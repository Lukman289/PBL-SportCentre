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
import { useRouter } from "next/navigation";
import { ResetPasswordRequest } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { setResetPasswordToken, getResetPasswordToken } from "@/utils/cookie.utils";

interface ResetPasswordProps {
  params: {
    token: string;
  }
}

export default function ResetPasswordTokenPage({ params }: ResetPasswordProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);

  useEffect(() => {
    // Mendapatkan token dari URL path parameter dan simpan ke cookie
    if (params.token) {
      try {
        // Decode token dari URL
        const decodedToken = decodeURIComponent(params.token);
        // Simpan token ke cookie
        setResetPasswordToken(decodedToken);
        setIsTokenValid(true);
      } catch (error) {
        console.error("Error decoding token:", error);
        toast({
          variant: "destructive",
          title: "Token Tidak Valid",
          description: "Link reset password tidak valid. Silakan minta link baru.",
        });
        setIsTokenValid(false);
      }
    } else {
      // Jika tidak ada token di parameter URL, cek apakah ada di cookie
      const tokenFromCookie = getResetPasswordToken();
      
      if (!tokenFromCookie) {
        toast({
          variant: "destructive",
          title: "Token Tidak Ditemukan",
          description: "Link reset password tidak valid. Silakan minta link baru.",
        });
        setIsTokenValid(false);
      } else {
        setIsTokenValid(true);
      }
    }
  }, [params, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Password Terlalu Pendek",
        description: "Password harus minimal 6 karakter",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password Tidak Cocok",
        description: "Password dan konfirmasi password harus sama",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Token akan diambil dari cookie di dalam API
      const data: ResetPasswordRequest = {
        password,
        confirmPassword,
      };
      
      await authApi.resetPassword(data);
      setIsSuccess(true);
      toast({
        title: "Berhasil",
        description: "Password Anda telah diperbarui. Silakan login dengan password baru.",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal mereset password. Token mungkin sudah kedaluwarsa.",
      });
    } finally {
      setIsLoading(false);
    }
  };

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