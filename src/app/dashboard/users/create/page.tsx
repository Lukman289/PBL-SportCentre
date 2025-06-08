'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Role } from '@/types';
import axiosInstance from '@/config/axios.config';
import useToastHandler from '@/hooks/useToastHandler';

interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: Role;
}

interface CreateUserResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role: Role;
    createdAt: string;
    branch?: string;
  };
}

interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export default function CreateUserPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role | ''>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { showError, showSuccess } = useToastHandler();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) newErrors.name = 'Nama harus diisi';
    if (!email.trim()) newErrors.email = 'Email harus diisi';
    if (!password.trim()) newErrors.password = 'Password harus diisi';
    if (!phone.trim()) newErrors.phone = 'Nomor telepon harus diisi';
    if (!role) newErrors.role = 'Peran harus dipilih';
    
    // Validasi format email
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Format email tidak valid';
    }
    
    // Validasi format telepon (minimal 8 digit angka)
    if (phone && !/^\d{8,}$/.test(phone)) {
      newErrors.phone = 'Nomor telepon harus minimal 8 digit angka';
    }
    
    // Validasi password minimal 6 karakter
    if (password && password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const payload: CreateUserRequest = {
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        role: role as Role,
      };

      const response = await axiosInstance.post<CreateUserResponse>('/users', payload);

      if (response.data.status) {
        showSuccess('User berhasil dibuat');
        
        // Reset form
        setName('');
        setEmail('');
        setPassword('');
        setPhone('');
        setRole('');
        
        // Gunakan setTimeout untuk memastikan toast muncul sebelum redirect
        setTimeout(() => {
          // Redirect dengan parameter refresh untuk force update
          router.push('/dashboard/users?refresh=true');
        }, 100);
      } else {
        showError(response.data.message || 'Terjadi kesalahan');
      }
    } catch (error) {
      const apiError = error as ApiError;
      
      if (apiError.response?.data?.message) {
        // Handle specific validation errors from backend
        if (apiError.response.data.message.includes('Email sudah digunakan')) {
          setErrors({ email: 'Email sudah digunakan' });
          showError(apiError.response.data.message, 'Email Sudah Digunakan');
        } else if (apiError.response.data.message.includes('Peran yang diizinkan')) {
          setErrors({ role: apiError.response.data.message });
          showError(apiError.response.data.message, 'Peran Tidak Diizinkan');
        } else {
          showError(apiError.response.data.message);
        }
      } else if (apiError.response?.status === 401) {
        showError('Anda tidak memiliki izin untuk melakukan aksi ini', 'Tidak Memiliki Akses');
        router.push('/login');
      } else if (apiError.response?.status === 403) {
        showError('Anda tidak memiliki akses untuk membuat user dengan role tersebut', 'Akses Ditolak');
      } else {
        showError(error, 'Terjadi kesalahan saat membuat user');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/users');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tambah Pengguna</h1>

      <Card>
        <CardHeader>
          <CardTitle>Form Pengguna Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div>
              <Label htmlFor="name">Nama</Label>
              <Input
                id="name"
                placeholder="Nama pengguna"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={errors.name ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email pengguna"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password pengguna (minimal 6 karakter)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>
            
            <div>
              <Label htmlFor="phone">Nomor Telepon</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Nomor telepon pengguna"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={errors.phone ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <Label htmlFor="role">Peran</Label>
              <Select 
                value={role} 
                onValueChange={(val: Role) => setRole(val)}
                disabled={isLoading}
              >
                <SelectTrigger id="role" className={errors.role ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Pilih peran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Role.SUPER_ADMIN}>Super Admin</SelectItem>
                  <SelectItem value={Role.ADMIN_CABANG}>Admin Cabang</SelectItem>
                  <SelectItem value={Role.OWNER_CABANG}>Owner Cabang</SelectItem>
                  <SelectItem value={Role.USER}>Pengguna</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                disabled={isLoading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}