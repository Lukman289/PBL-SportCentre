import { useBookingContext } from "@/context/booking/booking.context";

/**
 * Hook untuk mengakses BookingContext 
 * 
 * @returns BookingContext yang berisi state dan fungsi-fungsi booking
 */
export const useBooking = () => {
  return useBookingContext();
};

// Re-export types dari BookingContext untuk kompatibilitas
export type { BookingFormValues, BookingRequest } from "@/context/booking/booking.context"; 