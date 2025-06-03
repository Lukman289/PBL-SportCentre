import axiosInstance from '../config/axios.config';
import { LoginRequest, RegisterRequest, UserWithToken } from '../types';
import { hasAuthCookie } from '@/utils/cookie.utils';
import Cookies from 'js-cookie';

// Interface untuk error Axios
interface AxiosErrorResponse {
  response?: {
    status?: number;
    data?: unknown;
  };
}

class AuthApi {
  /**
   * Login user dengan email/nomor telepon dan password
   * @param data - Data login berupa identifier (email/telepon) dan password
   * @returns Promise dengan data user dan token
   */
  async login(data: LoginRequest): Promise<UserWithToken> {
    // Menyesuaikan payload agar kompatibel dengan backend
    // Backend masih menggunakan field "email" meskipun bisa berisi email atau nomor telepon
    const payload = {
      email: data.identifier,
      password: data.password
    };
    
    const response = await axiosInstance.post<UserWithToken>('/auth/login', payload, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    // Token dan user disimpan dalam cookie di server
    return response.data;
  }

  /**
   * Register user baru
   * @param data - Data registrasi berupa nama, email, password, dll
   * @returns Promise dengan data user yang berhasil dibuat
   */
  async register(data: RegisterRequest): Promise<{ user: UserWithToken }> {
    const response = await axiosInstance.post<{ user: UserWithToken }>('/auth/register', data, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    return response.data;
  }

  /**
   * Logout user
   * @returns Promise dengan pesan sukses
   */
  async logout(): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.post<{ message: string }>('/auth/logout', {}, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      // Menghapus is_logged_in cookie dari client-side
      // Next.js tidak mendukung operasi document.cookie di server-side
      if (typeof window !== 'undefined') {
        Cookies.remove('is_logged_in', { path: '/' });
      }
      
      // Cookie akan dihapus oleh server
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      // Tetap menghapus cookie meskipun terjadi error
      if (typeof window !== 'undefined') {
        Cookies.remove('is_logged_in', { path: '/' });
      }
      throw error;
    }
  }

  /**
   * Cek status autentikasi user
   * @returns Promise dengan data user jika terautentikasi, null jika tidak
   */
  async getAuthStatus(): Promise<UserWithToken | null> {
    try {
      if (!hasAuthCookie()) {
        return null; 
      }

      // Cookie auth_token (httpOnly) akan dikirim otomatis oleh browser
      const response = await axiosInstance.get<UserWithToken>('/auth/status', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Error getting auth status:', error);
      
      // Jika error 401, hapus cookie klien supaya konsisten
      const axiosError = error as AxiosErrorResponse;
      if (axiosError.response?.status === 401) {
        if (typeof window !== 'undefined') {
          Cookies.remove('is_logged_in', { path: '/' });
        }
      }
      
      return null;
    }
  }

  /**
   * Refresh token
   * @returns Promise dengan token baru
   */
  async refreshToken(): Promise<{ token: string }> {
    try {
      const response = await axiosInstance.post<{ token: string }>('/auth/refresh-token', {}, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      // Token akan disimpan sebagai cookie oleh server
      return response.data;
    } catch (error) {
      console.error('Error refreshing token:', error);
      
      // Jika error 401, hapus cookie klien supaya konsisten
      const axiosError = error as AxiosErrorResponse;
      if (axiosError.response?.status === 401) {
        if (typeof window !== 'undefined') {
          Cookies.remove('is_logged_in', { path: '/' });
        }
      }
      
      throw error;
    }
  }
}

export const authApi = new AuthApi(); 