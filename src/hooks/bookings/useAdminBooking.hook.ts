import { useBookingContext } from "@/context/booking/booking.context";
import { useAuth } from "@/context/auth/auth.context";
import { bookingApi } from "@/api";
import { useState, useCallback, useEffect } from "react";
import { Booking, PaymentMethod, PaymentStatus } from "@/types";
import { BookingFormValues } from "@/context/booking/booking.context";
import { subscribeToBookingUpdates } from "@/services/socket/booking.socket";
import { subscribeToFieldAvailability, joinFieldAvailabilityRoom } from "@/services/socket";
import useToastHandler from "../useToastHandler";

/**
 * Hook untuk admin cabang yang mengelola booking
 * Menyediakan fungsi-fungsi khusus untuk admin cabang
 * 
 * @returns Fungsi dan state untuk mengelola booking sebagai admin cabang
 */
export const useAdminBooking = (branchId?: number) => {
  const bookingContext = useBookingContext();
  const { socketInitialized } = bookingContext;
  const { user } = useAuth();
  const [branchBookings, setBranchBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { showError, showSuccess } = useToastHandler();

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
      setBranchBookings(bookings.data);
    } catch (err) {
      showError("Gagal mengambil data booking cabang");
    } finally {
      setLoading(false);
    }
  }, [adminBranchId]);

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
      showError(errorMsg);
      return null;
    }

    if (!data.fieldId) {
      const errorMsg = "ID lapangan tidak ditemukan";
      showError(errorMsg);
      return null;
    }

    // Konversi ke tipe data yang diharapkan backend
    const fieldId = Number(data.fieldId);
    const userId = Number(data.userId || user?.id);
    const branchId = Number(data.branchId);
    
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
      showError(errorMsg);
      return null;
    }

    setLoading(true);
    try {
      const booking = await bookingApi.createManualBooking(bookingData);
      
      showSuccess("Manual booking berhasil dibuat");
      
 
      setBranchBookings(prevBookings => [...prevBookings, booking]);

      // Refresh ketersediaan lapangan setelah booking berhasil dibuat
      // Ini akan memperbarui grid ketersediaan lapangan tanpa perlu reload
      if (bookingContext.refreshAvailability) {
        showSuccess("Memperbarui ketersediaan lapangan setelah booking manual...");
        await bookingContext.refreshAvailability();
      }
      
      
      return booking;
    } catch (error: unknown) {

      const err = error as {
        response?: {
          status?: number;
          data?: {
            message?: string;
            [key: string]: unknown;
          };
        };
        request?: unknown;
        message?: string;
      };
      
      if (err.response) {
        showError(`Gagal membuat booking manual: ${err.response.data?.message || JSON.stringify(err.response.data) || 'Unknown server error'}`);
      } else if (err.request) {
        showError("Tidak ada respons dari server. Periksa koneksi internet Anda.");
      } else {
        showError(`Gagal membuat booking manual: ${err.message || 'Unknown error'}`);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.id, bookingContext]);

  // Fungsi untuk mengubah status pembayaran
  const updatePaymentStatus = useCallback(async (paymentId: number, status: PaymentStatus) => {
    setLoading(true);
    try {
      const updatedPayment = await bookingApi.updatePaymentStatus(paymentId, status);
      
      // Refresh data booking cabang setelah berhasil mengubah status pembayaran
      await fetchBranchBookings();
      
      return updatedPayment;
    } catch (err) {
      showError("Gagal mengubah status pembayaran");
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchBranchBookings]);

  // Subscribe ke socket untuk pembaruan booking real-time
  useEffect(() => {
    if (!socketInitialized || !adminBranchId) return;

    // Subscribe ke pembaruan booking melalui socket
    const unsubscribe = subscribeToBookingUpdates(({ booking }) => {
      
      // Filter hanya booking yang relevan dengan cabang ini
      if (booking && booking.field && booking.field.branchId === adminBranchId) {
        // Update state dengan booking yang diperbarui
        setBranchBookings(prevBookings => {
          // Cek apakah booking sudah ada di state
          const existingBookingIndex = prevBookings.findIndex(b => b.id === booking.id);
          
          if (existingBookingIndex >= 0) {
            const updatedBookings = [...prevBookings];
            updatedBookings[existingBookingIndex] = booking;
            return updatedBookings;
          } else {
            // Tambahkan booking baru
            return [...prevBookings, booking];
          }
        });
      }
    });

    // Load data booking cabang saat komponen dimount
    fetchBranchBookings();

    // Cleanup: unsubscribe dari socket events
    return () => {
      unsubscribe();
    };
  }, [socketInitialized, adminBranchId, fetchBranchBookings]);

  // Subscribe ke socket untuk pembaruan ketersediaan lapangan
  useEffect(() => {
    if (!socketInitialized || !adminBranchId || !bookingContext.selectedDate) return;


    // Gabung ke room ketersediaan lapangan berdasarkan tanggal dan cabang
    joinFieldAvailabilityRoom(adminBranchId, bookingContext.selectedDate);

    // Subscribe ke pembaruan ketersediaan lapangan
    const unsubscribe = subscribeToFieldAvailability((data) => {
      // Tidak perlu melakukan apa-apa di sini karena BookingContext 
      // sudah meng-handle pembaruan ini
    });

    // Cleanup: unsubscribe dari socket events
    return () => {
      unsubscribe();
    };
  }, [socketInitialized, adminBranchId, bookingContext.selectedDate]);

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
      showError("Gagal membuat booking");
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
export type { BookingFormValues } from "@/context/booking/booking.context"; 