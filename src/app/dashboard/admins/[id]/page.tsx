'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/auth/auth.context';
import { branchApi } from '@/api/branch.api';
import { Branch, BranchAdmin, Role, User } from '@/types';
import { userApi } from '@/api';


export default function AdminDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesAdmin, setBranchesAdmin] = useState<BranchAdmin[]>([]);
  const [admin, setAdmin] = useState<User>({} as User);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddFieldForm, setShowAddFieldForm] = useState(false);
  const adminId = parseInt(params.id as string);

  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const adminsData = await userApi.getUserById(adminId);
            if (adminsData) {
                setAdmin(adminsData);
            } else {
                setAdmin({} as User);
            }
            
            const branchData = await branchApi.getUserBranches();
            setBranches(branchData.data);
        } catch (err) {
            console.error('Error fetching branch details:', err);
            setError('Gagal memuat data cabang. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };
    if (adminId) {
        fetchData();
        fetchBranchesAdmin();
    }
  }, [adminId]);

  const fetchBranchesAdmin = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const branchesData = await userApi.getBranchesForAdmin(adminId);
        setBranchesAdmin(branchesData);
    } catch (err) {
        console.error('Error fetching branch details:', err);
        setError('Gagal memuat data cabang. Silakan coba lagi.');
    } finally {
        setIsLoading(false);
    }
  };
    
  const handleRemoveAdmin = async (branchId: number, userId: number) => {
    try {
      if (!window.confirm('Apakah Anda yakin ingin menghapus admin ini?')) return;
      await branchApi.removeBranchAdmin(branchId, userId);
      fetchBranchesAdmin();
    } catch (error) {
      console.error('Error removing admin:', error);
      alert('Gagal menghapus admin. Silakan coba lagi.');
    }
  };

  const handleSubmitAddAdmin = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      if (!adminId) return;
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const branchId = formData.get('branchId');
      if (!branchId) {
        alert('Cabang tidak valid.');
        return;
      }
      await branchApi.addBranchAdmin(parseInt(branchId as string), adminId);
      setShowAddFieldForm(false);
      fetchBranchesAdmin();
    } catch (error) {
      console.error('Error changing branch:', error);
      alert('Gagal mengubah cabang admin. Silakan coba lagi.');
      setShowAddFieldForm(false);
      return;
    }
  };

  if (user && user.role !== Role.SUPER_ADMIN && user.role !== Role.OWNER_CABANG) {
    router.push('/dashboard');
    return null;
  }

  const handleAddField = () => {
    setShowAddFieldForm(!showAddFieldForm);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !admin) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error || 'Admin tidak ditemukan'}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Detail Admin: {admin.name || 'Tidak Diketahui'}
        </h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Informasi Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">ID Admin:</p>
              <p>{admin.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nama:</p>
              <p>{admin.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email:</p>
              <p>{admin.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">No HP:</p>
              <p>{admin.phone}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="branches" className="w-full">
        <TabsContent value="branches" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Daftar Cabang Yang Dikelola:</CardTitle>
              <Button onClick={handleAddField}>
                {showAddFieldForm ? 'Tutup Form' : 'Tambah Cabang'}
              </Button>
            </CardHeader>
            <CardContent>
              {showAddFieldForm && (
                <div className="mb-6 p-4 border rounded-md bg-gray-50">
                  <h3 className="text-lg font-semibold mb-4">Pilih Cabang</h3>
                  <form onSubmit={handleSubmitAddAdmin} className="grid grid-cols-1 gap-4">
                    <div>
                      <select name="branchId" id="branchId" className='w-full border px-2 py-1 rounded' required>
                        <option value={0}>Pilih Cabang</option>
                        {branches.map((branch) => ( 
                            <option key={branch.id} value={branch.id}>
                            {branch.name}
                            </option>
                        ))}
                        </select>
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-2">
                      <Button type="button" onClick={() => setShowAddFieldForm(false)} variant="secondary">
                        Batal
                      </Button>
                      <Button type="submit">Simpan</Button>
                    </div>
                  </form>
                </div>
              )}

              {branchesAdmin.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Belum ada penempatan cabang untuk {admin.name || 'Admin Ini'}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>ID Cabang</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Lokasi</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {branchesAdmin.map((branch, index) => (
                      <TableRow key={branch.branchId}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{branch.branchId}</TableCell>
                        <TableCell>{branch.branch?.name}</TableCell>
                        <TableCell>{branch.branch?.location}</TableCell>
                        <TableCell>
                            <Button
                                variant="destructive"
                                size="sm"
                                className='text-white'
                                onClick={() => handleRemoveAdmin(branch.branchId, admin.id)}
                                >
                                Hapus
                            </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
