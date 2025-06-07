"use client";

import { useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getResetPasswordToken } from "@/utils/cookie.utils";

function ResetPasswordContent() {
  const router = useRouter();

  useEffect(() => {
    // Cek apakah ada token reset password di cookie
    const tokenFromCookie = getResetPasswordToken();
    
    if (tokenFromCookie) {
      router.push(`/auth/reset-password/${tokenFromCookie}`);
    } else {
      router.push("/auth/forgot-password");
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            Mengalihkan ke halaman yang sesuai...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full"
            onClick={() => router.push("/auth/forgot-password")}
          >
            Minta Link Reset Password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordRedirectPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              Memuat...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
} 