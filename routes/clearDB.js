'use strict';
const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * GET /ajax/clearDB
 * Drops all game tables.  Call /ajax/initDB afterwards to recreate them.
 */
router.get('/', (req, res) => {
  try {
    db.exec(`
      DROP TABLE IF EXISTS log;
      DROP TABLE IF EXISTS inventory;
      DROP TABLE IF EXISTS groups;
      DROP TABLE IF EXISTS gameControl;
    `);
    res.json({ success: true, message: 'Database cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
