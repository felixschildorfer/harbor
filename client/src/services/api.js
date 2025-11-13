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
  
  // Create anchor model
  create: (data) => api.post('/anchor-models', data),
};

export default api;
