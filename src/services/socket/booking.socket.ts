import { getRootSocket, joinRoom } from '@/config/socket.config';
import { Booking, Payment } from '@/types';

/**
 * Berlangganan pembaruan status booking
 * @param callback - Fungsi yang akan dipanggil saat ada pembaruan status booking
 * @returns Fungsi untuk berhenti berlangganan
 */
export const subscribeToBookingUpdates = (callback: (data: { booking: Booking, payment?: Payment }) => void) => {
  const socket = getRootSocket();
  if (!socket) return () => {};

  const handleBookingUpdate = (data: { booking: Booking, payment?: Payment }) => {
    console.log('Booking status updated:', data);
    callback(data);
  };

  socket.on('bookingUpdate', handleBookingUpdate);

  // Return unsubscribe function
  return () => {
    socket.off('bookingUpdate', handleBookingUpdate);
  };
};

/**
 * Berlangganan event pembatalan booking
 * @param callback - Fungsi yang akan dipanggil saat ada booking yang dibatalkan
 * @returns Fungsi untuk berhenti berlangganan
 */
export const subscribeToBookingCancellations = (callback: (data: { bookingId: number }) => void) => {
  const socket = getRootSocket();
  if (!socket) return () => {};

  const handleBookingCancellation = (data: { bookingId: number }) => {
    console.log('Booking cancelled:', data);
    callback(data);
  };

  socket.on('bookingCancelled', handleBookingCancellation);

  // Return unsubscribe function
  return () => {
    socket.off('bookingCancelled', handleBookingCancellation);
  };
};

/**
 * Bergabung dengan room booking tertentu untuk melihat pembaruan status
 * @param bookingId - ID booking
 */
export const joinBookingRoom = (bookingId: number) => {
  if (!bookingId) return;

  const roomId = `booking_${bookingId}`;
  joinRoom(roomId);
  console.log('Joined room for booking:', bookingId);
};

const bookingSocket = {
  subscribeToBookingUpdates,
  subscribeToBookingCancellations,
  joinBookingRoom,
};

export default bookingSocket; 