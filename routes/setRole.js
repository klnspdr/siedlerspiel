'use strict';
const express = require('express');
const router = express.Router();

/**
 * GET /ajax/setRole?setRole=<role>
 * POST /ajax/setRole  body: setRole=<role>
 *
 * Stores the role in a cookie (httpOnly, sameSite strict).
 * Returns the new role.
 */
router.get('/', handle);
router.post('/', handle);

function handle(req, res) {
  const role = req.body?.setRole ?? req.query?.setRole ?? '';
  const cookieOptions = {
    httpOnly: true,
    sameSite: 'strict',
    // No maxAge → session cookie, cleared when browser closes.
    // Set maxAge in milliseconds here if persistence across restarts is needed.
  };

  res.cookie('role', role, { ...cookieOptions, path: '/' });
  res.cookie('role', role, { ...cookieOptions, path: '/ajax' });
  res.json({ role });
}

module.exports = router;
