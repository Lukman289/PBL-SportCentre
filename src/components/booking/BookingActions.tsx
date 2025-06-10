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
            <Button onClick={() => openConfirmDialog("reject")} className="w-full" variant="destructive">
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
      
      {/* Dialog pelunasan pembayaran */}
      {onPaymentCompletion && (
        <Dialog open={openCompletionDialog} onOpenChange={setOpenCompletionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pelunasan Pembayaran</DialogTitle>
              <DialogDescription>
                Pilih metode pembayaran untuk melunasi DP booking ini.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm font-medium mb-2">Metode Pembayaran</p>
              <Select
                value={selectedPaymentMethod}
                onValueChange={(value) => setSelectedPaymentMethod(value as PaymentMethod)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih metode pembayaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PaymentMethod.CASH}>Tunai</SelectItem>
                  <SelectItem value={PaymentMethod.CREDIT_CARD}>Kartu Kredit/Debit</SelectItem>
                  <SelectItem value={PaymentMethod.GOPAY}>GoPay</SelectItem>
                  <SelectItem value={PaymentMethod.SHOPEEPAY}>ShopeePay</SelectItem>
                  <SelectItem value={PaymentMethod.DANA}>DANA</SelectItem>
                  <SelectItem value={PaymentMethod.BCA_VA}>Transfer BCA</SelectItem>
                  <SelectItem value={PaymentMethod.BNI_VA}>Transfer BNI</SelectItem>
                  <SelectItem value={PaymentMethod.BRI_VA}>Transfer BRI</SelectItem>
                  <SelectItem value={PaymentMethod.MANDIRI_VA}>Transfer Mandiri</SelectItem>
                </SelectContent>
              </Select>
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