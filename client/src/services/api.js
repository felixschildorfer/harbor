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

  // Version History API
  getVersionHistory: (id) => api.get(`/anchor-models/${id}/versions`),
  
  getVersionDetail: (id, versionNum) => api.get(`/anchor-models/${id}/versions/${versionNum}`),
  
  rollbackToVersion: (id, versionNum, changelog) => 
    api.post(`/anchor-models/${id}/rollback/${versionNum}`, { changelog }),
  
  compareVersions: async (id, v1, v2) => {
    const [version1, version2] = await Promise.all([
      api.get(`/anchor-models/${id}/versions/${v1}`),
      api.get(`/anchor-models/${id}/versions/${v2}`),
    ]);
    return { version1: version1.data, version2: version2.data };
  },
};

export default api;
