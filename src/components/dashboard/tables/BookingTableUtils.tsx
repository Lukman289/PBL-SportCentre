import { Badge } from "@/components/ui/badge";
import { PaymentStatus, Booking } from "@/types/booking.types";
import { Role } from "@/types";

export const getDetailLink = (booking: Booking, userRole?: string) => {
  if (userRole === Role.SUPER_ADMIN) {
    return `/dashboard/bookings/${booking.id}`;
  } else if (userRole === Role.ADMIN_CABANG) {
    return `/dashboard/branches/${booking.field?.branchId}/bookings/${booking.id}`;
  } else {
    return `/bookings/${booking.id}`;
  }
};

export const getPaymentStatusBadge = (status?: PaymentStatus) => {
  if (!status) return null;
  
  switch (status) {
    case PaymentStatus.PENDING:
      return <Badge variant="outline">Menunggu</Badge>;
    case PaymentStatus.PAID:
      return <Badge variant="default">Lunas</Badge>;
    case PaymentStatus.DP_PAID:
      return <Badge variant="secondary">DP Terbayar</Badge>;
    case PaymentStatus.FAILED:
      return <Badge variant="destructive">Gagal</Badge>;
    case PaymentStatus.REFUNDED:
      return <Badge variant="destructive">Dikembalikan</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}; 