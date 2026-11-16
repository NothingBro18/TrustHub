const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../app');

test('successful API requests do not exhaust the general rate limit', async (t) => {
  const server = app.listen(0);
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));
  await new Promise((resolve) => server.once('listening', resolve));

  const address = server.address();
  for (let request = 0; request < 110; request += 1) {
    const response = await fetch(`http://127.0.0.1:${address.port}/api/health`);
    assert.equal(response.status, 200);
  }
});

test('repeated unsuccessful API requests remain rate limited', async (t) => {
  const server = app.listen(0);
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));
  await new Promise((resolve) => server.once('listening', resolve));

  const address = server.address();
  for (let request = 0; request < 101; request += 1) {
    const response = await fetch(`http://127.0.0.1:${address.port}/api/not-found`);
    assert.equal(response.status, request < 100 ? 404 : 429);
  }
});
