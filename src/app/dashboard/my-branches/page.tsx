'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Branch } from '@/types';
import { branchApi } from '@/api/branch.api';
import { useAuth } from '@/context/auth/auth.context';
import { Role } from '@/types';

export default function MyBranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchPaginate, setBranchPaginate] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 15;

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    setBranchPaginate(branches.slice((page - 1) * limit, page * limit));
  }, [page]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setBranchPaginate(branches.slice((page - 1) * limit, page * limit));
      setTotalItems(branches.length);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = branches.filter(
        (branch) =>
          branch.name.toLowerCase().includes(query) ||
          branch.location.toLowerCase().includes(query)
      );
      setTotalItems(filtered.length);
      setBranchPaginate(filtered);
    }
  }, [searchQuery]);

  const fetchBranches = async () => {
    setIsLoading(true);
    try {
      const response = await branchApi.getUserBranches();
      
      if (response && response.data) {
        const data = response.data;
        setBranches(data);
        setBranchPaginate(data.slice((page - 1) * limit, page * limit));
        setTotalItems(response.meta?.totalItems || 0);
      } else {
        setBranches([]);
        setBranchPaginate([]);
      }
    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

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
        {/* {user?.role === Role.OWNER_CABANG && (
          <Button onClick={handleAddBranch}>Tambah Cabang</Button>
        )} */}
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
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : branchPaginate.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'Tidak ada cabang yang sesuai dengan pencarian' : 'Anda belum memiliki cabang'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>ID Cabang</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branchPaginate.map((branch, index) => (
                  <TableRow key={branch.id}>
                    <TableCell>{(page - 1) * limit + index + 1}</TableCell>
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
                        {/* {user?.role === Role.OWNER_CABANG && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/branches/${branch.id}/admins`)}
                          >
                            Admin
                          </Button>
                        )} */}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableCaption>
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
              </TableCaption>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 