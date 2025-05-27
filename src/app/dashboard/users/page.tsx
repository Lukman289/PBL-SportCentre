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
import { User, Role } from '@/types';
import { useAuth } from '@/context/auth/auth.context';
import useGlobalLoading from '@/hooks/useGlobalLoading.hook';

// Interface untuk respons API
interface UsersResponse {
  data: User[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

// Fungsi untuk mendapatkan data pengguna (simulasi API)
const getUsers = async (search?: string): Promise<UsersResponse> => {
  // Ini hanya simulasi, pada implementasi sebenarnya akan memanggil API
  return {
    data: [
      {
        id: 1,
        name: 'Admin Utama',
        email: 'admin@example.com',
        role: Role.SUPER_ADMIN,
        createdAt: '2023-01-01T00:00:00Z',
      },
      {
        id: 2,
        name: 'Owner Cabang A',
        email: 'owner@example.com',
        role: Role.OWNER_CABANG,
        createdAt: '2023-01-02T00:00:00Z',
      },
      {
        id: 3,
        name: 'Admin Cabang A',
        email: 'admincabang@example.com',
        role: Role.ADMIN_CABANG,
        createdAt: '2023-01-03T00:00:00Z',
      },
      {
        id: 4,
        name: 'Pengguna Biasa',
        email: 'user@example.com',
        role: Role.USER,
        createdAt: '2023-01-04T00:00:00Z',
      },
    ].filter(user => 
      !search || 
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    ),
    meta: {
      page: 1,
      limit: 10,
      totalItems: 4,
      totalPages: 1,
    },
  };
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
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
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await withLoading(getUsers(searchQuery));
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [searchQuery, withLoading]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleAddUser = () => {
    router.push('/dashboard/users/create');
  };

  const handleViewUser = (id: number) => {
    router.push(`/dashboard/users/${id}`);
  };

  // Redirect jika bukan super admin
  if (user && user.role !== Role.SUPER_ADMIN) {
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
        <Button onClick={handleAddUser}>Tambah Pengguna</Button>
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
          <CardTitle>Daftar Pengguna</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            null // GlobalLoading akan otomatis ditampilkan
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'Tidak ada pengguna yang sesuai dengan pencarian' : 'Belum ada pengguna'}
            </div>
          ) : (
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
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          user.role === Role.SUPER_ADMIN
                            ? 'bg-purple-100 text-purple-800'
                            : user.role === Role.ADMIN_CABANG
                            ? 'bg-blue-100 text-blue-800'
                            : user.role === Role.OWNER_CABANG
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewUser(user.id)}
                      >
                        Detail
                      </Button>
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