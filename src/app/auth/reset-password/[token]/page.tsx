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
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ResetPasswordRequest } from "@/types";
import { Loader2 } from "lucide-react";
import { setResetPasswordToken, getResetPasswordToken } from "@/utils/cookie.utils";
import useToastHandler from "@/hooks/useToastHandler";
import { useMobileLayout } from "@/hooks/useMobileLayout";

export default function ResetPasswordTokenPage() {
  // Mengaktifkan bottom navigation di halaman ini
  useMobileLayout({
    includePaths: ['/auth/reset-password/*']
  });

  const router = useRouter();
  const { showError, showSuccess } = useToastHandler();
  const params = useParams<{ token: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isTokenChecked, setIsTokenChecked] = useState(false);

  useEffect(() => {
    if (params.token) {
      const token = decodeURIComponent(params.token as string);
      setResetPasswordToken(token);
      setIsTokenValid(true);
      setIsTokenChecked(true);
    } else {
      const tokenFromCookie = getResetPasswordToken();
      
      if (!tokenFromCookie) {
        showError("Token Tidak Ditemukan", "Link reset password tidak valid. Silakan minta link baru.");
        setIsTokenValid(false);
      } else {
        setIsTokenValid(true);
      }
      setIsTokenChecked(true);
    }
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      showError("Password Terlalu Pendek", "Password harus minimal 6 karakter");
      return;
    }

    if (password !== confirmPassword) {
      showError("Password Tidak Cocok", "Password dan konfirmasi password harus sama");
      return;
    }

    setIsLoading(true);

    try {
      // Kirim token yang tersimpan di cookie atau dari params
      const token = getResetPasswordToken() || (params.token ? decodeURIComponent(params.token as string) : "");
      
      const data: ResetPasswordRequest = {
        token,
        password,
        confirmPassword
      };
      
      await authApi.resetPassword(data);
      setIsSuccess(true);
      showSuccess("Password Anda telah diperbarui. Silakan login dengan password baru.");
    } catch (error) {
      showError(error, "Gagal mereset password. Token mungkin sudah kedaluwarsa.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isTokenChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Memeriksa Token</CardTitle>
            <CardDescription>
              Mohon tunggu sebentar...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isTokenValid && !isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Reset Password Gagal</CardTitle>
            <CardDescription>
              Link reset password tidak valid atau telah kedaluwarsa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full"
              onClick={() => router.push("/auth/forgot-password")}
            >
              Minta Link Reset Baru
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            Masukkan password baru untuk akun Anda
          </CardDescription>
        </CardHeader>

        {!isSuccess ? (
          <>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password Baru</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Ulangi password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    isLoading ||
                    !password ||
                    !confirmPassword ||
                    password !== confirmPassword
                  }
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </CardFooter>
            </form>
          </>
        ) : (
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-700">
                Password Anda berhasil diperbarui. Silakan login dengan password baru Anda.
              </p>
            </div>
            <Button
              className="w-full mt-4"
              onClick={() => router.push("/auth/login")}
            >
              Login
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
} 