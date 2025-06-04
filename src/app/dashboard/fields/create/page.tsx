'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
import { fieldApi } from '@/api/field.api';
import { branchApi } from '@/api/branch.api';
import { Role, Branch, FieldType, FieldStatus } from '@/types';
import useGlobalLoading from '@/hooks/useGlobalLoading.hook';
import Image from 'next/image';

// Validasi form menggunakan Zod
const createFieldSchema = z.object({
  name: z.string().min(3, 'Nama lapangan minimal 3 karakter'),
  typeId: z.string().min(1, 'Tipe lapangan harus dipilih'),
  branchId: z.string().min(1, 'Cabang harus dipilih'),
  priceDay: z.string().min(1, 'Harga siang harus diisi').regex(/^\d+$/, 'Harga harus berupa angka'),
  priceNight: z.string().min(1, 'Harga malam harus diisi').regex(/^\d+$/, 'Harga harus berupa angka'),
  status: z.string().min(1, 'Status harus dipilih'),
});

type CreateFieldFormValues = z.infer<typeof createFieldSchema>;

export default function CreateFieldPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [fieldTypes, setFieldTypes] = useState<FieldType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const defaultBranchId = searchParams.get('branchId');
  const { showLoading, hideLoading } = useGlobalLoading();
  
  // For file handling
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine if branch selection should be disabled
  const [isBranchSelectionDisabled, setIsBranchSelectionDisabled] = useState(!!defaultBranchId);
  const [singleAdminBranch, setSingleAdminBranch] = useState<string | null>(null);

  const form = useForm<CreateFieldFormValues>({
    resolver: zodResolver(createFieldSchema),
    defaultValues: {
      name: '',
      typeId: '',
      branchId: defaultBranchId || '',
      priceDay: '',
      priceNight: '',
      status: 'available',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        showLoading(); // Tampilkan loading di awal fetchData
        
        let branchesToUse: Branch[] = [];
        
        // If user is admin_cabang, get their specific branches
        if (user && user.role === Role.ADMIN_CABANG) {
          const userBranchResponse = await branchApi.getUserBranches();
          const adminBranches = userBranchResponse.data || [];
          branchesToUse = adminBranches;
          
          // If admin only has one branch, auto-select it
          if (branchesToUse.length === 1) {
            const branchId = branchesToUse[0].id.toString();
            setSingleAdminBranch(branchId);
            form.setValue('branchId', branchId);
            setIsBranchSelectionDisabled(true);
          }
        } else {
          // For super_admin, get all branches
          const branchResponse = await branchApi.getBranches();
          branchesToUse = branchResponse.data || [];
        }
        
        setBranches(branchesToUse);

        // Dapatkan daftar tipe lapangan
        const fieldTypeResponse = await fieldApi.getFieldTypes();
        setFieldTypes(fieldTypeResponse || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Gagal memuat data. Silakan coba lagi.');
      } finally {
        hideLoading(); // Sembunyikan loading setelah selesai fetch
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, form, showLoading, hideLoading]);

  // Effect to handle defaultBranchId or singleAdminBranch
  useEffect(() => {
    if (defaultBranchId) {
      form.setValue('branchId', defaultBranchId);
    } else if (singleAdminBranch) {
      form.setValue('branchId', singleAdminBranch);
    }
  }, [defaultBranchId, singleAdminBranch, form]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedImage(null);
      setPreviewUrl(null);
    }
  };

  // Redirect jika bukan admin cabang atau super admin
  if (user && user.role !== Role.ADMIN_CABANG && user.role !== Role.SUPER_ADMIN) {
    router.push('/dashboard');
    return null;
  }

  const onSubmit = async (data: CreateFieldFormValues) => {
    try {
      showLoading(); // Tampilkan loading saat submit
      setIsSubmitting(true);
      setError(null);

      // Cari tipe lapangan berdasarkan ID
      const selectedTypeId = parseInt(data.typeId);
      const selectedType = fieldTypes.find(type => type.id === selectedTypeId);
      
      if (!selectedType) {
        throw new Error('Tipe lapangan tidak ditemukan');
      }

      // Persiapkan data untuk dikirim ke API
      const submitData = {
        name: data.name,
        typeId: selectedTypeId,
        branchId: parseInt(data.branchId),
        priceDay: parseFloat(data.priceDay),
        priceNight: parseFloat(data.priceNight),
        status: data.status as FieldStatus,
        type: {
          id: selectedTypeId,
          name: selectedType.name
        },
      };

      if (selectedImage) {
        // Kirim data dengan gambar
        const formData = new FormData();
        
        // Tambahkan semua properti dari submitData ke formData
        Object.entries(submitData).forEach(([key, value]) => {
          if (key === 'type') {
            // Handle nested object 'type'
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        });
        
        // Tambahkan file gambar dengan nama 'imageUrl' sesuai yang diharapkan oleh backend
        formData.append('imageUrl', selectedImage);
        
        // Kirim formData ke API
        await fieldApi.createFieldWithImage(formData);
      } else {
        // Kirim data tanpa gambar
        await fieldApi.createField(submitData);
      }
      
      // Redirect ke halaman daftar lapangan atau detail cabang
      if (defaultBranchId) {
        router.push(`/dashboard/branches/${defaultBranchId}`);
      } else if (singleAdminBranch) {
        router.push(`/dashboard/branches/${singleAdminBranch}`);
      } else {
        router.push('/dashboard/fields');
      }
    } catch (error) {
      console.error('Error creating field:', error);
      setError('Gagal membuat lapangan. Silakan coba lagi.');
    } finally {
      hideLoading(); // Sembunyikan loading setelah selesai submit
      setIsSubmitting(false);
    }
  };

  // Jangan tampilkan apa-apa selama loading awal
  if (isLoading) {
    return null;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Tambah Lapangan Baru</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Lapangan</CardTitle>
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
                    <FormLabel>Nama Lapangan</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Masukkan nama lapangan" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="typeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipe Lapangan</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih tipe lapangan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {fieldTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id.toString()}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="branchId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cabang</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isBranchSelectionDisabled}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih cabang" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {branches.map((branch) => (
                            <SelectItem key={branch.id} value={branch.id.toString()}>
                              {branch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="priceDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Harga Siang (Rp)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          placeholder="Masukkan harga siang"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priceNight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Harga Malam (Rp)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          placeholder="Masukkan harga malam"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="available">Tersedia</SelectItem>
                        <SelectItem value="maintenance">Pemeliharaan</SelectItem>
                        <SelectItem value="closed">Tutup</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Gambar Lapangan</FormLabel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Ukuran maksimal: 5MB. Format: JPG, PNG
                    </p>
                  </div>
                  <div>
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="mt-2 max-h-40 rounded"
                      />
                    )}
                  </div>
                </div>
              </FormItem>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Lapangan'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}