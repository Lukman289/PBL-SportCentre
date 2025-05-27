"use client";

import { useAuth } from "@/context/auth/auth.context";
import BookingsTable from "@/components/dashboard/tables/BookingsTable";
import BookingFilters from "@/components/dashboard/filters/BookingFilters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Role } from "@/types";
import PageTitle from "@/components/common/PageTitle";
import { useBookingFilters } from "@/hooks/bookings/useBookingFilters.hook";
import { useBookingData } from "@/hooks/bookings/useBookingData.hook";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useMemo } from "react";
import useGlobalLoading from "@/hooks/useGlobalLoading.hook";

export default function BookingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { showLoading, hideLoading } = useGlobalLoading();
  
  // Hitung default branchId berdasarkan role user
  const defaultBranchId = useMemo(() => {
    if (user?.role === Role.ADMIN_CABANG && user.branches && user.branches.length > 0) {
      return user.branches[0].branchId;
    }
    return undefined;
  }, [user]);

  // Gunakan defaultBranchId saat inisialisasi filter
  const { filters, handleFilterChange } = useBookingFilters(defaultBranchId);
  
  const { bookings, branches, loading, showBranchFilter } = useBookingData({ 
    user, 
    filters 
  });

  // Mengelola loading state
  useEffect(() => {
    if (loading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [loading, showLoading, hideLoading]);
  
  // Tampilkan toast jika ada booking berhasil dibuat (digunakan saat redirect dari halaman create)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    
    if (success === 'booking-created') {
      toast({
        title: "Booking berhasil dibuat",
        description: "Booking telah berhasil ditambahkan",
        variant: "default",
      });
      
      // Hapus parameter dari URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [toast]);

  const getCreateButtonLink = () => {
    if (user?.role === Role.ADMIN_CABANG && user.branches && user.branches.length > 0) {
      return `/dashboard/bookings/create`;
    }
    return "#";
  };

  // Jika loading, GlobalLoading akan ditampilkan
  if (loading) {
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <PageTitle title="Daftar Booking" />
        
        {user?.role === Role.ADMIN_CABANG && (
          <Link href={getCreateButtonLink()}>
            <Button variant="default" className="flex items-center gap-2">
              <Plus size={16} /> Tambah Booking Manual
            </Button>
          </Link>
        )}
      </div>

      <BookingFilters 
        onFilterChange={handleFilterChange} 
        branches={branches}
        showBranchFilter={showBranchFilter}
        initialBranchId={defaultBranchId}
      />

      <BookingsTable bookings={bookings} userRole={user?.role} />
    </div>
  );
} 