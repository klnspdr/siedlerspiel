'use strict';

/**
 * routes/dbApi.js
 * Mount as:  app.use('/db-api', require('./routes/dbApi'));
 *
 * Endpoints:
 *   GET    /db-api/tables                      → list all user tables
 *   GET    /db-api/tables/:table               → columns + all rows (with rowid)
 *   PUT    /db-api/tables/:table/:rowid        → update a row
 *   DELETE /db-api/tables/:table/:rowid        → delete a row
 *   POST   /db-api/tables/:table               → insert a new row
 */

const { Router } = require('express');
const db = require('../db');

const router = Router();

// ── helpers ──────────────────────────────────────────────────────────────────

/** Return column metadata for a table as [{ cid, name, type, notnull, dflt_value, pk }] */
function getColumns(table) {
  return db.prepare(`PRAGMA table_info("${esc(table)}")`).all();
}

/** Rudimentary table-name escaping – only allow alphanumeric + _ */
function esc(name) {
  if (!/^[\w]+$/.test(name)) throw new Error(`Invalid identifier: ${name}`);
  return name;
}

// ── GET /tables ───────────────────────────────────────────────────────────────
router.get('/tables', (_req, res) => {
  try {
    const tables = db
      .prepare(
        `SELECT name FROM sqlite_master
         WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
         ORDER BY name`
      )
      .all()
      .map((r) => r.name);
    res.json({ tables });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /tables/:table ────────────────────────────────────────────────────────
router.get('/tables/:table', (req, res) => {
  try {
    const table = esc(req.params.table);
    const columns = getColumns(table);
    // Always select rowid so we have a stable handle for updates/deletes.
    const rows = db.prepare(`SELECT rowid AS _rowid_, * FROM "${table}"`).all();
    res.json({ table, columns, rows });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── PUT /tables/:table/:rowid ─────────────────────────────────────────────────
router.put('/tables/:table/:rowid', (req, res) => {
  try {
    const table = esc(req.params.table);
    const rowid = Number(req.params.rowid);
    if (!Number.isInteger(rowid)) throw new Error('rowid must be an integer');

    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new Error('Request body must be a JSON object of column→value pairs');
    }

    // Only update columns that actually exist in the table.
    const knownCols = getColumns(table).map((c) => c.name);
    const updates = Object.keys(body).filter((k) => knownCols.includes(k));
    if (updates.length === 0) throw new Error('No valid columns to update');

    const set = updates.map((c) => `"${c}" = ?`).join(', ');
    const values = updates.map((c) => body[c]);
    values.push(rowid);

    const info = db
      .prepare(`UPDATE "${table}" SET ${set} WHERE rowid = ?`)
      .run(...values);

    res.json({ changes: info.changes });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── DELETE /tables/:table/:rowid ──────────────────────────────────────────────
router.delete('/tables/:table/:rowid', (req, res) => {
  try {
    const table = esc(req.params.table);
    const rowid = Number(req.params.rowid);
    if (!Number.isInteger(rowid)) throw new Error('rowid must be an integer');

    const info = db
      .prepare(`DELETE FROM "${table}" WHERE rowid = ?`)
      .run(rowid);

    res.json({ changes: info.changes });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── POST /tables/:table ───────────────────────────────────────────────────────
router.post('/tables/:table', (req, res) => {
  try {
    const table = esc(req.params.table);
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new Error('Request body must be a JSON object of column→value pairs');
    }

    const knownCols = getColumns(table).map((c) => c.name);
    const cols = Object.keys(body).filter((k) => knownCols.includes(k));

    let info;
    if (cols.length === 0) {
      // Insert a default row (e.g. for tables with all-default columns)
      info = db.prepare(`INSERT INTO "${table}" DEFAULT VALUES`).run();
    } else {
      const colList = cols.map((c) => `"${c}"`).join(', ');
      const placeholders = cols.map(() => '?').join(', ');
      const values = cols.map((c) => body[c]);
      info = db
        .prepare(`INSERT INTO "${table}" (${colList}) VALUES (${placeholders})`)
        .run(...values);
    }

    // Return the newly inserted row (with its rowid)
    const newRow = db
      .prepare(`SELECT rowid AS _rowid_, * FROM "${table}" WHERE rowid = ?`)
      .get(info.lastInsertRowid);

    res.status(201).json({ row: newRow });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
