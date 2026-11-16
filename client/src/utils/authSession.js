const AUTH_TOKEN_KEY = 'trusthub.authToken';
const LEGACY_TOKEN_KEY = 'token';

export const getAuthToken = (storage = window.sessionStorage) =>
  storage.getItem(AUTH_TOKEN_KEY);

export const setAuthToken = (token, storage = window.sessionStorage) => {
  if (typeof token !== 'string' || !token) {
    throw new Error('A valid authentication token is required');
  }
  storage.setItem(AUTH_TOKEN_KEY, token);
};

export const clearAuthToken = (storage = window.sessionStorage) =>
  storage.removeItem(AUTH_TOKEN_KEY);

export const migrateLegacyToken = (
  sessionStorage = window.sessionStorage,
  localStorage = window.localStorage
) => {
  const sessionToken = sessionStorage.getItem(AUTH_TOKEN_KEY);
  const legacyToken = localStorage.getItem(LEGACY_TOKEN_KEY);
  if (!sessionToken && legacyToken) {
    sessionStorage.setItem(AUTH_TOKEN_KEY, legacyToken);
  }
  localStorage.removeItem(LEGACY_TOKEN_KEY);
};

export const consumeOAuthCode = ({
  location = window.location,
  history = window.history,
} = {}) => {
  const params = new URLSearchParams(location.hash.slice(1));
  const code = params.get('code');
  if (!code) return null;

  history.replaceState(history.state, '', `${location.pathname}${location.search}`);
  return code;
};
