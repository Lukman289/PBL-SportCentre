"use client";

import { PropsWithChildren } from "react";

import { AuthProvider } from "@/context/auth/auth.context";
import { BookingProvider } from "@/context/booking/booking.context";
import { MobileProvider } from "@/context/mobile/MobileContext";

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <AuthProvider>
      <BookingProvider>
        <MobileProvider>
          {children}
        </MobileProvider>
      </BookingProvider>
    </AuthProvider>
  );
}; 