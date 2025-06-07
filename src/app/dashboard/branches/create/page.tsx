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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/auth/auth.context';
import { branchApi } from '@/api/branch.api';
import { BranchStatus, Role } from '@/types';
import { Loader2, X } from 'lucide-react';
import useGlobalLoading from '@/hooks/useGlobalLoading.hook';

// Validasi form menggunakan Zod - disesuaikan dengan database schema
const createBranchSchema = z.object({
  name: z.string().min(3, 'Nama cabang minimal 3 karakter'),
  location: z.string().min(5, 'Alamat minimal 5 karakter'),
  status: z.nativeEnum(BranchStatus),
  imageUrl: z.instanceof(File).optional(),
  ownerId: z.number().positive('Owner harus dipilih'),
});

type CreateBranchFormValues = z.infer<typeof createBranchSchema>;

export default function CreateBranchPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [owners, setOwners] = useState<Array<{ id: number; name: string; email: string }>>([]);
  const [loadingOwners, setLoadingOwners] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { showLoading, hideLoading, withLoading } = useGlobalLoading();

  const form = useForm<CreateBranchFormValues>({
    resolver: zodResolver(createBranchSchema),
    defaultValues: {
      name: '',
      location: '',
      status: BranchStatus.ACTIVE, // Default ke active
      ownerId: 0,
    },
  });

  // Load daftar owner saat component mount
  useEffect(() => {
    const loadOwners = async () => {
      try {
        setLoadingOwners(true);
        showLoading();

        const ownersData = await branchApi.getUsersByRole('owner_cabang');
        console.log('Received owners data:', ownersData);

        // Format data owner untuk select dropdown
        const formattedOwners = ownersData.map(owner => ({
          id: owner.id,
          name: owner.name || 'Tanpa Nama',
          email: owner.email
        }));

        setOwners(formattedOwners);

        // Jika user adalah owner cabang, set sebagai pemilik default
        if (user?.role === Role.OWNER_CABANG) {
          form.setValue('ownerId', user.id);
        }
      } catch (err) {
        console.error('Error loading owners:', err);
        setError('Gagal memuat daftar owner. Silakan refresh halaman.');
      } finally {
        setLoadingOwners(false);
        hideLoading();
      }
    };

    loadOwners();
  }, [user, form, showLoading, hideLoading]);

  // Redirect jika bukan super admin atau owner cabang
  if (user && user.role !== Role.SUPER_ADMIN && user.role !== Role.OWNER_CABANG) {
    router.push('/dashboard');
    return null;
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      form.setValue('imageUrl', file);

      // Buat URL untuk preview gambar
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
    } else {
      form.resetField('imageUrl');
      setPreviewImage(null);
    }
  };

  const handleRemoveImage = () => {
    form.resetField('imageUrl');
    setPreviewImage(null);
    // Reset the file input
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const onSubmit = async (data: CreateBranchFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Siapkan data untuk dikirim ke API - sesuaikan dengan database schema
      const submitData = {
        name: data.name,
        location: data.location, // Konsisten menggunakan 'location'
        status: data.status, // Tambahkan status
        ownerId: data.ownerId,
        imageUrl: data.imageUrl, // File untuk upload
      };

      console.log('Submitting data:', submitData);

      // Gunakan withLoading dengan membungkus promise
      await withLoading(branchApi.createBranch(submitData));

      // Redirect berdasarkan role user
      const redirectPath = user?.role === Role.SUPER_ADMIN
        ? '/dashboard/branches'
        : '/dashboard/my-branches';

      router.push(redirectPath);
    } catch (err: unknown) {
      console.error('Error creating branch:', err);

      // Perbaiki cara penanganan error
      if (err && typeof err === 'object' && 'message' in err) {
        setError((err as Error).message || 'Gagal membuat cabang. Silakan coba lagi.');
      } else {
        setError('Gagal membuat cabang. Silakan coba lagi.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Tambah Cabang Baru</h1>
        <p className="text-muted-foreground">Isi form berikut untuk menambahkan cabang baru</p>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Form Pendaftaran Cabang</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Nama Cabang *</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: Cabang Jakarta Pusat" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Alamat Lengkap *</FormLabel>
                      <FormControl>
                        <Input placeholder="Jl. Contoh No. 123, Kota" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ownerId"
                  render={({ field }) => (
                    <FormItem className="md:col-span-1">
                      <FormLabel>Pemilik Cabang *</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString() || undefined}
                        disabled={loadingOwners || user?.role === Role.OWNER_CABANG}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            {loadingOwners ? (
                              <div className="flex items-center">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Memuat daftar owner...
                              </div>
                            ) : (
                              <SelectValue placeholder="Pilih Pemilik Cabang" />
                            )}
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {owners.length === 0 ? (
                            <SelectItem value="no-data" disabled>
                              Tidak ada owner tersedia
                            </SelectItem>
                          ) : (
                            owners.map((owner) => (
                              <SelectItem
                                key={owner.id}
                                value={owner.id.toString()}
                              >
                                {owner.name} ({owner.email})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {user?.role === Role.OWNER_CABANG && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Anda otomatis terdaftar sebagai pemilik cabang ini
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="md:col-span-1">
                      <FormLabel>Status Cabang *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih Status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={BranchStatus.ACTIVE}>
                            Aktif
                          </SelectItem>
                          <SelectItem value={BranchStatus.INACTIVE}>
                            Tidak Aktif
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="imageUrl"
                render={() => (
                  <FormItem>
                    <FormLabel>Gambar Cabang (Opsional)</FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                          <Input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleLogoChange}
                            className="w-full max-w-md"
                          />
                        </div>
                        {previewImage && (
                          <div className="mt-2">
                            <div className="text-sm text-muted-foreground mb-2">Preview:</div>
                            <div className="relative inline-block">
                              <img
                                src={previewImage}
                                alt="Preview gambar cabang"
                                className="max-w-xs max-h-40 object-contain border rounded"
                              />
                              <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-600 transition-colors"
                                aria-label="Hapus gambar"
                              >
                                <X className="h-4 w-4 text-white" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex gap-4 pt-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(user?.role === Role.SUPER_ADMIN
                    ? '/dashboard/branches'
                    : '/dashboard/my-branches')}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting || loadingOwners}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan Cabang'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}