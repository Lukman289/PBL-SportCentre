import axiosInstance from '../config/axios.config';
import { Notification } from '../types';

// Interface untuk format respons dengan data dan meta
interface NotificationResponseWithMeta {
  data: Notification[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }
}

class NotificationApi {
  /**
   * Dapatkan semua notifikasi untuk user saat ini
   * @returns Promise dengan array data notifikasi
   */
  async getUserNotifications(): Promise<Notification[]> {
    try {
      const response = await axiosInstance.get<NotificationResponseWithMeta | { notifications: Notification[] } | Notification[]>('/user/notifications');
      
      // Handle format respons yang berbeda-beda
      if (response.data && typeof response.data === 'object') {
        // Format 1: { data: [...], meta: {...} }
        if ('data' in response.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
        // Format 2: { notifications: [...] }
        else if ('notifications' in response.data && Array.isArray(response.data.notifications)) {
          return response.data.notifications;
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
   * Tandai notifikasi sebagai sudah dibaca
   * @param id - ID notifikasi
   * @returns Promise dengan notifikasi yang sudah diupdate
   */
  async markAsRead(id: number): Promise<Notification> {
    try {
      const response = await axiosInstance.post<{ data: Notification } | { notification: Notification }>(`/notifications/${id}/read`);
      
      // Format 1: { data: {...} }
      if ('data' in response.data) {
        return response.data.data;
      }
      // Format 2: { notification: {...} }
      else if ('notification' in response.data) {
        return response.data.notification;
      }
      
      throw new Error('Unexpected response format');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Tandai semua notifikasi sebagai sudah dibaca
   * @returns Promise dengan pesan sukses
   */
  async markAllAsRead(): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.post<{ message: string }>('/notifications/read-all');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Hapus notifikasi
   * @param id - ID notifikasi
   * @returns Promise dengan pesan sukses
   */
  async deleteNotification(id: number): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.delete<{ message: string }>(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Dapatkan jumlah notifikasi yang belum dibaca
   * @returns Promise dengan jumlah notifikasi yang belum dibaca
   */
  async getUnreadCount(): Promise<{ count: number }> {
    const response = await axiosInstance.get<{ count: number }>('/notifications/unread-count');
    return response.data;
  }
}

export const notificationApi = new NotificationApi(); 