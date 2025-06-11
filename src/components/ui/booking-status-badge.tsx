import { Badge } from "@/components/ui/badge";
import { BookingStatus } from "@/types/booking.types";
import { getBookingStatusColor, getBookingStatusText } from "@/utils/booking/bookingStatus.utils";

interface BookingStatusBadgeProps {
  status?: BookingStatus;
}

/**
 * Komponen universal untuk menampilkan badge status booking
 * Dengan warna dan teks yang sesuai
 * @param status Status booking yang akan ditampilkan
 * @return Badge komponen dengan teks dan warna yang sesuai
 */
export function BookingStatusBadge({
  status,
}: BookingStatusBadgeProps) {
  const statusText = getBookingStatusText(status);
  const colorClass = getBookingStatusColor(status);

  return <Badge className={`text-xs font-medium ${colorClass}`}>{statusText}</Badge>;
} 