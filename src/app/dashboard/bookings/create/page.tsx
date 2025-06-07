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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const handleBranchChange = (branchId: string) => {
    setSelectedBranchId(Number(branchId));
    setSelectedBranch(Number(branchId));
  };

  // Handler untuk ketika booking berhasil dibuat
  const handleBookingSuccess = (paymentMethod?: PaymentMethod) => {
    if (paymentMethod === PaymentMethod.CASH) {
      showSuccess(`Booking manual telah berhasil dibuat dengan metode pembayaran tunai (cash).`);
    } else {
      showSuccess(`Booking manual telah berhasil dibuat dengan metode pembayaran online (Midtrans). Halaman pembayaran akan terbuka dalam tab baru.`);
    }
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
    <div className="w-full max-w-full xl:max-w-none p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Branch selector (jika admin mengelola lebih dari 1 cabang) */}
      {assignedBranches.length > 1 && (
        <div className="mb-6 bg-white p-4 rounded-lg shadow-md border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pilih Cabang yang Dikelola:
          </label>
          <Select
            value={selectedBranchId?.toString() || ""}
            onValueChange={handleBranchChange}
          >
            <SelectTrigger className="w-full sm:w-[300px] flex items-center">
              <MapPinIcon className="h-4 w-4 mr-2 opacity-70" />
              <SelectValue placeholder="Pilih cabang" />
            </SelectTrigger>
            <SelectContent>
              {assignedBranches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id.toString()}>
                  <div className="flex flex-col">
                    <span>{branch.name}</span>
                    {branch.location && (
                      <span className="text-xs text-muted-foreground">{branch.location}</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <TimeSlotSelector />
        </div>
        
        <div className="md:col-span-1">
          <div className="sticky top-4">
            <BookingForm isAdminBooking={true} onSuccess={handleBookingSuccess} />
          </div>
        </div>
      </div>
    </div>
  );
} 