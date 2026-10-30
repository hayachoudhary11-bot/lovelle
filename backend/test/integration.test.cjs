const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { spawn } = require('node:child_process');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { io } = require('socket.io-client');
const { createApplication } = require('../dist/app');
const { readConfig } = require('../dist/config/env');
const { User } = require('../dist/models/User');
const { Couple } = require('../dist/models/Couple');

test('configuration rejects missing secrets and unsafe production origins', () => {
  assert.throws(() => readConfig({}), /MONGO_URI/);
  assert.throws(() => readConfig({ MONGO_URI: 'mongodb://localhost/test', JWT_SECRET: 'short' }), /JWT_SECRET/);
  assert.throws(() => readConfig({ MONGO_URI: 'mongodb://localhost/test', JWT_SECRET: 'x'.repeat(64), NODE_ENV: 'production', CORS_ORIGINS: '*' }));
});

test('isolated API, privacy, concurrency and distributed socket regression suite', { timeout: 900000 }, async (t) => {
  const db = await MongoMemoryReplSet.create({ replSet: { count: 1 }, binary: { version: '7.0.24' } });
  const sockets = [];
  const apps = [];
  t.after(async () => {
    sockets.forEach((socket) => socket.disconnect());
    await Promise.all(apps.map(({ io }) => new Promise((resolve) => io.close(resolve))));
    await mongoose.disconnect();
    await db.stop();
  });
  process.env.JWT_SECRET = 'isolated-test-secret-'.repeat(4);
  const env = { ...process.env, MONGO_URI: db.getUri('lovelle_test'), SOCKET_DISTRIBUTED: 'true', NODE_ENV: 'test', CORS_ORIGINS: 'http://localhost:8081' };
  const config = readConfig(env);
  for (let i = 0; i < 2; i++) {
    const app = createApplication(config);
    apps.push(app);
    await app.ready();
    app.server.listen(0, '127.0.0.1');
    await once(app.server, 'listening');
  }
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
  const base = apps.map(({ server }) => `http://127.0.0.1:${server.address().port}`);
  async function request(path, { token, body, method = body ? 'POST' : 'GET', headers = {} } = {}) {
    const response = await fetch(base[0] + path, { method, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers }, body: body ? JSON.stringify(body) : undefined });
    return { status: response.status, data: await response.json(), headers: response.headers };
  }
  async function signup(name) {
    const result = await request('/auth/signup', { body: { email: `${name}@example.com`, name, password: 'test-password-123' } });
    assert.equal(result.status, 201);
    assert.equal(result.data.user.passwordHash, undefined);
    return result.data;
  }
  async function child(args) {
    const command = spawn(process.execPath, args, { env: { ...env, TEST_BASE_URL: base[0], ALLOW_TEST_WRITES: 'true' }, stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '';
    command.stdout.on('data', (chunk) => { output += chunk; });
    command.stderr.on('data', (chunk) => { output += chunk; });
    const [code] = await once(command, 'exit');
    assert.equal(code, 0, output);
    return output;
  }
  await t.test('health, CORS, authentication and malformed requests', async () => {
    const health = await request('/health');
    assert.equal(health.status, 200);
    assert.equal(health.headers.get('x-content-type-options'), 'nosniff');
    assert.equal((await request('/health', { headers: { Origin: 'https://untrusted.example' } })).status, 403);
    assert.equal((await request('/notes')).status, 401);
    assert.equal((await request('/auth/signup', { body: { email: {}, password: 'x', name: [] } })).status, 400);
    assert.equal((await request('/auth/login', { method: 'POST' })).status, 400);
    const invalid = await fetch(base[0] + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
    assert.equal(invalid.status, 400);
    assert.deepEqual(await invalid.json(), { error: 'Invalid JSON body' });
  });
  let owner, partner, outsider, couple;
  await t.test('couple creation and joining remain consistent under concurrent requests', async () => {
    owner = await signup('owner');
    partner = await signup('partner');
    outsider = await signup('outsider');
    const created = await Promise.all([1, 2].map(() => request('/auth/create', { token: owner.token, body: {} })));
    assert.deepEqual(created.map((r) => r.status).sort(), [201, 409]);
    couple = created.find((r) => r.status === 201).data;
    assert.equal(await Couple.countDocuments({ members: owner.user.id }), 1);
    const joined = await Promise.all([partner, outsider].map((user) => request('/auth/join', { token: user.token, body: { inviteCode: couple.couple.inviteCode } })));
    assert.deepEqual(joined.map((r) => r.status).sort(), [200, 409]);
    if (joined[1].status === 200) [partner, outsider] = [outsider, partner];
    assert.equal((await Couple.findById(couple.couple.id)).members.length, 2);
    assert.equal(await User.countDocuments({ coupleId: couple.couple.id }), 2);
    // Tokens issued before joining must use current database membership.
    assert.equal((await request('/notes', { token: partner.token })).status, 200);
  });
  await t.test('data stays private across couples; invalid IDs are safe errors', async () => {
    const other = await request('/auth/create', { token: outsider.token, body: {} });
    assert.equal(other.status, 201);
    const note = await request('/notes', { token: owner.token, body: { text: 'private' } });
    assert.equal(note.status, 201);
    assert.deepEqual((await request('/notes', { token: outsider.token })).data, []);
    assert.ok([403, 404].includes((await request('/notes/' + note.data._id, { token: outsider.token, method: 'DELETE' })).status));
    assert.equal((await request('/notes/invalid-id', { token: owner.token, method: 'DELETE' })).status, 400);
  });
  await t.test('existing 30 API scenarios pass with seeded disposable data', async () => {
    await child(['dist/seedPrompts.js']);
    await child(['dist/seedChallenges.js']);
    const output = await child(['-r', 'ts-node/register', 'src/testAllApis.ts']);
    assert.match(output, /30 PASSED, 0 FAILED/);
  });
  await t.test('unanswered partner responses cannot be read through history', async () => {
    for (const feature of ['prompts', 'challenges']) {
      assert.equal((await request(`/${feature}/answer`, { token: owner.token, body: { answerText: 'secret answer' } })).status, 201);
      assert.deepEqual((await request(`/${feature}/history`, { token: partner.token })).data, []);
      assert.equal((await request(`/${feature}/answer`, { token: partner.token, body: { answerText: 'my answer' } })).status, 201);
      assert.equal((await request(`/${feature}/history`, { token: owner.token })).data.length, 1);
    }
  });
  await t.test('chat and drawing relay across server instances without leaking to outsiders', async () => {
    async function connect(url, token) {
      const socket = io(url, { transports: ['websocket'], auth: { token }, reconnection: false });
      sockets.push(socket);
      await Promise.race([once(socket, 'connect'), new Promise((_, reject) => socket.once('connect_error', reject))]);
      return socket;
    }
    const a = await connect(base[0], owner.token);
    const b = await connect(base[1], partner.token);
    const c = await connect(base[1], outsider.token);
    let leaked = false;
    c.on('new-message', () => { leaked = true; });
    const received = once(b, 'new-message');
    const ack = await a.timeout(5000).emitWithAck('send-message', { text: 'Across instances' });
    assert.ok(ack.message._id);
    const [message] = await received;
    assert.equal(message.text, 'Across instances');
    assert.equal(leaked, false);
    const stroke = once(b, 'stroke');
    await a.timeout(5000).emitWithAck('stroke', { points: [{ x: 1, y: 2 }], color: '#fff', strokeWidth: 3 });
    assert.equal((await stroke)[0].points.length, 1);
    const invalid = await a.timeout(5000).emitWithAck('stroke', { points: [] });
    assert.ok(invalid.error);
    // Non-function acknowledgements used to crash the process.
    a.emit('stroke', {}, 'invalid callback');
    assert.equal((await request('/health')).status, 200);
    const cleared = once(b, 'board-cleared');
    await request('/drawing/strokes', { token: owner.token, method: 'DELETE' });
    await cleared;
  });
});
