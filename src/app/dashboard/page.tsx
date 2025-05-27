'use client';

import { useEffect } from 'react';
import useAuth from '@/hooks/useAuth.hook';
import { Role } from '@/types';
import { SuperAdminDashboard } from '@/components/dashboard/SuperAdminDashboard';
import { AdminCabangDashboard } from '@/components/dashboard/AdminCabangDashboard';
import { OwnerCabangDashboard } from '@/components/dashboard/OwnerCabangDashboard';
import { UserDashboard } from '@/components/dashboard/UserDashboard';
import useGlobalLoading from '@/hooks/useGlobalLoading.hook';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const { showLoading, hideLoading } = useGlobalLoading();

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  if (isLoading) {
    return null;
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center p-8 rounded-lg bg-red-50 text-red-500 border border-red-200">
        Silakan login untuk melihat dashboard
      </div>
    );
  }

  // Render dashboard berdasarkan role
  switch (user.role) {
    case Role.SUPER_ADMIN:
      return <SuperAdminDashboard />;
    case Role.ADMIN_CABANG:
      return <AdminCabangDashboard />;
    case Role.OWNER_CABANG:
      return <OwnerCabangDashboard />;
    case Role.USER:
      return <UserDashboard />;
    default:
      return <UserDashboard />;
  }
} 