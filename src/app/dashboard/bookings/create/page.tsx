"use client";

import { useAdminBooking } from "@/hooks/useAdminBooking.hook";
import { useAuth } from "@/context/auth/auth.context";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

// Komponen-komponen terpisah untuk halaman booking
import TimeSlotSelector from "@/components/booking/TimeSlotSelector";
import BookingHeader from "@/components/booking/BookingHeader";
import BookingForm from "@/components/booking/BookingForm";
import LoadingState from "@/components/booking/LoadingState";
import ErrorState from "@/components/booking/ErrorState";
import { Branch } from "@/types";

export default function AdminBookingCreatePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assignedBranches, setAssignedBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | undefined>(undefined);
  
  // Menggunakan custom hook untuk admin cabang dengan branch ID yang dipilih
  const {
    loading,
    error,
    refreshing,
    refreshAvailability,
    setSelectedBranch,
    branches
  } = useAdminBooking(selectedBranchId);

  // Dapatkan daftar cabang yang di-assign ke admin cabang
  useEffect(() => {
    if (user?.branches && user.branches.length > 0) {
      // Filter branches berdasarkan branches yang di-assign ke admin
      const adminBranches = branches.filter(branch => 
        user.branches?.some(userBranch => userBranch.branchId === branch.id)
      );
      
      setAssignedBranches(adminBranches);
      
      // Jika belum ada cabang yang dipilih, pilih cabang pertama
      if (!selectedBranchId && adminBranches.length > 0) {
        setSelectedBranchId(adminBranches[0].id);
        setSelectedBranch(adminBranches[0].id);
      }
    }
  }, [user?.branches, branches, selectedBranchId, setSelectedBranch]);

  // Handler untuk perubahan cabang
  const handleBranchChange = (branchId: number) => {
    setSelectedBranchId(branchId);
    setSelectedBranch(branchId);
  };

  // Handler untuk ketika booking berhasil dibuat
  const handleBookingSuccess = () => {
    toast({
      title: "Booking Berhasil",
      description: "Booking manual telah berhasil dibuat dan dicatat sebagai PAID dengan metode CASH.",
      variant: "default",
      duration: 5000,
    });
  };

  // Render states
  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  // Main render
  return (
    <div className="w-full max-w-full xl:max-w-none py-6 px-4 sm:px-6">
      <div className="mb-6">
        <div className="bg-black py-8 px-6 rounded-t-xl">
          <h1 className="text-3xl sm:text-4xl text-center font-bold text-white mb-2">
            Buat Booking Manual
          </h1>
          <p className="text-gray-300 text-center max-w-xl mx-auto text-sm sm:text-base">
            Pilih cabang, tanggal, dan waktu yang tersedia untuk membuat booking lapangan
          </p>
          <p className="text-gray-400 text-center max-w-xl mx-auto mt-2 text-xs sm:text-sm">
            Booking manual akan otomatis menggunakan status pembayaran PAID dengan metode CASH
          </p>
        </div>
      </div>

      {/* Pemilihan cabang */}
      {assignedBranches.length > 1 && (
        <div className="mb-4">
          <label htmlFor="adminBranch" className="block text-sm font-medium text-gray-700 mb-2">
            Pilih Cabang yang Dikelola:
          </label>
          <select
            id="adminBranch"
            value={selectedBranchId}
            onChange={(e) => handleBranchChange(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {assignedBranches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name} - {branch.location}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 px-2">
        <div className="font-medium text-gray-700 mb-4 sm:mb-0">
          Pilih Tanggal
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
        <BookingHeader hideSelectBranch={true} />
        
        <div className="bg-white p-4 rounded-b-xl shadow">
          <TimeSlotSelector />
        </div>
      </section>

      <section className="flex justify-center">
        <div className="w-full max-w-md">
          <BookingForm isAdminBooking={true} onSuccess={handleBookingSuccess} />
        </div>
      </section>
    </div>
  );
} 