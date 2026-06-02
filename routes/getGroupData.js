'use strict';
const express = require('express');
const router = express.Router();
const db = require('../db');
const config = require('../config');

/**
 * GET /ajax/getGroupData
 *
 * Returns all groups with their current stats plus a computed `final_score`.
 *
 * The original PHP built a single MySQL query that used session variables
 * (@consumed, @old_consumed) to track shared item consumption across ratio
 * rules inside SQL.  Here we fetch raw rows and compute final_score in JS,
 * which is cleaner and works in SQLite.
 *
 * final_score formula (per group):
 *   base   = score + hpBonus * hp - (hp === 0 ? deathPunishment : 0)
 *   then for every ratio in config.finalScores.ratios:
 *     requiredItem is "consumed" by requiringItems.
 *     consumed tracks how much of requiredItem has already been used up.
 *     For each requiringItem:
 *       need = ceil(requiringItem_qty / multiplicator)
 *       available = max(0, requiredItem_qty - consumed)
 *       if available >= need  → add bonus
 *       else                  → subtract once_punishment + punishment * ceil(need - available)
 *       if consuming          → consumed += min(need, requiredItem_qty - old_consumed)
 */
router.get('/', (req, res) => {
  try {
    const hpBonus         = config.finalScores?.hp             ?? 0;
    const deathPunishment = config.finalScores?.deathPunishment ?? 0;
    const ratios          = config.finalScores?.ratios         ?? {};
    const numberItems     = config.number_items;

    const gc = db.prepare('SELECT displayScore FROM gameControl LIMIT 1').get();
    const displayScore = gc ? gc.displayScore : 1;

    const rows = db.prepare(`
      SELECT
        g.groupId, g.hp, g.max_hp, g.name, g.score,
        i.*
      FROM groups g
      LEFT JOIN inventory i ON g.groupId = i.groupId
      ORDER BY g.groupId
    `).all();

    const groups = rows.map(row => {
      const finalScore = computeFinalScore(
        row, hpBonus, deathPunishment, ratios, numberItems
      );
      return {
        groupId:      row.groupId,
        hp:           row.hp,
        max_hp:       row.max_hp,
        name:         row.name,
        score:        row.score,
        final_score:  finalScore,
        displayScore: displayScore,
      };
    });

    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Final score computation ────────────────────────────────────────────────────

/**
 * Mirrors the MySQL session-variable logic from the original PHP.
 * @param {object} row         - Combined groups + inventory row
 * @param {number} hpBonus
 * @param {number} deathPunishment
 * @param {object} ratios      - config.finalScores.ratios
 * @param {number} numberItems
 * @returns {number}
 */
function computeFinalScore(row, hpBonus, deathPunishment, ratios, numberItems) {
  let score = row.score
    + hpBonus * row.hp
    - (row.hp === 0 ? deathPunishment : 0);

  for (const [requiredItem, ratioBlock] of Object.entries(ratios)) {
    if (!isValidItem(requiredItem, numberItems)) continue;

    const requiredQty = row[requiredItem] ?? 0;

    // consumed tracks how many units of requiredItem have already been used
    // across previous requiringItem iterations (for consuming:true items).
    let consumed = 0;

    for (const [requiringItem, opts] of Object.entries(ratioBlock.required_by ?? {})) {
      if (!isValidItem(requiringItem, numberItems)) continue;

      let multiplicator   = opts.multiplicator;
      let punishment      = opts.punishment;
      let once_punishment = opts.once_punishment;
      let bonus           = opts.bonus;
      const consuming     = opts.consuming === true;

      // Validate / default
      if (typeof multiplicator !== 'number' || multiplicator < 0) multiplicator = 1;
      if (typeof punishment    !== 'number' || punishment    < 0) multiplicator = 0; // mirrors PHP bug-for-bug
      if (typeof once_punishment !== 'number' || once_punishment < 0) once_punishment = 0;
      if (typeof bonus         !== 'number' || bonus         < 0) bonus = 0;

      const requiringQty = row[requiringItem] ?? 0;

      // How many requiredItem units does this requiringItem demand?
      const need      = requiringQty / multiplicator;
      // How many requiredItem units are still available after prior consumption?
      const available = Math.max(0, requiredQty - consumed);

      if (available >= need) {
        score += bonus;
      } else {
        score -= once_punishment + punishment * Math.ceil(need - available);
      }

      if (consuming) {
        // Consume min(need, available) units
        consumed += Math.min(need, available);
      }
    }
  }

  return Math.max(0, score);
}

function isValidItem(item, numberItems) {
  if (!item) return false;
  for (let i = 1; i <= numberItems; i++) {
    if (item === `item${i}`) return true;
  }
  return false;
}

module.exports = router;
