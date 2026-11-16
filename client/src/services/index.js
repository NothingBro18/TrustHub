import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.get('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  heartbeat: () => api.post('/auth/heartbeat'),
  exchangeOAuthCode: (code) => api.post('/auth/oauth/exchange', { code }),
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
  updateStatus: (id, payload) => api.put(`/bookings/${id}/status`, typeof payload === 'string' ? { status: payload } : payload),
  markPaymentReceived: (id, paymentAmount) => api.patch(`/bookings/${id}/payment`, { paymentAmount }),
};

export const messageService = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (otherUserId, params) => api.get(`/messages/${otherUserId}`, { params }),
  sendMessage: (data) => api.post('/messages', data),
  markAsRead: (otherUserId) => api.put(`/messages/read/${otherUserId}`),
  getUnreadCount: () => api.get('/messages/unread-count'),
};

export const serviceService = {
  getServices: (params) => api.get('/services', { params }),
  getMyServices: () => api.get('/services/mine'),
  createService: (data) => api.post('/services', data),
  updateService: (id, data) => api.put(`/services/${id}`, data),
  deactivateService: (id) => api.delete(`/services/${id}`),
};

export const reviewService = {
  getMyReviews: () => api.get('/reviews/mine'),
  createReview: (data) => api.post('/reviews', data),
};

export const notificationService = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  getProviders: (params) => api.get('/admin/providers', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getFlaggedActivities: (params) => api.get('/admin/flagged', { params }),
  createFlaggedActivity: (data) => api.post('/admin/flagged', data),
  resolveFlaggedActivity: (id, data) => api.put(`/admin/flagged/${id}/resolve`, data),
  deleteFlaggedActivity: (id) => api.delete(`/admin/flagged/${id}`),
  verifyProvider: (id, data) => api.put(`/admin/providers/${id}/verify`, data),
  getServices: (params) => api.get('/admin/services', { params }),
  updateService: (id, data) => api.patch(`/admin/services/${id}`, data),
};
