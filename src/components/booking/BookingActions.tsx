import { Button } from "@/components/ui/button";
import { Check, XCircle, CreditCard, Ban } from "lucide-react";
import { Booking, PaymentStatus } from "@/types/booking.types";
import { Role } from "@/types";

interface UserRole {
  role?: Role;
}

interface BookingActionsProps {
  user: UserRole;
  booking: Booking;
  openConfirmDialog: (action: "approve" | "reject" | "cancel" | "complete" | "pay") => void;
  setOpenCancelDialog: (open: boolean) => void;
  canCancel: boolean;
}

/**
 * Komponen untuk menampilkan tombol-tombol aksi pada detail booking
 */
export const BookingActions = ({
  user,
  booking,
  openConfirmDialog,
  setOpenCancelDialog,
  canCancel,
}: BookingActionsProps) => {
  return (
    <div className="grid gap-3 print:hidden">
      {user?.role === Role.ADMIN_CABANG && booking.payment?.status === PaymentStatus.PENDING && (
        <>
          <Button onClick={() => openConfirmDialog("approve")} className="w-full" variant="default">
            <Check className="mr-2 h-4 w-4" />
            Konfirmasi Pembayaran
          </Button>
          <Button onClick={() => openConfirmDialog("reject")} className="w-full" variant="destructive">
            <XCircle className="mr-2 h-4 w-4" />
            Tolak Pembayaran
          </Button>
        </>
      )}

      {user?.role === Role.ADMIN_CABANG && booking.payment?.status === PaymentStatus.DP_PAID && (
        <Button onClick={() => openConfirmDialog("pay")} className="w-full" variant="default">
          <CreditCard className="mr-2 h-4 w-4" />
          Lunasi Pembayaran
        </Button>
      )}

      {user?.role === Role.ADMIN_CABANG && booking.payment?.status === PaymentStatus.PAID && (
        <Button onClick={() => openConfirmDialog("complete")} className="w-full" variant="default">
          <Check className="mr-2 h-4 w-4" />
          Selesaikan Booking
        </Button>
      )}

      {(user?.role === Role.SUPER_ADMIN || user?.role === Role.ADMIN_CABANG) &&
        booking.payment?.status !== PaymentStatus.FAILED &&
        booking.payment?.status !== PaymentStatus.REFUNDED && (
          <Button onClick={() => openConfirmDialog("cancel")} className="w-full" variant="destructive">
            <XCircle className="mr-2 h-4 w-4" />
            Batalkan Booking
          </Button>
        )}

      {canCancel && (
        <Button variant="destructive" onClick={() => setOpenCancelDialog(true)} className="w-full mt-2">
          <Ban className="mr-2 h-4 w-4" />
          Batalkan Booking
        </Button>
      )}
    </div>
  );
};

export default BookingActions; 