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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { branchApi } from '@/api/branch.api';
import PageLoading from '@/components/ui/PageLoading';

const editBranchSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  location: z.string().min(5, 'Lokasi minimal 5 karakter'),
  status: z.enum(['active', 'inactive']),
  imageUrl: z.string().optional(),
});

type EditBranchFormValues = z.infer<typeof editBranchSchema>;

export default function EditBranchPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<EditBranchFormValues>({
    resolver: zodResolver(editBranchSchema),
    defaultValues: {
      name: '',
      location: '',
      status: 'active',
      imageUrl: '',
    },
  });

  useEffect(() => {
    const fetchBranch = async () => {
      setLoading(true);
      try {
        const response = await branchApi.getBranchById(Number(id));
        const branchData = response.data;
        
        // Handle both array and single object responses
        const branch = Array.isArray(branchData) 
          ? branchData[0] // Take first item if array
          : branchData;

        if (!branch) {
          throw new Error('Cabang tidak ditemukan');
        }

        form.reset({
          name: branch.name || '',
          location: branch.location || '',
          status: branch.status || 'active',
          imageUrl: branch.imageUrl || '',
        });

        setImagePreview(branch.imageUrl || null);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui';
        setError(`Gagal mengambil data cabang: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBranch();
  }, [id, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      form.setValue('imageUrl', base64);
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: EditBranchFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await branchApi.updateBranch(Number(id), data);
      router.push('/dashboard/branches');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui';
      setError(`Gagal memperbarui cabang: ${errorMessage}`);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <PageLoading title="Edit Cabang" message="Memuat data cabang..." />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Cabang</h1>
      <Card>
        <CardHeader>
          <CardTitle>Form Edit Cabang</CardTitle>
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
                      <Input {...field} placeholder="Masukkan nama cabang" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lokasi</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Masukkan lokasi cabang" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <select {...field} className="w-full border p-2 rounded">
                        <option value="active">Aktif</option>
                        <option value="inactive">Nonaktif</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Gambar</FormLabel>
                <Input type="file" accept="image/*" onChange={handleImageChange} />
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="mt-2 w-40 h-auto rounded" />
                )}
              </FormItem>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}