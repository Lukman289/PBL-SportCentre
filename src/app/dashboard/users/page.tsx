'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
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
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, RefreshCw, Search, X } from 'lucide-react';
import { userApi } from '@/api';
import useToastHandler from '@/hooks/useToastHandler';

function UsersContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 15;
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { showError, showSuccess } = useToastHandler();

  // Gunakan useCallback untuk fetchUsers agar bisa dipanggil dari mana saja
  const fetchUsers = useCallback(async (showToastMessage = false) => {
    try {
      setIsLoading(true);
      
      const response = await userApi.getAllUsers();
      
      // Filter out super_admin jika user yang login bukan super_admin
      const allFilteredUsers = user?.role === Role.SUPER_ADMIN
        ? response.filter(u => u.role !== Role.SUPER_ADMIN)
        : response.filter(u => u.role !== Role.SUPER_ADMIN);
      
      setUsers(allFilteredUsers);
      setFilteredUsers(allFilteredUsers);
      
      // Calculate total pages based on all filtered data
      const totalItems = allFilteredUsers.length;
      const calculatedTotalPages = Math.ceil(totalItems / itemsPerPage);
      setTotalPages(Math.max(1, calculatedTotalPages));
      
      // Jika current page melebihi total pages, reset ke page 1
      if (currentPage > calculatedTotalPages && calculatedTotalPages > 0) {
        setCurrentPage(1);
      }
      
      if (showToastMessage) {
        showSuccess('Data berhasil diperbarui');
      }
    } catch (error) {
      showError(error, 'Gagal memuat data pengguna');
    } finally {
      setIsLoading(false);
    }
  }, [user?.role, currentPage, showSuccess, showError]);

  // Handle refresh parameter dari URL
  useEffect(() => {
    const refresh = searchParams?.get('refresh');
    if (refresh === 'true') {
      // Clean URL tanpa refresh parameter terlebih dahulu
      const url = new URL(window.location.href);
      url.searchParams.delete('refresh');
      router.replace(url.pathname + url.search, { scroll: false });
      
      // Kemudian fetch data
      fetchUsers(true);
    }
  }, [router, fetchUsers]);

  // Initial load
  useEffect(() => {
    if (user && !searchParams?.get('refresh')) {
      fetchUsers();
    }
  }, [user?.role, fetchUsers, searchParams]);

  // Debounced search - reset to page 1 when searching
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (user) {
        setCurrentPage(1); // Reset to first page when searching
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [user]);

  // Separate effect for page changes (no debounce needed)
  useEffect(() => {
    if (user && users.length > 0) {
      // No need to fetch again, just update the display
    }
  }, [user, users.length]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (query === '') {
      setFilteredUsers(users);
    } else {
      const lowerCaseQuery = query.toLowerCase();
      const results = users.filter(user => 
        user.name.toLowerCase().includes(lowerCaseQuery) || 
        user.email.toLowerCase().includes(lowerCaseQuery)
      );
      setFilteredUsers(results);
    }
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
    return filteredUsers.slice(startIndex, endIndex);
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
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <span className="hidden sm:block">{isLoading ? 'Memuat...' : 'Refresh'}</span>
            <RefreshCw size={16} className="block sm:hidden" />
          </Button>
          {/* Hanya super admin yang bisa menambah user */}
          {user?.role === Role.SUPER_ADMIN && (
            <Button onClick={handleAddUser}>Tambah Pengguna</Button>
          )}
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex items-center gap-2 mb-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Cari berdasarkan nama atau email..."
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
                fetchUsers();
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
          // disabled={loading}
        >
          <Search className="w-5 h-5" />
        </Button>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>
            Daftar Pengguna ({filteredUsers.length})
            {filteredUsers.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                Menampilkan {startIndex}-{endIndex} dari {filteredUsers.length} pengguna
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'Tidak ada pengguna yang sesuai dengan pencarian' : 'Belum ada pengguna'}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Peran</TableHead>
                    <TableHead>Tanggal Daftar</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPageData.map((userItem, index) => (
                    <TableRow key={userItem.id}>
                      <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
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
              {totalPages > 1 && filteredUsers.length > itemsPerPage && (
                <div className="flex items-center justify-between mt-6">
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
                  </div>

                  <div className="flex items-center space-x-2">
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
                  </div>

                  <div className="flex items-center space-x-2">
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

export default function UsersPage() {
  return (
    <Suspense fallback={
      <div className="p-4">
        <h1 className="text-xl font-semibold">Memuat Data Pengguna...</h1>
      </div>
    }>
      <UsersContent />
    </Suspense>
  );
}