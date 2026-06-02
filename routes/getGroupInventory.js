'use strict';
const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * GET /ajax/getGroupInventory
 * Returns all inventory rows ordered by groupId.
 */
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM inventory ORDER BY groupId').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
