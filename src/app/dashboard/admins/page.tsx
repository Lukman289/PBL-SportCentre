'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Role, BranchAdmin } from '@/types';
import { useAuth } from '@/context/auth/auth.context';
import { userApi } from '@/api/user.api';
import { branchApi } from '@/api/branch.api';
import useGlobalLoading from '@/hooks/useGlobalLoading.hook';

export default function AdminsPage() {
  const [admins, setAdmins] = useState<BranchAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddFormOpen, setIsAddFormOpen] = useState(false); // untuk toggle form
  const router = useRouter();
  const { user } = useAuth();
  const { showLoading, hideLoading, withLoading } = useGlobalLoading();

  // Mengelola loading state
  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setIsLoading(true);
        const adminList = await withLoading(userApi.getUserBranchAdmins(searchQuery || undefined));
        setAdmins(adminList);
      } catch (error) {
        console.error('Error fetching admins:', error);
        setAdmins([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdmins();
  }, [searchQuery, withLoading]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleAddAdmin = () => {
    setIsAddFormOpen(true); // tampilkan form
  };

  const handleRemoveAdmin = async (branchId: number, userId: number) => {
    try {
      setIsLoading(true);
      await withLoading(branchApi.removeBranchAdmin(branchId, userId));
      setAdmins(admins.filter(admin => admin.userId !== userId || admin.branchId !== branchId));
    } catch (error) {
      console.error('Error removing admin:', error);
      alert('Gagal menghapus admin. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAddAdmin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name');
    const email = formData.get('email');
    // TODO: Kirim ke API kalau sudah siap
    console.log('Admin baru:', { name, email });

    alert('Admin berhasil ditambahkan (dummy)');
    setIsAddFormOpen(false);
    e.currentTarget.reset(); // reset form
  };

  if (user && user.role !== Role.OWNER_CABANG && user.role !== Role.ADMIN_CABANG && user.role !== Role.SUPER_ADMIN) {
    router.push('/dashboard');
    return null;
  }

  // Jika loading, GlobalLoading akan otomatis ditampilkan
  if (isLoading) {
    return null;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Admin Cabang</h1>
        {user?.role === Role.OWNER_CABANG && (
          <Button onClick={handleAddAdmin}>Tambah Admin</Button>
        )}
      </div>

      {isAddFormOpen && (
        <Card className="mb-6 max-w-xl">
          <CardHeader>
            <CardTitle>Tambah Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitAddAdmin} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Nama</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full border px-2 py-1 rounded"
                  placeholder="Masukkan nama"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full border px-2 py-1 rounded"
                  placeholder="Masukkan email"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Cabang</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full border px-2 py-1 rounded"
                  placeholder="Masukkan cabang"
                />
              </div>
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => setIsAddFormOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">Simpan</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Cari Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Cari berdasarkan nama atau email..."
            value={searchQuery}
            onChange={handleSearch}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Admin</CardTitle>
        </CardHeader>
        <CardContent>
          {admins.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'Tidak ada admin yang sesuai dengan pencarian' : 'Belum ada admin cabang'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Cabang</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={`${admin.branchId}-${admin.userId}`}>
                    <TableCell>{admin.userId}</TableCell>
                    <TableCell>{admin.user?.name || 'N/A'}</TableCell>
                    <TableCell>{admin.user?.email || 'N/A'}</TableCell>
                    <TableCell>{admin.branch?.name || 'N/A'}</TableCell>
                    <TableCell>
                      {user?.role === Role.OWNER_CABANG && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveAdmin(admin.branchId, admin.userId)}
                        >
                          Hapus
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
