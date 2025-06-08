"use client";

import { bookingApi } from "@/api";
import { useAuth } from "@/context/auth/auth.context";
import useGlobalLoading from "@/hooks/useGlobalLoading.hook";
import { PaymentStatus, BookingWithPayment } from "@/types";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import useToastHandler from "@/hooks/useToastHandler";
import Link from "next/link";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<BookingWithPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | "all">("all");
  const { user } = useAuth();
  const userId = user?.id || 0;
  const { showLoading, hideLoading, withLoading } = useGlobalLoading();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems] = useState(0);
  const maxData = 10;
  const { showError } = useToastHandler();

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  useEffect(() => {
    fetchBookings(statusFilter === "all" ? undefined : statusFilter);
  }, [currentPage, statusFilter]);

  const fetchBookings = async (status?: string) => {
    setIsLoading(true);
    try {
      const response = await withLoading(bookingApi.getUserBookings(userId, status));

      setBookings(Array.isArray(response) ? response : []);
    } catch (error) {
      showError(error, 'Gagal memuat data booking. Silakan coba lagi nanti.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value as PaymentStatus | "all";
    setStatusFilter(status);
  }

  const getStatusColor = (status?: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return "bg-green-100 text-green-800";
      case PaymentStatus.DP_PAID:
        return "bg-blue-100 text-blue-800";
      case PaymentStatus.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case PaymentStatus.FAILED:
        return "bg-red-100 text-red-800";
      case PaymentStatus.REFUNDED:
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status?: PaymentStatus | string) => {
    switch (status) {
      case PaymentStatus.PAID:
        return "Lunas";
      case PaymentStatus.DP_PAID:
        return "DP Terbayar";
      case PaymentStatus.PENDING:
        return "Menunggu Pembayaran";
      case PaymentStatus.FAILED:
        return "Pembayaran Gagal";
      case PaymentStatus.REFUNDED:
        return "Dana Dikembalikan";
      default:
        return "Belum Dibayar";
    }
  };

  const paymentStatusOptions = Object.entries(PaymentStatus).map(([_, value]) => ({
    label: getStatusText(value),
    value: value,
  }));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Histori Reservasi</h1>
      </div>

      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Histori Booking</CardTitle>
              <div className="flex flex-col sm:flex-row gap-3 w-auto">
                <select
                  value={statusFilter}
                  onChange={handleFilterChange}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">Semua Status</option>
                  {paymentStatusOptions.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery
                ? "Tidak ada cabang yang sesuai dengan pencarian"
                : "Anda belum memiliki cabang"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>Tanggal Peminjaman</TableHead>
                  <TableHead>Status Pembayaran</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking, index) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      {(currentPage - 1) * maxData + index + 1}
                    </TableCell>
                    <TableCell>{booking.field?.name}</TableCell>
                    <TableCell>{booking.field?.branch?.location}</TableCell>
                    <TableCell>
                      {format(new Date(booking.bookingDate), "dd MMMM yyyy", {
                        locale: id,
                      })}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`${getStatusColor(booking.payment?.status)}`}
                      >
                        {getStatusText(booking.payment?.status)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link
                          href={`/dashboard/my-bookings/${booking.id}`}
                          className="flex items-center px-3 py-1 text-sm font-medium border rounded hover:bg-muted"
                        >
                          Detail
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableCaption>
                {totalItems > maxData && (
                  <div className="flex justify-between items-center gap-4 mt-8">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                    >
                      Sebelumnya
                    </Button>
                    <span className="text-sm text-gray-500">
                      Halaman {currentPage} dari{" "}
                      {Math.ceil(totalItems / maxData)}
                    </span>
                    <Button
                      variant="outline"
                      disabled={currentPage >= Math.ceil(totalItems / maxData)}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                    >
                      Selanjutnya
                    </Button>
                  </div>
                )}
              </TableCaption>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
