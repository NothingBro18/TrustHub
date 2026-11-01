import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.get('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
  googleLogin: () => { window.location.href = `${import.meta.env.VITE_API_URL || '/api'}/auth/google`; },
  githubLogin: () => { window.location.href = `${import.meta.env.VITE_API_URL || '/api'}/auth/github`; },
};

export const userService = {
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data),
  toggleSavedProvider: (providerId) => api.put(`/users/saved-providers/${providerId}`),
  getDashboard: () => api.get('/users/dashboard'),
};

export const providerService = {
  getProviders: (params) => api.get('/providers', { params }),
  getProvider: (id) => api.get(`/providers/${id}`),
  updateProfile: (data) => api.put('/providers/me', data),
  getDashboard: () => api.get('/providers/dashboard'),
};

export const bookingService = {
  createBooking: (data) => api.post('/bookings', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMyBookings: (params) => api.get('/bookings/my', { params }),
  getProviderBookings: (params) => api.get('/bookings/provider', { params }),
  getBooking: (id) => api.get(`/bookings/${id}`),
  updateStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }),
};

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getFlaggedActivities: (params) => api.get('/admin/flagged', { params }),
  createFlaggedActivity: (data) => api.post('/admin/flagged', data),
  resolveFlaggedActivity: (id, data) => api.put(`/admin/flagged/${id}/resolve`, data),
  deleteFlaggedActivity: (id) => api.delete(`/admin/flagged/${id}`),
  verifyProvider: (id, data) => api.put(`/admin/providers/${id}/verify`, data),
};
