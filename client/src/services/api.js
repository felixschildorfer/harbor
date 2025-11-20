import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
