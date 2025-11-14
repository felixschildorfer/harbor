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
};

export default api;
