'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Role } from '@/types';
import { useAuth } from '@/context/auth/auth.context';
import { userApi } from '@/api/user.api';
import axiosInstance from '@/config/axios.config';
import useToastHandler from '@/hooks/useToastHandler';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user: authUser } = useAuth();
  const userId = Number(params?.id);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const { showError, showSuccess } = useToastHandler();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await userApi.getUserById(userId);
        setUser(userData);
      } catch (err) {
        showError("Gagal mengambil data pengguna");
        
        // Type assertion untuk error Axios
        const axiosError = err as { response?: { status?: number } };
        
        if (axiosError.response?.status === 403) {
          router.push('/dashboard');
        } else if (axiosError.response?.status === 404) {
          showError("Pengguna tidak ditemukan");
          router.push('/dashboard/users');
        } else {
          showError("Gagal memuat data pengguna");
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
        showSuccess(`Pengguna ${user.name} berhasil dihapus`);
        
        router.push('/dashboard/users');
      } catch (error) {
        showError(error, "Gagal menghapus pengguna");
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
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Detail Pengguna: {user.name || 'Tidak Diketahui'}
        </h1>
        <div className="flex gap-2">
          {canDelete && (
            <Button
              variant="destructive"
              className='text-white'
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Menghapus...' : 'Hapus'}
            </Button>
          )}
        </div>
      </div>
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