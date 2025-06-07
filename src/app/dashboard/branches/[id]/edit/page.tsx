'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import { branchApi } from '@/api/branch.api';
import { useAuth } from '@/context/auth/auth.context';
import { Loader2, X, Upload } from 'lucide-react';
import { Role } from '@/types';
import Image from 'next/image';

// Validasi form menggunakan Zod
const editBranchSchema = z.object({
  name: z.string().min(3, 'Nama cabang minimal 3 karakter'),
  location: z.string().min(5, 'Alamat minimal 5 karakter'),
  imageUrl: z.union([z.instanceof(File), z.string()]).optional(),
  ownerId: z.number().positive('Owner harus dipilih').optional(),
  status: z.enum(['active', 'inactive']),
  removeImage: z.boolean().optional(), // Flag untuk menghapus gambar
});

type EditBranchFormValues = z.infer<typeof editBranchSchema>;

interface Owner {
  id: number;
  name: string;
  email: string;
}

export default function EditBranchPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loadingOwners, setLoadingOwners] = useState(true);
  const [loadingBranch, setLoadingBranch] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  // Pastikan user terdefinisi dan role adalah string literal type
  const isSuperAdmin = user?.role === Role.SUPER_ADMIN;

  const form = useForm<EditBranchFormValues>({
    resolver: zodResolver(editBranchSchema),
    defaultValues: {
      name: '',
      location: '',
      ownerId: 0,
      status: 'active',
      removeImage: false,
    },
  });

  // Load daftar owner dan data cabang saat component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingOwners(true);
        setLoadingBranch(true);
        setError(null);

        const branchId = Number(id);
        if (isNaN(branchId)) {
          setError('ID cabang tidak valid');
          return;
        }

        // Load owners hanya jika super admin
        let ownersData: Owner[] = [];
        if (isSuperAdmin) {
          try {
            const usersData = await branchApi.getUsersByRole('owner_cabang');
            ownersData = usersData.map(owner => ({
              id: owner.id,
              name: owner.name || 'Tanpa Nama',
              email: owner.email
            }));
            setOwners(ownersData);
          } catch (err) {
            console.error('Error loading owners:', err);
            // Continue execution even if owners fail to load
          }
        }
        setLoadingOwners(false);

        // Load branch data
        try {
          const response = await branchApi.getBranchById(branchId);

          // Pastikan response.data ada dan merupakan object
          if (!response.data) {
            setError('Data cabang tidak ditemukan');
            return;
          }

          const branch = response.data;

          // Validasi bahwa branch memiliki properti yang diperlukan
          if (!branch.name || !branch.location) {
            setError('Data cabang tidak lengkap');
            return;
          }

          // Reset form dengan data branch
          form.reset({
            name: branch.name,
            location: branch.location,
            ownerId: branch.ownerId || 0,
            status: (branch.status as 'active' | 'inactive') || 'active',
            imageUrl: branch.imageUrl || undefined,
            removeImage: false,
          });

          // Set image preview jika ada
          if (branch.imageUrl) {
            setImagePreview(branch.imageUrl);
            setCurrentImageUrl(branch.imageUrl);
          }
        } catch (err) {
          console.error('Error loading branch data:', err);
          const error = err as { response?: { status?: number } };
          if (error.response?.status === 404) {
            setError('Cabang tidak ditemukan');
          } else if (error.response?.status === 403) {
            setError('Anda tidak memiliki akses ke cabang ini');
          } else {
            setError('Gagal memuat data cabang. Silakan coba lagi.');
          }
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Terjadi kesalahan yang tidak terduga');
      } finally {
        setLoadingBranch(false);
        setLoadingOwners(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id, form, isSuperAdmin]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validasi ukuran file (maksimal 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran file maksimal 5MB');
        e.target.value = '';
        return;
      }

      // Validasi tipe file
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Format file harus JPG, PNG, atau WebP');
        e.target.value = '';
        return;
      }

      setSelectedFile(file);
      setRemoveImage(false);
      form.setValue('imageUrl', file);
      form.setValue('removeImage', false);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setRemoveImage(true);
    setImagePreview(null);
    form.setValue('imageUrl', undefined);
    form.setValue('removeImage', true);
    
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleRestoreImage = () => {
    setRemoveImage(false);
    setImagePreview(currentImageUrl);
    form.setValue('imageUrl', currentImageUrl || undefined);
    form.setValue('removeImage', false);
  };

  const onSubmit = async (data: EditBranchFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const branchId = Number(id);
      const formData = new FormData();

      // Debug: Log data yang akan dikirim
      console.log('🔍 Data to submit:', {
        name: data.name,
        location: data.location,
        status: data.status,
        ownerId: data.ownerId,
        hasFile: selectedFile ? 'Yes' : 'No',
        removeImage: removeImage,
        currentImageUrl: currentImageUrl
      });

      // Tambahkan field wajib
      formData.append('name', data.name);
      formData.append('location', data.location);
      formData.append('status', data.status);

      // Tambahkan ownerId jika ada dan user adalah super admin
      if (data.ownerId && isSuperAdmin) {
        formData.append('ownerId', data.ownerId.toString());
      }

      // Handle gambar
      if (removeImage) {
        // Kirim flag untuk menghapus gambar
        formData.append('removeImage', 'true');
        console.log('📸 Removing image');
      } else if (selectedFile) {
        // Kirim file baru
        formData.append('imageUrl', selectedFile);
        console.log('📸 Uploading new image:', selectedFile.name);
      } else if (currentImageUrl) {
        // Pertahankan gambar lama
        formData.append('keepCurrentImage', 'true');
        console.log('📸 Keeping current image');
      }

      // Debug: Log FormData contents
      console.log('📤 FormData contents:');
      for (const [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `File: ${value.name}` : value);
      }

      const result = await branchApi.updateBranch(branchId, formData);
      console.log('✅ Update result:', result);
      
      router.push(isSuperAdmin ? '/dashboard/branches' : '/dashboard/my-branches');
    } catch (err) {
      console.error('❌ Update error:', err);
      const error = err as { response?: { data?: { message?: string } } };
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Gagal memperbarui cabang. Silakan coba lagi.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loadingBranch) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Memuat data cabang...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !form.getValues('name')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() => router.push(isSuperAdmin ? '/dashboard/branches' : '/dashboard/my-branches')}
          >
            Kembali
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Cabang</h1>
        <p className="text-muted-foreground">Perbarui informasi cabang berikut</p>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Form Edit Cabang</CardTitle>
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

                {isSuperAdmin && (
                  <FormField
                    control={form.control}
                    name="ownerId"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Pemilik Cabang *</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value?.toString()}
                          disabled={loadingOwners}
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
                              <SelectItem value="0" disabled>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Aktif</SelectItem>
                          <SelectItem value="inactive">Nonaktif</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Image Upload Section */}
              <FormField
                control={form.control}
                name="imageUrl"
                render={() => (
                  <FormItem>
                    <FormLabel>Gambar Cabang (Opsional)</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        {/* Current/Preview Image */}
                        {imagePreview && !removeImage && (
                          <div className="relative inline-block">
                            <Image
                              src={imagePreview}
                              alt="Preview"
                              className="w-40 h-32 object-cover rounded border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 p-0"
                              onClick={handleRemoveImage}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            <p className="text-sm text-muted-foreground mt-1">
                              {selectedFile ? 'Preview gambar baru' : 'Gambar saat ini'}
                            </p>
                          </div>
                        )}

                        {/* Removed Image State */}
                        {removeImage && currentImageUrl && (
                          <div className="p-4 border border-dashed border-gray-300 rounded">
                            <p className="text-sm text-muted-foreground mb-2">
                              Gambar akan dihapus setelah menyimpan
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleRestoreImage}
                            >
                              Batalkan Hapus
                            </Button>
                          </div>
                        )}

                        {/* File Input */}
                        <div className="flex items-center gap-4">
                          <Input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={handleImageChange}
                            className="w-full max-w-md"
                          />
                          <div className="text-sm text-muted-foreground">
                            <p>Format: JPG, PNG, WebP</p>
                            <p>Maksimal: 5MB</p>
                          </div>
                        </div>

                        {/* Upload Instructions */}
                        {!imagePreview && !removeImage && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Upload className="h-4 w-4" />
                            <span>Pilih gambar untuk cabang Anda</span>
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
                  onClick={() => router.push(isSuperAdmin ? '/dashboard/branches' : '/dashboard/my-branches')}
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
                    'Simpan Perubahan'
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