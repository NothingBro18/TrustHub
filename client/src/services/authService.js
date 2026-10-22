import api from './api.js';

export const login = async (credentials) => (await api.post('/auth/login', credentials)).data;
export const register = async (userDetails) => (await api.post('/auth/register', userDetails)).data;
export const loginAsGuest = async () => (await api.post('/auth/guest')).data;
export const fetchCurrentUser = async () => (await api.get('/auth/me')).data;