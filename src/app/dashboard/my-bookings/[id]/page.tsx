"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/auth/auth.context";
import { Booking, PaymentMethod, PaymentStatus } from "@/types/booking.types";
import { bookingApi } from "@/api/booking.api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Role } from "@/types";
import { XCircle, ArrowLeft } from "lucide-react";
import useGlobalLoading from "@/hooks/useGlobalLoading.hook";
import useToastHandler from "@/hooks/useToastHandler";

// Import komponen-komponen yang sudah dipisahkan
import {
  BookingDetailHeader,
  FieldInfoCard,
  BookingTimeCard,
  UserInfoCard,
  PaymentInfoCard,
} from "@/components/booking";

export default function MyBookingDetailPage() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { showError, showSuccess } = useToastHandler();
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "approve" | "reject" | "cancel" | "complete" | "pay";
    title: string;
    description: string;
  }>({
    open: false,
    action: "approve",
    title: "",
    description: "",
  });
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const { showLoading, hideLoading, withLoading } = useGlobalLoading();

  const bookingId = Number(params?.id);

  // Mengelola loading state
  useEffect(() => {
    if (loading || actionLoading || cancelLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [loading, actionLoading, cancelLoading, showLoading, hideLoading]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      // Memastikan user?.role ada sebelum memanggil API
      if (!user?.role) {
        showError("Data pengguna tidak ditemukan. Silakan login kembali.");
        router.push("/auth/login");
        return;
      }

      // Memastikan hanya User yang dapat mengakses halaman ini
      if (user.role !== Role.USER) {
        showError(
          "Anda tidak memiliki izin untuk mengakses halaman ini",
          "Akses Ditolak"
        );
        router.push("/dashboard");
        return;
      }
      const bookingData = await withLoading(
        bookingApi.getBookingById(bookingId)
      );

      setBooking(bookingData);
    } catch (error) {
      showError(error, "Gagal memuat detail booking");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const handleAction = async () => {
    if (!booking) return;

    setActionLoading(true);
    try {
      switch (confirmDialog.action) {
        case "approve":
          if (booking.payment?.id) {
            await withLoading(
              bookingApi.updatePaymentStatus(
                booking.payment.id,
                PaymentStatus.PAID
              )
            );
            showSuccess("Pembayaran berhasil dikonfirmasi");
          }
          break;
        case "reject":
          if (booking.payment?.id) {
            await withLoading(
              bookingApi.updatePaymentStatus(
                booking.payment.id,
                PaymentStatus.FAILED
              )
            );
            showSuccess("Pembayaran berhasil ditolak");
          }
          break;
        case "cancel":
          await withLoading(bookingApi.cancelBooking(booking.id));
          showSuccess("Booking berhasil dibatalkan");
          break;
        case "complete":
          // Implementasi completedBooking jika diperlukan
          showSuccess("Booking berhasil diselesaikan");
          break;
        case "pay":
          if (booking.payment?.id) {
            await withLoading(bookingApi.markPaymentAsPaid(booking.payment.id));
            showSuccess("Pembayaran berhasil dilunasi");
          }
          break;
      }
      // Refresh data booking
      await fetchBookingDetails();
    } catch (error) {
      showError(error, `Gagal melakukan aksi: ${confirmDialog.action}`);
    } finally {
      setActionLoading(false);
      setConfirmDialog({ ...confirmDialog, open: false });
    }
  };

  const openConfirmDialog = (
    action: "approve" | "reject" | "cancel" | "complete" | "pay"
  ) => {
    const dialogConfig = {
      approve: {
        title: "Konfirmasi Pembayaran",
        description: "Anda yakin ingin mengkonfirmasi pembayaran booking ini?",
      },
      reject: {
        title: "Tolak Pembayaran",
        description: "Anda yakin ingin menolak pembayaran booking ini?",
      },
      cancel: {
        title: "Batalkan Booking",
        description:
          "Anda yakin ingin membatalkan booking ini? Tindakan ini tidak dapat dibatalkan.",
      },
      complete: {
        title: "Selesaikan Booking",
        description: "Anda yakin ingin menandai booking ini sebagai selesai?",
      },
      pay: {
        title: "Lunasi Pembayaran",
        description: "Anda yakin ingin menandai pembayaran ini sebagai lunas?",
      },
    };

    setConfirmDialog({
      open: true,
      action,
      title: dialogConfig[action].title,
      description: dialogConfig[action].description,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Tentukan apakah booking adalah booking manual (cash)
  const isManualBooking =
    booking?.payment?.paymentMethod === PaymentMethod.CASH &&
    booking?.payment?.status === PaymentStatus.PAID;

  const handleCancelBooking = async () => {
    if (!booking) return;

    setCancelLoading(true);
    try {
      await bookingApi.cancelBooking(booking.id);

      showSuccess("Booking berhasil dibatalkan.");

      // Redirect to bookings list
      router.push("/dashboard/my-bookings");
    } catch (error) {
      showError(error, "Gagal membatalkan booking. Silakan coba lagi.");
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return null; // GlobalLoading akan otomatis ditampilkan
  }

  if (!booking) {
    return (
      <div className="container py-6 px-4">
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center h-[calc(100vh-200px)]">
          <div className="bg-white dark:bg-gray-950 rounded-lg p-8 shadow-sm border border-gray-100 dark:border-gray-800 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Data Booking Tidak Ditemukan
            </h2>
            <p className="text-muted-foreground mb-6">
              Booking dengan ID ini tidak dapat ditemukan atau Anda tidak
              memiliki akses untuk melihatnya.
            </p>
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="flex items-center gap-2 mx-auto"
            >
              <ArrowLeft size={16} />
              Kembali
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard/my-bookings')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Kembali ke Daftar Booking
          </Button>
        </div>
        <BookingDetailHeader
          bookingId={booking.id}
          createdAt={booking.createdAt}
          url="/dashboard/my-bookings"
        />

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <FieldInfoCard booking={booking} />
            <BookingTimeCard booking={booking} />
            {booking.user && <UserInfoCard user={booking.user} />}
          </div>

          <div className="space-y-6">
            <PaymentInfoCard
              booking={booking}
              isManualBooking={isManualBooking}
              formatCurrency={formatCurrency}
            />

            {booking.payment?.status !== PaymentStatus.PAID &&
              booking.payment?.status !== PaymentStatus.FAILED && (
                <Button
                  onClick={handleCancelBooking}
                  className="w-full text-white"
                  variant="destructive"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Batalkan Booking
                </Button>
              )}
          </div>
        </div>
      </div>

      {/* Dialog konfirmasi tindakan */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogDescription>{confirmDialog.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() =>
                setConfirmDialog({ ...confirmDialog, open: false })
              }
              disabled={actionLoading}
            >
              Batal
            </Button>
            <Button onClick={handleAction} disabled={actionLoading}>
              {actionLoading ? "Memproses..." : "Ya, Lanjutkan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog konfirmasi pembatalan */}
      <Dialog open={openCancelDialog} onOpenChange={setOpenCancelDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Batalkan Booking</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin membatalkan booking ini? Tindakan ini
              tidak dapat dibatalkan.
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
    </div>
  );
}
