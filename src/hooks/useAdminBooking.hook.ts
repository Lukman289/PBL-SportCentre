import { useBookingContext } from "@/context/booking/booking.context";
import { useAuth } from "@/context/auth/auth.context";
import { bookingApi } from "@/api";
import { useState, useCallback, useEffect } from "react";
import { Booking, PaymentMethod, PaymentStatus } from "@/types";
import { BookingFormValues } from "@/context/booking/booking.context";

/**
 * Hook untuk admin cabang yang mengelola booking
 * Menyediakan fungsi-fungsi khusus untuk admin cabang
 * 
 * @returns Fungsi dan state untuk mengelola booking sebagai admin cabang
 */
export const useAdminBooking = (branchId?: number) => {
  const bookingContext = useBookingContext();
  const { user } = useAuth();
  const [branchBookings, setBranchBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Ambil ID cabang dari user jika tidak disediakan
  const adminBranchId = branchId || (user?.branches && user.branches.length > 0 ? user.branches[0].branchId : 0);

  // Fungsi untuk mengambil semua booking di cabang
  const fetchBranchBookings = useCallback(async () => {
    if (!adminBranchId) {
      setError("ID cabang tidak ditemukan");
      return;
    }

    setLoading(true);
    try {
      const bookings = await bookingApi.getBranchBookings(adminBranchId);
      setBranchBookings(bookings);
    } catch (err) {
      console.error("Error fetching branch bookings:", err);
      setError("Gagal mengambil data booking cabang");
    } finally {
      setLoading(false);
    }
  }, [adminBranchId]);

  // Fungsi untuk membuat booking manual oleh admin cabang
  const createManualBooking = useCallback(async (data: {
    userId: number;
    fieldId: number;
    bookingDate: string;
    startTime: string;
    endTime: string;
    branchId: number;
    paymentStatus?: PaymentStatus; // opsional, tidak dikirim ke backend
    paymentMethod?: PaymentMethod; // opsional, tidak dikirim ke backend
  }) => {
    if (!data.branchId) {
      const errorMsg = "ID cabang tidak ditemukan";
      console.error(errorMsg);
      setError(errorMsg);
      return null;
    }

    if (!data.fieldId) {
      const errorMsg = "ID lapangan tidak ditemukan";
      console.error(errorMsg);
      setError(errorMsg);
      return null;
    }

    // Konversi ke tipe data yang diharapkan backend
    const fieldId = Number(data.fieldId);
    const userId = Number(data.userId || user?.id);
    const branchId = Number(data.branchId);
    
    // Backend hanya memerlukan fieldId, userId, bookingDate, startTime, endTime
    const bookingData = {
      fieldId,
      userId,
      bookingDate: data.bookingDate,
      startTime: data.startTime,
      endTime: data.endTime,
      branchId
    };
    
    if (!userId) {
      const errorMsg = "ID user tidak ditemukan";
      console.error(errorMsg);
      setError(errorMsg);
      return null;
    }

    setLoading(true);
    try {
      // Log data yang akan dikirim untuk debugging
      console.log("Creating manual booking with data:", JSON.stringify(bookingData, null, 2));
      console.log("API URL yang akan dipanggil:", `/bookings/branches/${branchId}/bookings/manual`);

      const booking = await bookingApi.createManualBooking(bookingData);
      
      console.log("Manual booking berhasil dibuat:", booking);
      
      // Refresh data booking cabang setelah berhasil membuat booking baru
      await fetchBranchBookings();
      
      return booking;
    } catch (error: unknown) {
      console.error("Error creating manual booking:", error);
      const err = error as {
        response?: {
          status?: number;
          data?: any;
        };
        request?: any;
        message?: string;
      };
      
      if (err.response) {
        console.error("Error response:", err.response.status, err.response.data);
        const errorMessage = err.response.data?.message || JSON.stringify(err.response.data) || 'Unknown server error';
        setError(`Gagal membuat booking manual: ${errorMessage}`);
      } else if (err.request) {
        console.error("Error request:", err.request);
        setError("Tidak ada respons dari server. Periksa koneksi internet Anda.");
      } else {
        setError(`Gagal membuat booking manual: ${err.message || 'Unknown error'}`);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.id, fetchBranchBookings]);

  // Fungsi untuk mengubah status pembayaran
  const updatePaymentStatus = useCallback(async (paymentId: number, status: PaymentStatus) => {
    setLoading(true);
    try {
      const updatedPayment = await bookingApi.updatePaymentStatus(paymentId, status);
      
      // Refresh data booking cabang setelah berhasil mengubah status pembayaran
      await fetchBranchBookings();
      
      return updatedPayment;
    } catch (err) {
      console.error("Error updating payment status:", err);
      setError("Gagal mengubah status pembayaran");
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchBranchBookings]);

  // Load data booking cabang saat komponen dimount
  useEffect(() => {
    if (adminBranchId) {
      fetchBranchBookings();
    }
  }, [adminBranchId, fetchBranchBookings]);

  // Fungsi untuk membuat booking dengan context yang sama seperti user biasa
  const createBooking = useCallback(async (data: BookingFormValues) => {
    if (!user?.id) {
      setError("User ID tidak ditemukan");
      return null;
    }

    // Gunakan ID admin cabang sebagai userId
    const bookingData = {
      fieldId: data.fieldId,
      bookingDate: data.bookingDate,
      startTime: data.startTime,
      endTime: data.endTime,
    };

    try {
      return await bookingApi.createBooking(bookingData);
    } catch (err) {
      console.error("Error creating booking:", err);
      setError("Gagal membuat booking");
      return null;
    }
  }, [user?.id]);

  // Return semua fungsi dan state yang dibutuhkan
  return {
    // State dari booking context
    ...bookingContext,
    
    // State khusus admin
    branchBookings,
    adminBranchId,
    user,
    
    // Fungsi khusus admin
    fetchBranchBookings,
    createManualBooking,
    updatePaymentStatus,
    createBooking,
    
    // State loading dan error khusus admin
    adminLoading: loading,
    adminError: error,
  };
};

// Re-export types dari BookingContext untuk kompatibilitas
export type { BookingFormValues, BookingRequest } from "@/context/booking/booking.context"; 