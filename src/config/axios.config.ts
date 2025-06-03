'use client';

import axios from 'axios';
import { useRouter } from 'next/navigation';

// Gunakan relative URL untuk memanfaatkan proxy di next.config.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {'Content-Type': 'application/json'}
});

// Buat interceptor factory untuk menghindari masalah dengan useRouter di server-side
export const createAxiosResponseInterceptor = (router: ReturnType<typeof useRouter>) => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && 
          !originalRequest._retry && 
          !originalRequest.url?.includes('auth/status') &&
          !originalRequest.url?.includes('auth/login') &&
          !originalRequest.url?.includes('auth/refresh-token')) {
        
        originalRequest._retry = true;
        
        try {
          const refreshResponse = await axios.post(
            `${BASE_URL}/auth/refresh-token`,
            {},
            { withCredentials: true }
          );
          
          if (refreshResponse.status === 200) {
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          router.push('/auth/login');
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );
};

axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance; 