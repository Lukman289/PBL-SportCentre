'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { bookingApi } from '@/api/booking.api';
import { fieldApi } from '@/api/field.api';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookingWithPayment, Field, PaymentStatus } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { use } from 'react';
import useToastHandler from '@/hooks/useToastHandler';
import { useMobileLayout } from '@/hooks/useMobileLayout';

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Mengaktifkan bottom navigation di halaman ini
  useMobileLayout({
    includePaths: ['/histories/*']
  });

  const router = useRouter();
  const { toast } = useToast();
  const { id } = use(params);
  const bookingId = Number(id);
  const { showError } = useToastHandler();
  const [booking, setBooking] = useState<BookingWithPayment | null>(null);
  const [field, setField] = useState<Field | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingCancel, setProcessingCancel] = useState(false);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const bookingData = await bookingApi.getBookingById(bookingId);
        setBooking(bookingData);

        if (bookingData.field) {
          setField(bookingData.field);
        } else if (bookingData.fieldId) {
          const field = await fieldApi.getFieldById(bookingData.fieldId);
          setField(field);
        }

      } catch (error) {
        showError(error, 'Gagal memuat detail booking. Silakan coba lagi nanti.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  // const handleProcessPayment = async () => {
  //   if (!booking) return;

  //   setProcessingPayment(true);
  //   try {
  //     // const payment = await paymentApi.createPayment({
  //     //   bookingId: booking.id,
  //     //   paymentMethod,
  //     // });
      
  //     // toast({
  //     //   title: 'Sukses',
  //     //   description: 'Pembayaran berhasil diproses.',
  //     // });
      
  //     // const updatedBooking = await bookingApi.getBookingById(bookingId);
  //     // setBooking(updatedBooking);
      
  //     // if (payment.paymentUrl) {
  //     //   window.open(payment.paymentUrl, '_blank');
  //     // }
  //     router.push(`${booking.payment?.paymentUrl || ''}`);
  //   } catch (error) {
  //     console.error('Error processing payment:', error);
  //     toast({
  //       title: 'Error',
  //       description: 'Gagal memproses pembayaran. Silakan coba lagi.',
  //       variant: 'destructive',
  //     });
  //   } finally {
  //     setProcessingPayment(false);
  //   }
  // };

  const handleCancelBooking = async () => {
    if (!booking) return;

    setProcessingCancel(true);
    try {
      await bookingApi.cancelBooking(booking.id);
      
      toast({
        title: 'Sukses',
        description: 'Booking berhasil dibatalkan.',
      });
      
      // Redirect to bookings list
      router.push('/histories');
    } catch (error) {
      showError(error, 'Gagal membatalkan booking. Silakan coba lagi.');
    } finally {
      setProcessingCancel(false);
    }
  };

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

  // Check if payment is needed
  // const needsPayment = !booking?.payment || booking.payment.status === PaymentStatus.PENDING;

  // Check if booking can be cancelled 
  // Only allow cancellation for pending payments or when there's no payment
  const canBeCancelled = !booking?.payment || booking.payment.status === PaymentStatus.PENDING;

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            {error || 'Booking tidak ditemukan'}
          </h1>
          <Button asChild>
            <Link href="/histories">Kembali ke Daftar Booking</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Detail Booking #{booking.id}</h1>
      <div className="mb-8">
        <Badge className={`${getStatusColor(booking.payment?.status)} pointer-events-none`}>
          {getStatusText(booking.payment?.status)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Tanggal Booking</h3>
                    <p className="text-base">
                      {format(new Date(booking.bookingDate), 'dd MMMM yyyy', { locale: idLocale })}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Jam</h3>
                    <p className="text-base">
                      {format(new Date(booking.startTime), 'HH:mm')} - {format(new Date(booking.endTime), 'HH:mm')}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Tanggal Pemesanan</h3>
                  <p className="text-base">
                    {format(new Date(booking.createdAt), 'dd MMMM yyyy, HH:mm', { locale: idLocale })}
                  </p>
                </div>

                {field && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Detail Lapangan</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium">Nama Lapangan</h4>
                          <p>{field.name}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Tipe</h4>
                          <p>{field.type?.name}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {booking.payment && (
            <Card>
              <CardHeader>
                <CardTitle>Informasi Pembayaran</CardTitle>
                <CardDescription>
                  ID Pembayaran: #{booking.payment.id}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Metode Pembayaran</h3>
                      <p className="text-base capitalize">{booking.payment.paymentMethod.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Status</h3>
                      <Badge className={`${getStatusColor(booking.payment?.status)} pointer-events-none`}>
                        {getStatusText(booking.payment.status)}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Total Pembayaran</h3>
                    <p className="text-xl font-bold">Rp{booking.payment.amount.toLocaleString()}</p>
                  </div>

                  {booking.payment.expiresDate && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Tenggat Waktu</h3>
                      <p>
                        {format(new Date(booking.payment.expiresDate), 'dd MMMM yyyy, HH:mm')}
                      </p>
                    </div>
                  )}

                  {booking.payment.status === PaymentStatus.PENDING && (
                    <div className="mt-4">
                      <Button asChild className="w-full">
                        <a href={booking.payment.paymentUrl} target="_blank" rel="noopener noreferrer">
                          Lanjutkan Pembayaran
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Aksi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* {needsPayment && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Metode Pembayaran</h3>
                    <Select
                      value={paymentMethod}
                      onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih metode pembayaran" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={PaymentMethod.MIDTRANS}>Payment Gateway</SelectItem>
                        <SelectItem value={PaymentMethod.TRANSFER}>Transfer Bank</SelectItem>
                        <SelectItem value={PaymentMethod.EWALLET}>E-Wallet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handleProcessPayment} 
                    className="w-full"
                    disabled={processingPayment}
                  >
                    {processingPayment ? 'Memproses...' : 'Bayar Sekarang'}
                  </Button>
                </div>
              )} */}

              {canBeCancelled && (
                <Button 
                  variant="destructive" 
                  className="w-full text-white"
                  onClick={handleCancelBooking}
                  disabled={processingCancel}
                >
                  {processingCancel ? 'Memproses...' : 'Batalkan Booking'}
                </Button>
              )}

              <Button asChild variant="outline" className="w-full">
                <Link href="/histories">Kembali ke Daftar Booking</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 