"use client";

import { authApi } from "@/api/auth.api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ForgotPasswordRequest } from "@/types";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useToastHandler from "@/hooks/useToastHandler";
import { useMobileLayout } from "@/hooks/useMobileLayout";

export default function ForgotPasswordPage() {
  // Mengaktifkan bottom navigation di halaman ini
  useMobileLayout({
    includePaths: ['/auth/forgot-password']
  });

  const { showError, showSuccess } = useToastHandler();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showError("Silakan masukkan email Anda");
      return;
    }

    setIsLoading(true);
    setDevResetUrl(null);

    try {
      const data: ForgotPasswordRequest = { email };
      const response = await authApi.forgotPassword(data);
      setIsSuccess(true);
      showSuccess("Jika email terdaftar, instruksi reset password akan dikirim", "Permintaan terkirim");
      
      // Cek jika server mengirim URL untuk mode development
      if (response.resetUrl) {
        setDevResetUrl(response.resetUrl);
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      showError(error, "Gagal mengirim permintaan reset password. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Lupa Password</CardTitle>
          <CardDescription>
            Masukkan email Anda untuk menerima link reset password
          </CardDescription>
        </CardHeader>

        {!isSuccess ? (
          <>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contoh@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !email}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...
                    </>
                  ) : (
                    "Kirim Link Reset"
                  )}
                </Button>
                <div className="text-center text-sm">
                  <Link href="/auth/login" className="text-blue-600 hover:underline">
                    Kembali ke Login
                  </Link>
                </div>
              </CardFooter>
            </form>
          </>
        ) : (
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-700">
                Jika email terdaftar, instruksi reset password telah dikirim. 
                Silakan periksa kotak masuk email Anda.
              </p>
            </div>

            {/* Tampilkan link reset jika dalam mode development */}
            {devResetUrl && (
              <Alert className="mt-4 bg-orange-50 border-orange-200">
                <AlertDescription>
                  <p className="font-semibold mb-2 text-orange-700">
                    Mode Development - Link Reset:
                  </p>
                  <Link 
                    href={devResetUrl} 
                    className="text-blue-600 hover:underline break-words"
                  >
                    {devResetUrl}
                  </Link>
                </AlertDescription>
              </Alert>
            )}

            <Button
              className="w-full mt-4"
              onClick={() => router.push("/auth/login")}
            >
              Kembali ke Login
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
} 