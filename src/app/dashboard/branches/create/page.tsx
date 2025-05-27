'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/auth/auth.context';
import { branchApi } from '@/api/branch.api';
import { Role } from '@/types';
import useGlobalLoading from '@/hooks/useGlobalLoading.hook';

// Validasi form menggunakan Zod
const createBranchSchema = z.object({
  name: z.string().min(3, 'Nama cabang minimal 3 karakter'),
  address: z.string().min(5, 'Alamat minimal 5 karakter'),
  open_time: z.string().min(5, 'Format waktu: HH:MM'),
  close_time: z.string().min(5, 'Format waktu: HH:MM'),
  location: z.string().min(5, 'Lokasi minimal 5 karakter'),
  logo: z.instanceof(File).optional(),
  admin_ids: z.array(z.number()).optional(),
});

type CreateBranchFormValues = z.infer<typeof createBranchSchema>;

export default function CreateBranchPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showLoading, hideLoading, withLoading } = useGlobalLoading();

  // Mengelola loading state
  useEffect(() => {
    if (isSubmitting) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isSubmitting, showLoading, hideLoading]);

  const form = useForm<CreateBranchFormValues>({
    resolver: zodResolver(createBranchSchema),
    defaultValues: {
      name: '',
      address: '',
      location: '',
      open_time: '08:00',
      close_time: '22:00',
      admin_ids: [],
    },
  });

  // Redirect jika bukan super admin atau owner cabang
  if (user && user.role !== Role.SUPER_ADMIN && user.role !== Role.OWNER_CABANG) {
    router.push('/dashboard');
    return null;
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      form.setValue('logo', e.target.files[0]);
    }
  };

  const onSubmit = async (data: CreateBranchFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Siapkan data untuk dikirim
      const submitData = {
        ...data,
        ownerId: user?.id || 0, // Gunakan ID user yang login sebagai ownerId
      };

      await withLoading(branchApi.createBranch(submitData));
      
      // Redirect ke halaman daftar cabang
      if (user?.role === Role.SUPER_ADMIN) {
        router.push('/dashboard/branches');
      } else {
        router.push('/dashboard/my-branches');
      }
    } catch (err) {
      console.error('Error creating branch:', err);
      setError('Gagal membuat cabang. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Jika loading, GlobalLoading akan otomatis ditampilkan
  if (isSubmitting) {
    return null;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Tambah Cabang Baru</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Cabang</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Cabang</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama Cabang" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alamat</FormLabel>
                    <FormControl>
                      <Input placeholder="Alamat lengkap cabang" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="open_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jam Buka</FormLabel>
                      <FormControl>
                        <Input placeholder="08:00" type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="close_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jam Tutup</FormLabel>
                      <FormControl>
                        <Input placeholder="22:00" type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Lokasi</FormLabel>
                    <FormControl>
                      <Input placeholder="https://maps.google.com/?q=-7.9666204,112.6326321" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logo"
                render={() => (
                  <FormItem>
                    <FormLabel>Logo Cabang (Opsional)</FormLabel>
                    <FormControl>
                      <Input type="file" accept="image/*" onChange={handleLogoChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => user?.role === Role.SUPER_ADMIN ? router.push('/dashboard/branches') : router.push('/dashboard/my-branches')}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 