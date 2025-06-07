"use client";

import { useAdminBooking } from "@/hooks/bookings/useAdminBooking.hook";
import { useAuth } from "@/context/auth/auth.context";
import { useEffect, useState } from "react";
import useGlobalLoading from "@/hooks/useGlobalLoading.hook";

// Komponen-komponen terpisah untuk halaman booking
import TimeSlotSelector from "@/components/booking/TimeSlotSelector";
import BookingHeader from "@/components/booking/BookingHeader";
import BookingForm from "@/components/booking/BookingForm";
import useToastHandler from "@/hooks/useToastHandler";
import { Branch, Role } from "@/types";

export default function AdminBookingCreatePage() {
  const { user } = useAuth();
  const { showError, showSuccess } = useToastHandler();
  const [assignedBranches, setAssignedBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | undefined>(undefined);
  const { showLoading, hideLoading } = useGlobalLoading();
  
  // Menggunakan custom hook untuk admin cabang dengan branch ID yang dipilih
  const {
    loading,
    error,
    setSelectedBranch,
    branches
  } = useAdminBooking(selectedBranchId);

  // Mengelola loading state
  useEffect(() => {
    if (loading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [loading, showLoading, hideLoading]);

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
    showSuccess(`Booking manual telah berhasil dibuat dan dicatat sebagai ${user?.role === Role.ADMIN_CABANG ? "PAID" : "UNPAID"} dengan metode CASH.`);
  };

  // Render states
  if (loading) {
    return null;
  }

  if (error) {
    showError(error, 'Gagal memuat data cabang');
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