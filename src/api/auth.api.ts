import axiosInstance from '../config/axios.config';
import { ForgotPasswordRequest, LoginRequest, RegisterRequest, ResetPasswordRequest, UserWithToken } from '../types';
import { hasAuthCookie, setResetPasswordToken, getResetPasswordToken } from '@/utils/cookie.utils';
import Cookies from 'js-cookie';

// Interface untuk error Axios
interface AxiosErrorResponse {
  response?: {
    status?: number;
    data?: unknown;
  };
}

// Interface untuk response forgot password
interface ForgotPasswordResponse {
  message: string;
  resetUrl?: string; // Opsional, hanya ada di mode development
  token?: string; // Opsional, hanya ada di mode development
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

  /**
   * Kirim permintaan reset password
   * @param data - Data berupa email
   * @returns Promise dengan pesan sukses
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    const response = await axiosInstance.post<ForgotPasswordResponse>('/auth/forgot-password', data, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    // Jika dalam mode development dan ada token, simpan di cookie
    if (response.data.token) {
      setResetPasswordToken(response.data.token);
    }
    
    return response.data;
  }

  /**
   * Reset password dengan token dari cookie atau parameter
   * @param data - Data berupa token (opsional jika sudah di cookie), password baru, dan konfirmasi password
   * @returns Promise dengan pesan sukses
   */
  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    // Ambil token dari cookie jika tidak disediakan di data
    const tokenToUse = data.token || getResetPasswordToken();
    
    if (!tokenToUse) {
      throw new Error('Token reset password tidak ditemukan');
    }
    
    const requestData = {
      ...data,
      token: tokenToUse
    };
    
    try {
      const response = await axiosInstance.post<{ message: string }>('/auth/reset-password', requestData, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      // Hapus token dari cookie setelah berhasil reset password
      Cookies.remove('reset_password_token', { path: '/' });
      
      return response.data;
    } catch (error) {
      // Jangan hapus token jika terjadi error
      throw error;
    }
  }
}

export const authApi = new AuthApi(); 