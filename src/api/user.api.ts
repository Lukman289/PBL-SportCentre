import axiosInstance from '../config/axios.config';
import { User, BranchAdmin } from '@/types';

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
}

class UserApi {
  /**
   * Mendapatkan daftar admin dari cabang yang dimiliki/dikelola oleh user yang login
   */
  async getUserBranchAdmins(search?: string): Promise<BranchAdmin[]> {
    const response = await axiosInstance.get<{ data: BranchAdmin[] }>('/users/branch-admins', { 
      params: { q: search }
    });
    return response.data.data;
  }

  /**
   * Mendapatkan daftar cabang untuk admin cabang
   */
  async getBranchesForAdmin(userId: number): Promise<BranchAdmin[]> {
    const response = await axiosInstance.get<{ data: BranchAdmin[] }>(`/users/${userId}/branches`);
    return response.data.data;
  }

  /**
   * Mendapatkan profil user yang sedang login
   */
  async getUserProfile(): Promise<User> {
    const response = await axiosInstance.get<{ data: User }>('/users/profile');
    return response.data.data;
  }

  /**
   * Mengupdate profil user yang sedang login
   */
  async updateUserProfile(data: UpdateUserRequest): Promise<User> {
    const response = await axiosInstance.put<{ data: User }>('/users/profile', data);
    return response.data.data;
  }
}

export const userApi = new UserApi(); 
