import axiosInstance from '../config/axios.config';
import { Payment, PaymentMethod } from '../types';

// Interface untuk format respons dengan data dan meta
interface PaymentResponseWithMeta {
  data: Payment[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }
}

class PaymentApi {
  /**
   * Dapatkan semua pembayaran untuk user saat ini
   * @returns Promise dengan array data pembayaran
   */
  async getUserPayments(): Promise<Payment[]> {
    try {
      const response = await axiosInstance.get<PaymentResponseWithMeta | { payments: Payment[] } | Payment[]>('/user/payments');
      
      // Handle format respons yang berbeda-beda
      if (response.data && typeof response.data === 'object') {
        // Format 1: { data: [...], meta: {...} }
        if ('data' in response.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
        // Format 2: { payments: [...] }
        else if ('payments' in response.data && Array.isArray(response.data.payments)) {
          return response.data.payments;
        }
        // Format 3: Array langsung [...]
        else if (Array.isArray(response.data)) {
          return response.data;
        }
      }
      
      return [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Dapatkan pembayaran berdasarkan ID
   * @param id - ID pembayaran
   * @returns Promise dengan data pembayaran
   */
  async getPaymentById(id: number): Promise<Payment> {
    try {
      const response = await axiosInstance.get<{ data: Payment } | { payment: Payment }>(`/payments/${id}`);
      
      // Format 1: { data: {...} }
      if ('data' in response.data) {
        return response.data.data;
      }
      // Format 2: { payment: {...} }
      else if ('payment' in response.data) {
        return response.data.payment;
      }
      
      throw new Error('Unexpected response format');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Proses pembayaran untuk booking
   * @param bookingId - ID booking
   * @param paymentMethod - Metode pembayaran
   * @returns Promise dengan data payment dan URL pembayaran jika menggunakan payment gateway
   */
  async processPayment(bookingId: number, paymentMethod: PaymentMethod): Promise<Payment> {
    try {
      const response = await axiosInstance.post<{ data: Payment } | { payment: Payment }>(`/payments/process`, {
        bookingId,
        paymentMethod
      });
      
      // Format 1: { data: {...} }
      if ('data' in response.data) {
        return response.data.data;
      }
      // Format 2: { payment: {...} }
      else if ('payment' in response.data) {
        return response.data.payment;
      }
      
      throw new Error('Unexpected response format');
    } catch (error) {
      console.error(`Error processing payment for booking ID ${bookingId}:`, error);
      throw error;
    }
  }

  /**
   * Cek status pembayaran
   * @param id - ID pembayaran
   * @returns Promise dengan status pembayaran terbaru
   */
  async checkPaymentStatus(id: number): Promise<Payment> {
    try {
      const response = await axiosInstance.get<{ data: Payment } | { payment: Payment }>(`/payments/${id}/status`);
      
      // Format 1: { data: {...} }
      if ('data' in response.data) {
        return response.data.data;
      }
      // Format 2: { payment: {...} }
      else if ('payment' in response.data) {
        return response.data.payment;
      }
      
      throw new Error('Unexpected response format');
    } catch (error) {
      console.error(`Error checking payment status for ID ${id}:`, error);
      throw error;
    }
  }
}

export const paymentApi = new PaymentApi(); 