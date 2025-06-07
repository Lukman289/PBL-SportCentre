'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import useToastHandler from '@/hooks/useToastHandler';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
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
import { Branch, Role, User } from '@/types';
import { userApi } from '@/api/user.api'; 
// Validasi form menggunakan Zod
const addAdminSchema = z.object({
  userId: z.string().min(1, 'Admin harus dipilih'),
});

type AddAdminFormValues = z.infer<typeof addAdminSchema>;

export default function AddAdminPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const { showError } = useToastHandler();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [eligibleAdmins, setEligibleAdmins] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const branchId = parseInt(params.id as string);

  const form = useForm<AddAdminFormValues>({
    resolver: zodResolver(addAdminSchema),
    defaultValues: {
      userId: '',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Dapatkan detail cabang
        const branchData = await branchApi.getBranchById(branchId);
        setBranch(branchData.data);

        // Dapatkan daftar admin yang eligible (belum menjadi admin di cabang ini)
        const admins = await userApi.getUsersByRole(Role.ADMIN_CABANG);
        setEligibleAdmins(admins.data);
      } catch (err) {
        showError(err, 'Gagal memuat data. Silakan coba lagi.');    
      } finally {
        setIsLoading(false);
      }
    };

    if (branchId) {
      fetchData();
    }
  }, [branchId]);

  // Redirect jika bukan super admin atau owner cabang
  if (user && user.role !== Role.SUPER_ADMIN && user.role !== Role.OWNER_CABANG) {
    router.push('/dashboard');
    return null;
  }

  const onSubmit = async (data: AddAdminFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const userId = parseInt(data.userId);
      await branchApi.addBranchAdmin(branchId, userId);
      
      // Redirect ke halaman detail cabang
      router.push(`/dashboard/branches/${branchId}`);
    } catch (err) {
      console.error('Error adding admin:', err);
      setError('Gagal menambahkan admin. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !branch) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Tambah Admin untuk {branch?.name}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Tambah Admin</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {eligibleAdmins.length === 0 ? (
            <Alert>
              <AlertDescription>
                Tidak ada admin yang tersedia untuk ditambahkan. Pastikan ada pengguna dengan peran Admin Cabang.
              </AlertDescription>
            </Alert>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih admin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {eligibleAdmins.map((admin) => (
                            <SelectItem key={admin.id} value={admin.id.toString()}>
                              {admin.name} ({admin.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/dashboard/branches/${branchId}`)}
                  >
                    Batal
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Menyimpan...' : 'Tambahkan'}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 