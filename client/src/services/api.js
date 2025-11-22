import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

let accessToken = null;
export const setAccessToken = (token) => {
  accessToken = token;
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${accessToken}`,
    };
  }
  return config;
});

let isRefreshing = false;
const refreshQueue = [];

const processQueue = (error, token = null) => {
  while (refreshQueue.length) {
    const { resolve, reject } = refreshQueue.shift();
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/register') &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((queueError) => Promise.reject(queueError));
      }

      isRefreshing = true;

      try {
        const { data } = await refreshClient.post('/auth/refresh');
        setAccessToken(data.accessToken);
        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  refresh: () => refreshClient.post('/auth/refresh'),
};

// Anchor Models API
export const anchorModelsAPI = {
  // Get all anchor models
  getAll: () => api.get('/anchor-models'),
  
  // Get anchor model by ID
  getById: (id) => api.get(`/anchor-models/${id}`),
  
  // Create anchor model
  create: (data) => api.post('/anchor-models', data),
  
  // Update anchor model
  update: (id, data) => api.put(`/anchor-models/${id}`, data),
  
  // Delete anchor model
  delete: (id) => api.delete(`/anchor-models/${id}`),

  // Get version history for a model
  getHistory: (id) => api.get(`/anchor-models/${id}/history`),

  // Restore a previous version
  restoreVersion: (id, versionNumber) => 
    api.post(`/anchor-models/${id}/restore/${versionNumber}`),
};

// Database Connections API
export const databaseAPI = {
  // Get all connections
  getConnections: () => api.get('/db/connections'),

  // Get connection by ID
  getConnection: (id) => api.get(`/db/connections/${id}`),

  // Create new connection
  createConnection: (data) => api.post('/db/connections', data),

  // Update connection
  updateConnection: (id, data) => api.put(`/db/connections/${id}`, data),

  // Delete connection
  deleteConnection: (id) => api.delete(`/db/connections/${id}`),

  // Test connection
  testConnection: (id) => api.post(`/db/test-connection/${id}`),

  // Execute SQL query
  executeQuery: (connectionId, query) => 
    api.post('/db/execute', { connectionId, query }),
};

export default api;
