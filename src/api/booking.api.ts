import axiosInstance from '../config/axios.config';
import { Booking, BookingRequest, Payment, PaymentMethod, PaymentStatus, Role } from '../types';
import { combineDateAndTime } from '../utils/timezone.utils';

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

class BookingApi {
  /**
   * Dapatkan semua booking untuk user saat ini
   * @param userId - ID user (opsional untuk admin)
   * @returns Promise dengan array data booking
   */
  async getUserBookings(userId?: number, statusPayment?: string): Promise<Booking[]> {
    try {
      let endpoint = '';
      if (userId) {
        // Jika userId ada, ambil booking untuk user tersebut
        endpoint = `/bookings/users/${userId}/bookings?include=field.branch`;
      } else {
        // Jika tidak ada userId, ini adalah admin yang mengakses semua booking (akan ditangani di getAllBookings)
        return [];
      }
      
      // Gunakan endpoint yang benar sesuai dengan backend
      const response = await axiosInstance.get<BookingResponseWithMeta | { bookings: Booking[] } | Booking[]>(
        endpoint, 
        {params: { statusPayment: statusPayment }}
      );
      
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
      return [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Dapatkan semua booking (untuk admin)
   * @returns Promise dengan array data booking
   */
  async getAllBookings(filters?: { branchId?: number; status?: string; startDate?: string; endDate?: string; search?: string }, params?: {limit?: number, page?: number}): Promise<BookingResponseWithMeta> {
    try {
      const query = new URLSearchParams();

      if (filters?.branchId) query.append('branchId', filters.branchId.toString());
      if (filters?.status) query.append('status', filters.status);
      if (filters?.startDate) query.append('startDate', filters.startDate);
      if (filters?.endDate) query.append('endDate', filters.endDate);
      if (filters?.search) query.append('search', filters.search);

      if (params?.limit) query.append('limit', params.limit.toString());
      if (params?.page) query.append('page', params.page.toString());
      query.append('include', 'field.branch');
      const queryParams = `?${query.toString()}`;
      
      // Endpoint untuk admin mendapatkan semua booking
      const response = await axiosInstance.get<BookingResponseWithMeta>(
        `/bookings/admin/bookings${queryParams}`
      );
      return response.data;
    } catch (error) {
      return { data: [], meta: { page: 1, limit: 10, totalItems: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false } };
    }
  }

  /**
   * Dapatkan booking untuk cabang tertentu (untuk admin cabang)
   * @param branchId - ID cabang
   * @returns Promise dengan array data booking
   */
  async getBranchBookings(branchId: number, filters?: { status?: string; startDate?: string; endDate?: string; search?: string }, params?: {limit?: number, page?: number}): Promise<BookingResponseWithMeta> {
    try {

      const query = new URLSearchParams();

      if (filters?.status) query.append('status', filters.status);
      if (filters?.startDate) query.append('startDate', filters.startDate);
      if (filters?.endDate) query.append('endDate', filters.endDate);
      if (filters?.search) query.append('search', filters.search);

      if (params?.limit) query.append('limit', params.limit.toString());
      if (params?.page) query.append('page', params.page.toString());
      
      query.append('include', 'field.branch');

      const queryParams = `?${query.toString()}`;

      // Endpoint untuk admin cabang
      const response = await axiosInstance.get<BookingResponseWithMeta>(
        `/bookings/branches/${branchId}/bookings${queryParams}`
      );
      return response.data;
    } catch (error) {
      return { data: [], meta: { page: 1, limit: 10, totalItems: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false } };
    }
  }

  /**
   * Dapatkan booking berdasarkan ID
   * @param id - ID booking
   * @param role - Peran pengguna (opsional)
   * @returns Promise dengan data booking
   */
  async getBookingById(id: number, role?: string, branchId?: number): Promise<Booking> {
    try {
      // Tentukan endpoint yang akan digunakan berdasarkan peran pengguna
      let endpoint = '';
      
      const userRole = role || Role.USER;

      // Gunakan endpoint yang sesuai dengan peran pengguna
      if (userRole === Role.SUPER_ADMIN) {
        endpoint = `/bookings/admin/${id}?include=field.branch,user,payment`;
      } else if (userRole === Role.ADMIN_CABANG) {
        if (!branchId) {
          throw new Error('BranchId diperlukan untuk admin cabang');
        }
        // Admin cabang menggunakan endpoint khusus untuk cabang
        endpoint = `/bookings/branches/${branchId}/bookings/${id}?include=field.branch,user,payment`;
      } else {
        endpoint = `/bookings/${id}/user?include=field.branch,payment`;
      }
      
      const response = await axiosInstance.get<{ data: Booking } | { booking: Booking } | Booking>(endpoint);
      
      if (response.data && typeof response.data === 'object') {
        if ('data' in response.data) {
          return response.data.data;
        } else if ('booking' in response.data) {
          return response.data.booking;
        } else if ('id' in response.data && 'bookingDate' in response.data) {
          return response.data as Booking;
        }
      }
      
      throw new Error('Unexpected response format');
    } catch (error) {
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
      
      // Konversi waktu lokal ke UTC untuk dikirim ke server
      
      // Gabungkan tanggal dan waktu, lalu konversi ke UTC
      combineDateAndTime(data.bookingDate, data.startTime);
      combineDateAndTime(data.bookingDate, data.endTime);
      
      // Data yang akan dikirim ke server (format tetap sama, tapi nilai waktu dalam UTC)
      const requestData = {
        ...data,
        // Format tanggal tetap YYYY-MM-DD
        bookingDate: data.bookingDate,
        // Tambahkan userId dari localStorage jika tidak ada
        userId: data.userId || JSON.parse(localStorage.getItem('user') || '{}').id
      };
      
      const response = await axiosInstance.post<
        { booking: Booking & { payment?: Payment & { paymentUrl?: string } } } |
        { data: Booking & { payment?: Payment & { paymentUrl?: string } } } |
        (Booking & { payment?: Payment & { paymentUrl?: string } })
      >('/bookings', requestData);
      
      
      // Periksa format respons dan ekstrak data booking dengan benar
      if (response.data && typeof response.data === 'object') {
        // Format 1: { booking: {...} }
        if ('booking' in response.data) {
          return response.data.booking;
        }
        // Format 2: { data: {...} }
        else if ('data' in response.data) {
          return response.data.data;
        }
        // Format 3: Objek booking langsung yang berisi id, bookingDate, dll.
        else if ('id' in response.data) {
          return response.data as Booking;
        }
      }

      throw new Error('Format respons tidak valid: ' + JSON.stringify(response.data));
    } catch (error) {
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
      const response = await axiosInstance.delete<{ message: string }>(`/bookings/bookings/${id}`);
      return response.data;
    } catch (error) {
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
      const response = await axiosInstance.post<{ data: Payment } | Payment>(`/bookings/payments/${paymentId}/mark-paid`);
      
      if ('data' in response.data) {
        return response.data.data;
      } else {
        return response.data as Payment;
      }
    } catch (error) {
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
        `/bookings/payments/${paymentId}/update-status`,
        { status }
      );
      
      if ('data' in response.data) {
        return response.data.data;
      } else {
        return response.data as Payment;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buat booking manual (untuk admin cabang)
   * @param data - Data booking manual
   * @returns Promise dengan data booking yang berhasil dibuat
   */
  async createManualBooking(data: BookingRequest): Promise<Booking & { payment?: Payment & { paymentUrl?: string } }> {
    try {
      const { branchId, paymentStatus, paymentMethod, ...bookingData } = data;
      
      // Gabungkan tanggal dan waktu dalam timezone WIB
      combineDateAndTime(data.bookingDate, data.startTime);
      combineDateAndTime(data.bookingDate, data.endTime);
      
      // Gunakan endpoint baru untuk booking admin
      const response = await axiosInstance.post<
        { data: { booking: Booking; payment: Payment & { paymentUrl?: string }; paymentUrl?: string } } |
        { booking: Booking; payment: Payment & { paymentUrl?: string }; paymentUrl?: string } |
        (Booking & { payment?: Payment & { paymentUrl?: string }; paymentUrl?: string })
      >(`/bookings/admin`, {
        ...bookingData,
        branchId, // Sertakan branchId dalam request body
        paymentStatus, // Sertakan status pembayaran
        paymentMethod // Sertakan metode pembayaran
      });


      // Handle berbagai format respons dan pastikan payment dan paymentUrl disertakan
      if ('data' in response.data) {
        // Format: { data: { booking, payment, paymentUrl } }
        if ('booking' in response.data.data && 'payment' in response.data.data) {
          const paymentUrl = response.data.data.paymentUrl || 
                            (response.data.data.payment && response.data.data.payment.paymentUrl);
                            
                            
          const result = {
            ...response.data.data.booking,
            payment: {
              ...response.data.data.payment,
              paymentUrl: paymentUrl
            }
          };
          return result;
        }
        // Format: { data: Booking }
        return response.data.data as Booking & { payment?: Payment & { paymentUrl?: string } };
      } 
      // Format: { booking, payment, paymentUrl }
      else if ('booking' in response.data && 'payment' in response.data) {
        const paymentUrl = response.data.paymentUrl || 
                          (response.data.payment && response.data.payment.paymentUrl);
                          
                          
        const result = {
          ...response.data.booking,
          payment: {
            ...response.data.payment,
            paymentUrl: paymentUrl
          }
        };
        return result;
      } 
      // Format: Booking
      else {
        return response.data as Booking & { payment?: Payment & { paymentUrl?: string } };
      }
    } catch (error) {
      throw error;
    }
  }
}

export const bookingApi = new BookingApi(); 