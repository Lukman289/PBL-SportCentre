import { Badge } from "@/components/ui/badge";
import { PaymentStatus, Payment } from "@/types/booking.types";
import { 
  getPaymentStatusText, 
  getPaymentStatusColor, 
  determinePaymentStatus,
  getLatestPayment
} from "@/utils/payment/paymentStatus.utils";

interface PaymentStatusBadgeProps {
  status?: PaymentStatus;
  payments?: Payment[];
  totalPrice?: number;
  variant?: "default" | "outline" | "custom";
  bookingId?: number;
}

/**
 * Komponen universal untuk menampilkan badge status pembayaran
 * Mendukung 3 varian:
 * - default: menggunakan style badge default dari UI
 * - outline: menggunakan style outline dari UI
 * - custom: menggunakan warna kustom berdasarkan status
 */
export function PaymentStatusBadge({
  status,
  payments,
  totalPrice,
  variant = "custom",
  bookingId
}: PaymentStatusBadgeProps) {
  // Ambil pembayaran terakhir jika ada
  const latestPayment = getLatestPayment(payments, bookingId);
  
  // Gunakan status dari pembayaran terakhir jika ada
  const paymentStatus = latestPayment?.status || status;
  
  // Tentukan status yang sebenarnya berdasarkan total pembayaran
  const effectiveStatus = determinePaymentStatus(paymentStatus, payments, totalPrice);
  
  // Dapatkan teks status
  const statusText = getPaymentStatusText(effectiveStatus);
  
  // Jika tidak ada status, tidak perlu menampilkan badge
  if (!effectiveStatus) return null;
  
  // Tentukan style badge berdasarkan variant
  if (variant === "default") {
    // Gunakan style default dari UI
    let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "outline";
    
    switch (effectiveStatus) {
      case PaymentStatus.PAID:
        badgeVariant = "default";
        break;
      case PaymentStatus.DP_PAID:
        badgeVariant = "secondary";
        break;
      case PaymentStatus.PENDING:
        badgeVariant = "outline";
        break;
      case PaymentStatus.FAILED:
      case PaymentStatus.REFUNDED:
        badgeVariant = "destructive";
        break;
    }
    
    return <Badge variant={badgeVariant}>{statusText}</Badge>;
  } else if (variant === "outline") {
    // Gunakan style outline dengan warna teks sesuai status
    return <Badge variant="outline">{statusText}</Badge>;
  } else {
    // Gunakan warna kustom berdasarkan status
    const colorClass = getPaymentStatusColor(effectiveStatus);
    return <Badge className={colorClass}>{statusText}</Badge>;
  }
} 