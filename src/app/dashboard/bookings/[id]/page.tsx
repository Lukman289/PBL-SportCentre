"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth/auth.context";
import { Booking, PaymentMethod, PaymentStatus } from "@/types/booking.types";
import { bookingApi } from "@/api/booking.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowLeft, XCircle, Printer, CreditCard, Info, Ban } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "@/components/ui/use-toast";
import { Role } from "@/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function SuperAdminBookingDetailPage() {
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

  const getPaymentStatusBadge = (status?: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return <Badge className="bg-green-500">Lunas</Badge>;
      case PaymentStatus.PENDING:
        return <Badge className="bg-yellow-500">Menunggu Pembayaran</Badge>;
      case PaymentStatus.DP_PAID:
        return <Badge className="bg-blue-500">DP Terbayar</Badge>;
      case PaymentStatus.FAILED:
        return <Badge className="bg-red-500">Gagal</Badge>;
      case PaymentStatus.REFUNDED:
        return <Badge className="bg-gray-500">Dikembalikan</Badge>;
      default:
        return <Badge className="bg-gray-500">Tidak Diketahui</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const printBookingReceipt = () => {
    if (!booking) return;
    
    // Implementasi print receipt
    window.print();
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
      <div className="container p-4">
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
          <h2 className="text-xl font-semibold mb-2">Data Booking Tidak Ditemukan</h2>
          <p className="text-muted-foreground mb-4">Booking dengan ID ini tidak dapat ditemukan</p>
          <Button onClick={() => router.back()} variant="outline" className="flex items-center gap-2">
            <ArrowLeft size={16} />
            Kembali
          </Button>
        </div>
      </div>
    );
  }

  const canCancel = booking.payment?.status === PaymentStatus.PENDING ||
    booking.payment?.status === PaymentStatus.DP_PAID;

  return (
    <div className="container p-4">
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/bookings">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar Booking
          </Link>
        </Button>
      </div>
      
      <div className="flex flex-col gap-4 md:flex-row">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span>Booking #{booking.id}</span>
                {isManualBooking && (
                  <Badge className="bg-blue-600">
                    <Info className="h-3 w-3 mr-1" />
                    Booking Manual
                  </Badge>
                )}
              </div>
              {getPaymentStatusBadge(booking.payment?.status)}
            </CardTitle>
            <CardDescription>
              Dibuat pada {format(new Date(booking.createdAt), "dd MMMM yyyy, HH:mm", { locale: id })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Informasi Lapangan</h3>
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nama Lapangan</span>
                    <span className="font-medium">{booking.field?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cabang</span>
                    <span className="font-medium">{booking.field?.branch?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Jenis</span>
                    <span className="font-medium">{booking.field?.type?.name}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-2">Informasi Booking</h3>
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tanggal</span>
                    <span className="font-medium">
                      {format(new Date(booking.bookingDate), "EEEE, dd MMMM yyyy", { locale: id })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Waktu</span>
                    <span className="font-medium">
                      {booking.startTime} - {booking.endTime}
                    </span>
                  </div>
                </div>
              </div>

              {booking.user && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Informasi Pemesan</h3>
                    <div className="grid gap-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nama</span>
                        <span className="font-medium">{booking.user.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email</span>
                        <span className="font-medium">{booking.user.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Telepon</span>
                        <span className="font-medium">{booking.user.phone || "-"}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            {booking.payment ? (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span>{getPaymentStatusBadge(booking.payment.status)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-medium">{formatCurrency(booking.payment.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Metode</span>
                    <span className="font-medium capitalize">
                      {booking.payment.paymentMethod.replace("_", " ")}
                      {isManualBooking && " (Booking Manual)"}
                    </span>
                  </div>
                  {booking.payment.transactionId && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID Transaksi</span>
                      <span className="font-medium">{booking.payment.transactionId}</span>
                    </div>
                  )}
                  {booking.payment.expiresDate && booking.payment.status === PaymentStatus.PENDING && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Batas Waktu</span>
                      <span className="font-medium">
                        {format(new Date(booking.payment.expiresDate), "dd MMM yyyy, HH:mm", { locale: id })}
                      </span>
                    </div>
                  )}
                </div>

                {booking.payment.paymentUrl && booking.payment.status === PaymentStatus.PENDING && (
                  <div className="mt-2">
                    <Button asChild className="w-full" variant="default">
                      <a href={booking.payment.paymentUrl} target="_blank" rel="noopener noreferrer">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Bayar Sekarang
                      </a>
                    </Button>
                  </div>
                )}
                
                {isManualBooking && (
                  <div className="p-3 bg-muted rounded-md mt-2">
                    <p className="text-sm text-muted-foreground">
                      Booking ini dibuat secara manual oleh admin cabang dengan pembayaran tunai (cash).
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Data pembayaran tidak tersedia</p>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-2">
            {user?.role === Role.ADMIN_CABANG && booking.payment?.status === PaymentStatus.PENDING && (
              <>
                <Button
                  onClick={() => openConfirmDialog("approve")}
                  className="w-full"
                  variant="default"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Konfirmasi Pembayaran
                </Button>
                <Button
                  onClick={() => openConfirmDialog("reject")}
                  className="w-full"
                  variant="destructive"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Tolak Pembayaran
                </Button>
              </>
            )}

            {user?.role === Role.ADMIN_CABANG && booking.payment?.status === PaymentStatus.DP_PAID && (
              <Button
                onClick={() => openConfirmDialog("pay")}
                className="w-full"
                variant="default"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Lunasi Pembayaran
              </Button>
            )}

            {user?.role === Role.ADMIN_CABANG && booking.payment?.status === PaymentStatus.PAID && (
              <Button
                onClick={() => openConfirmDialog("complete")}
                className="w-full"
                variant="default"
              >
                <Check className="mr-2 h-4 w-4" />
                Selesaikan Booking
              </Button>
            )}

            {(user?.role === Role.SUPER_ADMIN || user?.role === Role.ADMIN_CABANG) && 
             booking.payment?.status !== PaymentStatus.FAILED && 
             booking.payment?.status !== PaymentStatus.REFUNDED && (
              <Button
                onClick={() => openConfirmDialog("cancel")}
                className="w-full"
                variant="destructive"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Batalkan Booking
              </Button>
            )}

            <Button
              onClick={printBookingReceipt}
              className="w-full"
              variant="outline"
            >
              <Printer className="mr-2 h-4 w-4" />
              Cetak Bukti Booking
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent>
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
              {actionLoading ? "Memproses..." : "Ya, Lanjutkan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {canCancel && (
        <Button
          variant="destructive"
          onClick={() => setOpenCancelDialog(true)}
          className="w-full mt-4"
        >
          <Ban className="mr-2 h-4 w-4" />
          Batalkan Booking
        </Button>
      )}

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
    </div>
  );
} 