'use strict';
const express = require('express');
const router = express.Router();

/**
 * GET /ajax/getRole
 * Returns the role stored in the 'role' cookie, or empty string if not set.
 * Mirrors the original PHP $_SESSION['role'] behaviour via a cookie.
 */
router.get('/', (req, res) => {
  const role = req.cookies.role ?? '';
  res.json({ role });
});

module.exports = router;
