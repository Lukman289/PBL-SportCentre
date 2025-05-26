"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/auth/auth.context";
import { Booking, PaymentMethod, PaymentStatus } from "@/types/booking.types";
import { bookingApi } from "@/api/booking.api";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Role, User } from "@/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { XCircle, ArrowLeft } from "lucide-react";

// Import komponen-komponen yang sudah dipisahkan
import {
  BookingDetailHeader,
  FieldInfoCard,
  BookingTimeCard,
  UserInfoCard,
  PaymentInfoCard,
  BookingActions
} from "@/components/booking";

export default function BookingDetailPage() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
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

  const bookingId = Number(params.id);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      // Memastikan user?.role ada sebelum memanggil API
      if (!user?.role) {
        toast({
          title: "Error",
          description: "Data pengguna tidak ditemukan. Silakan login kembali.",
          variant: "destructive",
        });
        router.push('/auth/login');
        return;
      }
      
      // Memastikan hanya SUPER_ADMIN dan ADMIN_CABANG yang dapat mengakses
      if (user.role !== Role.SUPER_ADMIN && user.role !== Role.ADMIN_CABANG) {
        toast({
          title: "Akses Ditolak",
          description: "Anda tidak memiliki izin untuk mengakses halaman ini",
          variant: "destructive",
        });
        router.push('/dashboard');
        return;
      }
      
      const roleParam = user.role;
      
      let data;
      if (user.role === Role.SUPER_ADMIN) {
        // Super admin tidak membutuhkan branchId
        data = await bookingApi.getBookingById(bookingId, roleParam);
      } else if (user.role === Role.ADMIN_CABANG && user.branches && user.branches.length > 0) {
        // Admin cabang membutuhkan branchId
        // Ambil branchId dari cabang pertama yang dimiliki admin
        const branchId = user.branches[0].branchId;
        data = await bookingApi.getBookingById(bookingId, roleParam, branchId);
      } else {
        toast({
          title: "Error",
          description: "Data cabang tidak ditemukan untuk admin cabang",
          variant: "destructive",
        });
        return;
      }
      
      setBooking(data);
    } catch (error) {
      console.error("Error fetching booking details:", error);
      toast({
        title: "Error",
        description: "Gagal memuat detail booking",
        variant: "destructive",
      });
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
            await bookingApi.updatePaymentStatus(booking.payment.id, PaymentStatus.PAID);
            toast({
              title: "Sukses",
              description: "Pembayaran berhasil dikonfirmasi",
            });
          }
          break;
        case "reject":
          if (booking.payment?.id) {
            await bookingApi.updatePaymentStatus(booking.payment.id, PaymentStatus.FAILED);
            toast({
              title: "Sukses",
              description: "Pembayaran berhasil ditolak",
            });
          }
          break;
        case "cancel":
          await bookingApi.cancelBooking(booking.id);
          toast({
            title: "Sukses",
            description: "Booking berhasil dibatalkan",
          });
          break;
        case "complete":
          // Implementasi completedBooking jika diperlukan
          toast({
            title: "Sukses",
            description: "Booking berhasil diselesaikan",
          });
          break;
        case "pay":
          if (booking.payment?.id) {
            await bookingApi.markPaymentAsPaid(booking.payment.id);
            toast({
              title: "Sukses",
              description: "Pembayaran berhasil dilunasi",
            });
          }
          break;
      }
      // Refresh data booking
      await fetchBookingDetails();
    } catch (error) {
      console.error("Error performing action:", error);
      toast({
        title: "Error",
        description: `Gagal melakukan aksi: ${confirmDialog.action}`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
      setConfirmDialog({ ...confirmDialog, open: false });
    }
  };

  const openConfirmDialog = (action: "approve" | "reject" | "cancel" | "complete" | "pay") => {
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
        description: "Anda yakin ingin membatalkan booking ini? Tindakan ini tidak dapat dibatalkan.",
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
  const isManualBooking = booking?.payment?.paymentMethod === PaymentMethod.CASH && 
                         booking?.payment?.status === PaymentStatus.PAID;

  const handleCancelBooking = async () => {
    if (!booking) return;
    
    setCancelLoading(true);
    try {
      await bookingApi.cancelBooking(booking.id);
      
      toast({
        title: "Berhasil",
        description: "Booking berhasil dibatalkan",
      });
      
      // Reload data booking setelah berhasil dibatalkan
      if (user?.role) {
        const roleParam = user.role;
        
        let updatedBooking;
        if (user.role === Role.SUPER_ADMIN) {
          updatedBooking = await bookingApi.getBookingById(bookingId, roleParam);
        } else if (user.role === Role.ADMIN_CABANG && user.branches && user.branches.length > 0) {
          // Admin cabang membutuhkan branchId
          const branchId = user.branches[0].branchId;
          updatedBooking = await bookingApi.getBookingById(bookingId, roleParam, branchId);
        }
        
        if (updatedBooking) {
          setBooking(updatedBooking);
        }
      }
      
      setOpenCancelDialog(false);
    } catch (error) {
      console.error("Error canceling booking:", error);
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan saat membatalkan booking",
        variant: "destructive",
      });
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container flex items-center justify-center h-[calc(100vh-200px)]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container py-6 px-4">
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center h-[calc(100vh-200px)]">
          <div className="bg-white dark:bg-gray-950 rounded-lg p-8 shadow-sm border border-gray-100 dark:border-gray-800 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Data Booking Tidak Ditemukan</h2>
            <p className="text-muted-foreground mb-6">Booking dengan ID ini tidak dapat ditemukan atau Anda tidak memiliki akses untuk melihatnya.</p>
            <Button onClick={() => router.back()} variant="outline" className="flex items-center gap-2 mx-auto">
              <ArrowLeft size={16} />
              Kembali
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const canCancel = booking.payment?.status === PaymentStatus.PENDING ||
    booking.payment?.status === PaymentStatus.DP_PAID;

  return (
    <div className="container py-6 px-4">
      <div className="max-w-5xl mx-auto">
        <BookingDetailHeader bookingId={booking.id} createdAt={booking.createdAt} />
        
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
            
            <BookingActions
              user={user as User}
              booking={booking}
              openConfirmDialog={openConfirmDialog}
              setOpenCancelDialog={setOpenCancelDialog}
              canCancel={canCancel}
            />
          </div>
        </div>
      </div>

      {/* Dialog konfirmasi tindakan */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogDescription>{confirmDialog.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
              disabled={actionLoading}
            >
              Batal
            </Button>
            <Button onClick={handleAction} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <LoadingSpinner size="small" /> 
                  <span className="ml-2">Memproses...</span>
                </>
              ) : (
                "Ya, Lanjutkan"
              )}
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
              {cancelLoading ? (
                <>
                  <LoadingSpinner size="small" />
                  <span className="ml-2">Memproses...</span>
                </>
              ) : (
                "Ya, Batalkan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 