// Central API config — all requests go to the Express backend
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Store token in localStorage
export const saveToken = (token) => localStorage.setItem('linkbook_token', token);
export const getToken  = ()      => localStorage.getItem('linkbook_token');
export const clearToken = ()     => localStorage.removeItem('linkbook_token');

// Store user object in localStorage
export const saveUser = (user) => {
  localStorage.setItem('linkbook_user', JSON.stringify(user));
  window.dispatchEvent(new Event('linkbook:userchange'));
};
export const getUser  = ()     => {
  try {
    const u = localStorage.getItem('linkbook_user');
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
};
export const clearUser = () => localStorage.removeItem('linkbook_user');

// Generic request helper
const request = async (method, path, body = null) => {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401) {
      clearToken();
      clearUser();
      window.location.hash = '#login';
    }
    throw new Error(data.message || 'Erreur serveur');
  }
  return data;
};

// Auth endpoints
export const authAPI = {
  register: (payload) => request('POST', '/auth/register', payload),
  login:    (payload) => request('POST', '/auth/login',    payload),
  me:       ()        => request('GET',  '/auth/me'),
  sendVerification: (email) => request('POST', '/auth/send-verification', { email }),
  verifyEmail: (email, otp) => request('POST', '/auth/verify-email', { email, otp }),
  forgotPassword: (email) => request('POST', '/auth/forgot', { email }),
  resetPassword: (token, password) => request('POST', `/auth/reset/${token}`, { password }),
  updateProfile: (payload) => request('PUT', '/auth/profile', payload),
  changePassword: (currentPassword, newPassword) => request('PUT', '/auth/password', { currentPassword, newPassword }),
};

// Book endpoints
export const bookAPI = {
  create:   (payload) => request('POST',   '/books', payload),
  getAll:   (params)  => request('GET',    '/books' + (params ? '?' + new URLSearchParams(params) : '')),
  search:   (params)  => request('GET',    '/books/search' + (params ? '?' + new URLSearchParams(params) : '')),
  getById:  (id)      => request('GET',    `/books/${id}`),
  update:   (id, payload) => request('PUT',    `/books/${id}`, payload),
  delete:   (id)      => request('DELETE', `/books/${id}`),
};

// Upload endpoint (multipart)
export const uploadAPI = {
  upload: async (files) => {
    const token = getToken();
    const fd = new FormData();
    files.forEach(f => fd.append('images', f));
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erreur upload');
    return data;
  },
};

// Invitation endpoints
export const invitationAPI = {
  send:      (bookId)     => request('POST', '/invitations', { bookId }),
  getMine:   ()           => request('GET',  '/invitations'),
  accept:    (id)         => request('PUT',  `/invitations/${id}/accept`),
  refuse:    (id)         => request('PUT',  `/invitations/${id}/refuse`),
};

// Notification endpoints
export const notificationAPI = {
  get: () => request('GET', '/notifications'),
};

// Subscription endpoint
export const subscriptionAPI = {
  purchase: (planType) => request('POST', '/subscriptions/purchase', { planType }),
};

// Chat endpoints
export const chatAPI = {
  getConversations: () => request('GET', '/chat/conversations'),
  getMessages: (id) => request('GET', `/chat/messages/${id}`),
  sendMessage: (payload) => request('POST', '/chat/messages', payload),
  startConversation: (participantId) => request('POST', '/chat/conversations', { participantId }),
  askAI: (payload) => request('POST', '/chat/ask', payload),
};

// Payment endpoints
export const paymentAPI = {
  requestRecharge: (payload) => request('POST', '/payments/recharge', payload),
  getHistory: () => request('GET', '/payments/history'),
  getStats: () => request('GET', '/payments/stats'),
  purchaseBook: (bookId) => request('POST', '/payments/purchase', { bookId }),
  approveRecharge: (id) => request('PUT', `/payments/recharge/${id}/approve`),
};

// Asset helpers — images stored in MongoDB
export const assetURL = (filename) => `${API_BASE}/assets/${filename}`;

export const assetAPI = {
  getAll: () => request('GET', '/assets'),
};

// Admin endpoints
export const adminAPI = {
  getStats:      ()          => request('GET',    '/admin/stats'),
  getUsers:      (params)    => request('GET',    '/admin/users' + (params ? '?' + new URLSearchParams(params) : '')),
  getUserById:   (id)        => request('GET',    `/admin/users/${id}`),
  updateUser:    (id, data)  => request('PUT',    `/admin/users/${id}`, data),
  deleteUser:    (id)        => request('DELETE', `/admin/users/${id}`),
  banUser:       (id)        => request('PUT',    `/admin/users/${id}/ban`),
  unbanUser:     (id)        => request('PUT',    `/admin/users/${id}/unban`),
  banIp:         (id)        => request('PUT',    `/admin/users/${id}/ban-ip`),
  unbanIp:       (id)        => request('PUT',    `/admin/users/${id}/unban-ip`),
  upgradeSub:    (id, months) => request('PUT',   `/admin/users/${id}/upgrade`, { months }),
  toggleAccess:  (id)        => request('PUT',    `/admin/users/${id}/toggle-access`),
  getBooks:      (params)    => request('GET',    '/admin/books' + (params ? '?' + new URLSearchParams(params) : '')),
  updateBook:    (id, data)  => request('PUT',    `/admin/books/${id}`, data),
  deleteBook:    (id)        => request('DELETE', `/admin/books/${id}`),
  getWeeklyActivity:  ()    => request('GET',    '/admin/stats/weekly'),
  getWilayaStats:     ()    => request('GET',    '/admin/stats/wilaya'),
  getRegistrationEvolution: () => request('GET', '/admin/stats/registrations'),
};
