import axiosInstance from '../config/axios.config';
import { 
  ActivityLog, 
  ActivityLogListParams, 
  ActivityLogListResponse, 
  CreateActivityLogRequest, 
  CreateActivityLogResponse, 
  DeleteActivityLogResponse 
} from '@/types';

class ActivityLogApi {
  /**
   * Mendapatkan daftar activity logs
   * Super admin bisa melihat semua logs atau berdasarkan userId
   * User biasa hanya bisa melihat logs sendiri
   */
  async getActivityLogs(params?: ActivityLogListParams): Promise<ActivityLogListResponse> {
    const response = await axiosInstance.get<ActivityLogListResponse>('/activity-logs', { 
      params: params 
    });
    return response.data;
  }

  /**
   * Membuat activity log baru
   * User biasa hanya bisa membuat log untuk diri sendiri
   * Super admin bisa membuat log untuk user manapun
   */
  async createActivityLog(data: CreateActivityLogRequest): Promise<CreateActivityLogResponse> {
    const response = await axiosInstance.post<CreateActivityLogResponse>('/activity-logs', data);
    return response.data;
  }

  /**
   * Menghapus activity log (hanya super admin)
   */
  async deleteActivityLog(id: number): Promise<DeleteActivityLogResponse> {
    const response = await axiosInstance.delete<DeleteActivityLogResponse>(`/activity-logs/${id}`);
    return response.data;
  }
}

export const activityLogApi = new ActivityLogApi();