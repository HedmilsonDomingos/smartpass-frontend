import axios from 'axios';

// Central axios instance used across the app. Base URL is configurable via
// REACT_APP_API_URL environment variable (create .env in frontend root if needed).
const API_URL = process.env.REACT_APP_API_URL || 'https://smartpass-api.onrender.com';

// --- Authenticated API Instance ---
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach auth token from localStorage on every request if present
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore
  }
  return config;
});

// --- Public API Instance (No Auth Interceptor) ---
export const publicApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
