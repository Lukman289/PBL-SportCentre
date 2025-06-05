import { getRootSocket, joinRoom } from '@/config/socket.config';
import { Booking, Payment } from '@/types';

// Definisikan tipe data untuk event booking
interface BookingCreatedEvent {
  booking: Booking;
  payment?: Payment;
  message?: string;
}

interface BookingUpdatedEvent {
  bookingId?: number;
  booking?: Booking;
  payment?: Payment;
  paymentStatus?: string;
  message?: string;
}

interface BookingCancelledEvent {
  bookingId: number;
  fieldId?: number;
  userId?: number;
  bookingDate?: string;
  startTime?: string;
  endTime?: string;
}

/**
 * Berlangganan pembaruan status booking
 * @param callback - Fungsi yang akan dipanggil saat ada pembaruan status booking
 * @returns Fungsi untuk berhenti berlangganan
 */
export const subscribeToBookingUpdates = (callback: (data: BookingCreatedEvent | BookingUpdatedEvent) => void) => {
  const socket = getRootSocket();
  if (!socket) return () => {};

  const handleBookingCreated = (data: BookingCreatedEvent) => {
    console.log('Booking created:', data);
    callback(data);
  };

  const handleBookingUpdated = (data: BookingUpdatedEvent) => {
    console.log('Booking updated:', data);
    callback(data);
  };

  socket.on('booking:created', handleBookingCreated);
  socket.on('booking:updated', handleBookingUpdated);

  // Return unsubscribe function
  return () => {
    socket.off('booking:created', handleBookingCreated);
    socket.off('booking:updated', handleBookingUpdated);
  };
};

/**
 * Berlangganan event pembatalan booking
 * @param callback - Fungsi yang akan dipanggil saat ada booking yang dibatalkan
 * @returns Fungsi untuk berhenti berlangganan
 */
export const subscribeToBookingCancellations = (callback: (data: BookingCancelledEvent) => void) => {
  const socket = getRootSocket();
  if (!socket) return () => {};

  const handleBookingCancellation = (data: BookingCancelledEvent) => {
    console.log('Booking cancelled:', data);
    callback(data);
  };

  socket.on('booking:cancelled', handleBookingCancellation);
  socket.on('booking:deleted', handleBookingCancellation);

  // Return unsubscribe function
  return () => {
    socket.off('booking:cancelled', handleBookingCancellation);
    socket.off('booking:deleted', handleBookingCancellation);
  };
};

/**
 * Bergabung dengan room booking tertentu untuk melihat pembaruan status
 * @param bookingId - ID booking
 */
export const joinBookingRoom = (bookingId: number) => {
  if (!bookingId) return;

  const roomId = `booking-${bookingId}`;
  joinRoom(roomId);
  console.log('Joined room for booking:', bookingId);
};

/**
 * Bergabung dengan room user untuk melihat pembaruan booking
 * @param userId - ID user
 */
export const joinUserBookingRoom = (userId: number) => {
  if (!userId) return;

  const roomId = `user-${userId}`;
  joinRoom(roomId);
  console.log('Joined user booking room:', userId);
};

const bookingSocket = {
  subscribeToBookingUpdates,
  subscribeToBookingCancellations,
  joinBookingRoom,
  joinUserBookingRoom
};

export default bookingSocket; 