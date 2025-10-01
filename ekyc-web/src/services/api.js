import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
});

/**
 * Check API health status
 */
export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

/**
 * Verify face between ID card and selfie
 */
export const verifyFace = async (idCardFile, selfieFile) => {
  try {
    const formData = new FormData();
    formData.append('id_card', idCardFile);
    formData.append('selfie', selfieFile);

    const response = await api.post('/verify', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Verification failed:', error);
    throw error;
  }
};

/**
 * Detect face in an image
 */
export const detectFace = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await api.post('/detect-face', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Face detection failed:', error);
    throw error;
  }
};

// ============= ADMIN APIs =============

const adminApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Add token to admin requests
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors for admin
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_username');
      window.location.href = '/admin';
    }
    return Promise.reject(error);
  }
);

export const adminLogin = async (username, password) => {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  const response = await api.post('/admin/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  return response.data;
};

export const getVerifications = async (skip = 0, limit = 50) => {
  const response = await adminApi.get(`/admin/verifications?skip=${skip}&limit=${limit}`);
  return response.data;
};

export const getStats = async () => {
  const response = await adminApi.get('/admin/stats');
  return response.data;
};

export const deleteVerification = async (id) => {
  const response = await adminApi.delete(`/admin/verifications/${id}`);
  return response.data;
};

export default api;
