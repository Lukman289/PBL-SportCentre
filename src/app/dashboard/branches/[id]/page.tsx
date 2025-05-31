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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/auth/auth.context';
import { branchApi } from '@/api/branch.api';
import { fieldApi } from '@/api/field.api';
import { Branch, BranchAdmin, Field, Role } from '@/types';
import useGlobalLoading from '@/hooks/useGlobalLoading.hook';
import { userApi } from '@/api';

export default function BranchDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [admins, setAdmins] = useState<BranchAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddFieldForm, setShowAddFieldForm] = useState(false);
  const branchId = parseInt(params.id as string);
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
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const branchData = await withLoading(branchApi.getBranchById(branchId));
        setBranch(Array.isArray(branchData.data) ? branchData.data[0] : branchData.data);

        const fieldsData = await withLoading(fieldApi.getBranchFields(branchId));
        setFields(fieldsData);

        const adminsData = await withLoading(userApi.getUserBranchAdmins({ branchId }));
        setAdmins(adminsData.data);
      } catch (err) {
        console.error('Error fetching branch details:', err);
        setError('Gagal memuat data cabang. Silakan coba lagi.');
      } finally {
        setIsLoading(false);
      }
    };

    if (branchId) {
      fetchData();
    }
  }, [branchId]);

  if (user && user.role !== Role.SUPER_ADMIN && user.role !== Role.OWNER_CABANG) {
    router.push('/dashboard');
    return null;
  }

  const handleEdit = () => {
    router.push(`/dashboard/branches/${branchId}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm('Anda yakin ingin menghapus cabang ini?')) {
      try {
        await withLoading(branchApi.deleteBranch(branchId));
        if (user?.role === Role.SUPER_ADMIN) {
          router.push('/dashboard/branches');
        } else {
          router.push('/dashboard/my-branches');
        }
      } catch (err) {
        console.error('Error deleting branch:', err);
        setError('Gagal menghapus cabang. Silakan coba lagi.');
      }
    }
  };

  const handleAddField = () => {
    setShowAddFieldForm(!showAddFieldForm);
  };

  const handleAddAdmin = () => {
    router.push(`/dashboard/admins`);
  };

  if (isLoading) {
    return null; // Global loading akan otomatis ditampilkan
  }

  if (error || !branch) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error || 'Cabang tidak ditemukan'}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Detail Cabang: {branch.name}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit}>
            Edit
          </Button>
          {user?.role === Role.SUPER_ADMIN && (
            <Button variant="destructive" className='text-white' onClick={handleDelete}>
              Hapus
            </Button>
          )}
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Informasi Cabang</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">ID:</p>
              <p>{branch.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nama:</p>
              <p>{branch.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Alamat:</p>
              <p>{branch.location}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status:</p>
              <p>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    branch.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {branch.status === 'active' ? 'Aktif' : 'Nonaktif'}
                </span>
              </p>
            </div>
          </div>
          {branch.imageUrl && (
            <div className="my-4 w-full h-100">
              <p className="text-sm font-medium text-muted-foreground mb-2">Gambar:</p>
              <img
                src={branch.imageUrl || "images/img_not_found.png"}
                alt={branch.name}
                className="w-full h-full rounded-md object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = "images/img_not_found.png";
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="fields" className="w-full">
        <TabsList>
          <TabsTrigger value="fields">Lapangan</TabsTrigger>
          <TabsTrigger value="admins">Admin</TabsTrigger>
        </TabsList>

        <TabsContent value="fields" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Daftar Lapangan</CardTitle>
              {user?.role === Role.SUPER_ADMIN && (
                <Button onClick={handleAddField}>
                  {showAddFieldForm ? 'Tutup Form' : 'Tambah Lapangan'}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {showAddFieldForm && (
                <div className="mb-6 p-4 border rounded-md">
                  <h3 className="text-lg font-semibold mb-4">Form Tambah Lapangan</h3>
                  <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium">Nama Lapangan</label>
                      <input type="text" className="mt-1 block w-full border rounded p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Tipe</label>
                      <input type="text" className="mt-1 block w-full border rounded p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Harga Siang</label>
                      <input type="number" className="mt-1 block w-full border rounded p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Harga Malam</label>
                      <input type="number" className="mt-1 block w-full border rounded p-2" />
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

              {fields.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Belum ada lapangan di cabang ini
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>ID Lapangan</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Harga (Siang)</TableHead>
                      <TableHead>Harga (Malam)</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{field.id}</TableCell>
                        <TableCell>{field.name}</TableCell>
                        <TableCell>{field.type?.name || '-'}</TableCell>
                        <TableCell>
                          Rp {parseInt(field.priceDay.toString()).toLocaleString('id-ID')}
                        </TableCell>
                        <TableCell>
                          Rp {parseInt(field.priceNight.toString()).toLocaleString('id-ID')}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              field.status === 'available'
                                ? 'bg-green-100 text-green-800'
                                : field.status === 'booked'
                                ? 'bg-blue-100 text-blue-800'
                                : field.status === 'maintenance'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {field.status === 'available'
                              ? 'Tersedia'
                              : field.status === 'booked'
                              ? 'Dibooking'
                              : field.status === 'maintenance'
                              ? 'Pemeliharaan'
                              : 'Tutup'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admins" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Daftar Admin</CardTitle>
              <Button onClick={handleAddAdmin}>Tambah Admin</Button>
            </CardHeader>
            <CardContent>
              {admins.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Belum ada admin di cabang ini
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>ID Admin</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.map((admin, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{admin.userId}</TableCell>
                        <TableCell>{admin.user?.name}</TableCell>
                        <TableCell>{admin.user?.email}</TableCell>
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
