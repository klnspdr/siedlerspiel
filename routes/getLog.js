'use strict';
const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * GET /ajax/getLog
 * Returns all log entries ordered by logId.
 */
router.get('/', (req, res) => {
  try {
    const logs = db.prepare('SELECT * FROM log ORDER BY logId').all();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
