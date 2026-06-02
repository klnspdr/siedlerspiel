/**
 * server.js
 * Express server.  Each PHP endpoint becomes a route under /ajax/<name>
 * (no .php extension).
 */
'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Serve the browser shell from the Node server root.
app.get('/', (req, res) => {
  if ('reset' in req.query) {
    const cookieOptions = {
      httpOnly: true,
      sameSite: 'strict',
    };

    res.cookie('role', '0', { ...cookieOptions, path: '/' });
    res.cookie('role', '0', { ...cookieOptions, path: '/ajax' });
    res.redirect(303, '/');
    return;
  }
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.use(express.static('frontend')); // serve static files from public/
//app.use('/p5js', express.static(path.join(__dirname, 'node_modules', 'p5', 'lib')));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/ajax/getRole',           require('./routes/getRole'));
app.use('/ajax/setRole',           require('./routes/setRole'));
app.use('/ajax/getLog',            require('./routes/getLog'));
app.use('/ajax/getGroupData',      require('./routes/getGroupData'));
app.use('/ajax/getGroupInventory', require('./routes/getGroupInventory'));
app.use('/ajax/buyItem',           require('./routes/buyItem'));
app.use('/ajax/runAction',         require('./routes/runAction'));
app.use('/ajax/initDB',            require('./routes/initDB'));
app.use('/ajax/clearDB',           require('./routes/clearDB'));
app.use('/ajax/toggleDisplayScore',require('./routes/toggleDisplayScore'));
app.use('/ajax/getServerInfo',       require('./routes/getServerInfo'));
app.use('/config/config.json', (req, res) => {
  res.type('json').sendFile(path.join(__dirname, 'config', 'config.json'));
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Siedlerspiel server running on http://localhost:${PORT}`);
});

module.exports = app; // exported for tests
