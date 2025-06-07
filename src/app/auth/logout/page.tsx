'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth/auth.context';
import { Button } from '@/components/ui/button';
import useGlobalLoading from '@/hooks/useGlobalLoading.hook';
import useToastHandler from '@/hooks/useToastHandler';

export default function LogoutPage() {
  const { logout } = useAuth();
  const router = useRouter();
  const { showLoading, hideLoading } = useGlobalLoading();
  const { showError } = useToastHandler();

  useEffect(() => {
    const performLogout = async () => {
      try {
        showLoading();
        await logout();
        router.push('/auth/login');
      } catch (error) {
        showError(error, "Gagal logout");
        router.push('/auth/login');
      } finally {
        hideLoading();
      }
    };

    performLogout();
  }, [logout, router, showLoading, hideLoading]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center">Sedang Keluar...</h1>
        <p className="text-center text-gray-600">
          Anda sedang dalam proses keluar dari akun. Mohon tunggu sebentar.
        </p>
        <div className="flex justify-center mt-6">
          <Button 
            variant="outline" 
            onClick={() => router.push('/auth/login')}
          >
            Kembali ke Login
          </Button>
        </div>
      </div>
    </div>
  );
} 