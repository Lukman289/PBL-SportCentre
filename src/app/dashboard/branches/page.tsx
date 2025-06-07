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
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, PlusCircle, RefreshCw } from 'lucide-react';
import useToastHandler from '@/hooks/useToastHandler';

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const router = useRouter();
  const { user } = useAuth();
  const { showError } = useToastHandler();

  const fetchBranches = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await branchApi.getBranches({
        q: searchQuery || undefined,
        limit: 100,
      });
      
      if (response?.data) {
        setBranches(response.data);
        setCurrentPage(1);
      } else {
        setBranches([]);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      const errorMsg = 'Gagal memuat daftar cabang. Silakan coba lagi.';
      setError(errorMsg);
      showError(error, errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, showError]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBranches();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchBranches]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = branches.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(branches.length / itemsPerPage);

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

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const delta = 2; // Show 2 pages before and after current page
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (user && user.role !== Role.SUPER_ADMIN && user.role !== Role.OWNER_CABANG) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Cabang</h1>
          <p className="text-muted-foreground">
            Kelola semua cabang perusahaan Anda
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Memuat...' : 'Refresh'}
          </Button>
          <Button onClick={handleAddBranch}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Cabang
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <CardTitle className="text-lg">Daftar Cabang</CardTitle>
            <div className="w-full md:w-auto">
              <Input
                placeholder="Cari cabang..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full md:w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <RefreshCw className="animate-spin h-8 w-8 text-primary mb-4" />
              <p className="text-muted-foreground">Memuat data cabang...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">{error}</div>
              <Button variant="outline" onClick={handleRefresh}>
                Coba Lagi
              </Button>
            </div>
          ) : branches.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                {searchQuery ? 'Tidak ada cabang yang sesuai' : 'Belum ada cabang'}
              </div>
              <Button onClick={handleAddBranch}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Cabang Pertama
              </Button>
            </div>
          ) : (
            <>
              <div className="relative overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[80px]">ID</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Lokasi</TableHead>
                      <TableHead className="w-[120px]">Status</TableHead>
                      <TableHead>Pemilik</TableHead>
                      <TableHead className="w-[100px]">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.map((branch) => (
                      <TableRow key={branch.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{branch.id}</TableCell>
                        <TableCell>{branch.name}</TableCell>
                        <TableCell className="max-w-[200px] truncate" title={branch.location}>
                          {branch.location}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              branch.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {branch.status === 'active' ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </TableCell>
                        <TableCell>{branch.owner?.name || '-'}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewBranch(branch.id)}
                            className="text-primary hover:text-primary"
                          >
                            Detail
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Menampilkan{' '}
                    <span className="font-medium">
                      {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, branches.length)}
                    </span>{' '}
                    dari <span className="font-medium">{branches.length}</span> cabang
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {getPageNumbers().map((pageNum, index) => (
                      <Button
                        key={index}
                        variant={pageNum === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => typeof pageNum === 'number' && setCurrentPage(pageNum)}
                        disabled={pageNum === '...'}
                        className="h-8 min-w-8"
                      >
                        {pageNum}
                      </Button>
                    ))}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}