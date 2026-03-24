import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalize error messages
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (!err.response) {
      err.userMessage = 'Could not connect to the server. Check your internet connection.';
    } else {
      const data = err.response.data;
      err.userMessage =
        data?.error ||
        (Array.isArray(data?.errors) && data.errors[0]?.msg) ||
        'Something went wrong. Please try again.';
    }
    return Promise.reject(err);
  }
);

export default api;
