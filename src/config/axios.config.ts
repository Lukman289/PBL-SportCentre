'use client';

import axios from 'axios';
import { useAuth } from "@/context/auth/auth.context";

// Gunakan relative URL untuk memanfaatkan proxy di next.config.ts -chatgpt
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';


export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {'Content-Type': 'application/json'}
});

// Tambahkan log sederhana untuk debugging
axiosInstance.interceptors.request.use(
  (config) => {
    // console.log(`Request to: ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { isAuthenticated } = useAuth();
    const originalRequest = error.config;
    
    // Jangan coba refresh token jika error dari endpoint auth/status atau auth/login
    // atau jika request sudah pernah dicoba refresh
    if (error.response?.status === 401 && 
        !originalRequest._retry && 
        !originalRequest.url?.includes('auth/status') &&
        !originalRequest.url?.includes('auth/login') &&
        !originalRequest.url?.includes('auth/refresh-token')) {
      
      originalRequest._retry = true;
      
      try {
        // console.log('Mencoba refresh token...');
        const refreshResponse = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        
        if (refreshResponse.status === 200) {
          // console.log('Token berhasil diperbarui');
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        if (!isAuthenticated) {
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 