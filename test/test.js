/**
 * test/test.js
 *
 * Integration tests for the Siedlerspiel API.
 * Ported from the original test.php (curl-based).
 *
 * Runs against a live server on localhost:3000.
 * Start the server first:  node server.js
 * Then run:                node test/test.js
 *
 * Uses only node:test and node:assert (no extra dependencies).
 */
'use strict';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http   = require('node:http');

const BASE = 'http://localhost:3000';

// ── HTTP helpers ──────────────────────────────────────────────────────────────

function get(path, cookieJar = {}) {
  return new Promise((resolve, reject) => {
    const cookies = Object.entries(cookieJar)
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
    const opts = {
      ...parseUrl(BASE + path),
      headers: cookies ? { Cookie: cookies } : {},
    };
    const req = http.get(opts, res => {
      let body = '';
      res.on('data', d => (body += d));
      res.on('end', () => {
        try {
          // Capture Set-Cookie into the jar
          const sc = res.headers['set-cookie'] ?? [];
          for (const c of sc) {
            const [kv] = c.split(';');
            const [k, v] = kv.split('=');
            cookieJar[k.trim()] = v?.trim() ?? '';
          }
          resolve({ status: res.statusCode, body, json: safeJson(body) });
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
  });
}

function sqlDirect(sql, params = []) {
  // For test setup we require the db module directly.
  const db = require('../db');
  return db.prepare(sql).run(...params);
}

function setInventory(groupId, fields) {
  const sets = Object.entries(fields).map(([k]) => `${k} = ?`).join(', ');
  const vals = Object.values(fields);
  sqlDirect(`UPDATE inventory SET ${sets} WHERE groupId = ?`, [...vals, groupId]);
}

function setGroup(groupId, fields) {
  const sets = Object.entries(fields).map(([k]) => `${k} = ?`).join(', ');
  const vals = Object.values(fields);
  sqlDirect(`UPDATE groups SET ${sets} WHERE groupId = ?`, [...vals, groupId]);
}

function parseUrl(url) {
  const u = new URL(url);
  return { host: u.hostname, port: u.port || 80, path: u.pathname + u.search };
}

function safeJson(str) {
  try { return JSON.parse(str); } catch { return null; }
}

// ── Setup / Teardown ──────────────────────────────────────────────────────────

before(async () => {
  await get('/ajax/clearDB');
  await get('/ajax/initDB');
});

after(async () => {
  // Leave DB intact so results can be inspected; uncomment to clean up:
  // await get('/ajax/clearDB');
});

// ── buyItem tests ─────────────────────────────────────────────────────────────

test('buyItem – invalid item (out of range)', async () => {
  const r = await get('/ajax/buyItem?item=item999&groupId=1');
  assert.equal(r.status, 400);
  assert.ok(r.json?.error, 'should have error field');
});

test('buyItem – invalid item (garbage string)', async () => {
  const r = await get('/ajax/buyItem?item=komischerundfalscherText&groupId=1');
  assert.equal(r.status, 400);
  assert.ok(r.json?.error);
});

test('buyItem – invalid group (too high)', async () => {
  const config = require('../config');
  const r = await get(`/ajax/buyItem?item=item1&groupId=${config.number_groups + 1}`);
  assert.equal(r.status, 400);
  assert.ok(r.json?.error);
});

test('buyItem – invalid group (zero)', async () => {
  const r = await get('/ajax/buyItem?item=item1&groupId=0');
  assert.equal(r.status, 400);
  assert.ok(r.json?.error);
});

test('buyItem – requirement not satisfied (item4 needs item3)', async () => {
  // item4 requires item3; clear both first
  setInventory(1, { item3: 0, item4: 0 });
  const r = await get('/ajax/buyItem?item=item4&groupId=1');
  assert.equal(r.status, 400);
  assert.ok(r.json?.error, 'should fail – requirement not met');
});

test('buyItem – success (item3, no requirement)', async () => {
  setInventory(1, { item3: 0 });
  const r = await get('/ajax/buyItem?item=item3&groupId=1');
  assert.equal(r.status, 200);
  assert.equal(r.json?.success, true);
});

test('buyItem – requirement satisfied after buying item3', async () => {
  // item3 was bought in the previous test; now item4 should succeed
  setInventory(1, { item4: 0 });
  const r = await get('/ajax/buyItem?item=item4&groupId=1');
  assert.equal(r.status, 200);
  assert.equal(r.json?.success, true);
});

test('buyItem – max reached (item4 max=1)', async () => {
  // item4 already has qty 1 from the previous test
  const r = await get('/ajax/buyItem?item=item4&groupId=1');
  assert.equal(r.status, 400);
  assert.ok(r.json?.error, 'should fail – max reached');
});

test('buyItem – dead group cannot buy non-deadAllowed item', async () => {
  setGroup(1, { hp: 0 });
  const r = await get('/ajax/buyItem?item=item1&groupId=1');
  assert.equal(r.status, 400);
  assert.ok(r.json?.error);
  setGroup(1, { hp: 100 }); // restore
});

test('buyItem – dead group CAN buy deadAllowed item (item17)', async () => {
  setGroup(1, { hp: 0 });
  const r = await get('/ajax/buyItem?item=item17&groupId=1');
  assert.equal(r.status, 200);
  assert.equal(r.json?.success, true);
  setGroup(1, { hp: 100 }); // restore
});

// ── getRole / setRole tests ───────────────────────────────────────────────────

test('setRole + getRole round-trip via cookie', async () => {
  const jar = {};
  await get('/ajax/setRole?setRole=gamemaster', jar);
  const r = await get('/ajax/getRole', jar);
  assert.equal(r.json?.role, 'gamemaster');
});

test('getRole returns empty string when no cookie set', async () => {
  const r = await get('/ajax/getRole', {}); // fresh jar
  assert.equal(r.json?.role, '');
});

// ── runAction tests ───────────────────────────────────────────────────────────

test('runAction – invalid action', async () => {
  const r = await get('/ajax/runAction?action=action99&groupId=1&targetId=2');
  assert.equal(r.status, 400);
  assert.ok(r.json?.error);
});

test('runAction – missing requirement', async () => {
  // action1 requires item11; clear it
  setInventory(1, { item11: 0 });
  const r = await get('/ajax/runAction?action=action1&groupId=1&targetId=2');
  assert.equal(r.status, 400);
  assert.ok(r.json?.error);
});

test('runAction – dead group cannot act', async () => {
  setGroup(1, { hp: 0 });
  setInventory(1, { item11: 5 });
  const r = await get('/ajax/runAction?action=action1&groupId=1&targetId=2');
  assert.equal(r.status, 400);
  assert.ok(r.json?.error);
  setGroup(1, { hp: 100 });
});

test('runAction – success when requirement met', async () => {
  setInventory(1, { item11: 5 }); // gold (requirement for action1)
  setInventory(2, { item10: 0 }); // target has no compareItem, attacker wins
  const before = require('../db').prepare('SELECT item11 FROM inventory WHERE groupId = 1').get();
  const r = await get('/ajax/runAction?action=action1&groupId=1&targetId=2');
  assert.equal(r.status, 200);
  assert.equal(r.json?.success, true);
  // item11 (uses) should have been decremented
  const after = require('../db').prepare('SELECT item11 FROM inventory WHERE groupId = 1').get();
  assert.equal(after.item11, before.item11 - 1);
});

// ── toggleDisplayScore ────────────────────────────────────────────────────────

test('toggleDisplayScore flips the flag', async () => {
  const r1 = await get('/ajax/toggleDisplayScore');
  const r2 = await get('/ajax/toggleDisplayScore');
  assert.notEqual(r1.json?.displayScore, r2.json?.displayScore,
    'two toggles should produce different values');
});

// ── getGroupData ──────────────────────────────────────────────────────────────

test('getGroupData returns array with final_score', async () => {
  const r = await get('/ajax/getGroupData');
  assert.equal(r.status, 200);
  assert.ok(Array.isArray(r.json));
  assert.ok(r.json.length > 0);
  const g = r.json[0];
  assert.ok('final_score'  in g, 'should have final_score');
  assert.ok('displayScore' in g, 'should have displayScore');
  assert.ok('hp'           in g);
  assert.ok('score'        in g);
});

test('final_score is >= 0 for all groups', async () => {
  const r = await get('/ajax/getGroupData');
  for (const g of r.json) {
    assert.ok(g.final_score >= 0, `final_score for group ${g.groupId} is negative`);
  }
});

// ── getLog ────────────────────────────────────────────────────────────────────

test('getLog returns array', async () => {
  const r = await get('/ajax/getLog');
  assert.equal(r.status, 200);
  assert.ok(Array.isArray(r.json));
});

// ── getGroupInventory ─────────────────────────────────────────────────────────

test('getGroupInventory returns array with item columns', async () => {
  const r = await get('/ajax/getGroupInventory');
  assert.equal(r.status, 200);
  assert.ok(Array.isArray(r.json));
  assert.ok('item1' in r.json[0]);
});

// ── clearDB / initDB ──────────────────────────────────────────────────────────

test('clearDB and initDB leave DB usable', async () => {
  await get('/ajax/clearDB');
  await get('/ajax/initDB');
  const r = await get('/ajax/getGroupData');
  assert.equal(r.status, 200);
  assert.ok(Array.isArray(r.json));
});
