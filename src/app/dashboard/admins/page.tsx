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
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';

export default function AdminsPage() {
  const [admins, setAdmins] = useState<BranchAdmin[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { showLoading, hideLoading, withLoading } = useGlobalLoading();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const maxData = 5;

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  useEffect(() => {
    fetchBranches();
  }, []);
  
  useEffect(() => {
    fetchAdmins(maxData, currentPage);
  }, [currentPage]);

  const fetchAdmins = async (limit: number, page: number, q: string = '') => {
    setIsLoading(true);
    try {
      const response = await withLoading(userApi.getUserBranchAdmins({
        limit,
        page,
        q
      }));
      
      if (response && response.data) {
        const data = response.data;
        console.log('Fetched admins:', data);
        setAdmins(data);
        setTotalItems(response.meta?.totalItems || 0);
      } else {
        setAdmins([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      setAdmins([]);
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

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (query === '') {
      fetchAdmins(maxData, currentPage);
    } else {
      fetchAdmins(1000, 1, query);
    }
  };

  const handleAddAdmin = () => {
    setIsAddFormOpen(!isAddFormOpen);
  };

  const handleRemoveAdmin = async (branchId: number, userId: number) => {
    try {
      setIsLoading(true);
      await withLoading(branchApi.removeBranchAdmin(branchId, userId));
      const updatedAdmins = admins.filter(admin => admin.userId !== userId || admin.branchId !== branchId);
      setAdmins(updatedAdmins);
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

      await fetchAdmins(maxData, currentPage);
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
          <form onSubmit={handleSearch} className="flex items-center gap-2 mb-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari cabang berdasarkan nama atau lokasi..."
                name="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-20"
              />
              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 h-6 w-6 text-gray-500 hover:text-red-600"
                  onClick={() => {
                    setSearchQuery('');
                    fetchAdmins(maxData, 1);
                    setCurrentPage(1);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            <Button
              type={searchQuery.trim() !== '' ? 'submit' : 'button'}
              variant="default"
              className="p-3 h-10 w-10 flex items-center justify-center"
              disabled={isLoading}
            >
              <Search className="w-5 h-5" />
            </Button>
          </form>
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
                  <TableHead>No</TableHead>
                  <TableHead>ID Admin</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Cabang</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin, index) => (
                  <TableRow key={`${admin.branchId}-${admin.userId}`}>
                    <TableCell>{(currentPage - 1) * maxData + index + 1}</TableCell>
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
                            className='text-white'
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
          {totalItems > maxData && (
            <div className="flex justify-between items-center gap-4 mt-8">
              <Button 
                variant="outline" 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden md:block">Sebelumnya</span>
              </Button>
              <span className="text-sm text-gray-500">
                Halaman {currentPage} dari {Math.ceil(totalItems / maxData)}
              </span>
              <Button 
                variant="outline" 
                disabled={currentPage >= Math.ceil(totalItems / maxData)} 
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                <span className="hidden md:block">Selanjutnya</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
