'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';


import { Alert, AlertDescription } from '@/components/ui/alert';
import useAuth from '@/hooks/useAuth.hook';
import useGlobalLoading from '@/hooks/useGlobalLoading.hook';
import { Role } from '@/types';
import useToastHandler from '@/hooks/useToastHandler';
import { useMobileLayout } from '@/hooks/useMobileLayout';

const registerSchema = z
  .object({
    name: z.string().min(3, 'Nama minimal 3 karakter'),
    email: z.string().email('Email tidak valid'),
    phone: z
      .string()
      .min(10, 'Nomor telepon minimal 10 digit')
      .regex(/^[0-9+]+$/, 'Nomor telepon hanya boleh berisi angka dan tanda +')
      .optional(),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    confirmPassword: z.string().min(6, 'Konfirmasi password minimal 6 karakter'),
    role: z.enum([Role.USER, Role.OWNER_CABANG, Role.ADMIN_CABANG, Role.SUPER_ADMIN]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password dan konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  useMobileLayout({
    includePaths: ['/auth/register']
  });

  const router = useRouter();
  const { register } = useAuth();
  const { withLoading } = useGlobalLoading();
  const { showError, showSuccess } = useToastHandler();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: Role.USER,
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setError(null);

    try {
      await withLoading(register(data.name, data.email, data.password, data.phone, data.role));
      setSuccess(true);
      showSuccess('Pendaftaran berhasil! Anda akan dialihkan ke halaman login.');
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (error) {
      showError(error, 'Gagal mendaftar. Silakan coba lagi.');
      
      // Tetap menyimpan error untuk ditampilkan dalam Alert
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: { error?: string } } };
        const errorMessage = apiError.response?.data?.error || 'Gagal mendaftar. Silakan coba lagi.';
        setError(errorMessage);
      } else {
        setError('Gagal mendaftar. Silakan coba lagi.');
      }
    }
  };

  if (success) {
    return (
      <>
        <div className="max-w-md mx-auto p-6 bg-card rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-6">Pendaftaran Berhasil</h1>
          <Alert className="mb-4">
            <AlertDescription>
              Pendaftaran berhasil! Anda akan dialihkan ke halaman login dalam beberapa detik.
            </AlertDescription>
          </Alert>
          <div className="text-center">
            <Link href="/auth/login">
              <Button variant="link">Kembali ke halaman login</Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="max-w-md my-15 mx-auto p-6 bg-card rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Daftar</h1>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama Lengkap" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="nama@example.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Telepon (Opsional)</FormLabel>
                  <FormControl>
                    <Input placeholder="+628xxxxxxxxxx" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="******" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Konfirmasi Password</FormLabel>
                  <FormControl>
                    <Input placeholder="******" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Daftar
            </Button>
          </form>
        </Form>

        <div className="mt-4 text-center text-sm">
          <p>
            Sudah punya akun?{' '}
            <Link href="/auth/login" className="text-primary hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </>
  );
} 