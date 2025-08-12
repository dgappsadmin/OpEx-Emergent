import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL;
const API_BASE_URL = `${BACKEND_URL}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('opex_user') || '{}');
    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('opex_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/signin', { email, password });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  }
};

// Initiative APIs
export const initiativeAPI = {
  getAll: () => api.get('/initiatives'),
  getById: (id) => api.get(`/initiatives/${id}`),
  getByInitiativeId: (initiativeId) => api.get(`/initiatives/initiative-id/${initiativeId}`),
  create: (data) => api.post('/initiatives', data),
  update: (id, data) => api.put(`/initiatives/${id}`, data),
  delete: (id) => api.delete(`/initiatives/${id}`),
  getByStatus: (status) => api.get(`/initiatives/status/${status}`),
  getBySite: (siteCode) => api.get(`/initiatives/site/${siteCode}`),
  getCountByStatus: (status) => api.get(`/initiatives/stats/count/${status}`),
  getTotalValue: () => api.get('/initiatives/stats/total-value')
};

// Lookup APIs
export const lookupAPI = {
  getSites: () => api.get('/initiative-sites'),
  getSiteById: (id) => api.get(`/initiative-sites/${id}`),
  getSiteByCode: (code) => api.get(`/initiative-sites/code/${code}`),
  getDisciplines: () => api.get('/initiative-disciplines'),
  getDisciplineById: (id) => api.get(`/initiative-disciplines/${id}`),
  getDisciplineByCode: (code) => api.get(`/initiative-disciplines/code/${code}`),
  
  // Role APIs
  getRoles: () => api.get('/roles'),
  getRolesBySite: (siteCode) => api.get(`/roles/site/${siteCode}`),
  getRolesByCode: (code) => api.get(`/roles/code/${code}`)
};

// Workflow APIs
export const workflowAPI = {
  getByInitiativeId: (initiativeId) => api.get(`/workflow/initiative/${initiativeId}`),
  getByStatus: (status) => api.get(`/workflow/status/${status}`),
  getById: (id) => api.get(`/workflow/${id}`),
  approve: (stepId, data) => api.post(`/workflow/${stepId}/approve`, data),
  reject: (stepId, data) => api.post(`/workflow/${stepId}/reject`, data),
  update: (id, data) => api.put(`/workflow/${id}`, data),
  getTransactions: (initiativeId) => api.get(`/workflow/transactions/initiative/${initiativeId}`),
  getTransactionsByWorkflowId: (workflowId) => api.get(`/workflow/transactions/${workflowId}`),
  getPendingTransactions: (userEmail) => api.get(`/workflow/pending/${userEmail}`),
  getPendingTransactionsBySite: (site) => api.get(`/workflow/pending/site/${site}`)
};

// KPI APIs
export const kpiAPI = {
  getAll: () => api.get('/kpis'),
  getById: (id) => api.get(`/kpis/${id}`),
  getBySite: (site) => api.get(`/kpis/site/${site}`),
  getByMonthAndSite: (month, site) => api.get(`/kpis/month/${month}/site/${site}`),
  create: (data) => api.post('/kpis', data),
  update: (id, data) => api.put(`/kpis/${id}`, data),
  delete: (id) => api.delete(`/kpis/${id}`),
  getTotalSavings: () => api.get('/kpis/stats/total-savings'),
  getAvgProductivity: () => api.get('/kpis/stats/avg-productivity')
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentActivities: () => api.get('/dashboard/recent-activities')
};

export default api;