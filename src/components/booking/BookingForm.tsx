"use client";

import { Button } from "@/components/ui/button";
import { useBookingContext } from "@/context/booking/booking.context";
import { useAdminBooking } from "@/hooks/bookings/useAdminBooking.hook";
import { useDurationCalculator } from "@/hooks/useDurationCalculator.hook";
import { PaymentMethod, PaymentStatus } from "@/types";
import { BookingFormValues } from "@/context/booking/booking.context";
import { useState } from "react";

interface BookingFormProps {
  isAdminBooking?: boolean;
  onSuccess?: (paymentMethod: PaymentMethod) => void;
}

export default function BookingForm({ isAdminBooking = false, onSuccess }: BookingFormProps) {
  // Menggunakan hook context sesuai dengan jenis user
  const regularBooking = useBookingContext();
  const adminBooking = useAdminBooking();
  
  // State untuk metode pembayaran (hanya untuk admin booking)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatus.PAID);
  
  // Pilih context berdasarkan jenis booking
  const {
    selectedFieldName,
    selectedBranchName,
    selectedStartTime,
    selectedEndTime,
    selectedField,
    selectedDate,
    form,
    onSubmit,
    loading
  } = isAdminBooking ? adminBooking : regularBooking;

  // Menggunakan custom hook untuk menghitung durasi
  const { durationInHours } = useDurationCalculator();

  // Pastikan format waktu yang ditampilkan sesuai dengan timezone lokal
  const formattedStartTime = selectedStartTime === "-" ? "" : selectedStartTime;
  const formattedEndTime = selectedEndTime || "";
  
  // Fungsi untuk menangani submit form
  const handleSubmit = async (data: BookingFormValues) => {
    if (isAdminBooking) {
      // Untuk admin cabang, gunakan createManualBooking dengan status yang dipilih
      try {
        console.log("Data yang akan dikirim:", {
          fieldId: selectedField,
          userId: adminBooking.user?.id || 0,
          bookingDate: selectedDate,
          startTime: selectedStartTime,
          endTime: selectedEndTime,
          paymentMethod: paymentMethod,
          paymentStatus: paymentStatus
        });
        
        const bookingData = {
          fieldId: selectedField,
          userId: adminBooking.user?.id || 0,
          bookingDate: selectedDate,
          startTime: selectedStartTime,
          endTime: selectedEndTime,
          paymentMethod: paymentMethod,
          paymentStatus: paymentStatus,
          branchId: adminBooking.selectedBranch
        };
        
        console.log("Mengirim data booking manual:", bookingData);
        
        const result = await adminBooking.createManualBooking(bookingData);
        if (result) {
          console.log("Booking manual berhasil dibuat:", result);
          
          // Jika ada paymentUrl dan menggunakan metode online, redirect ke halaman pembayaran
          if (result.payment?.paymentUrl && paymentMethod !== PaymentMethod.CASH) {
            console.log("Redirecting ke halaman pembayaran:", result.payment.paymentUrl);
            window.open(result.payment.paymentUrl, "_blank");
          }
          
          if (onSuccess) {
            onSuccess(paymentMethod);
          }
        }
      } catch (error) {
        console.error("Error saat membuat manual booking:", error);
      }
    } else {
      await onSubmit(data);
      if (onSuccess) {
        onSuccess(PaymentMethod.CASH);
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white shadow-xl rounded-xl p-6 border border-gray-200">
      <h2 className="text-xl font-bold text-center mb-6 pb-2 border-b border-gray-100">
        {isAdminBooking ? "Booking Manual" : "Pesanan Anda"}
      </h2>
      
      {loading ? (
        <div className="flex flex-col items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black mb-4"></div>
          <p className="text-lg font-medium">Memproses pemesanan...</p>
          <p className="text-sm text-gray-500">Mohon tunggu sebentar</p>
        </div>
      ) : (
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Lapangan:</span>
            <span className="font-medium">{selectedFieldName === "Lapangan" ? "-" : selectedFieldName}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Cabang:</span>
            <span className="font-medium">{selectedBranchName === "Cabang" ? "-" : selectedBranchName}</span>
          </div>
          
          <hr className="my-2 border-gray-200" />
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="startTime" className="block text-sm text-gray-600">
                Jam Mulai:
              </label>
              <input
                type="text"
                name="startTime"
                value={formattedStartTime}
                readOnly
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-700"
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="endTime" className="block text-sm text-gray-600">
                Jam Selesai:
              </label>
              <input
                type="text"
                name="endTime"
                value={formattedEndTime}
                readOnly
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-700"
              />
            </div>
          </div>
        </div>

        {selectedStartTime !== "-" && selectedEndTime && (
          <div className="border border-gray-200 rounded-lg p-4 bg-blue-50 text-center">
            <p className="text-sm text-gray-600 mb-1">Durasi Booking:</p>
            <p className="font-medium">
              {formattedStartTime} - {formattedEndTime}
              <span className="ml-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                {durationInHours} jam
              </span>
            </p>
          </div>
        )}

        {/* Opsi pembayaran khusus untuk admin */}
        {isAdminBooking && (
          <div className="space-y-5 mt-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status Pembayaran:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div 
                  className={`p-3 border-2 rounded-lg cursor-pointer text-center transition-all duration-200 transform hover:scale-105 ${paymentStatus === PaymentStatus.PAID ? 'bg-green-50 border-green-500 shadow-md' : 'bg-white border-gray-300 hover:border-green-300 hover:bg-green-50/30'}`}
                  onClick={() => setPaymentStatus(PaymentStatus.PAID)}
                >
                  <div className="font-bold text-green-700">LUNAS (PAID)</div>
                  <div className="text-sm text-gray-600 mt-1">Pembayaran telah lunas</div>
                </div>
                <div 
                  className={`p-3 border-2 rounded-lg cursor-pointer text-center transition-all duration-200 transform hover:scale-105 ${paymentStatus === PaymentStatus.DP_PAID ? 'bg-blue-50 border-blue-500 shadow-md' : 'bg-white border-gray-300 hover:border-blue-300 hover:bg-blue-50/30'}`}
                  onClick={() => setPaymentStatus(PaymentStatus.DP_PAID)}
                >
                  <div className="font-bold text-blue-700">DP (DP_PAID)</div>
                  <div className="text-sm text-gray-600 mt-1">Down payment telah dibayar</div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metode Pembayaran:
              </label>
              <div className="space-y-4">
                {/* Pilihan Metode Pembayaran - Cash atau Midtrans */}
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    className={`p-4 border-2 rounded-lg cursor-pointer text-center transition-all duration-200 transform hover:scale-105 ${paymentMethod === PaymentMethod.CASH ? 'bg-green-50 border-green-500 shadow-md' : 'bg-white border-gray-300 hover:border-green-300 hover:bg-green-50/30'}`}
                    onClick={() => setPaymentMethod(PaymentMethod.CASH)}
                  >
                    <div className="font-bold mb-1 text-lg">TUNAI (CASH)</div>
                    <div className="text-sm text-gray-600">Pembayaran langsung di lokasi</div>
                  </div>
                  
                  <div 
                    className={`p-4 border-2 rounded-lg cursor-pointer text-center transition-all duration-200 transform hover:scale-105 ${paymentMethod !== PaymentMethod.CASH ? 'bg-blue-50 border-blue-500 shadow-md' : 'bg-white border-gray-300 hover:border-blue-300 hover:bg-blue-50/30'}`}
                    onClick={() => setPaymentMethod(PaymentMethod.GOPAY)}
                  >
                    <div className="font-bold mb-1 text-lg">ONLINE (MIDTRANS)</div>
                    <div className="text-sm text-gray-600">Pembayaran via metode digital</div>
                  </div>
                </div>
                
                {/* Jika Midtrans dipilih, tampilkan informasi */}
                {paymentMethod !== PaymentMethod.CASH && (
                  <div className="mt-3 border border-blue-200 rounded-lg p-3 bg-blue-50">
                    <div className="text-sm text-blue-700 p-2 bg-blue-100 rounded border border-blue-300 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>
                        Anda akan diarahkan ke halaman pembayaran Midtrans setelah booking berhasil dibuat. Berbagai metode pembayaran tersedia di halaman tersebut.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="pt-4">
          <Button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black text-white font-medium rounded-lg transition-all shadow-lg"
            disabled={selectedStartTime === "-" || !selectedEndTime}
          >
            {isAdminBooking 
              ? `Buat Booking (${paymentStatus === PaymentStatus.PAID ? 'Lunas' : 'DP'})`
              : "Booking & Bayar Sekarang"}
          </Button>

          {isAdminBooking && (
            <div className="mt-3 text-sm text-center text-gray-600">
              Status: <span className="font-medium">{paymentStatus === PaymentStatus.PAID ? 'LUNAS' : 'DP DIBAYAR'}</span> • 
              Metode: <span className="font-medium">{paymentMethod === PaymentMethod.CASH ? 'TUNAI' : 'ONLINE (MIDTRANS)'}</span>
            </div>
          )}
        </div>
      </form>
      )}
    </div>
  );
} 