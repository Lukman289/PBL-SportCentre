import { useBookingContext } from "@/context/booking/booking.context";
import { useAuth } from "@/context/auth/auth.context";
import { bookingApi } from "@/api";
import { useState, useCallback, useEffect } from "react";
import { Booking, Branch, Field, PaymentMethod, PaymentStatus, User } from "@/types";
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
  const { user } = useAuth();
  const [branchBookings, setBranchBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { showError, showSuccess } = useToastHandler();
  const [selectedBranch, setSelectedBranchState] = useState<number | undefined>(branchId);
  
  // Efek untuk menetapkan cabang yang dipilih saat branchId parameter berubah
  useEffect(() => {
    if (branchId) {
      setSelectedBranchState(branchId);
      // Perbarui juga di context booking untuk TimeSlotSelector
      bookingContext.setSelectedBranch(branchId);
      
    } else if (user?.branches && user.branches.length > 0 && !selectedBranch) {
      // Jika tidak ada branchId parameter dan belum ada cabang yang dipilih,
      // tetapi user memiliki cabang yang di-assign, pilih cabang pertama
      const firstBranchId = user.branches[0].branchId;
      setSelectedBranchState(firstBranchId);
      // Perbarui juga di context booking untuk TimeSlotSelector
      bookingContext.setSelectedBranch(firstBranchId);
      
      // Refresh ketersediaan lapangan untuk cabang default
      setTimeout(() => {
        bookingContext.refreshAvailability();
      }, 100);
    }
  }, [branchId, user?.branches, selectedBranch, bookingContext]);

  // Gunakan selectedBranch sebagai adminBranchId
  const adminBranchId = selectedBranch || 0;

  // Fungsi untuk mengatur cabang yang dipilih
  const setSelectedBranch = useCallback((branchId: number) => {
    setSelectedBranchState(branchId);
    // Perbarui juga di context booking untuk TimeSlotSelector
    bookingContext.setSelectedBranch(branchId);
    
    // Refresh ketersediaan lapangan untuk cabang yang baru dipilih
    setTimeout(() => {
      bookingContext.refreshAvailability();
    }, 100);
  }, [bookingContext]);

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
    } catch (error) {
      showError(error, "Gagal mengambil data booking cabang");
    } finally {
      setLoading(false);
    }
  }, [adminBranchId]);

  // Ambil data booking saat cabang berubah
  useEffect(() => {
    if (adminBranchId) {
      fetchBranchBookings();
    }
  }, [adminBranchId, fetchBranchBookings]);

  const createManualBooking = useCallback(async (data: {
    userId: User['id'];
    fieldId: Field['id'];
    bookingDate: string;
    startTime: string;
    endTime: string;
    branchId: Branch['id'];
    paymentStatus?: PaymentStatus;
    paymentMethod?: PaymentMethod;
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
      branchId,
      // Tambahkan paymentStatus dan paymentMethod jika disediakan
      ...(data.paymentStatus && { paymentStatus: data.paymentStatus }),
      ...(data.paymentMethod && { paymentMethod: data.paymentMethod })
    };
    
    if (!userId) {
      const errorMsg = "User ID tidak ditemukan";
      showError(errorMsg);
      return null;
    }

    setLoading(true);
    try {
      const response = await bookingApi.createManualBooking(bookingData);
      
      // Sesuaikan pesan berdasarkan status pembayaran
      const statusText = data.paymentStatus === PaymentStatus.PAID 
        ? "lunas" 
        : "DP";
          
      const methodText = data.paymentMethod === PaymentMethod.CASH 
        ? "tunai" 
        : "online (Midtrans)";
        
      showSuccess(`Manual booking berhasil dibuat dengan status ${statusText} dan metode ${methodText}`);
      
      // Jika metode online dan booking berhasil tetapi tidak ada paymentUrl, tampilkan peringatan
      if (data.paymentMethod !== PaymentMethod.CASH && !response.payment?.paymentUrl) {
        showError("Berhasil membuat booking, tetapi tidak bisa membuka halaman pembayaran. Hubungi admin.");
      }
 
      setBranchBookings(prevBookings => [...prevBookings, response]);

      // Refresh ketersediaan lapangan setelah booking berhasil dibuat
      if (bookingContext.refreshAvailability) {
        showSuccess("Memperbarui ketersediaan lapangan setelah booking manual...");
        await bookingContext.refreshAvailability();
      }
      
      return response;
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
  }, [user?.id, bookingContext.refreshAvailability]);

  // Fungsi untuk mengubah status pembayaran
  const updatePaymentStatus = useCallback(async (paymentId: number, status: PaymentStatus) => {
    setLoading(true);
    try {
      const updatedPayment = await bookingApi.updatePaymentStatus(paymentId, status);
      
      // Refresh data booking cabang setelah berhasil mengubah status pembayaran
      await fetchBranchBookings();
      
      return updatedPayment;
    } catch (error) {
      showError(error, "Gagal mengubah status pembayaran");
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchBranchBookings]);

  // Subscribe ke socket untuk pembaruan booking real-time
  useEffect(() => {
    if (!bookingContext.socketInitialized || !adminBranchId) return;

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
  }, [bookingContext.socketInitialized, adminBranchId, fetchBranchBookings]);

  // Subscribe ke socket untuk pembaruan ketersediaan lapangan
  useEffect(() => {
    if (!bookingContext.socketInitialized || !adminBranchId || !bookingContext.selectedDate) return;

    // Gabung ke room ketersediaan lapangan berdasarkan tanggal dan cabang
    joinFieldAvailabilityRoom(adminBranchId, bookingContext.selectedDate);

    // Subscribe ke pembaruan ketersediaan lapangan
    const unsubscribe = subscribeToFieldAvailability(() => {
      // Tidak perlu melakukan apa-apa di sini karena BookingContext 
      // sudah meng-handle pembaruan ini
    });

    // Cleanup: unsubscribe dari socket events
    return () => {
      unsubscribe();
    };
  }, [bookingContext.socketInitialized, adminBranchId, bookingContext.selectedDate]);

  // Return nilai dan fungsi yang diperlukan
  return {
    // Data dan fungsi booking umum dari BookingContext
    ...bookingContext,
    
    // State dan fungsi khusus admin
    branchBookings,
    adminBranchId, 
    user,
    selectedBranch,
    setSelectedBranch,
    fetchBranchBookings,
    createManualBooking,
    updatePaymentStatus,
    
    // Loading dan error state khusus admin
    loading: loading || bookingContext.loading,
    error: error || bookingContext.error,
  };
}; 