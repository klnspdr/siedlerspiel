/**
 * config.js
 * Loads config.json once at startup and exports it.
 */
'use strict';

const path = require('path');
const fs = require('fs');

const configPath = path.join(__dirname, 'config', 'config.json');
const raw = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(raw);

if (!config) {
  throw new Error('Failed to load config/config.json');
}

module.exports = config;
