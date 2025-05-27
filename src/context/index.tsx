"use client";

import { PropsWithChildren } from "react";

import { AuthProvider } from "@/context/auth/auth.context";
import { BookingProvider } from "@/context/booking/booking.context";
import { LoadingProvider } from "@/context/loading/loading.context";

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <AuthProvider>
      <LoadingProvider>
        <BookingProvider>
          {children}
        </BookingProvider>
      </LoadingProvider>
    </AuthProvider>
  );
}; 