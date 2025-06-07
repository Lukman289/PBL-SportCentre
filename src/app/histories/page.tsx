'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { bookingApi } from '@/api/booking.api';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PaymentStatus, BookingWithPayment } from '@/types';
import { useAuth } from '@/context/auth/auth.context';
import useToastHandler from '@/hooks/useToastHandler';

export default function HistoriesPage() {
  const [bookings, setBookings] = useState<BookingWithPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useAuth();
  const userId = user?.user?.id || 0; 
  const { showError } = useToastHandler();

  useEffect(() => {
    if (!userId || userId === 0) return;
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await bookingApi.getUserBookings(userId);
        setBookings(Array.isArray(data) ? data : []);
      } catch (error) {
        showError(error, 'Gagal memuat daftar booking. Silakan coba lagi nanti.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [userId]);

  const getStatusColor = (status?: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return 'bg-green-100 text-green-800';
      case PaymentStatus.DP_PAID:
        return 'bg-blue-100 text-blue-800';
      case PaymentStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case PaymentStatus.FAILED:
        return 'bg-red-100 text-red-800';
      case PaymentStatus.REFUNDED:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status?: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return 'Lunas';
      case PaymentStatus.DP_PAID:
        return 'DP Terbayar';
      case PaymentStatus.PENDING:
        return 'Menunggu Pembayaran';
      case PaymentStatus.FAILED:
        return 'Pembayaran Gagal';
      case PaymentStatus.REFUNDED:
        return 'Dana Dikembalikan';
      default:
        return 'Belum Dibayar';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Booking Saya</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Booking Saya</h1>
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
          <p>{error}</p>
        </div>
        <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
      </div>
    );
  }

  // Render the main content
  const renderBookingCards = () => {
    if (bookings.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Anda belum memiliki booking.</p>
          <Button asChild>
            <Link href="/branches">Cari Lapangan</Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookings.map((booking) => (
          <Card key={booking.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-center">
                <span>Booking #{booking.id}</span>
                <Badge className={`${getStatusColor(booking.payment?.status)} pointer-events-none`}>
                  {getStatusText(booking.payment?.status)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Tanggal:</span>
                  <p>{format(new Date(booking.bookingDate), 'dd MMMM yyyy', { locale: id })}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Waktu:</span>
                  <p>
                    {format(new Date(booking.startTime), 'HH:mm')} - {format(new Date(booking.endTime), 'HH:mm')}
                  </p>
                </div>
                {booking.payment && (
                  <div>
                    <span className="text-sm text-gray-500">Total Pembayaran:</span>
                    <p className="font-bold">Rp{booking.payment.amount.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button asChild className="w-full">
                <Link href={`/histories/${booking.id}`}>
                  Lihat Detail
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Booking Saya</h1>
      {renderBookingCards()}
    </div>
  );
}
