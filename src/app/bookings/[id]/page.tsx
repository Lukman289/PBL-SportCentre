"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Booking, PaymentMethod, PaymentStatus, Role } from "@/types";
import { bookingApi } from "@/api/booking.api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatTimeRange } from "@/utils/timezone.utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Ban, ArrowLeft, CreditCard } from "lucide-react";
import Link from "next/link";
import useToastHandler from "@/hooks/useToastHandler";
import { useMobileLayout } from "@/hooks/useMobileLayout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentFlow } from "@/components/ui/payment-flow";
import { PaymentStatusBadge } from "@/components/ui/payment-status-badge";

export default function BookingDetailPage() {
  useMobileLayout({
    includePaths: ['/bookings/*']
  });

  const params = useParams();
  const { showError, showSuccess } = useToastHandler();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CREDIT_CARD);

  const bookingId = Number(params.id);

  useEffect(() => {
    const fetchBookingData = async () => {
      if (!bookingId) return;

      try {
        setLoading(true);
        const data = await bookingApi.getBookingById(bookingId, Role.USER);
        setBooking(data);
      } catch (error) {
        showError(error, "Terjadi kesalahan saat memuat data booking");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [bookingId]);

  const handleCancelBooking = async () => {
    if (!booking) return;
    
    setCancelLoading(true);
    try {
      await bookingApi.cancelBooking(booking.id);
      
      showSuccess("Booking berhasil dibatalkan");
      
      // Reload data booking setelah berhasil dibatalkan
      const updatedBooking = await bookingApi.getBookingById(bookingId, Role.USER);
      setBooking(updatedBooking);
      
      setOpenCancelDialog(false);
    } catch (error) {
      showError(error, "Terjadi kesalahan saat membatalkan booking");
    } finally {
      setCancelLoading(false);
    }
  };

  const handlePaymentCompletion = async () => {
    if (!booking) return;
    
    setPaymentLoading(true);
    try {
      const result = await bookingApi.createUserPaymentCompletion(booking.id, selectedPaymentMethod);
      
      if (result.paymentUrl) {
        // Buka URL pembayaran di tab baru
        window.open(result.paymentUrl, "_blank");
      }
      
      showSuccess("Link pembayaran pelunasan berhasil dibuat");
      
      // Reload data booking setelah berhasil membuat pelunasan
      const updatedBooking = await bookingApi.getBookingById(bookingId, Role.USER);
      setBooking(updatedBooking);
      
      setOpenPaymentDialog(false);
    } catch (error) {
      showError(error, "Terjadi kesalahan saat membuat pelunasan");
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-center items-center h-64">
          <p>Memuat data booking...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-center items-center h-64">
          <p>Booking tidak ditemukan</p>
        </div>
      </div>
    );
  }

  const canCancel = booking.payment?.status === PaymentStatus.PENDING ||
    booking.payment?.status === PaymentStatus.DP_PAID;

  const showPaymentButton = booking.payment?.status === PaymentStatus.PENDING && 
    booking.payment?.paymentUrl;

  const showCompletionButton = booking.payment?.status === PaymentStatus.DP_PAID;

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/bookings">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Detail Booking #{booking.id}
                <PaymentStatusBadge
                  status={booking.payment?.status}
                  payments={booking.payments}
                  totalPrice={booking.payment?.amount}
                  variant="default"
                />
              </CardTitle>
              <CardDescription>
                Informasi detail tentang booking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Informasi Lapangan</h3>
                  <Separator className="my-2" />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Nama Lapangan</p>
                      <p className="font-medium">{booking.field?.name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cabang</p>
                      <p className="font-medium">{booking.field?.branch?.name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Alamat</p>
                      <p className="font-medium">{booking.field?.branch?.location || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Harga per Jam</p>
                      <p className="font-medium">
                        {booking.field?.priceDay 
                          ? `Rp ${booking.field.priceDay.toLocaleString('id-ID')}`
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Informasi Booking</h3>
                  <Separator className="my-2" />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Tanggal</p>
                      <p className="font-medium">
                        {booking.bookingDate 
                          ? format(new Date(booking.bookingDate), "EEEE, d MMMM yyyy", { locale: id })
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Waktu</p>
                      <p className="font-medium">{formatTimeRange(booking.startTime, booking.endTime)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Dibuat pada</p>
                      <p className="font-medium">
                        {booking.createdAt 
                          ? format(new Date(booking.createdAt), "d MMMM yyyy, HH:mm", { locale: id })
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Diperbarui pada</p>
                      <p className="font-medium">
                        {booking.createdAt 
                          ? format(new Date(booking.createdAt), "d MMMM yyyy, HH:mm", { locale: id })
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              {canCancel && (
                <Button 
                  variant="destructive" 
                  onClick={() => setOpenCancelDialog(true)}
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Batalkan Booking
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Informasi Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Status Pembayaran</h3>
                  <PaymentFlow 
                    status={booking.payment?.status} 
                    payments={booking.payments || []} 
                    totalPaid={booking.payments?.reduce((sum, p) => 
                      (p.status === PaymentStatus.PAID || p.status === PaymentStatus.DP_PAID) ? 
                      sum + (p.amount || 0) : sum, 0) || 0}
                    totalPrice={booking.payment?.amount || 0}
                  />
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">
                    <PaymentStatusBadge
                      status={booking.payment?.status}
                      payments={booking.payments}
                      totalPrice={booking.payment?.amount}
                      variant="default"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Harga</p>
                  <p className="font-medium">
                    {booking.payment?.amount 
                      ? `Rp ${booking.payment.amount.toLocaleString('id-ID')}`
                      : "-"}
                  </p>
                </div>
                {booking.payment?.paymentMethod && (
                  <div>
                    <p className="text-sm text-muted-foreground">Metode Pembayaran</p>
                    <p className="font-medium">{booking.payment.paymentMethod}</p>
                  </div>
                )}
                {booking.payment?.transactionId && (
                  <div>
                    <p className="text-sm text-muted-foreground">ID Transaksi</p>
                    <p className="font-medium">{booking.payment.transactionId}</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              {showPaymentButton && (
                <Button 
                  className="w-full" 
                  onClick={() => window.open(booking.payment?.paymentUrl, "_blank")}
                >
                  Lanjutkan Pembayaran
                </Button>
              )}
              
              {showCompletionButton && (
                <Button 
                  className="w-full" 
                  onClick={() => setOpenPaymentDialog(true)}
                  variant="outline"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pelunasan DP
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Dialog konfirmasi pembatalan */}
      <Dialog open={openCancelDialog} onOpenChange={setOpenCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Batalkan Booking</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin membatalkan booking ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => setOpenCancelDialog(false)} 
              disabled={cancelLoading}
            >
              Batal
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelBooking} 
              disabled={cancelLoading}
            >
              {cancelLoading ? "Memproses..." : "Ya, Batalkan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pelunasan pembayaran */}
      <Dialog open={openPaymentDialog} onOpenChange={setOpenPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pelunasan Pembayaran</DialogTitle>
            <DialogDescription>
              Silakan pilih metode pembayaran untuk melunasi DP booking ini.
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
              onClick={() => setOpenPaymentDialog(false)} 
              disabled={paymentLoading}
            >
              Batal
            </Button>
            <Button 
              onClick={handlePaymentCompletion} 
              disabled={paymentLoading}
            >
              {paymentLoading ? "Memproses..." : "Lanjutkan Pembayaran"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 