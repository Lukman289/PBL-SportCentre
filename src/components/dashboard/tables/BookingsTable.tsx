"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoreHorizontal, Eye, CreditCard, Check, X, Ban } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Booking, PaymentStatus } from "@/types/booking.types";
import Link from "next/link";
import { bookingApi } from "@/api/booking.api";
import EmptyState from "@/components/ui/EmptyState";
import { Role } from "@/types";
import { formatTimeRange } from "@/utils/timezone.utils";
import useToastHandler from "@/hooks/useToastHandler";
import { PaymentStatusBadge } from "@/components/ui/payment-status-badge";

interface BookingsTableProps {
  bookings: Booking[];
  userRole?: string;
}

// Fungsi untuk mendapatkan link detail booking berdasarkan role user
const getDetailLink = (booking: Booking, userRole?: string) => {
  if (userRole === Role.SUPER_ADMIN || userRole === Role.ADMIN_CABANG) {
    return `/dashboard/bookings/${booking.id}`;
  // } else if (userRole === Role.ADMIN_CABANG) {
  //   return `/dashboard/bookings/${booking.id}`;
  } else {
    return `/bookings/${booking.id}`;
  }
};

export default function BookingsTable({ bookings, userRole }: BookingsTableProps) {
  const [openAlertId, setOpenAlertId] = useState<number | null>(null);
  const [alertAction, setAlertAction] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { showError } = useToastHandler();

  const handleConfirmAction = async () => {
    if (!openAlertId) return;

    setIsLoading(true);
    try {
      // Melakukan aksi sesuai dengan alertAction
      if (alertAction === "cancel") {
        await bookingApi.cancelBooking(openAlertId);
      } else if (alertAction === "paid" && bookings.find(b => b.id === openAlertId)?.payment?.id) {
        const booking = bookings.find(b => b.id === openAlertId);
        if (booking?.payment?.id) {
          await bookingApi.markPaymentAsPaid(booking.payment.id);
        }
      }

      toast({
        title: "Sukses",
        description: `Booking berhasil ${
          alertAction === "cancel" ? "dibatalkan" : 
          alertAction === "approve" ? "disetujui" : 
          alertAction === "reject" ? "ditolak" : 
          alertAction === "complete" ? "diselesaikan" : 
          "diperbarui"
        }`,
      });

      // Refresh halaman setelah aksi berhasil
      window.location.reload();
    } catch (error) {
     showError(error, "Gagal memproses aksi booking");
    } finally {
      setIsLoading(false);
      setOpenAlertId(null);
    }
  };

  if (!bookings || bookings.length === 0) {
    return <EmptyState message="Belum ada data booking" />;
  }

  return (
    <>
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Lapangan</TableHead>
              <TableHead>Cabang</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Waktu</TableHead>
              <TableHead>Pembayaran</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">#{booking.id}</TableCell>
                <TableCell>{booking.field?.name || "-"}</TableCell>
                <TableCell>{booking.field?.branch?.name || "-"}</TableCell>
                <TableCell>
                  {booking.bookingDate
                    ? format(new Date(booking.bookingDate), "dd MMM yyyy", { locale: id })
                    : "-"}
                </TableCell>
                <TableCell>
                  {formatTimeRange(booking.startTime, booking.endTime)}
                </TableCell>
                <TableCell>
                  <PaymentStatusBadge 
                    status={booking.payment?.status}
                    payments={booking.payments}
                    totalPrice={booking.payment?.amount}
                    variant="default"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Buka menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={getDetailLink(booking, userRole)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Detail
                        </Link>
                      </DropdownMenuItem>

                      {(userRole === Role.SUPER_ADMIN || userRole === Role.USER) && (
                        <DropdownMenuItem
                          onClick={() => {
                            setOpenAlertId(booking.id);
                            setAlertAction("cancel");
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          Batalkan
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!openAlertId} onOpenChange={() => setOpenAlertId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {alertAction === "cancel"
                ? "Batalkan Booking"
                : alertAction === "approve"
                ? "Setujui Booking"
                : alertAction === "reject"
                ? "Tolak Booking"
                : alertAction === "complete"
                ? "Selesaikan Booking"
                : "Perbarui Status Pembayaran"}
            </DialogTitle>
            <DialogDescription>
              {alertAction === "cancel"
                ? "Apakah Anda yakin ingin membatalkan booking ini? Tindakan ini tidak dapat dibatalkan."
                : alertAction === "approve"
                ? "Apakah Anda yakin ingin menyetujui booking ini?"
                : alertAction === "reject"
                ? "Apakah Anda yakin ingin menolak booking ini?"
                : alertAction === "complete"
                ? "Apakah Anda yakin ingin menandai booking ini sebagai selesai?"
                : "Apakah Anda yakin ingin menandai pembayaran ini sebagai lunas?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => setOpenAlertId(null)} 
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button onClick={handleConfirmAction} disabled={isLoading}>
              {isLoading ? "Memproses..." : "Ya, Lanjutkan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 