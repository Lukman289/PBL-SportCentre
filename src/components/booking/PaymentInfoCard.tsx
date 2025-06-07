import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, CreditCard, Tag, Clock, Info } from "lucide-react";
import { Booking, PaymentStatus } from "@/types/booking.types";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { PaymentStatusBadge } from "./PaymentStatusBadge";

interface PaymentInfoCardProps {
  booking: Booking;
  isManualBooking: boolean;
  formatCurrency: (amount: number) => string;
}

/**
 * Format payment method menjadi nama yang lebih mudah dibaca
 */
const formatPaymentMethod = (method: string | undefined): string => {
  if (!method) return "Tidak diketahui";
  
  // Ganti underscore dengan spasi dan capitalize setiap kata
  const formatted = method
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  // Khusus untuk Virtual Account, tambahkan "VA" di belakang
  if (method.endsWith('_va')) {
    return formatted.replace(' Va', ' VA');
  }
  
  return formatted;
};

/**
 * Komponen untuk menampilkan informasi pembayaran booking
 */
export const PaymentInfoCard = ({
  booking,
  isManualBooking,
  formatCurrency,
}: PaymentInfoCardProps) => {
  if (!booking.payment) return <Card className="shadow-sm"><CardContent className="pt-6"><p className="text-muted-foreground">Data pembayaran tidak tersedia</p></CardContent></Card>;

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-primary" />
            Informasi Pembayaran
          </div>
          <PaymentStatusBadge status={booking.payment.status} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Total
            </span>
            <span className="font-medium">{formatCurrency(booking.payment.amount)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Metode
            </span>
            <span className="font-medium">
              {formatPaymentMethod(booking.payment.paymentMethod)}
              {isManualBooking && " (Booking Manual)"}
            </span>
          </div>
          {booking.payment.transactionId && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center">
                <Tag className="h-4 w-4 mr-2" />
                ID Transaksi
              </span>
              <span className="font-medium">{booking.payment.transactionId}</span>
            </div>
          )}
          {booking.payment.expiresDate && booking.payment.status === PaymentStatus.PENDING && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Batas Waktu
              </span>
              <span className="font-medium">
                {format(new Date(booking.payment.expiresDate), "dd MMM yyyy, HH:mm", { locale: id })}
              </span>
            </div>
          )}
        </div>

        {booking.payment.paymentUrl && booking.payment.status === PaymentStatus.PENDING && (
          <div className="mt-4">
            <Button asChild className="w-full" variant="default">
              <a
                href={booking.payment.paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Bayar Sekarang
              </a>
            </Button>
          </div>
        )}

        {isManualBooking && (
          <div className="p-3 bg-muted rounded-md mt-4">
            <p className="text-sm text-muted-foreground flex items-start">
              <Info className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
              Booking ini dibuat secara manual oleh admin cabang dengan pembayaran tunai (cash).
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentInfoCard;