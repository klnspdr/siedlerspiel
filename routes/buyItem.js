'use strict';
const express = require('express');
const router = express.Router();
const db = require('../db');
const config = require('../config');

/**
 * GET /ajax/buyItem?item=item3&groupId=1
 *
 * Attempts to buy an item for a group.
 * Returns { success: true } or { error: "<message>" }.
 *
 * Checks (in order):
 *   1. item parameter is valid
 *   2. groupId is valid
 *   3. group is alive (unless deadAllowed)
 *   4. max not exceeded
 *   5. requirement satisfied
 *
 * On success: increments item count, updates hp / max_hp / score, appends log.
 */
router.get('/', (req, res) => {
  const { groupId: groupIdRaw, item } = req.query;
  const groupId = parseInt(groupIdRaw, 10);
  const numberItems  = config.number_items;
  const numberGroups = config.number_groups;

  // ── Validate item ──────────────────────────────────────────────────────────
  if (!isValidItem(item, numberItems)) {
    return res.status(200).json({success: false, message: `Invalid item: ${item}` });
  }

  // ── Validate groupId ───────────────────────────────────────────────────────
  if (!groupId || groupId <= 0 || groupId > numberGroups) {
    return res.status(200).json({success: false, message: `Invalid group number: ${groupIdRaw}` });
  }

  const itemCfg       = config[item] ?? {};
  const plusMaxHP     = itemCfg.plusMaxHP     ?? 0;
  const plusHP        = itemCfg.plusHP        ?? 0;
  const max           = itemCfg.max           ?? null;
  const requirement   = itemCfg.requirement   ?? null;
  const score         = itemCfg.score         ?? 0;
  const deadAllowed   = itemCfg.deadAllowed   ?? false;

  try {
    // ── Alive check ──────────────────────────────────────────────────────────
    if (!deadAllowed && !isAlive(groupId)) {
      return res.status(200).json({success: false, message: getDeathErrorMessage(item) });
    }

    // ── Max check ────────────────────────────────────────────────────────────
    if (!checkMax(groupId, item, max)) {
      return res.status(200).json({success: false, message: getMaxErrorMessage(item, max) });
    }

    // ── Requirement check ────────────────────────────────────────────────────
    if (!checkRequirement(groupId, requirement, numberItems)) {
      return res.status(200).json({success: false, message: getRequirementErrorMessage(item, requirement) });
    }

    // ── Execute purchase in a transaction ────────────────────────────────────
    const purchase = db.transaction(() => {
      // Increment item count
      db.prepare(`UPDATE inventory SET ${item} = ${item} + 1 WHERE groupId = ?`).run(groupId);

      // Update group stats.
      // LEAST equivalent: new hp = min(hp + plusHP, max_hp + plusMaxHP)
      db.prepare(`
        UPDATE groups
        SET
          max_hp = max_hp + ?,
          hp     = MIN(hp + ?, max_hp + ?),
          score  = score + ?
        WHERE groupId = ?
      `).run(plusMaxHP, plusHP, plusMaxHP, score, groupId);

      // Append log
      appendLog(groupId, item);
    });

    purchase();
    return res.json({ success: true });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
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

function isAlive(groupId) {
  const row = db.prepare('SELECT hp FROM groups WHERE groupId = ?').get(groupId);
  return row ? row.hp > 0 : false;
}

function checkMax(groupId, item, max) {
  if (max === null || max === undefined) return true;
  if (max <= 0) return false;
  const row = db.prepare(`SELECT ${item} AS qty FROM inventory WHERE groupId = ?`).get(groupId);
  return row ? row.qty < max : false;
}

function checkRequirement(groupId, requirement, numberItems) {
  if (!requirement) return true;
  if (!isValidItem(requirement, numberItems)) return false;
  const row = db.prepare(`SELECT ${requirement} AS qty FROM inventory WHERE groupId = ?`).get(groupId);
  return row ? row.qty > 0 : false;
}

function appendLog(groupId, item) {
  let msg = config.log_messages?.[item]?.buy ?? config.log_messages?.buy
    ?? 'Group <group> has bought <item>.';
  const itemName  = config[item]?.name  ?? item;
  const groupName = config.group_names?.[`gr${groupId}`] ?? `group ${groupId}`;
  msg = msg.replace(/<item>/g, itemName).replace(/<group>/g, groupName);
  db.prepare('INSERT INTO log (groupId, message) VALUES (?, ?)').run(groupId, msg);
}

function getDeathErrorMessage(item) {
  let msg = config.error_messages?.[item]?.death
    ?? config.error_messages?.death
    ?? 'You have to be alive to buy <item>.';
  const itemName = config[item]?.name ?? item;
  return msg.replace(/<item>/g, itemName);
}

function getMaxErrorMessage(item, max) {
  let msg = config.error_messages?.[item]?.max
    ?? config.error_messages?.max
    ?? 'You can buy at most <max> <item>.';
  const itemName = config[item]?.name ?? item;
  return msg.replace(/<item>/g, itemName).replace(/<max>/g, max);
}

function getRequirementErrorMessage(item, requirement) {
  let msg = config.error_messages?.[item]?.requirement
    ?? config.error_messages?.requirement
    ?? 'You have to buy <requirement> before you can buy <item>.';
  const itemName        = config[item]?.name        ?? item;
  const requirementName = config[requirement]?.name ?? requirement;
  return msg.replace(/<item>/g, itemName).replace(/<requirement>/g, requirementName);
}

module.exports = router;
