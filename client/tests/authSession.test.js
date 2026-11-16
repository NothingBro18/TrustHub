import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clearAuthToken,
  consumeOAuthCode,
  getAuthToken,
  migrateLegacyToken,
  setAuthToken,
} from '../src/utils/authSession.js';

const createStorage = (entries = {}) => {
  const values = new Map(Object.entries(entries));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
};

test('authentication tokens remain isolated between tab session stores', () => {
  const firstTab = createStorage();
  const secondTab = createStorage();

  setAuthToken('first-user-token', firstTab);
  setAuthToken('second-user-token', secondTab);

  assert.equal(getAuthToken(firstTab), 'first-user-token');
  assert.equal(getAuthToken(secondTab), 'second-user-token');
  clearAuthToken(firstTab);
  assert.equal(getAuthToken(firstTab), null);
  assert.equal(getAuthToken(secondTab), 'second-user-token');
});

test('legacy shared token is migrated into one tab and removed from local storage', () => {
  const sessionStorage = createStorage();
  const localStorage = createStorage({ token: 'legacy-token' });

  migrateLegacyToken(sessionStorage, localStorage);

  assert.equal(getAuthToken(sessionStorage), 'legacy-token');
  assert.equal(localStorage.getItem('token'), null);
});

test('OAuth code is removed from the address bar for one-time tab exchange', () => {
  const storage = createStorage();
  let replacedUrl;
  const location = {
    hash: '#code=one-time-code&state=unused',
    pathname: '/oauth/callback',
    search: '?source=google',
  };
  const history = {
    state: null,
    replaceState: (_state, _title, url) => { replacedUrl = url; },
  };

  assert.equal(consumeOAuthCode({ location, history }), 'one-time-code');
  assert.equal(getAuthToken(storage), null);
  assert.equal(replacedUrl, '/oauth/callback?source=google');
});
