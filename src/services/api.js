// 📁 admin-web/src/services/api.js

import axios from 'axios';

// ============================================
// API CONFIGURATION
// ============================================
// Defaults to the hosted Render backend.
// Override in .env with VITE_API_URL if you ever need to point elsewhere
// (e.g. a staging server or a local backend).
const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://gas-mtaani-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-admin-key': 'adminsecretkey_123',
  },
});

// ============================================
// REQUEST INTERCEPTOR - Add Token
// ============================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================
// RESPONSE INTERCEPTOR - Handle Errors
// ============================================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTH API
// ============================================
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/login';
  },
  getCurrentUser: () => api.get('/auth/me'),
};

// ============================================
// ADMIN API
// ============================================
export const adminAPI = {
  // ------------------------------------------
  // DASHBOARD
  // ------------------------------------------
  getDashboard: () => api.get('/admin/dashboard'),
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getRevenueData: () => api.get('/admin/dashboard/revenue'),
  getRecentOrders: () => api.get('/admin/dashboard/recent-orders'),

  // ------------------------------------------
  // CUSTOMERS
  // ------------------------------------------
  getCustomers: () => api.get('/admin/customers'),
  getCustomerDetails: (id) => api.get(`/admin/customers/${id}`),
  updateCustomer: (id, data) => api.put(`/admin/customers/${id}`, data),
  deleteCustomer: (id) => api.delete(`/admin/customers/${id}`),
  toggleCustomerStatus: (id, is_active) =>
    api.put(`/admin/customers/${id}/toggle-status`, { is_active }),
  exportCustomers: () =>
    api.get('/admin/exports/customers', { responseType: 'blob' }),

  // customer profile data
  getCustomerOrders: (customerId) =>
    api.get(`/admin/customers/${customerId}/orders`),
  getCustomerPayments: (customerId) =>
    api.get(`/admin/customers/${customerId}/payments`),
  getCustomerChats: (customerId) =>
    api.get(`/admin/customers/${customerId}/chats`),
  getCustomerTickets: (customerId) =>
    api.get(`/admin/customers/${customerId}/tickets`),

  // ------------------------------------------
  // AGENTS
  // ------------------------------------------
  getAgents: () => api.get('/admin/agents'),
  getPendingAgents: () => api.get('/admin/agents/pending'),
  getAgentDetails: (id) => api.get(`/admin/agents/${id}`),
  approveAgent: (id) => api.put(`/admin/agents/${id}/approve`),
  rejectAgent: (id) => api.delete(`/admin/agents/${id}/reject`),
  banAgent: (id) => api.put(`/admin/agents/${id}/ban`),
  unbanAgent: (id) => api.put(`/admin/agents/${id}/unban`),
  getAgentsList: () => api.get('/admin/agents/list'),

  // agent profile data
  getAgentOrders: (agentId) => api.get(`/admin/agents/${agentId}/orders`),
  getAgentPayments: (agentId) => api.get(`/admin/agents/${agentId}/payments`),
  getAgentChats: (agentId) => api.get(`/admin/agents/${agentId}/chats`),
  getAgentTickets: (agentId) => api.get(`/admin/agents/${agentId}/tickets`),

  // ------------------------------------------
  // PRODUCTS
  // ------------------------------------------
  getProducts: () => api.get('/admin/products'),
  getProductDetails: (id) => api.get(`/admin/products/${id}`),
  createProduct: (data) => api.post('/admin/products', data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  toggleProductStatus: (id, is_active) =>
    api.put(`/admin/products/${id}/toggle-status`, { is_active }),
  getProductPriceHistory: (id) =>
    api.get(`/admin/products/${id}/price-history`),
  getProductsList: () => api.get('/admin/products/list'),

  // ------------------------------------------
  // ORDERS
  // ------------------------------------------
  getOrders: () => api.get('/admin/orders'),
  getOrderDetails: (id) => api.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, status) =>
    api.put(`/admin/orders/${id}/status`, { status }),
  cancelOrder: (id) => api.put(`/admin/orders/${id}/cancel`),
  assignAgent: (orderId, agentId) =>
    api.put(`/admin/orders/${orderId}/assign-agent`, { agent_id: agentId }),
  assignAgentToOrder: (orderId, agentId) =>
    api.put(`/admin/orders/${orderId}/assign-agent`, { agent_id: agentId }),
  bulkUpdateOrderStatus: (orderIds, status) =>
    api.put('/admin/orders/bulk-status', { orderIds, status }),
  createOrderForCustomer: (data) => api.post('/admin/orders/create', data),

  // ------------------------------------------
  // INVENTORY
  // ------------------------------------------
  getInventory: () => api.get('/admin/inventory'),
  getInventoryItem: (id) => api.get(`/admin/inventory/${id}`),
  createInventory: (data) => api.post('/admin/inventory', data),
  updateInventory: (id, data) => api.put(`/admin/inventory/${id}`, data),
  deleteInventory: (id) => api.delete(`/admin/inventory/${id}`),
  getInventoryByAgent: (agentId) =>
    api.get(`/admin/inventory/agent/${agentId}`),
  getInventoryByProduct: (productId) =>
    api.get(`/admin/inventory/product/${productId}`),

  // ------------------------------------------
  // WITHDRAWALS
  // ------------------------------------------
  getWithdrawals: () => api.get('/admin/withdrawals'),
  getPendingWithdrawals: () => api.get('/admin/withdrawals/pending'),
  processWithdrawal: (id, status) =>
    api.put(`/admin/withdrawals/${id}/process`, { status }),
  approveWithdrawal: (id) => api.put(`/admin/withdrawals/${id}/approve`),
  rejectWithdrawal: (id) => api.put(`/admin/withdrawals/${id}/reject`),
  markWithdrawalAsPaid: (id) =>
    api.put(`/admin/withdrawals/${id}/mark-paid`),

  // ------------------------------------------
  // ANALYTICS
  // ------------------------------------------
  getAnalytics: () => api.get('/admin/analytics'),
  getRevenueAnalytics: (period) =>
    api.get(`/admin/analytics/revenue?period=${period}`),
  getOrderAnalytics: () => api.get('/admin/analytics/orders'),
  getAgentPerformance: () => api.get('/admin/analytics/agents'),
  getCustomerInsights: () => api.get('/admin/analytics/customers'),

  // ------------------------------------------
  // SETTINGS
  // ------------------------------------------
  getSettings: () => api.get('/admin/settings'),
  getSettingsByGroup: (group) => api.get(`/admin/settings/${group}`),
  getSettingByKey: (key) => api.get(`/admin/settings/${key}`),
  updateSettings: (data) => api.put('/admin/settings', data),
  updateSetting: (key, data) => api.put(`/admin/settings/${key}`, data),
  resetSettings: () => api.post('/admin/settings/reset'),

  // ------------------------------------------
  // EXPORTS
  // ------------------------------------------
  exportOrders: () =>
    api.get('/admin/exports/orders', { responseType: 'blob' }),
  exportCustomers: () =>
    api.get('/admin/exports/customers', { responseType: 'blob' }),
  exportProducts: () =>
    api.get('/admin/exports/products', { responseType: 'blob' }),
  exportAnalytics: () =>
    api.get('/admin/exports/analytics', { responseType: 'blob' }),
  exportWithdrawals: () =>
    api.get('/admin/exports/withdrawals', { responseType: 'blob' }),

  // ------------------------------------------
  // SUPPORT
  // ------------------------------------------
  getSupportTickets: () => api.get('/admin/support/tickets'),
  getSupportTicketDetails: (id) =>
    api.get(`/admin/support/tickets/${id}`),
  updateSupportTicket: (id, data) =>
    api.put(`/admin/support/tickets/${id}`, data),
  replyToSupportTicket: (id, data) =>
    api.post(`/admin/support/tickets/${id}/reply`, data),
  deleteSupportTicket: (id) =>
    api.delete(`/admin/support/tickets/${id}`),

  // ------------------------------------------
  // NOTIFICATIONS
  // ------------------------------------------
  getNotifications: () => api.get('/admin/notifications'),
  sendNotification: (data) => api.post('/admin/notifications', data),
  deleteNotification: (id) => api.delete(`/admin/notifications/${id}`),
  markNotificationAsRead: (id) =>
    api.put(`/admin/notifications/${id}/read`),

  // ------------------------------------------
  // PUSH NOTIFICATIONS
  // ------------------------------------------
  getPushNotifications: () => api.get('/admin/push-notifications'),
  sendPushNotification: (data) => api.post('/admin/push-notifications', data),
  markPushNotificationAsRead: (id) =>
    api.put(`/admin/push-notifications/${id}/read`),

  // ------------------------------------------
  // BULK ACTIONS
  // ------------------------------------------
  bulkUpdateOrders: (orderIds, action) =>
    api.post('/admin/orders/bulk', { orderIds, action }),
  bulkDeleteProducts: (productIds) =>
    api.delete('/admin/products/bulk', { data: { productIds } }),
  bulkApproveAgents: (agentIds) =>
    api.put('/admin/agents/bulk-approve', { agentIds }),
};

export default api;