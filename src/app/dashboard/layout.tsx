'use client';

import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/context/auth/auth.context';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { redirect } from 'next/navigation';
import useGlobalLoading from '@/hooks/useGlobalLoading.hook';

export default function Layout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const { showLoading, hideLoading } = useGlobalLoading();
  
  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);
  
  // Redirect jika user belum login
  if (!isLoading && !user) {
    redirect('/auth/login');
  }
  
  return <DashboardLayout>{children}</DashboardLayout>;
} 