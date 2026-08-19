import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://43.156.53.131/api',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// إضافة Interceptor لجلب الـ Token المحدث من localStorage تلقائياً مع كل طلب
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosClient;