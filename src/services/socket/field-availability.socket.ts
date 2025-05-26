import { getFieldsSocket, joinFieldsRoom } from '@/config/socket.config';
import { FieldStatus } from '@/types/field.types';

/**
 * Struktur data untuk ketersediaan lapangan
 */
export interface FieldAvailabilityData {
  date?: string;
  branchId?: number;
  fields: {
    id: number;
    name: string;
    status: FieldStatus;
    availableHours?: {
      hour: number;
      isAvailable: boolean;
    }[];
  }[];
}

/**
 * Gabung ke room untuk pembaruan ketersediaan lapangan
 * @param branchId - ID cabang (opsional)
 * @param date - Tanggal dalam format YYYY-MM-DD (opsional)
 */
export const joinFieldAvailabilityRoom = (branchId?: number, date?: string) => {
  const roomId = date ? `field_availability_${date}` : 'field_availability';
  joinFieldsRoom(roomId, { branchId });
  
  // Minta update ketersediaan lapangan terbaru segera setelah join room
  requestAvailabilityUpdate(date, branchId);
};

/**
 * Minta update ketersediaan lapangan terbaru
 * @param date - Tanggal dalam format YYYY-MM-DD (opsional)
 * @param branchId - ID cabang (opsional)
 */
export const requestAvailabilityUpdate = (date?: string, branchId?: number) => {
  const socket = getFieldsSocket();
  if (!socket) return;
  
  socket.emit('request_availability_update', { date, branchId });
  console.log('Requested availability update for date:', date || 'all dates');
};

/**
 * Dapatkan pembaruan ketersediaan lapangan
 * @param callback - Fungsi yang akan dipanggil saat ada pembaruan
 * @returns Fungsi untuk berhenti berlangganan
 */
export const subscribeToFieldAvailability = (callback: (data: FieldAvailabilityData) => void) => {
  const socket = getFieldsSocket();
  if (!socket) return () => {};

  const handleUpdate = (data: FieldAvailabilityData) => {
    console.log('Received field availability update:', data);
    callback(data);
  };

  socket.on('fieldsAvailabilityUpdate', handleUpdate);

  // Return unsubscribe function
  return () => {
    socket.off('fieldsAvailabilityUpdate', handleUpdate);
  };
};

const fieldAvailabilitySocket = {
  joinFieldAvailabilityRoom,
  requestAvailabilityUpdate,
  subscribeToFieldAvailability,
};

export default fieldAvailabilitySocket; 