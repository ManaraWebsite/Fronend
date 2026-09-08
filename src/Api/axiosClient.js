import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://43.156.53.131/api',
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token') || localStorage.getItem('adminToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  } else {
    config.headers['Content-Type'] = 'application/json';
    config.headers['Accept'] = 'application/json';
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosClient;