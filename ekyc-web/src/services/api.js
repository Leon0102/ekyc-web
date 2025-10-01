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

export default api;
