import { Badge } from "@/components/ui/badge";
import { PaymentStatus } from "@/types/booking.types";

interface PaymentStatusBadgeProps {
  status?: PaymentStatus;
}

/**
 * Komponen untuk menampilkan badge status pembayaran
 */
export const PaymentStatusBadge = ({ status }: PaymentStatusBadgeProps) => {
  switch (status) {
    case PaymentStatus.PAID:
      return <Badge className="bg-green-500 hover:bg-green-600">Lunas</Badge>;
    case PaymentStatus.PENDING:
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Menunggu Pembayaran</Badge>;
    case PaymentStatus.DP_PAID:
      return <Badge className="bg-blue-500 hover:bg-blue-600">DP Terbayar</Badge>;
    case PaymentStatus.FAILED:
      return <Badge className="bg-red-500 hover:bg-red-600">Gagal</Badge>;
    case PaymentStatus.REFUNDED:
      return <Badge className="bg-gray-500 hover:bg-gray-600">Dikembalikan</Badge>;
    default:
      return <Badge className="bg-gray-500 hover:bg-gray-600">Tidak Diketahui</Badge>;
  }
};

export default PaymentStatusBadge; 