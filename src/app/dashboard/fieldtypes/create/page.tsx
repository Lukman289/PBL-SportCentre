'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fieldApi } from '@/api/field.api';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

// Tipe untuk error
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

// Form schema
const formSchema = z.object({
  name: z.string().min(1, 'Nama tipe field harus diisi'),
});

export default function CreateFieldTypePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      await fieldApi.createFieldType(values);
      
      toast({
        title: 'Berhasil',
        description: 'Tipe field berhasil dibuat',
      });
      
      router.push('/dashboard/fieldtypes');
    } catch (error) {
      console.error('Error creating field type:', error);
      const apiError = error as ApiError;
      toast({
        title: 'Gagal',
        description: apiError?.response?.data?.message || 'Gagal membuat tipe field',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tambah Tipe Field Baru</h1>
          <p className="text-muted-foreground">
            Isi form berikut untuk menambahkan tipe field baru
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Form Tambah Tipe Field</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Tipe Field</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Masukkan nama tipe field"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      'Simpan'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/dashboard/fieldtypes')}
                    disabled={isSubmitting}
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}