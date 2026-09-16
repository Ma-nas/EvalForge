import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_URL || '') + '/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 120000,
});

// ─── JWT Token Interceptor ──────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('evalforge_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── 401 Response Interceptor ───────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('evalforge_token');
      if (!error.config?.url?.includes('/auth/')) {
        console.warn('[EvalForge] Token expired or invalid');
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ───────────────────────────────────────
export const authService = {
  register: (data: { email: string; username: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// ─── Dashboard API ──────────────────────────────────
export const dashboardService = {
  getSummary: () => api.get('/dashboard/summary'),
};

// ─── Evaluation API ─────────────────────────────────
export const evaluateService = {
  single: (data: any) => api.post('/evaluation/evaluate', data),
  batch: (data: any) => api.post('/evaluation/evaluate/batch', data),
};

// ─── Hallucination API ──────────────────────────────
export const hallucinationService = {
  detect: (data: any) => api.post('/hallucination/detect', data),
  getHistory: () => api.get('/hallucination/history'),
};

// ─── Benchmark API ──────────────────────────────────
export const benchmarkService = {
  run: (data: any) => api.post('/benchmark/run', data),
  runBatch: (data: any) => api.post('/benchmark/run/batch', data),
};

// ─── RAG API ────────────────────────────────────────
export const ragService = {
  evaluate: (data: any) => api.post('/rag/evaluate', data),
  getHistory: () => api.get('/rag/history'),
};

// ─── Dataset API ────────────────────────────────────
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
  evaluateBatch: (id: string, config: any) => api.post(`/datasets/${id}/evaluate`, config),
  seed: () => api.post('/datasets/seed'),
  delete: (id: string) => api.delete(`/datasets/${id}`),
};

// ─── Export API ─────────────────────────────────────
export const exportService = {
  getEvaluationsUrl: (format: 'json' | 'csv' = 'json') => `${API_BASE}/export/evaluations?format=${format}`,
  getBenchmarksUrl: (format: 'json' | 'csv' = 'json') => `${API_BASE}/export/benchmarks?format=${format}`,
};

export default api;
