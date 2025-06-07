"use client";

import { useBooking } from "@/hooks/bookings/useBooking.hook";

// Komponen-komponen terpisah untuk halaman booking
import TimeSlotSelector from "@/components/booking/TimeSlotSelector";
import BookingHeader from "@/components/booking/BookingHeader";
import BookingForm from "@/components/booking/BookingForm";
import useToastHandler from "@/hooks/useToastHandler";

export default function BookingsPage() {
  const { showError } = useToastHandler();
  // Menggunakan custom hook untuk memisahkan logika state dan efek
  const {
    loading,
    error,
    refreshing,
    refreshAvailability
  } = useBooking();

  // Render states
  if (loading) {
    return null; // GlobalLoading akan otomatis ditampilkan
  }

  if (error) {
    showError(error, "Gagal memuat data booking");
  }

  // Main render
  return (
    <div className="w-full max-w-full mt-8 xl:max-w-none py-6 px-4 sm:px-6">
      <div className="mb-6">
        <div className="bg-black py-8 px-6 rounded-t-xl">
          <h1 className="text-3xl sm:text-4xl text-center font-bold text-white mb-2">
            Jadwal Booking Lapangan
          </h1>
          <p className="text-gray-300 text-center max-w-xl mx-auto text-sm sm:text-base">
            Pilih cabang, tanggal, dan waktu yang tersedia untuk melakukan booking lapangan
          </p>
          <p className="text-gray-400 text-center max-w-xl mx-auto mt-2 text-xs sm:text-sm">
            Setelah booking, Anda akan diarahkan ke halaman pembayaran Midtrans untuk menyelesaikan transaksi
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 px-2">
        <div className="font-medium text-gray-700 mb-4 sm:mb-0">
          Pilih Cabang dan Tanggal
        </div>
        <button 
          onClick={refreshAvailability}
          disabled={refreshing}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 transition-colors"
        >
          {refreshing ? (
            <>
              <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Memperbarui...</span>
            </>
          ) : (
            <>
              <svg className="h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Perbarui Ketersediaan</span>
            </>
          )}
        </button>
      </div>

      <section className="mb-8">
        <BookingHeader />
        
        <div className="bg-white p-4 rounded-b-xl shadow">
          <TimeSlotSelector />
        </div>
      </section>

      <section className="flex justify-center">
        <div className="w-full max-w-md">
          <BookingForm />
        </div>
      </section>
    </div>
  );
}
