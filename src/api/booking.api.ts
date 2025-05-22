import axiosInstance from '../config/axios.config';
import { Booking, BookingRequest, Payment, PaymentMethod, PaymentStatus } from '../types';
import { combineDateAndTime } from '@/utils/date.utils';
import { BookingRequest as BookingRequestContext } from '@/context/booking/booking.context';

// Interface untuk format respons dengan data dan meta
interface BookingResponseWithMeta {
  data: Booking[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }
}

// Menambahkan interface untuk semua kemungkinan format respons booking
interface BookingResponseVariants {
  data?: Booking[];
  bookings?: Booking[];
  status?: string;
}

class BookingApi {
  /**
   * Dapatkan semua booking untuk user saat ini
   * @param userId - ID user (opsional untuk admin)
   * @returns Promise dengan array data booking
   */
  async getUserBookings(userId?: number): Promise<Booking[]> {
    try {
      let endpoint = '';
      if (userId) {
        // Jika userId ada, ambil booking untuk user tersebut
        endpoint = `/bookings/users/${userId}/bookings`;
      } else {
        // Jika tidak ada userId, ini adalah admin yang mengakses semua booking (akan ditangani di getAllBookings)
        console.error('User ID tidak ditemukan, gunakan getAllBookings() untuk admin');
        return [];
      }
      
      // Gunakan endpoint yang benar sesuai dengan backend
      const response = await axiosInstance.get<BookingResponseWithMeta | { bookings: Booking[] } | Booking[]>(endpoint);
      
      // Handle format respons yang berbeda-beda
      if (response.data && typeof response.data === 'object') {
        // Format 1: { data: [...], meta: {...} }
        if ('data' in response.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
        // Format 2: { bookings: [...] }
        else if ('bookings' in response.data && Array.isArray(response.data.bookings)) {
          return response.data.bookings;
        }
        // Format 3: Array langsung [...]
        else if (Array.isArray(response.data)) {
          return response.data;
        }
      }
      
      // Jika format tidak dikenali, kembalikan array kosong
      console.error('Unexpected response format:', response.data);
      return [];
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      return [];
    }
  }

  /**
   * Dapatkan semua booking (untuk admin)
   * @returns Promise dengan array data booking
   */
  async getAllBookings(): Promise<Booking[]> {
    try {
      console.log("Fetching all bookings for admin");
      // Endpoint untuk admin mendapatkan semua booking
      const response = await axiosInstance.get<BookingResponseWithMeta | BookingResponseVariants | Booking[]>('/bookings/admin/bookings');
      
      console.log("Admin bookings response:", response.data);
      
      // Handle format respons yang berbeda-beda
      if (response.data && typeof response.data === 'object') {
        if ('data' in response.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
        else if ('bookings' in response.data && Array.isArray(response.data.bookings)) {
          return response.data.bookings;
        }
        else if (Array.isArray(response.data)) {
          return response.data;
        }
        // Format dengan status dan data
        else if ('status' in response.data && 'data' in response.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
      }
      
      console.error('Unexpected response format:', response.data);
      return [];
    } catch (error) {
      console.error('Error fetching all bookings:', error);
      return [];
    }
  }

  /**
   * Dapatkan booking untuk cabang tertentu (untuk admin cabang)
   * @param branchId - ID cabang
   * @returns Promise dengan array data booking
   */
  async getBranchBookings(branchId: number): Promise<Booking[]> {
    try {
      console.log(`Fetching bookings for branch ID: ${branchId}`);
      // Endpoint untuk admin cabang
      const response = await axiosInstance.get<BookingResponseWithMeta | BookingResponseVariants | Booking[]>(`/bookings/branches/${branchId}/bookings`);
      
      console.log("Branch bookings response:", response.data);
      
      // Handle berbagai format respon
      if (response.data) {
        if (Array.isArray(response.data)) {
          return response.data;
        }
        else if ('data' in response.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
        else if ('bookings' in response.data && Array.isArray(response.data.bookings)) {
          return response.data.bookings;
        }
      }
      
      console.error('Unexpected response format:', response.data);
      return [];
    } catch (error) {
      console.error(`Error fetching bookings for branch ID ${branchId}:`, error);
      return [];
    }
  }

  /**
   * Dapatkan booking berdasarkan ID
   * @param id - ID booking
   * @returns Promise dengan data booking
   */
  async getBookingById(id: number): Promise<Booking> {
    try {
      const response = await axiosInstance.get<{ data: Booking } | { booking: Booking }>(`/bookings/${id}/user`);
      
      if ('data' in response.data) {
        return response.data.data;
      } else if ('booking' in response.data) {
        return response.data.booking;
      } else if ('id' in response.data && 'bookingDate' in response.data) {
        return response.data as Booking;
      }
      
      throw new Error('Unexpected response format');
    } catch (error) {
      console.error(`Error fetching booking with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Membuat booking baru
   * @param data - Data booking baru
   * @returns Promise dengan data booking yang berhasil dibuat
   */
  async createBooking(data: BookingRequest): Promise<Booking> {
    try {
      console.log('Original booking data:', data);
      
      // Konversi waktu lokal ke UTC untuk dikirim ke server
      
      // Gabungkan tanggal dan waktu, lalu konversi ke UTC
      const startDateTime = combineDateAndTime(data.bookingDate, data.startTime);
      const endDateTime = combineDateAndTime(data.bookingDate, data.endTime);
      
      console.log('Local date/time - Start:', startDateTime.toString());
      console.log('Local date/time - End:', endDateTime.toString());
      
      // Data yang akan dikirim ke server (format tetap sama, tapi nilai waktu dalam UTC)
      const requestData = {
        ...data,
        // Format tanggal tetap YYYY-MM-DD
        bookingDate: data.bookingDate,
        // Tambahkan userId dari localStorage jika tidak ada
        userId: data.userId || JSON.parse(localStorage.getItem('user') || '{}').id
      };
      
      console.log('Sending booking data to server:', requestData);
      
      const response = await axiosInstance.post<
        { data: Booking & { payment?: Payment & { paymentUrl?: string } } } |
        { booking: Booking & { payment?: Payment & { paymentUrl?: string } } }
      >('/bookings', requestData);

      // Format 1: { data: {...} }
      if ('data' in response.data) {
        return response.data.data;
      }
      // Format 2: { booking: {...} }
      else if ('booking' in response.data) {
        return response.data.booking;
      }

      throw new Error('Unexpected response format');
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  /**
   * Batalkan booking
   * @param id - ID booking
   * @returns Promise dengan pesan sukses
   */
  async cancelBooking(id: number): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.post<{ message: string }>(`/bookings/${id}/cancel`);
      return response.data;
    } catch (error) {
      console.error(`Error cancelling booking with ID ${id}:`, error);
      throw error;
    }
  }
  /**
   * Buat pembayaran untuk booking
   * @param bookingId - ID booking
   * @param paymentMethod - Metode pembayaran
   * @returns Promise dengan data pembayaran
   */
  async createPayment(bookingId: number, paymentMethod: PaymentMethod): Promise<Payment & { paymentUrl?: string }> {
    const response = await axiosInstance.post<{ payment: Payment & { paymentUrl?: string } }>(`/bookings/${bookingId}/payment`, {
      paymentMethod,
    });
    return response.data.payment;
  }

  /**
   * Dapatkan status pembayaran
   * @param paymentId - ID pembayaran
   * @returns Promise dengan data pembayaran terbaru
   */
  async getPaymentStatus(paymentId: number): Promise<Payment> {
    const response = await axiosInstance.get<{ payment: Payment }>(`/payments/${paymentId}`);
    return response.data.payment;
  }

  /**
   * Tandai pembayaran sebagai lunas
   * @param paymentId - ID pembayaran
   * @returns Promise dengan data pembayaran yang diperbarui
   */
  async markPaymentAsPaid(paymentId: number): Promise<Payment> {
    try {
      const response = await axiosInstance.post<{ data: Payment } | Payment>(`/payments/${paymentId}/mark-paid`);
      
      if ('data' in response.data) {
        return response.data.data;
      } else {
        return response.data as Payment;
      }
    } catch (error) {
      console.error(`Error marking payment ${paymentId} as paid:`, error);
      throw error;
    }
  }

  /**
   * Memperbarui status pembayaran
   * @param paymentId - ID pembayaran
   * @param status - Status pembayaran baru
   * @returns Promise dengan data pembayaran yang diperbarui
   */
  async updatePaymentStatus(paymentId: number, status: PaymentStatus): Promise<Payment> {
    try {
      const response = await axiosInstance.post<{ data: Payment } | Payment>(
        `/payments/${paymentId}/update-status`,
        { status }
      );
      
      if ('data' in response.data) {
        return response.data.data;
      } else {
        return response.data as Payment;
      }
    } catch (error) {
      console.error(`Error updating payment ${paymentId} status:`, error);
      throw error;
    }
  }

  /**
   * Buat booking manual (untuk admin cabang)
   * @param data - Data booking manual
   * @returns Promise dengan data booking yang berhasil dibuat
   */
  async createManualBooking(data: {
    userId: number;
    fieldId: number;
    bookingDate: string;
    startTime: string;
    endTime: string;
    branchId: number;
  }): Promise<Booking> {
    try {
      const { branchId, ...bookingData } = data;
      
      console.log(`Creating manual booking for branch ID ${branchId}:`, bookingData);
      
      const response = await axiosInstance.post<
        { data: Booking } | { booking: Booking } | Booking
      >(`/bookings/branches/${branchId}/bookings/manual`, bookingData);

      // Handle berbagai format respon
      if ('data' in response.data) {
        return response.data.data;
      } else if ('booking' in response.data) {
        return response.data.booking;
      } else {
        return response.data as Booking;
      }
    } catch (error) {
      console.error('Error creating manual booking:', error);
      throw error;
    }
  }
}

export const bookingApi = new BookingApi(); 