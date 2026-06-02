'use strict';
const express = require('express');
const router = express.Router();
const db = require('../db');
const config = require('../config');

/**
 * GET /ajax/initDB
 * Creates all tables (if they don't exist) and seeds initial data from
 * config.json.  Safe to call multiple times; INSERT is skipped when rows
 * already exist.
 */
router.get('/', (req, res) => {
  try {
    // ── Schema ──────────────────────────────────────────────────────────────
    db.exec(`
      CREATE TABLE IF NOT EXISTS groups (
        groupId  INTEGER PRIMARY KEY AUTOINCREMENT,
        hp       INTEGER,
        max_hp   INTEGER,
        name     TEXT,
        score    INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS inventory (
        groupId INTEGER PRIMARY KEY,
        ${Array.from({ length: 20 }, (_, i) => `item${i + 1} INTEGER DEFAULT 0`).join(',\n        ')},
        FOREIGN KEY (groupId) REFERENCES groups(groupId)
      );

      CREATE TABLE IF NOT EXISTS log (
        logId    INTEGER PRIMARY KEY AUTOINCREMENT,
        groupId  INTEGER,
        message  TEXT,
        FOREIGN KEY (groupId) REFERENCES groups(groupId)
      );

      CREATE TABLE IF NOT EXISTS gameControl (
        session      INTEGER PRIMARY KEY AUTOINCREMENT,
        displayScore INTEGER DEFAULT 1
      );
    `);

    const numberGroups = config.number_groups;
    const numberItems  = config.number_items;
    const initHp       = config.init_values?.hp    ?? 100;
    const initMaxHp    = config.init_values?.max_hp ?? 100;
    const groupNames   = config.group_names; // { gr1: "Team A", ... }

    // ── Seed groups ──────────────────────────────────────────────────────────
    const existingGroups = db.prepare('SELECT COUNT(*) AS cnt FROM groups').get().cnt;
    if (existingGroups < numberGroups) {
      const insertGroup = db.prepare(
        'INSERT INTO groups (hp, max_hp, name) VALUES (?, ?, ?)'
      );
      for (let i = 1; i <= numberGroups; i++) {
        const name = groupNames[`gr${i}`] ?? `Group ${i}`;
        insertGroup.run(initHp, initMaxHp, name);
      }
    }

    // ── Seed inventory ───────────────────────────────────────────────────────
    const existingInv = db.prepare('SELECT COUNT(*) AS cnt FROM inventory').get().cnt;
    if (existingInv < numberGroups) {
      const cols   = Array.from({ length: numberItems }, (_, i) => `item${i + 1}`);
      const sql    = `INSERT INTO inventory (groupId, ${cols.join(', ')}) VALUES (?, ${cols.map(() => '?').join(', ')})`;
      const insertInv = db.prepare(sql);

      for (let i = 1; i <= numberGroups; i++) {
        const values = [i, ...cols.map(col => config.init_values?.[col] ?? 0)];
        insertInv.run(...values);
      }
    }

    // ── Seed gameControl ─────────────────────────────────────────────────────
    const existingGC = db.prepare('SELECT COUNT(*) AS cnt FROM gameControl').get().cnt;
    if (existingGC === 0) {
      db.prepare('INSERT INTO gameControl (displayScore) VALUES (1)').run();
    }

    res.json({ success: true, message: 'Database initialized' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
