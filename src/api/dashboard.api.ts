import axiosInstance from '@/config/axios.config';
import { Role } from '@/types';
import { PeriodType } from '@/components/dashboard/filters/PeriodFilter';
import {
  SuperAdminStats,
  OwnerCabangStats, 
  AdminCabangStats,
  UserStats
} from '@/hooks/useDashboardStats.hook';

// Type untuk hasil respons API
type DashboardStatsResponse = 
  | SuperAdminStats
  | OwnerCabangStats
  | AdminCabangStats
  | UserStats;

/**
 * API client untuk fitur dashboard
 */
export const dashboardApi = {
  /**
   * Mendapatkan statistik dashboard berdasarkan role dan periode
   * @param role Role pengguna
   * @param period Periode waktu
   * @returns Data statistik dashboard
   */
  getDashboardStats: async (role: Role, period: PeriodType = 'monthly'): Promise<DashboardStatsResponse> => {
    try {
      // Gunakan satu endpoint tunggal untuk semua role
      const response = await axiosInstance.get<DashboardStatsResponse>(`/dashboard/stats`, {
        params: { period }
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 