/**
 * db.js
 * Opens (or creates) the SQLite database using Node 22's built-in node:sqlite.
 * The API is synchronous, mirroring better-sqlite3 closely.
 *
 * node:sqlite is experimental in Node 22 but stable enough for this use case.
 * No extra npm package required.
 */
'use strict';

const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const DB_PATH = path.join(__dirname, 'game.db');
const db = new DatabaseSync(DB_PATH);

// WAL mode + foreign keys
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");

/**
 * node:sqlite's DatabaseSync has a slightly different API from better-sqlite3:
 *   - db.prepare(sql).run(...params)   → { changes, lastInsertRowid }
 *   - db.prepare(sql).get(...params)   → object | undefined
 *   - db.prepare(sql).all(...params)   → object[]
 *   - db.exec(sql)                     → void  (multi-statement, no params)
 *
 * Transactions:  node:sqlite does not have a db.transaction() helper.
 * We expose one here that mirrors better-sqlite3's interface:
 *   db.transaction(fn)  → wrapped function that runs fn inside BEGIN/COMMIT
 *
 * Named parameters are NOT used; all queries use positional ? placeholders.
 */
db.transaction = function transaction(fn) {
  return function (...args) {
    db.exec('BEGIN');
    try {
      const result = fn(...args);
      db.exec('COMMIT');
      return result;
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  };
};

module.exports = db;
