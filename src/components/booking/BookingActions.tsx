import { Button } from "@/components/ui/button";
import { Check, XCircle, CreditCard, Ban } from "lucide-react";
import { Booking, PaymentMethod, PaymentStatus } from "@/types/booking.types";
import { Role } from "@/types";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserRole {
  role?: Role;
}

interface BookingActionsProps {
  user: UserRole;
  booking: Booking;
  openConfirmDialog: (action: "approve" | "reject" | "cancel" | "complete" | "pay") => void;
  setOpenCancelDialog: (open: boolean) => void;
  canCancel: boolean;
  onPaymentCompletion?: (paymentMethod: PaymentMethod) => Promise<void>;
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
  onPaymentCompletion,
}: BookingActionsProps) => {
  const [openCompletionDialog, setOpenCompletionDialog] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaymentCompletion = async () => {
    if (!onPaymentCompletion) return;
    
    setIsProcessing(true);
    try {
      await onPaymentCompletion(selectedPaymentMethod);
      setOpenCompletionDialog(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="grid gap-3 print:hidden">
        {user?.role === Role.ADMIN_CABANG && booking.payment?.status === PaymentStatus.PENDING && (
          <>
            <Button onClick={() => openConfirmDialog("approve")} className="w-full" variant="default">
              <Check className="mr-2 h-4 w-4" />
              Konfirmasi Pembayaran
            </Button>
            <Button onClick={() => openConfirmDialog("reject")} className="w-full text-white" variant="destructive">
              <XCircle className="mr-2 h-4 w-4" />
              Tolak Pembayaran
            </Button>
          </>
        )}

        {user?.role === Role.ADMIN_CABANG && booking.payment?.status === PaymentStatus.DP_PAID && (
          <>
            {/* Tombol lama untuk lunasi langsung dengan cash */}
            {!onPaymentCompletion && (
              <Button onClick={() => openConfirmDialog("pay")} className="w-full" variant="default">
                <CreditCard className="mr-2 h-4 w-4" />
                Lunasi Pembayaran
              </Button>
            )}
            
            {/* Tombol baru untuk dialog pelunasan dengan pilihan metode */}
            {onPaymentCompletion && (
              <Button onClick={() => setOpenCompletionDialog(true)} className="w-full" variant="default">
                <CreditCard className="mr-2 h-4 w-4" />
                Lunasi Pembayaran
              </Button>
            )}
          </>
        )}

        {/* {user?.role === Role.ADMIN_CABANG && booking.payment?.status !== PaymentStatus.PAID && firstPaymentStatus !== PaymentStatus.DP_PAID && (
          <Button onClick={() => openConfirmDialog("complete")} className="w-full" variant="default">
            <Check className="mr-2 h-4 w-4" />
            Selesaikan Booking
          </Button>
        )} */}

        {/* {(user?.role === Role.SUPER_ADMIN || user?.role === Role.ADMIN_CABANG) &&
          booking.payment?.status !== PaymentStatus.FAILED &&
          booking.payment?.status !== PaymentStatus.REFUNDED && (
            <Button onClick={() => openConfirmDialog("cancel")} className="w-full text-white" variant="destructive">
              <XCircle className="mr-2 h-4 w-4" />
              Batalkan Booking
            </Button>
          )} */}

        {canCancel && (
          <Button variant="destructive" onClick={() => setOpenCancelDialog(true)} className="w-full text-white">
            <Ban className="mr-2 h-4 w-4" />
            Batalkan Booking
          </Button>
        )}
      </div>
      
      {/* Dialog pelunasan pembayaran */}
      {onPaymentCompletion && (
        <Dialog open={openCompletionDialog} onOpenChange={setOpenCompletionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pelunasan Pembayaran</DialogTitle>
              <DialogDescription>
                Pelunasan sisa pembayaran akan dilakukan menggunakan metode tunai.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm font-medium mb-2">Metode Pembayaran</p>
              <div className="w-full px-3 py-2 rounded-md border-2 text-sm">
                Tunai
              </div>
            </div>
            <DialogFooter className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setOpenCompletionDialog(false)} 
                disabled={isProcessing}
              >
                Batal
              </Button>
              <Button 
                onClick={handlePaymentCompletion} 
                disabled={isProcessing}
              >
                {isProcessing ? "Memproses..." : "Lanjutkan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default BookingActions; 