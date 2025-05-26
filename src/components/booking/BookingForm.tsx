"use client";

import { Button } from "@/components/ui/button";
import { useBookingContext } from "@/context/booking/booking.context";
import { useAdminBooking } from "@/hooks/useAdminBooking.hook";
import { useDurationCalculator } from "@/hooks/useDurationCalculator.hook";
import { PaymentMethod, PaymentStatus } from "@/types";
import { BookingFormValues } from "@/context/booking/booking.context";

interface BookingFormProps {
  isAdminBooking?: boolean;
  onSuccess?: () => void;
}

export default function BookingForm({ isAdminBooking = false, onSuccess }: BookingFormProps) {
  // Menggunakan hook context sesuai dengan jenis user
  const regularBooking = useBookingContext();
  const adminBooking = useAdminBooking();
  
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
      // Untuk admin cabang, gunakan createManualBooking dengan status PAID dan metode CASH
      try {
        console.log("Data yang akan dikirim:", {
          fieldId: selectedField,
          userId: adminBooking.user?.id || 0,
          bookingDate: selectedDate,
          startTime: selectedStartTime,
          endTime: selectedEndTime
        });
        
        const bookingData = {
          fieldId: selectedField,
          userId: adminBooking.user?.id || 0,
          bookingDate: selectedDate,
          startTime: selectedStartTime,
          endTime: selectedEndTime,
          paymentStatus: PaymentStatus.PAID,
          paymentMethod: PaymentMethod.CASH,
          branchId: adminBooking.selectedBranch
        };
        
        console.log("Mengirim data booking manual:", bookingData);
        
        const result = await adminBooking.createManualBooking(bookingData);
        if (result) {
          console.log("Booking manual berhasil dibuat:", result);
          if (onSuccess) {
            onSuccess();
          }
        }
      } catch (error) {
        console.error("Error saat membuat manual booking:", error);
      }
    } else {
      await onSubmit(data);
      if (onSuccess) {
        onSuccess();
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white shadow rounded-lg p-6 border border-gray-200">
      <h2 className="text-xl font-bold text-center mb-6">
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
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Lapangan:</span>
            <span className="font-medium">{selectedFieldName === "Lapangan" ? "-" : selectedFieldName}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Cabang:</span>
            <span className="font-medium">{selectedBranchName === "Cabang" ? "-" : selectedBranchName}</span>
          </div>
          
          <hr className="my-2" />
          
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
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-gray-700"
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
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-gray-700"
              />
            </div>
          </div>
        </div>

        {selectedStartTime !== "-" && selectedEndTime && (
          <div className="border border-gray-200 rounded p-3 bg-gray-50 text-center">
            <p className="text-sm text-gray-600 mb-1">Durasi Booking:</p>
            <p className="font-medium">
              {formattedStartTime} - {formattedEndTime}
              <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                {durationInHours} jam
              </span>
            </p>
          </div>
        )}

        <div className="pt-2">
          <Button
            type="submit"
            className="w-full py-3 bg-black hover:bg-black/90 text-white font-medium rounded transition-all"
            disabled={selectedStartTime === "-" || !selectedEndTime}
          >
            {isAdminBooking ? "Buat Booking Manual" : "Booking & Bayar Sekarang"}
          </Button>
        </div>
      </form>
      )}
    </div>
  );
} 