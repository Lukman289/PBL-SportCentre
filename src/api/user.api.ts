import axiosInstance from '../config/axios.config';
import { User, BranchAdmin, BranchAdminListParams, BranchAdminListResponse } from '@/types';

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  role ?: string;
}

export interface CreateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: string;
  branchId?: number | null;
}

class UserApi {
  /**
   * Mendapatkan daftar admin dari cabang yang dimiliki/dikelola oleh user yang login
   */
  async getUserBranchAdmins(params?: BranchAdminListParams): Promise<BranchAdminListResponse> {
    const response = await axiosInstance.get<BranchAdminListResponse>('/users/branch-admins', { params: params });
    return response.data;
  }

  /**
   * Mendapatkan daftar user berdasarkan role
   */
  async getUsersByRole(role: string): Promise<{ data: User[] }> {
    const response = await axiosInstance.get<{ data: User[] }>(`/users/by-role/${role}`);
    return response.data;
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
   * Menambahkan user baru
   * @param data - Data user baru
   */
  async createUser(data: CreateUserRequest): Promise<User> {
    const response = await axiosInstance.post<{ data: User }>('/users', data);
    return response.data.data;
  }

  /**
   * Mengupdate profil user yang sedang login
   */
  async updateUserProfile(data: UpdateUserRequest): Promise<User> {
    const response = await axiosInstance.put<{ data: User }>('/users/profile', data);
    return response.data.data;
  }

  /**
   * Dapatkan semua user (untuk admin)
   * @returns Promise dengan array data user
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await axiosInstance.get<{ data: User[] } | User[]>('/users');
      
      if (Array.isArray(response.data)) {
        return response.data;
      } else if ('data' in response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      return [];
    }
  }
  /**
   * Mengupdate user berdasarkan ID (super admin only)
   */
  async updateUserById(id: number, data: UpdateUserRequest): Promise<User> {
    const response = await axiosInstance.put<{ data: User }>(`/users/${id}`, data);
    return response.data.data;
  }

  /**
   * Dapatkan user berdasarkan ID
   * @param id - ID user
   * @returns Promise dengan data user
   */
  /**
   * Mendapatkan detail user berdasarkan ID
   */
  async getUserById(id: number): Promise<User> {
    const response = await axiosInstance.get<{ data: User }>(`/users/detail/${id}`);
    return response.data.data;
  }
}

export const userApi = new UserApi(); 
