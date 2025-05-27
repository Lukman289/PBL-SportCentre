'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { userApi } from '@/api/user.api';
import { UpdateUserRequest } from '@/api/user.api';
import useGlobalLoading from '@/hooks/useGlobalLoading.hook';

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = Number(params.id);

  const [form, setForm] = useState<UpdateUserRequest>({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showLoading, hideLoading, withLoading } = useGlobalLoading();

  // Efek untuk mengelola loading state global
  useEffect(() => {
    if (initialLoading || loading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [initialLoading, loading, showLoading, hideLoading]);

  // Fungsi untuk fetch data user berdasarkan id dan isi form dengan data tersebut
  useEffect(() => {
    async function fetchUser() {
      try {
        setInitialLoading(true);
        const userData = await withLoading(userApi.getUserProfile());

        if (!userData || userData.id !== userId) {
          setError('Pengguna tidak ditemukan atau tidak bisa diedit.');
          return;
        }

        setForm({
          name: userData.name,
          email: userData.email,
          phone: userData.phone || '', 
          password: '', 
        });
      } catch (error: unknown) {
        console.error('Error fetching user:', error);
        const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui';
        setError(`Gagal mengambil data pengguna: ${errorMessage}`);
      } finally {
        setInitialLoading(false);
      }
    }

    fetchUser();
  }, [userId, withLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setForm((prev: UpdateUserRequest) => ({
    ...prev,
    [name]: value,
   }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Panggil API update user profile
      await withLoading(userApi.updateUserProfile(form));
      alert('Profil pengguna berhasil diperbarui!');
      router.push(`/dashboard/users/${userId}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui';
      setError(`Gagal memperbarui pengguna: ${errorMessage}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return <p className="p-4 text-red-600">{error}</p>;
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Pengguna</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block font-semibold mb-1">Nama</label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="input input-bordered w-full"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block font-semibold mb-1">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="input input-bordered w-full"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block font-semibold mb-1">Telepon</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>

            <div>
              <label htmlFor="password" className="block font-semibold mb-1">Password (kosongkan jika tidak ingin mengganti)</label>
              <input
                type="password"
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="input input-bordered w-full"
                autoComplete="new-password"
              />
            </div>

            {error && <p className="text-red-600">{error}</p>}

            <div className="flex justify-between mt-6">
              <Button type="submit" disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan'}
              </Button>
              <Button variant="outline" onClick={() => router.back()}>
                Batal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}