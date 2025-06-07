'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Role } from '@/types';
import { useAuth } from '@/context/auth/auth.context';
import { userApi } from '@/api/user.api';
import axiosInstance from '@/config/axios.config';
import { toast } from '@/components/ui/use-toast';

// Tipe untuk error
interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user: authUser } = useAuth();
  const userId = Number(params?.id);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await userApi.getUserById(userId);
        setUser(userData);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        const error = err as ApiError;
        
        if (error.response?.status === 403) {
          toast({
            title: 'Akses Ditolak',
            description: 'Anda tidak memiliki izin untuk melihat pengguna ini',
            variant: 'destructive',
          });
          router.push('/dashboard');
        } else if (error.response?.status === 404) {
          toast({
            title: 'Pengguna Tidak Ditemukan',
            description: 'Pengguna yang Anda cari tidak ditemukan',
            variant: 'destructive',
          });
          router.push('/dashboard/users');
        } else {
          toast({
            title: 'Terjadi Kesalahan',
            description: 'Gagal memuat data pengguna',
            variant: 'destructive',
          });
          router.push('/dashboard/users');
        }
      } finally {
        setLoading(false);
      }
    };

    if (authUser) {
      fetchUser();
    }
  }, [userId, router, authUser]);

  const handleDelete = async () => {
    if (!authUser || !user) return;

    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus pengguna ${user.name}? Tindakan ini tidak dapat dibatalkan.`
    );

    if (confirmDelete) {
      setDeleting(true);
      try {
        await axiosInstance.delete(`/users/${userId}`);
        
        toast({
          title: 'Berhasil',
          description: `Pengguna ${user.name} berhasil dihapus`,
        });
        
        router.push('/dashboard/users');
      } catch (error) {
        console.error('Failed to delete user:', error);
        const apiError = error as ApiError;
        
        const errorMessage = apiError.response?.data?.message || 
          'Gagal menghapus pengguna. Silakan coba lagi.';
        
        toast({
          title: 'Gagal Menghapus',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setDeleting(false);
      }
    }
  };

  if (!authUser) {
    router.push('/login');
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Card className="w-full">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 text-lg">Pengguna tidak ditemukan.</p>
            <Button
              onClick={() => router.push('/dashboard/users')}
              className="mt-4"
            >
              Kembali ke Daftar Pengguna
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if current user can delete this user
  const canDelete =
    authUser &&
    authUser.id !== user.id && // Can't delete yourself
    (authUser.role === 'super_admin' || // Super admin can delete anyone except themselves
      ((authUser.role === 'admin_cabang' || authUser.role === 'owner_cabang') && // Branch admins can only delete regular users
        user.role === 'user'));

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Card className="w-full">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Detail Pengguna
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <DetailItem label="ID Pengguna" value={user.id} />
              <DetailItem label="Nama Lengkap" value={user.name} />
              <DetailItem label="Alamat Email" value={user.email} />
              <DetailItem
                label="Nomor Telepon"
                value={user.phone || 'Tidak tersedia'}
              />
              <DetailItem
                label="Peran Pengguna"
                value={
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      user.role === Role.SUPER_ADMIN
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : user.role === Role.ADMIN_CABANG
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : user.role === Role.OWNER_CABANG
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}
                  >
                    {user.role}
                  </span>
                }
              />
              <DetailItem
                label="Tanggal Pendaftaran"
                value={new Date(user.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Informasi Tambahan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailItem
                  label="Status Akun"
                  value={
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                      Aktif
                    </span>
                  }
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-6 border-t bg-gray-50 -mx-8 -mb-8 px-8 py-6 rounded-b-lg">
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="px-6 py-2"
                disabled={!canDelete || deleting}
              >
                {deleting ? 'Menghapus...' : 'Hapus Pengguna'}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/users')}
                className="px-6 py-2 border-gray-300 hover:bg-gray-50"
              >
                Kembali
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
      <p className="text-sm font-semibold text-gray-600 mb-2">{label}</p>
      <div className="text-base text-gray-900">{value}</div>
    </div>
  );
}