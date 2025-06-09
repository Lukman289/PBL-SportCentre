'use client';

import { useAuth } from '@/context/auth/auth.context';
import { Role } from '@/types';
import { AdminCabangDashboard } from '@/components/dashboard/AdminCabangDashboard';
import { OwnerCabangDashboard } from '@/components/dashboard/OwnerCabangDashboard';
import { SuperAdminDashboard } from '@/components/dashboard/SuperAdminDashboard';
import { UserDashboard } from '@/components/dashboard/UserDashboard';

export function DashboardContent() {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Silakan login untuk melihat dashboard</p>
      </div>
    );
  }
  
  // Render konten dashboard sesuai dengan role pengguna
  switch (user.role) {
    case Role.SUPER_ADMIN:
      return <SuperAdminDashboard />;
    case Role.OWNER_CABANG:
      return <OwnerCabangDashboard />;
    case Role.ADMIN_CABANG:
      return <AdminCabangDashboard />;
    case Role.USER:
      return <UserDashboard />;
    default:
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Role tidak dikenali</p>
        </div>
      );
  }
}