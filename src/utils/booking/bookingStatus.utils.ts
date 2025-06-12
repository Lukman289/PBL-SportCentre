import { BookingStatus } from "@/types/booking.types";

/**
 * Mendapatkan teks status booking yang sesuai
 * @param status Status Booking
 * @returns Teks status booking
 */
export const getBookingStatusText = (status?: BookingStatus | string): string => {
  switch (status) {
    case BookingStatus.ACTIVE:
      return "Aktif";
    case BookingStatus.CANCELLED:
      return "Dibatalkan";
    case BookingStatus.COMPLETED:
      return "Selesai";
    default:
      return "Tidak Diketahui";
  }
};

/**
 * Mendapatkan warna untuk status booking
 * @param status Status Booking
 * @returns Kelas CSS untuk warna status
 */
export const getBookingStatusColor = (status?: BookingStatus): string => {
  switch (status) {
    case BookingStatus.COMPLETED:
      return "bg-green-500 hover:bg-green-600";
    case BookingStatus.ACTIVE:
      return "bg-blue-500 hover:bg-blue-600";
    case BookingStatus.CANCELLED:
      return "bg-red-500 hover:bg-red-600 text-white";
    default:
      return "bg-gray-500 hover:bg-gray-600";
  }
};