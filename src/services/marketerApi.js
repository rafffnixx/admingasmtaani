// admin-web/src/services/marketerApi.js
import axios from 'axios';

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://gas-mtaani-backend.onrender.com/api';

const marketerApi = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

marketerApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('marketer_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

marketerApi.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('marketer_token');
      const p = window.location.pathname;
      if (p.startsWith('/marketer') && p !== '/marketer/login') {
        window.location.href = '/marketer/login';
      }
    }
    return Promise.reject(err);
  }
);

export default marketerApi;