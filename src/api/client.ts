import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Replace with your deployed Render URL once live. Use your local IP (not localhost)
// when testing on a physical device via Expo Go — localhost won't reach your laptop's server.
export const BASE_URL = 'https://meeting-intelligence-service-dn5p.onrender.com';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Centralized place to handle 401s globally later if needed
    return Promise.reject(error);
  }
);