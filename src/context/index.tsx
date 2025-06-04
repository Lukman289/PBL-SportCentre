"use client";

import { PropsWithChildren } from "react";

import { AuthProvider } from "@/context/auth/auth.context";
import { BookingProvider } from "@/context/booking/booking.context";

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <AuthProvider>
      <BookingProvider>
        {children}
      </BookingProvider>
    </AuthProvider>
  );
}; 