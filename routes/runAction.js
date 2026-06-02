'use strict';
const express = require('express');
const router = express.Router();
const db = require('../db');
const config = require('../config');

/**
 * GET /ajax/runAction?action=action1&groupId=1&targetId=2
 *
 * Performs a game action by one group against another.
 * Returns { success: true, attackSuccess: bool, kill: bool, defendResponse?: string }
 * or { error: "<message>" }.
 *
 * The original PHP used MySQL session variables (@old_hp, @killing) inside a
 * single multi-statement transaction.  Here those intermediate values are
 * tracked as plain JS variables inside a better-sqlite3 transaction.
 */
router.get('/', (req, res) => {
  const { groupId: groupIdRaw, targetId: targetIdRaw, action } = req.query;
  const groupId  = parseInt(groupIdRaw,  10);
  const targetId = parseInt(targetIdRaw, 10);

  const numberGroups  = config.number_groups;
  const numberItems   = config.number_items;
  const numberActions = config.number_actions;

  // ── Validate action ────────────────────────────────────────────────────────
  if (!isValidAction(action, numberActions)) {
    return res.status(200).json({success: false, message: 'Invalid action' });
  }

  // ── Validate groupId / targetId ────────────────────────────────────────────
  if (!groupId || groupId <= 0 || groupId > numberGroups) {
    return res.status(200).json({ success: false, message: `Invalid group number: ${groupIdRaw}` });
  }
  if (!targetId || targetId <= 0 || targetId > numberGroups) {
    return res.status(200).json({ success: false, message: `Invalid target group number: ${targetIdRaw}` });
  }

  const actionCfg      = config[action] ?? {};
  const damage         = actionCfg.damage         ?? 0;
  const score          = actionCfg.score          ?? 0;
  const defendScore    = actionCfg.defendScore     ?? null;
  const scorePunishment= actionCfg.scorePunishment ?? 0;
  const multiplicator  = actionCfg.multiplicator   ?? null;
  const killBonus      = actionCfg.killBonus       ?? 0;
  const killPunishment = actionCfg.killPunishment  ?? 0;
  const requirement    = actionCfg.requirement     ?? null;
  const uses           = actionCfg.uses            ?? null;
  const destroyItem    = actionCfg.destroyItem     ?? null;
  const compareItem    = actionCfg.compareItem     ?? null;
  const defense        = actionCfg.defense         ?? null;
  const deadAllowed    = actionCfg.deadAllowed     ?? false;

  try {
    // ── Alive check ──────────────────────────────────────────────────────────
    if (!deadAllowed && !isAlive(groupId)) {
      return res.status(200).json({ success: false, message: getDeathErrorMessage(action) });
    }

    // ── Requirement check ────────────────────────────────────────────────────
    if (!checkRequirement(groupId, requirement, numberItems)) {
      return res.status(200).json({ success: false, message: getRequirementErrorMessage(action, requirement) });
    }

    // ── Consume uses item (deducted before we know if attack succeeds) ────────
    if (!useItem(groupId, uses, numberItems)) {
      return res.status(200).json({ success: false, message: getUsesErrorMessage(action, uses) });
    }

    // ── Evaluate attack ──────────────────────────────────────────────────────
    const attackSuccess = evaluateAttackSuccess(groupId, targetId, compareItem, defense, numberItems);

    let kill          = false;
    let itemDestroyed = false;
    let defendResponse = null;

    if (attackSuccess) {
      // Try to destroy one of the target's destroyItem
      itemDestroyed = destroyItemFromTarget(targetId, destroyItem, numberItems);

      if (itemDestroyed) {
        const mult = getMultiplicator(groupId, multiplicator, numberItems);

        // ── Run combat transaction ───────────────────────────────────────────
        const combat = db.transaction(() => {
          // 1. Read target's current HP before applying damage
          const targetRow = db.prepare('SELECT hp FROM groups WHERE groupId = ?').get(targetId);
          const oldHp = targetRow ? targetRow.hp : 0;

          // 2. Apply damage (HP floor 0)
          const actualDamage = damage * mult;
          const newHp = Math.max(0, oldHp - actualDamage);
          db.prepare('UPDATE groups SET hp = ? WHERE groupId = ?').run(newHp, targetId);

          // 3. Determine kill
          const killed = actualDamage >= oldHp && oldHp > 0;
          kill = killed;

          // 4. Deduct score from target
          db.prepare(`
            UPDATE groups
            SET score = MAX(0, score - ? - ?)
            WHERE groupId = ?
          `).run(
            killed ? killPunishment : 0,
            scorePunishment,
            targetId
          );

          // 5. Add score to attacker
          //    If kill: attacker gets killBonus + oldHp (per PHP logic)
          //    Otherwise: score * mult, but only if target was alive (oldHp > 0)
          const attackerGain = killed
            ? killBonus + oldHp
            : score * mult * (oldHp > 0 ? 1 : 0);
          db.prepare('UPDATE groups SET score = score + ? WHERE groupId = ?')
            .run(attackerGain, groupId);
        });

        combat();
      }
    } else {
      // Attack failed – give target defend score credit
      if (defendScore !== null) {
        db.prepare('UPDATE groups SET score = score + ? WHERE groupId = ?')
          .run(defendScore, targetId);
      }

      // Build defend response message for the attacker's UI
      if (groupId !== targetId) {
        let dr = config.error_messages?.[action]?.action_defend
          ?? config.error_messages?.action_defend
          ?? 'Action <action> was defended by <target>';
        const actionName = config[action]?.name ?? action;
        const targetName = config.group_names?.[`gr${targetId}`] ?? `group ${targetId}`;
        dr = dr.replace(/<action>/g, actionName).replace(/<target>/g, targetName);
        defendResponse = dr;
      }
    }

    // ── Append log ───────────────────────────────────────────────────────────
    appendLog(groupId, targetId, action, attackSuccess, itemDestroyed, kill);

    const response = { success: true, attackSuccess, kill };
    if (defendResponse !== null) response.defendResponse = defendResponse;
    return res.json(response);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function isValidItem(item, numberItems) {
  if (!item) return false;
  for (let i = 1; i <= numberItems; i++) {
    if (item === `item${i}`) return true;
  }
  return false;
}

function isValidAction(action, numberActions) {
  if (!action) return false;
  for (let i = 1; i <= numberActions; i++) {
    if (action === `action${i}`) return true;
  }
  return false;
}

function isAlive(groupId) {
  const row = db.prepare('SELECT hp FROM groups WHERE groupId = ?').get(groupId);
  return row ? row.hp > 0 : false;
}

function checkRequirement(groupId, requirement, numberItems) {
  if (!requirement) return true;
  if (!isValidItem(requirement, numberItems)) return false;
  const row = db.prepare(`SELECT ${requirement} AS qty FROM inventory WHERE groupId = ?`).get(groupId);
  return row ? row.qty > 0 : false;
}

function useItem(groupId, uses, numberItems) {
  if (!uses) return true;
  if (!isValidItem(uses, numberItems)) return false;
  const result = db.prepare(
    `UPDATE inventory SET ${uses} = ${uses} - 1 WHERE groupId = ? AND ${uses} > 0`
  ).run(groupId);
  return result.changes === 1;
}

/**
 * Determines whether the attack hits.
 * Attacker wins if groupId === targetId → always false (can't attack yourself).
 * If compareItem set: attacker needs >= target's count.
 * Then defense probability is evaluated.
 */
function evaluateAttackSuccess(groupId, targetId, compareItem, defense, numberItems) {
  if (groupId === targetId) return false;

  let success = true;

  if (compareItem !== null) {
    if (!isValidItem(compareItem, numberItems)) return false;
    const attRow = db.prepare(`SELECT ${compareItem} AS qty FROM inventory WHERE groupId = ?`).get(groupId);
    const defRow = db.prepare(`SELECT ${compareItem} AS qty FROM inventory WHERE groupId = ?`).get(targetId);
    const attQty = attRow?.qty ?? 0;
    const defQty = defRow?.qty ?? 0;
    success = attQty >= defQty;
  }

  if (!success) return false;

  // Defense probability check
  if (defense) {
    let defenseProbability = 0;
    for (const [defItem, factor] of Object.entries(defense)) {
      if (!isValidItem(defItem, numberItems)) continue;
      const row = db.prepare(`SELECT ${defItem} AS qty FROM inventory WHERE groupId = ?`).get(targetId);
      defenseProbability += factor * (row?.qty ?? 0);
    }
    if (defenseProbability > 0) {
      const roll = Math.floor(Math.random() * 100) + 1; // 1–100
      return roll > defenseProbability;
    }
  }

  return success;
}

/** Destroys one of destroyItem from the target. Returns true if destroyed, true if none specified. */
function destroyItemFromTarget(targetId, destroyItem, numberItems) {
  if (!destroyItem) return true;
  if (!isValidItem(destroyItem, numberItems)) return false;
  const result = db.prepare(
    `UPDATE inventory SET ${destroyItem} = ${destroyItem} - 1 WHERE groupId = ? AND ${destroyItem} > 0`
  ).run(targetId);
  return result.changes === 1;
}

function getMultiplicator(groupId, multiplicator, numberItems) {
  if (!multiplicator) return 1;
  if (!isValidItem(multiplicator, numberItems)) return 0;
  const row = db.prepare(`SELECT ${multiplicator} AS qty FROM inventory WHERE groupId = ?`).get(groupId);
  return row?.qty ?? 0;
}

function appendLog(groupId, targetId, action, attackSuccess, itemDestroyed, kill) {
  let msg;
  if (attackSuccess) {
    if (kill) {
      msg = config.log_messages?.[action]?.kill
        ?? config.log_messages?.kill
        ?? 'Group <group> killed group <target>';
    } else if (!itemDestroyed) {
      msg = config.log_messages?.[action]?.nothingToDestroy
        ?? config.log_messages?.nothingToDestroy
        ?? 'Group <group> tried to perform action <action> on group <target> but found nothing to destroy';
    } else {
      msg = config.log_messages?.[action]?.success
        ?? config.log_messages?.success
        ?? 'Group <group> performed action <action> successfully on group <target>';
    }
  } else {
    if (groupId === targetId) {
      msg = config.log_messages?.[action]?.hitSelf
        ?? config.log_messages?.hitSelf
        ?? 'Group <group> tried to perform action <action> but hit themselves';
    } else {
      msg = config.log_messages?.[action]?.failure
        ?? config.log_messages?.failure
        ?? 'Group <group> failed performing action <action> on group <target>';
    }
  }

  const groupName  = config.group_names?.[`gr${groupId}`]  ?? `group ${groupId}`;
  const targetName = config.group_names?.[`gr${targetId}`] ?? `group ${targetId}`;
  const actionName = config[action]?.name ?? action;

  msg = msg
    .replace(/<group>/g,  groupName)
    .replace(/<target>/g, targetName)
    .replace(/<action>/g, actionName);

  db.prepare('INSERT INTO log (groupId, message) VALUES (?, ?)').run(groupId, msg);
}

function getDeathErrorMessage(action) {
  let msg = config.error_messages?.[action]?.action_death
    ?? config.error_messages?.action_death
    ?? 'You have to be alive to perform action <action>.';
  const actionName = config[action]?.name ?? action;
  return msg.replace(/<action>/g, actionName);
}

function getRequirementErrorMessage(action, requirement) {
  let msg = config.error_messages?.[action]?.action_requirement
    ?? config.error_messages?.action_requirement
    ?? 'Action <action> requires <requirement>.';
  const actionName      = config[action]?.name      ?? action;
  const requirementName = config[requirement]?.name ?? requirement;
  return msg.replace(/<action>/g, actionName).replace(/<requirement>/g, requirementName);
}

function getUsesErrorMessage(action, uses) {
  let msg = config.error_messages?.[action]?.action_uses
    ?? config.error_messages?.action_uses
    ?? 'Action <action> requires <uses>.';
  const actionName = config[action]?.name ?? action;
  const usesName   = config[uses]?.name   ?? uses;
  return msg.replace(/<action>/g, actionName).replace(/<uses>/g, usesName);
}

module.exports = router;
