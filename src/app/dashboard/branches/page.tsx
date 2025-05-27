'use client';

import { useState, useEffect, useCallback } from 'react';
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

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<string>('');
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

  const fetchBranches = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Logging request untuk debug
      console.log("[DEBUG] Memuat data cabang dengan params:", { 
        q: searchQuery || undefined, 
        limit: 100 
      });
      
      const response = await withLoading(branchApi.getBranches({
        q: searchQuery || undefined,
        limit: 100, // Menampilkan lebih banyak data
      }));
      
      // Logging response untuk debug
      console.log("[DEBUG] Response dari API:", response);
      
      if (response && response.data) {
        setBranches(response.data);
        setDebug(`Jumlah data: ${response.data.length}, Total: ${response.meta?.totalItems || 0}`);
      } else {
        setBranches([]);
        setDebug("Tidak ada data yang diterima dari API");
      }
    } catch (error) {
      console.error('[ERROR] Error fetching branches:', error);
      setError('Gagal memuat daftar cabang. Silakan coba lagi.');
      setDebug(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, withLoading]);

  useEffect(() => {
    // Menggunakan timer untuk debounce pencarian
    const timer = setTimeout(() => {
      fetchBranches();
    }, 300); // Menambahkan debounce 300ms

    return () => clearTimeout(timer);
  }, [fetchBranches]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleAddBranch = () => {
    router.push('/dashboard/branches/create');
  };

  const handleViewBranch = (id: number) => {
    router.push(`/dashboard/branches/${id}`);
  };

  const handleRefresh = () => {
    fetchBranches();
  };

  // Redirect jika bukan super admin atau owner
  if (user && user.role !== Role.SUPER_ADMIN && user.role !== Role.OWNER_CABANG) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Cabang</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            {isLoading ? 'Memuat...' : 'Muat Ulang'}
          </Button>
          <Button onClick={handleAddBranch}>Tambah Cabang</Button>
        </div>
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
          {debug && (
            <div className="mt-2 text-xs text-muted-foreground">
              Debug: {debug}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Cabang ({branches.length} cabang)</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
              <Button variant="outline" onClick={handleRefresh} className="mt-4">
                Coba Lagi
              </Button>
            </div>
          ) : branches.length === 0 && !isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'Tidak ada cabang yang sesuai dengan pencarian' : 'Belum ada cabang'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Lokasi</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pemilik</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branches.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell>{branch.id}</TableCell>
                      <TableCell>{branch.name}</TableCell>
                      <TableCell className="max-w-[300px] truncate" title={branch.location}>
                        {branch.location}
                      </TableCell>
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
                      <TableCell>{branch.owner ? branch.owner.name : '-'}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewBranch(branch.id)}
                        >
                          Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 