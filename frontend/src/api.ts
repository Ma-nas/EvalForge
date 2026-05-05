import axios from 'axios';

const API_BASE = '/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 120000,
});

// Evaluation API
export const evaluateService = {
  single: (data: any) => api.post('/evaluation/evaluate', data),
  batch: (data: any) => api.post('/evaluation/evaluate/batch', data),
};

// Hallucination API
export const hallucinationService = {
  detect: (data: any) => api.post('/hallucination/detect', data),
};

// Benchmark API
export const benchmarkService = {
  run: (data: any) => api.post('/benchmark/run', data),
  runBatch: (data: any) => api.post('/benchmark/run/batch', data),
};

// RAG API
export const ragService = {
  evaluate: (data: any) => api.post('/rag/evaluate', data),
};

// Dataset API
export const datasetService = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/datasets/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  list: () => api.get('/datasets/'),
  get: (id: string) => api.get(`/datasets/${id}`),
  getData: (id: string, limit = 100) => api.get(`/datasets/${id}/data?limit=${limit}`),
  delete: (id: string) => api.delete(`/datasets/${id}`),
};

export default api;
