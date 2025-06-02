'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { User, Role } from '@/types';
import { useAuth } from '@/context/auth/auth.context';
import axiosInstance from '@/config/axios.config';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface UsersResponse {
  status: boolean;
  message: string;
  data: User[];
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 15;
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Gunakan useCallback untuk fetchUsers agar bisa dipanggil dari mana saja
  const fetchUsers = useCallback(async (showToast = false) => {
    try {
      setIsLoading(true);
      
      // Tambahkan timestamp untuk bypass cache
      const response = await axiosInstance.get<UsersResponse>('/users', {
        params: { 
          q: searchQuery,
          _t: Date.now() // timestamp untuk bypass cache
        },
        // Force fresh request
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      // Filter out super_admin jika user yang login bukan super_admin
      const allFilteredUsers = user?.role === Role.SUPER_ADMIN
        ? response.data.data.filter(u => u.role !== Role.SUPER_ADMIN)
        : response.data.data.filter(u => u.role !== Role.SUPER_ADMIN);
      
      setUsers(allFilteredUsers);
      
      // Calculate total pages based on all filtered data
      const totalItems = allFilteredUsers.length;
      const calculatedTotalPages = Math.ceil(totalItems / itemsPerPage);
      setTotalPages(Math.max(1, calculatedTotalPages));
      
      // Jika current page melebihi total pages, reset ke page 1
      if (currentPage > calculatedTotalPages && calculatedTotalPages > 0) {
        setCurrentPage(1);
      }
      
      if (showToast) {
        toast.success('Data berhasil diperbarui');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Gagal memuat data pengguna');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, user?.role, currentPage]);

  // Handle refresh parameter dari URL
  useEffect(() => {
    const refresh = searchParams.get('refresh');
    if (refresh === 'true') {
      // Clean URL tanpa refresh parameter terlebih dahulu
      const url = new URL(window.location.href);
      url.searchParams.delete('refresh');
      router.replace(url.pathname + url.search, { scroll: false });
      
      // Kemudian fetch data
      fetchUsers(true);
    }
  }, [searchParams, router, fetchUsers]);

  // Initial load
  useEffect(() => {
    if (user && !searchParams.get('refresh')) {
      fetchUsers();
    }
  }, [searchQuery, user?.role, fetchUsers, searchParams]);

  // Debounced search - reset to page 1 when searching
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (user) {
        setCurrentPage(1); // Reset to first page when searching
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, user]);

  // Separate effect for page changes (no debounce needed)
  useEffect(() => {
    if (user && users.length > 0) {
      // No need to fetch again, just update the display
    }
  }, [currentPage, user, users.length]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleAddUser = () => {
    router.push('/dashboard/users/create');
  };

  const handleViewUser = (id: number) => {
    router.push(`/dashboard/users/${id}`);
  };

  const handleRefresh = () => {
    fetchUsers(true);
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleFirstPage = () => {
    handlePageChange(1);
  };

  const handleLastPage = () => {
    handlePageChange(totalPages);
  };

  const handlePreviousPage = () => {
    handlePageChange(currentPage - 1);
  };

  const handleNextPage = () => {
    handlePageChange(currentPage + 1);
  };

  // Get current page data
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return users.slice(startIndex, endIndex);
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

  // Redirect jika tidak memiliki akses
  if (!user || ![Role.SUPER_ADMIN, Role.ADMIN_CABANG, Role.OWNER_CABANG].includes(user.role)) {
    router.push('/dashboard');
    return null;
  }

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case Role.SUPER_ADMIN:
        return 'Super Admin';
      case Role.ADMIN_CABANG:
        return 'Admin Cabang';
      case Role.OWNER_CABANG:
        return 'Owner Cabang';
      case Role.USER:
        return 'Pengguna';
      default:
        return role;
    }
  };

  const currentPageData = getCurrentPageData();
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, users.length);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? 'Memuat...' : 'Refresh'}
          </Button>
          {/* Hanya super admin yang bisa menambah user */}
          {user?.role === Role.SUPER_ADMIN && (
            <Button onClick={handleAddUser}>Tambah Pengguna</Button>
          )}
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Cari Pengguna</CardTitle>
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
          <CardTitle>
            Daftar Pengguna ({users.length})
            {users.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                Menampilkan {startIndex}-{endIndex} dari {users.length} pengguna
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'Tidak ada pengguna yang sesuai dengan pencarian' : 'Belum ada pengguna'}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Peran</TableHead>
                    <TableHead>Tanggal Daftar</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPageData.map((userItem) => (
                    <TableRow key={userItem.id}>
                      <TableCell>{userItem.id}</TableCell>
                      <TableCell>{userItem.name}</TableCell>
                      <TableCell>{userItem.email}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            userItem.role === Role.SUPER_ADMIN
                              ? 'bg-purple-100 text-purple-800'
                              : userItem.role === Role.ADMIN_CABANG
                              ? 'bg-blue-100 text-blue-800'
                              : userItem.role === Role.OWNER_CABANG
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {getRoleLabel(userItem.role)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(userItem.createdAt).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewUser(userItem.id)}
                        >
                          Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Halaman {currentPage} dari {totalPages}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFirstPage}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
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
                        onClick={() => typeof pageNum === 'number' && handlePageChange(pageNum)}
                        disabled={pageNum === '...'}
                        className="h-8 min-w-8"
                      >
                        {pageNum}
                      </Button>
                    ))}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLastPage}
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