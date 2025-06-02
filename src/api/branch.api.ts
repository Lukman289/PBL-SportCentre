import axiosInstance from '../config/axios.config';
import { Branch, BranchListParams, BranchListResponse, CreateBranchRequest, UpdateBranchRequest, BranchAdmin, User,BranchDetailResponse } from '@/types';

export interface UserListParams {
  role?: string;
  page?: number;
  limit?: number;
  search?: string;
}
export interface UserListResponse {
  data: User[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
class BranchApi {
  /**
   * Mendapatkan daftar cabang
   */
  async getBranches(params?: BranchListParams): Promise<BranchListResponse> {
    const response = await axiosInstance.get<BranchListResponse>('/branches', { params });
    return response.data;
  }

  /**
   * Mendapatkan cabang yang dimiliki/dikelola oleh user yang login
   */
  async getUserBranches(params?: BranchListParams): Promise<BranchListResponse> {
    const response = await axiosInstance.get<BranchListResponse>('/branches/owner-branches', { params });
    return response.data;
  }
   // Tambahkan method ini di dalam class BranchApi
  /**
   * Mendapatkan daftar user berdasarkan role
   */
  async getUsersByRole(role: string, params?: UserListParams): Promise<User[]> {
    const response = await axiosInstance.get<UserListResponse>('/users', {
      params: { ...params, role }
    });
    return response.data.data;
  }

  /**
   * Mendapatkan detail cabang berdasarkan ID
   */
 async getBranchById(id: number): Promise<BranchDetailResponse> {
    try {
      const response = await axiosInstance.get<BranchDetailResponse>(`/branches/${id}`);
      
      // Jika backend mengembalikan array, ambil elemen pertama
      if (Array.isArray(response.data.data)) {
        return {
          ...response.data,
          data: response.data.data[0]
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching branch by ID:', error);
      throw error;
    }
  }

  /**
   * Membuat cabang baru
   */
async createBranch(data: CreateBranchRequest): Promise<Branch> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('location', data.location);
    formData.append('status', data.status); // Tambahkan status
    formData.append('ownerId', data.ownerId.toString());
    
    if (data.imageUrl) {
      formData.append('imageUrl', data.imageUrl);
    }
    
    console.log('FormData being sent:', {
      name: data.name,
      location: data.location,
      status: data.status,
      ownerId: data.ownerId,
      hasImage: !!data.imageUrl
    });
    
    const response = await axiosInstance.post<Branch>('/branches', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
}

  /**
   * Mengupdate cabang
   */
  async updateBranch(id: number, data: UpdateBranchRequest | FormData): Promise<Branch> {
    // Jika data adalah FormData, gunakan content-type multipart/form-data
    if (data instanceof FormData) {
      const response = await axiosInstance.put<Branch>(`/branches/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }
    
    // Jika bukan FormData, kirim sebagai JSON biasa
    const response = await axiosInstance.put<Branch>(`/branches/${id}`, data);
    return response.data;
  }

  /**
   * Menghapus cabang
   */
  async deleteBranch(id: number): Promise<void> {
    await axiosInstance.delete(`/branches/${id}`);
  }

  /**
   * Mendapatkan detail admin cabang
   */
  async getBranchAdminById(userId: number): Promise<BranchAdmin> {
    const response = await axiosInstance.get<BranchAdmin>(`/branches/admins/${userId}`);
    return response.data;
  }
  /**
   * Mendapatkan daftar admin cabang sesuai ID cabang
   */
  async getBranchAdmins(branchId: number): Promise<{ data: BranchAdmin[] }> {
  try {
    const response = await axiosInstance.get<{ data: BranchAdmin[] }>(`/branches/${branchId}/admins`);
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil data admin cabang:', error);
    return { data: [] }; // Kembalikan array kosong jika error
  }
}

  /**
   * Menambah admin cabang
   */
  async addBranchAdmin(branchId: number, userId: number): Promise<void> {
    await axiosInstance.post(`/branches/${branchId}/admins/${userId}`);
  }

  /**
   * Menghapus admin cabang
   */
  async removeBranchAdmin(branchId: number, userId: number): Promise<void> {
    await axiosInstance.delete(`/branches/${branchId}/admins/${userId}`);
  }

  /**
   * Upload gambar cabang
   */
  async uploadBranchImage(branchId: number, file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await axiosInstance.post<{ imageUrl: string }>(
      `/branches/${branchId}/image`,
      formData,
      {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      }
    );
    
    return response.data;
  }
}

export const branchApi = new BranchApi(); 