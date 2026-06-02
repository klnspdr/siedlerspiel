'use strict';
const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * GET /ajax/toggleDisplayScore
 * Flips the displayScore boolean in the gameControl table (session row 1).
 * Returns the new value.
 */
router.get('/', (req, res) => {
  try {
    const row = db.prepare('SELECT displayScore FROM gameControl WHERE session = 1').get();
    if (!row) {
      return res.status(404).json({ error: 'gameControl row not found' });
    }
    const newScore = row.displayScore === 1 ? 0 : 1;
    db.prepare('UPDATE gameControl SET displayScore = ? WHERE session = 1').run(newScore);
    res.json({ displayScore: newScore === 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
