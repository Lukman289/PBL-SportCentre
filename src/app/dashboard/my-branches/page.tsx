'use client';

import { useState, useEffect } from 'react';
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
import useGlobalLoading from '@/hooks/useGlobalLoading.hook';
import { Search, X } from 'lucide-react';
import useToastHandler from '@/hooks/useToastHandler';

export default function MyBranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { showError } = useToastHandler();
  const router = useRouter();
  const { user } = useAuth();
  const { showLoading, hideLoading, withLoading } = useGlobalLoading();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const maxData = 10;

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);
  
  useEffect(() => {
    fetchBranches(maxData, currentPage);
  }, [currentPage]);

  const fetchBranches = async (limit: number, page: number, q: string = '') => {
    setIsLoading(true);
    try {
      const response = await withLoading(branchApi.getUserBranches({
        limit,
        page,
        q,
      }));
      
      if (response && response.data) {
        const data = response.data;
        setBranches(data);
        setTotalItems(response.meta?.totalItems || 0);
      } else {
        setBranches([]);
      }
    } catch (error) {
      showError(error, 'Gagal memuat data cabang. Silakan coba lagi nanti.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (query === '') {
      fetchBranches(maxData, currentPage);
    } else {
      fetchBranches(1000, 1, query);
    }
  };

  const handleViewBranch = (id: number) => {
    router.push(`/dashboard/branches/${id}`);
  };

  // Redirect jika bukan owner cabang atau admin cabang
  if (user && user.role !== Role.OWNER_CABANG && user.role !== Role.ADMIN_CABANG) {
    router.push('/dashboard');
    return null;
  }

  // Jika loading, GlobalLoading akan otomatis ditampilkan
  if (isLoading) {
    return null;
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Cabang Saya</h1>
          <p className="text-muted-foreground">
            Kelola cabang yang Anda miliki
          </p>
        </div>
        {/* {user?.role === Role.OWNER_CABANG && (
          <Button onClick={handleAddBranch}>Tambah Cabang</Button>
        )} */}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Cari Cabang</CardTitle>
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
                    fetchBranches(maxData, 1);
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
          <CardTitle>Daftar Cabang</CardTitle>
        </CardHeader>
        <CardContent>
          {branches.length === 0 ? (
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
                {branches.map((branch, index) => (
                  <TableRow key={branch.id}>
                    <TableCell>{(currentPage - 1) * maxData + index + 1}</TableCell>
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableCaption>
                {totalItems > maxData && (
                  <div className="flex justify-between items-center gap-4 mt-8">
                    <Button 
                      variant="outline" 
                      disabled={currentPage === 1} 
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    >
                      Sebelumnya
                    </Button>
                    <span className="text-sm text-gray-500">
                      Halaman {currentPage} dari {Math.ceil(totalItems / maxData)}
                    </span>
                    <Button 
                      variant="outline" 
                      disabled={currentPage >= Math.ceil(totalItems / maxData)} 
                      onClick={() => setCurrentPage((prev) => prev + 1)}
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