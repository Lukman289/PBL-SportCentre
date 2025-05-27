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
import { Branch } from '@/types';
import { branchApi } from '@/api/branch.api';
import { useAuth } from '@/context/auth/auth.context';
import { Role } from '@/types';
import useGlobalLoading from '@/hooks/useGlobalLoading.hook';

export default function MyBranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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
    const fetchBranches = async () => {
      try {
        setIsLoading(true);
        // Menggunakan metode getUserBranches untuk mendapatkan cabang yang dimiliki/dikelola
        const response = await withLoading(branchApi.getUserBranches({ 
          q: searchQuery || undefined 
        }));
        setBranches(response.data);
      } catch (error) {
        console.error('Error fetching branches:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBranches();
  }, [searchQuery, withLoading]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleAddBranch = () => {
    router.push('/dashboard/branches/create');
  };

  const handleViewBranch = (id: number) => {
    router.push(`/dashboard/branches/${id}`);
  };

  // Redirect jika bukan owner cabang atau admin cabang
  if (user && user.role !== Role.OWNER_CABANG && user.role !== Role.ADMIN_CABANG) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cabang Saya</h1>
        {user?.role === Role.OWNER_CABANG && (
          <Button onClick={handleAddBranch}>Tambah Cabang</Button>
        )}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Cari Cabang</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Cari berdasarkan nama atau lokasi..."
            value={searchQuery}
            onChange={handleSearch}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Cabang</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            null // GlobalLoading akan otomatis ditampilkan
          ) : branches.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'Tidak ada cabang yang sesuai dengan pencarian' : 'Anda belum memiliki cabang'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell>{branch.id}</TableCell>
                    <TableCell>{branch.name}</TableCell>
                    <TableCell>{branch.location}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          branch.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {branch.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewBranch(branch.id)}
                        >
                          Detail
                        </Button>
                        {user?.role === Role.OWNER_CABANG && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/branches/${branch.id}/admins`)}
                          >
                            Admin
                          </Button>
                        )}
                      </div>
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