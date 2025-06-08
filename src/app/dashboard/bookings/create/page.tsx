"use client";

import { useAdminBooking } from "@/hooks/bookings/useAdminBooking.hook";
import { useAuth } from "@/context/auth/auth.context";
import { useEffect, useState } from "react";
import useGlobalLoading from "@/hooks/useGlobalLoading.hook";

// Komponen-komponen terpisah untuk halaman booking
import TimeSlotSelector from "@/components/booking/TimeSlotSelector";
import BookingForm from "@/components/booking/BookingForm";
import useToastHandler from "@/hooks/useToastHandler";
import { Branch, PaymentMethod } from "@/types";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { MapPinIcon } from "lucide-react";

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
    branches,
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
    if (user?.branches && user.branches.length > 0 && branches.length > 0) {
      // Filter cabang yang hanya di-assign ke admin
      const userBranchIds = user.branches.map(branch => branch.branchId);
      
      const adminBranches = branches.filter(branch => userBranchIds.includes(branch.id));
      
      setAssignedBranches(adminBranches);
      
      // Jika belum ada cabang yang dipilih, pilih cabang pertama dari cabang yang di-assign
      if (!selectedBranchId && adminBranches.length > 0) {
        const firstBranchId = adminBranches[0].id;
        setSelectedBranchId(firstBranchId);
        setSelectedBranch(firstBranchId);
      }
    }
  }, [user?.branches, branches, selectedBranchId, setSelectedBranch]);

  // Handler untuk perubahan cabang
  const handleBranchChange = (branchId: string) => {
    const numericBranchId = Number(branchId);
    setSelectedBranchId(numericBranchId);
    setSelectedBranch(numericBranchId);
  };

  // Handler untuk ketika booking berhasil dibuat
  const handleBookingSuccess = (paymentMethod?: PaymentMethod) => {
    if (paymentMethod === PaymentMethod.CASH) {
      showSuccess(`Booking manual telah berhasil dibuat dengan metode pembayaran tunai (cash).`);
    } else {
      showSuccess(`Booking manual telah berhasil dibuat dengan metode pembayaran online (Midtrans). Halaman pembayaran akan terbuka dalam tab baru.`);
    }
  };

  // Konversi cabang menjadi format opsi untuk Combobox
  const branchOptions: ComboboxOption[] = assignedBranches.map((branch) => ({
    value: branch.id.toString(),
    label: branch.name,
    description: branch.location || "",
    icon: <MapPinIcon className="h-4 w-4 opacity-70" />
  }));

  // Render states
  if (loading) {
    return null;
  }

  if (error) {
    showError(error, 'Gagal memuat data cabang');
  }


  // Main render
  return (
    <div className="w-full max-w-full xl:max-w-none p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Branch selector (jika admin mengelola lebih dari 1 cabang) */}
      {assignedBranches.length > 0 && (
        <div className="mb-6 bg-white p-4 rounded-lg shadow-md border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pilih Cabang yang Dikelola:
          </label>
          <Combobox
            options={branchOptions}
            value={selectedBranchId?.toString() || ""}
            onValueChange={handleBranchChange}
            placeholder="Cari dan pilih cabang..."
            emptyMessage="Tidak ada cabang yang ditemukan"
            icon={<MapPinIcon className="h-4 w-4 opacity-70" />}
            triggerClassName="w-full sm:w-[300px]"
          />
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <TimeSlotSelector key={`timeslot-${selectedBranchId}`} />
        </div>
        
        <div className="md:col-span-1">
          <div className="sticky top-4">
            <BookingForm isAdminBooking={true} onSuccess={handleBookingSuccess} key={`bookingform-${selectedBranchId}`} />
          </div>
        </div>
      </div>
    </div>
  );
} 