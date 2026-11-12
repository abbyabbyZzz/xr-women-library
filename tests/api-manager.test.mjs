import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { once } from 'node:events';
import { createManager, validateApiUrl } from '../tools/api-manager/server.mjs';

test('API addresses reject credentials, local services, and query-string secrets', () => {
  for (const value of ['http://example.org/api/papers', 'https://localhost/api/papers', 'https://127.0.0.1/api/papers', 'https://user:password@example.org/api/papers', 'https://example.org/api/papers?key=secret', 'https://example.org:8443/api/papers']) assert.throws(() => validateApiUrl(value));
  assert.equal(validateApiUrl('https://example.org/api/papers'), 'https://example.org/api/papers');
});

test('local manager protects writes, preserves unrelated settings, and validates CORS before saving', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'xr-api-manager-'));
  const calls = [];
  let allowed = true;
  const server = createManager({ root, github: {
    status: async () => ({ connected: true, login: 'test-owner', runs: [] }),
    saveApiUrl: async url => calls.push(['save', url]),
    publish: async () => { calls.push(['publish']); return { message: 'started' }; },
  }, probe: async () => ({ corsAllowed: allowed, count: 8 }) });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const session = await (await fetch(`${base}/manager/session`)).json();
    const post = (route, body = {}, headers = {}) => fetch(`${base}/manager/${route}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Manager-Token': session.token, ...headers }, body: JSON.stringify(body) });
    assert.equal((await post('publish', {}, { Origin: 'https://unrelated.example' })).status, 403);
    assert.equal((await post('publish', {}, { 'X-Manager-Token': '' })).status, 403);
    assert.deepEqual(calls, []);
    assert.equal((await fetch(`${base}/.env.local`)).status, 404);
    const status = await (await fetch(`${base}/manager/status`)).json();
    assert.equal('token' in status, false);
    assert.equal('password' in status, false);
    allowed = false;
    assert.equal((await post('save', { apiUrl: 'https://example.org/api/papers' })).status, 400);
    assert.deepEqual(calls, []);
    allowed = true;
    await writeFile(path.join(root, '.env.local'), 'UNRELATED_SETTING=keep-me\nVITE_ZOTERO_API_URL=https://old.example/api/papers\n');
    assert.equal((await post('save', { apiUrl: 'https://example.org/api/papers' })).status, 200);
    const env = await readFile(path.join(root, '.env.local'), 'utf8');
    assert.match(env, /UNRELATED_SETTING=keep-me/);
    assert.match(env, /VITE_ZOTERO_API_URL=https:\/\/example.org\/api\/papers/);
    assert.equal((await post('publish')).status, 200);
    assert.deepEqual(calls, [['save', 'https://example.org/api/papers'], ['publish']]);
    const saved = JSON.parse(await readFile(path.join(root, '.local/api-manager.json'), 'utf8'));
    assert.deepEqual(Object.keys(saved).sort(), ['apiUrl', 'savedAt']);
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
    assert.equal(path.dirname(root), path.resolve(os.tmpdir()));
    assert.ok(path.basename(root).startsWith('xr-api-manager-'));
    await rm(root, { recursive: true, force: true });
  }
});
