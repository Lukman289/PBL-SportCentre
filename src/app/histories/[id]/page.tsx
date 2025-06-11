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
import { BookingWithPayment, Field, PaymentStatus, PaymentMethod } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { use } from 'react';
import useToastHandler from '@/hooks/useToastHandler';
import { useMobileLayout } from '@/hooks/useMobileLayout';
import { PaymentFlow } from '@/components/ui/payment-flow';
import { PaymentStatusBadge } from '@/components/ui/payment-status-badge';

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Mengaktifkan bottom navigation di halaman ini
  useMobileLayout({
    includePaths: ['/histories/*']
  });

  const router = useRouter();
  const { toast } = useToast();
  const { id } = use(params);
  const bookingId = Number(id);
  const { showError, showSuccess } = useToastHandler();
  const [booking, setBooking] = useState<BookingWithPayment | null>(null);
  const [field, setField] = useState<Field | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingCancel, setProcessingCancel] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

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

  // Mendapatkan status pembayaran, mendukung format baru (payments) dan lama (payment)
  const paymentStatus = booking?.payments && booking.payments.length > 0 
    ? booking.payments[0].status 
    : booking?.payment?.status;
  
  const lastPaymentStatus = booking?.payments && booking.payments.length > 0 
    ? booking.payments[booking.payments.length - 1].status 
    : booking?.payment?.status;

  // Mendapatkan URL pembayaran, mendukung format baru (payments) dan lama (payment)
  const paymentUrl = booking?.payments && booking.payments.length > 0 
    ? booking.payments[0].paymentUrl 
    : booking?.payment?.paymentUrl;

  // Mendapatkan informasi pembayaran, mendukung format baru (payments) dan lama (payment)
  const paymentInfo = booking?.payments && booking.payments.length > 0 
    ? booking.payments[0] 
    : booking?.payment;
  
  const lastPaymentInfo = booking?.payments && booking.payments.length > 0 
    ? booking.payments[booking.payments.length - 1] 
    : booking?.payment;

  // Check if booking can be cancelled 
  // Only allow cancellation for pending payments or when there's no payment
  const canBeCancelled = !paymentInfo || paymentStatus === PaymentStatus.PENDING;

  console.log("First Payment Status:", paymentStatus);
  console.log("Last Payment Status:", lastPaymentStatus);

  // Check if payment completion is needed
  const showCompletionButton = (paymentStatus === PaymentStatus.DP_PAID || paymentStatus !== PaymentStatus.PENDING) && lastPaymentStatus !== PaymentStatus.PAID;

  // Total amount to be paid, including last payment if available
  const totalAmount = (Number(paymentInfo?.amount) ?? 0) + (Number(lastPaymentInfo?.amount) ?? 0);

  const handlePaymentCompletion = async () => {
    if (!booking) return;
    
    setPaymentLoading(true);
    try {
      // Gunakan metode pembayaran default (CREDIT_CARD)
      const result = await bookingApi.createUserPaymentCompletion(booking.id, PaymentMethod.CREDIT_CARD);
      
      if (result.paymentUrl) {
        // Buka URL pembayaran di tab baru
        window.open(result.paymentUrl, "_blank");
      }
      
      showSuccess("Link pembayaran pelunasan berhasil dibuat");
      
      // Reload data booking setelah berhasil membuat pelunasan
      const updatedBooking = await bookingApi.getBookingById(bookingId);
      setBooking(updatedBooking);
    } catch (error) {
      showError(error, "Terjadi kesalahan saat membuat pelunasan");
    } finally {
      setPaymentLoading(false);
    }
  };

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
        <PaymentStatusBadge
          status={lastPaymentStatus || paymentStatus}
          payments={booking.payments}
          totalPrice={booking.payment?.amount || booking.payments?.[0]?.amount}
          variant="custom"
        />
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

          {paymentInfo && (
            <Card>
              <CardHeader>
                <CardTitle>Informasi Pembayaran</CardTitle>
                <CardDescription>
                  ID Pembayaran: #{paymentInfo.id}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Status Pembayaran</h3>
                  <PaymentFlow 
                    status={paymentStatus} 
                    payments={booking.payments || []} 
                    totalPaid={booking.payments?.reduce((sum, p) => 
                      (p.status === PaymentStatus.PAID || p.status === PaymentStatus.DP_PAID) ? 
                      sum + (p.amount || 0) : sum, 0) || 0}
                    totalPrice={booking.payment?.amount || booking.payments?.[0]?.amount || 0}
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Metode Pembayaran</h3>
                      <p className="text-base capitalize">{paymentInfo.paymentMethod?.replace('_', ' ') || 'Tidak tersedia'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Status</h3>
                      <PaymentStatusBadge
                        status={paymentStatus}
                        payments={booking.payments}
                        totalPrice={booking.payment?.amount || booking.payments?.[0]?.amount}
                        variant="default"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Total Pembayaran</h3>
                    <p className="text-xl font-bold">Rp{totalAmount.toLocaleString()}</p>
                  </div>

                  {paymentInfo.expiresDate && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Tenggat Waktu</h3>
                      <p>
                        {format(new Date(paymentInfo.expiresDate), 'dd MMMM yyyy, HH:mm')}
                      </p>
                    </div>
                  )}

                  <div className="mt-4">
                    {paymentStatus === PaymentStatus.PENDING && paymentUrl && (
                      <Button asChild className="w-full">
                        <a href={paymentUrl} target="_blank" rel="noopener noreferrer">
                          Lanjutkan Pembayaran
                        </a>
                      </Button>
                    )}
                  </div>
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

              {paymentStatus === PaymentStatus.PENDING && paymentUrl && (
                <Button 
                  asChild
                  className="w-full"
                >
                  <a href={paymentUrl} target="_blank" rel="noopener noreferrer">
                    Lanjutkan Pembayaran
                  </a>
                </Button>
              )}

              {showCompletionButton && (
                <Button 
                  className="w-full" 
                  onClick={handlePaymentCompletion}
                  disabled={paymentLoading}
                  variant="outline"
                >
                  {paymentLoading ? "Memproses..." : "Pelunasan DP"}
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