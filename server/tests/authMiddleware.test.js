const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const User = require('../src/models/User');
const { protect } = require('../src/middlewares/auth');

test('authentication does not fall back to a cookie shared by other tabs', async () => {
  const req = { headers: {}, cookies: { token: 'shared-cookie-token' } };
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
  let nextCalled = false;

  await protect(req, res, () => { nextCalled = true; });

  assert.equal(res.statusCode, 401);
  assert.equal(res.body.message, 'Not authorized, no token');
  assert.equal(nextCalled, false);
});

test('a tab Bearer token authenticates that tab user', async (t) => {
  const originalFindById = User.findById;
  t.after(() => { User.findById = originalFindById; });

  const user = {
    _id: 'tab-user-id',
    lastActiveAt: new Date(),
    isOnline: true,
  };
  User.findById = () => ({ select: async () => user });
  process.env.JWT_SECRET = 'test-secret-for-tab-auth';

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = {};
  let nextCalled = false;

  await protect(req, res, () => { nextCalled = true; });

  assert.equal(req.user, user);
  assert.equal(nextCalled, true);
});
