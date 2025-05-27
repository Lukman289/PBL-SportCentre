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
import { Role, BranchAdmin, Branch } from '@/types';
import { useAuth } from '@/context/auth/auth.context';
import { userApi } from '@/api/user.api';
import { branchApi } from '@/api/branch.api';
import useGlobalLoading from '@/hooks/useGlobalLoading.hook';

export default function AdminsPage() {
  const [admins, setAdmins] = useState<BranchAdmin[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [adminsPaginate, setAdminsPaginate] = useState<BranchAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { showLoading, hideLoading, withLoading } = useGlobalLoading();
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 15;

  // Mengelola loading state
  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  // Load initial data
  useEffect(() => {
    fetchAdmins();
    fetchBranches();
  }, []);

  // Update pagination when page changes
  useEffect(() => {
    setAdminsPaginate(admins.slice((page - 1) * limit, page * limit));
  }, [page, admins]);

  // Filter data when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setAdminsPaginate(admins.slice((page - 1) * limit, page * limit));
      setTotalItems(admins.length);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = admins.filter(
        (admin) =>
          admin.user?.name.toLowerCase().includes(query) ||
          admin.user?.email.toLowerCase().includes(query)
      );
      setTotalItems(filtered.length);
      setAdminsPaginate(filtered);
    }
  }, [searchQuery, admins, page, limit]);

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const response = await withLoading(userApi.getUserBranchAdmins(searchQuery || undefined));
      setAdmins(response);
      setAdminsPaginate(response.slice((page - 1) * limit, page * limit));
      setTotalItems(response.length);
    } catch (error) {
      console.error('Error fetching admins:', error);
      setAdmins([]);
      setAdminsPaginate([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchBranches = async () => {
    setIsLoading(true);
    try {
      const response = await withLoading(branchApi.getUserBranches());
      
      if (response && response.data) {
        const data = response.data;
        setBranches(data);
      } else {
        setBranches([]);
      }
    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset halaman saat pencarian berubah
  };

  const handleAddAdmin = () => {
    setIsAddFormOpen(!isAddFormOpen);
  };

  const handleRemoveAdmin = async (branchId: number, userId: number) => {
    try {
      setIsLoading(true);
      await withLoading(branchApi.removeBranchAdmin(branchId, userId));
      // Update data setelah menghapus admin
      const updatedAdmins = admins.filter(admin => admin.userId !== userId || admin.branchId !== branchId);
      setAdmins(updatedAdmins);
      setAdminsPaginate(updatedAdmins.slice((page - 1) * limit, page * limit));
      setTotalItems(updatedAdmins.length);
    } catch (error) {
      console.error('Error removing admin:', error);
      alert('Gagal menghapus admin. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAddAdmin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name')?.toString() || '';
    const email = formData.get('email')?.toString() || '';
    const phone = formData.get('phone')?.toString() || '';
    const branchId = formData.get('branchId');
    const role = Role.ADMIN_CABANG;
    const password = email.split('@')[0];

    try {
      setIsLoading(true);
      await withLoading(userApi.createUser({
        name,
        email,
        phone,
        branchId: parseInt(branchId as string),
        role,
        password
      }));

      // Refresh data setelah menambahkan admin baru
      await fetchAdmins();
      setIsAddFormOpen(false);
    } catch (error) {
      console.error('Error adding admin:', error);
      alert('Gagal menambahkan admin. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
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
        {(user?.role === Role.SUPER_ADMIN || user?.role === Role.OWNER_CABANG) && (
          <Button onClick={handleAddAdmin}>
            {isAddFormOpen ? 'Tutup Form' : 'Tambah Admin'}
          </Button>
        )}
      </div>

      {isAddFormOpen && (
        <Card className="mb-6 w-full">
          <CardHeader>
            <CardTitle>Tambah Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitAddAdmin} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">Nama</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="block w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="block w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">No HP</label>
                <input
                  type="number"
                  name="phone"
                  required
                  className="block w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Cabang</label>
                <select name="branchId" id="branchId" required className="block w-full border rounded p-2">
                  <option value="">Pilih Cabang</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 flex justify-end gap-4">
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
          {adminsPaginate.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'Tidak ada admin yang sesuai dengan pencarian' : 'Belum ada admin cabang'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>ID Admin</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Cabang</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminsPaginate.map((admin, index) => (
                  <TableRow key={`${admin.branchId}-${admin.userId}`}>
                    <TableCell>{(page - 1) * limit + index + 1}</TableCell>
                    <TableCell>{admin.userId}</TableCell>
                    <TableCell>{admin.user?.name || 'N/A'}</TableCell>
                    <TableCell>{admin.user?.email || 'N/A'}</TableCell>
                    <TableCell>{admin.branch?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/admins/${admin.userId}`)}
                        >
                          Detail
                        </Button>
                        {(user?.role === Role.SUPER_ADMIN || user?.role === Role.OWNER_CABANG) && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveAdmin(admin.branchId, admin.userId)}
                          >
                            Hapus
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {totalItems > limit && (
            <div className="flex justify-between items-center gap-4 mt-8">
              <Button 
                variant="outline" 
                disabled={page === 1} 
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              >
                Sebelumnya
              </Button>
              <span className="text-sm text-gray-500">
                Halaman {page} dari {Math.ceil(totalItems / limit)}
              </span>
              <Button 
                variant="outline" 
                disabled={page >= Math.ceil(totalItems / limit)} 
                onClick={() => setPage((prev) => prev + 1)}
              >
                Selanjutnya
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
