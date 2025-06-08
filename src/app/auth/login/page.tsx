'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import useAuth from '@/hooks/useAuth.hook';
import useGlobalLoading from '@/hooks/useGlobalLoading.hook';
import useToastHandler from '@/hooks/useToastHandler';
import { useMobileLayout } from '@/hooks/useMobileLayout';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email atau nomor telepon wajib diisi'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  useMobileLayout({
    includePaths: ['/auth/login']
  });

  const router = useRouter();
  const { login } = useAuth();
  const { withLoading } = useGlobalLoading();
  const { showError } = useToastHandler();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);

    try {
      await withLoading(login(data.identifier, data.password));
      router.push('/');
    } catch (error) {
      showError(error, 'Kredensial tidak valid. Silakan coba lagi.');
    }
  };

  return (
    <>
      <div className="max-w-md my-15 mx-auto p-6 bg-card rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Masuk</h1>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email atau Nomor Telepon</FormLabel>
                  <FormControl>
                    <Input placeholder="Email atau Nomor Telepon" {...field} />
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

            <div className="text-right">
              <Link href="/auth/forgot-password" className="text-primary text-sm hover:underline">
                Lupa password?
              </Link>
            </div>

            <Button type="submit" className="w-full">
              Masuk
            </Button>
          </form>
        </Form>

        <div className="mt-4 text-center text-sm">
          <p>
            Belum punya akun?{' '}
            <Link href="/auth/register" className="text-primary hover:underline">
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}