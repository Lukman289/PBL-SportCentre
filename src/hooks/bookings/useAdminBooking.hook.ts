"use client";

import { useState } from "react";
import { useBooking } from "./useBooking.hook";
import { useAuth } from "@/context/auth/auth.context";
import { bookingApi } from "@/api";
import { BookingRequest, PaymentMethod, PaymentStatus } from "@/types";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import useToastHandler from "../useToastHandler";

// Schema untuk form booking
const bookingSchema = z.object({
  fieldId: z.number(),
  bookingDate: z.string(),
  startTime: z.string(),
  endTime: z.string(),
});

export type AdminBookingFormValues = z.infer<typeof bookingSchema>;

/**
 * Hook untuk mengelola booking oleh admin
 */
export const useAdminBooking = () => {
  const regularBooking = useBooking();
  const { user } = useAuth();
  const { showSuccess, showError } = useToastHandler();
  const [loading, setLoading] = useState(false);

  // Gunakan form dari useBooking
  const form = useForm<AdminBookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      fieldId: 0,
      bookingDate: "",
      startTime: "",
      endTime: "",
    },
  });

  /**
   * Membuat booking manual oleh admin
   */
  const createManualBooking = async (bookingData: BookingRequest) => {
    setLoading(true);
    try {
      // Pastikan data booking valid
      if (!bookingData.fieldId || !bookingData.bookingDate || !bookingData.startTime || !bookingData.endTime) {
        throw new Error("Data booking tidak lengkap");
      }

      // Tambahkan userId jika tidak ada
      if (!bookingData.userId) {
        bookingData.userId = user?.id || 0;
      }

      // Tambahkan metode pembayaran jika tidak ada
      if (!bookingData.paymentMethod) {
        bookingData.paymentMethod = PaymentMethod.CASH;
      }

      // Tambahkan status pembayaran jika tidak ada
      if (!bookingData.paymentStatus) {
        bookingData.paymentStatus = PaymentStatus.PAID;
      }

      // Kirim request ke API
      const result = await bookingApi.createManualBooking(bookingData);
      
      // Refresh data ketersediaan
      if (regularBooking.refreshAvailability) {
        await regularBooking.refreshAvailability();
      }
      
      // Tampilkan pesan sukses
      showSuccess("Booking berhasil dibuat", "Sukses");
      
      // Reset form
      form.reset();
      
      return result;
    } catch (error) {
      showError(error, "Gagal membuat booking");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    ...regularBooking,
    user,
    createManualBooking,
    loading
  };
}; 