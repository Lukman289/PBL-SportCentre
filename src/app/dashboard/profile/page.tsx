'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useAuth from '@/hooks/useAuth.hook';
import { userApi } from '@/api/user.api';
import useGlobalLoading from '@/hooks/useGlobalLoading.hook';
import useToastHandler from '@/hooks/useToastHandler';

const profileSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.string().email('Email tidak valid').optional(),
  phone: z
    .string()
    .min(10, 'Nomor telepon minimal 10 digit')
    .regex(/^[0-9+]+$/, 'Nomor telepon hanya boleh berisi angka dan tanda +')
    .optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showLoading, hideLoading, withLoading } = useGlobalLoading();
  const { showError, showSuccess } = useToastHandler();

  // Mengelola loading state
  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const updatedUser = await withLoading(userApi.updateUserProfile({
        name: data.name,
        email: data.email,
        phone: data.phone
      }));
      
      // Update user profile di context
      updateUserProfile({
        ...user,
        ...updatedUser
      });
      
      setSuccess(true);
      showSuccess('Profil berhasil diperbarui!');
    } catch (error) {
      setError('Gagal memperbarui profil. Silakan coba lagi.');
      showError(error, 'Gagal memperbarui profil. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profil Pengguna</h1>
        <p className="text-muted-foreground">Kelola informasi profil Anda</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Informasi Pengguna</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user?.name}</h2>
              <p className="text-sm text-gray-500 capitalize">{user?.role.replace('_', ' ')}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>

          {success && (
            <Alert className="mb-4">
              <AlertDescription>Profil berhasil diperbarui!</AlertDescription>
            </Alert>
          )}

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
                      <Input placeholder="nama@example.com" type="email" {...field} disabled />
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
                    <FormLabel>Nomor Telepon</FormLabel>
                    <FormControl>
                      <Input placeholder="+628xxxxxxxxxx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Perbarui Profil
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 