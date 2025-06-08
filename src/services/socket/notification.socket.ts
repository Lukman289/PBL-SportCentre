import { getNotificationSocket, joinRoom } from '@/config/socket.config';
import { Notification } from '@/types';

/**
 * Bergabung dengan room notifikasi untuk pengguna tertentu
 * @param userId - ID pengguna
 */
export const joinNotificationRoom = (userId: number) => {
  if (!userId) return;

  const roomId = `notification_${userId}`;
  joinRoom(roomId);
};

/**
 * Berlangganan pemberitahuan baru
 * @param callback - Fungsi yang akan dipanggil saat ada notifikasi baru
 * @returns Fungsi untuk berhenti berlangganan
 */
export const subscribeToNotifications = (callback: (data: Notification) => void) => {
  const socket = getNotificationSocket();
  if (!socket) return () => {};

  const handleNewNotification = (notification: Notification) => {
    callback(notification);
  };

  socket.on('newNotification', handleNewNotification);

  // Return unsubscribe function
  return () => {
    socket.off('newNotification', handleNewNotification);
  };
};

/**
 * Berlangganan pembaruan status notifikasi
 * @param callback - Fungsi yang akan dipanggil saat ada pembaruan status notifikasi
 * @returns Fungsi untuk berhenti berlangganan
 */
export const subscribeToNotificationUpdates = (callback: (data: { id: number, read: boolean }) => void) => {
  const socket = getNotificationSocket();
  if (!socket) return () => {};

  const handleNotificationUpdate = (data: { id: number, read: boolean }) => {
    callback(data);
  };

  socket.on('notificationUpdate', handleNotificationUpdate);

  // Return unsubscribe function
  return () => {
    socket.off('notificationUpdate', handleNotificationUpdate);
  };
};

export default {
  joinNotificationRoom,
  subscribeToNotifications,
  subscribeToNotificationUpdates,
}; 