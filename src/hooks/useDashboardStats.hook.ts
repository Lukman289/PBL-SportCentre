import { useState, useEffect } from 'react';
import { dashboardApi } from '@/api/dashboard.api';
import { Role } from '@/types';
import { PeriodType } from '@/components/dashboard/filters/PeriodFilter';
import useToastHandler from './useToastHandler';

// Tipe data untuk statistik dashboard
export interface SuperAdminStats {
  totalBranches: number;
  totalUsers: number;
  totalFields: number;
  activePromotions: number;
  regions: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
  branches: Array<{
    id: string;
    name: string;
    location: string;
    status: string;
    adminCount: number;
    fieldCount: number;
  }>;
}

export interface AdminCabangStats {
  totalBookings: number;
  pendingPayments: number;
  totalIncome: number;
  availableFields: number;
  bookingData: {
    categories: string[];
    series: number[];
  };
  revenueData: {
    categories: string[];
    series: number[];
  };
  topCustomers: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    bookingCount: number;
  }>;
}

export interface OwnerCabangStats {
  totalBranches: number;
  totalAdmins: number;
  totalIncome: number;
  totalBookings: number;
  revenueData: {
    categories: string[];
    series: number[];
  };
  bookingData: {
    categories: string[];
    series: number[];
  };
  branches: Array<{
    id: string;
    name: string;
    location: string;
    status: string;
    adminCount: number;
    fieldCount: number;
  }>;
  admins: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    branch: string;
    status: string;
    role: string;
    lastActive: string;
  }>;
}

export interface UserStats {
  activeBookings: number;
  completedBookings: number;
  favoriteField: string;
  unreadNotifications: number;
  activityData: {
    categories: string[];
    series: number[];
  };
  recentBookings: Array<{
    id: string;
    fieldName: string;
    branchName: string;
    date: string;
    time: string;
    status: string;
    paymentStatus: string;
  }>;
}

type DashboardStats = SuperAdminStats | AdminCabangStats | OwnerCabangStats | UserStats;

export const useDashboardStats = (role: Role, period: PeriodType = 'monthly') => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showError } = useToastHandler();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const data = await dashboardApi.getDashboardStats(role, period);
        setStats(data);
        setError(null);
      } catch (err) {
        showError('Gagal memuat data dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [role, period]);

  return { stats, isLoading, error };
}; 