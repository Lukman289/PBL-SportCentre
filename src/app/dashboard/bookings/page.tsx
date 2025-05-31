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
import { useEffect, useMemo, useState } from "react";
import useGlobalLoading from "@/hooks/useGlobalLoading.hook";

export default function BookingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { showLoading, hideLoading } = useGlobalLoading();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const maxData = 10;
  
  const defaultBranchId = useMemo(() => {
    if (user?.role === Role.ADMIN_CABANG && user.branches && user.branches.length > 0) {
      return user.branches[0].branchId;
    }
    return undefined;
  }, [user]);

  const { filters, handleFilterChange } = useBookingFilters(defaultBranchId);
  
  const { bookings, branches, loading, showBranchFilter, meta } = useBookingData(
    { 
      user, 
      filters,
    },
    maxData,
    currentPage,
  );

  useEffect(() => {
    setCurrentPage(1);
    console.log("Filters updated in page.tsx", filters);
    console.log("currentPage :", currentPage);
  }, [filters]);

  useEffect(() => {
    if (meta) {
      setTotalItems(meta.totalItems);
    }
  }, [currentPage, bookings]);

  useEffect(() => {
    if (loading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [loading, showLoading, hideLoading]);
  
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

  // Jika loading, GlobalLoading akan ditampilkan
  if (loading) {
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <PageTitle title="Daftar Booking" />
        
        {user?.role === Role.ADMIN_CABANG && (
          <Link href="/dashboard/bookings/create">
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

      {totalItems > maxData && (
        <div className="flex justify-between items-center gap-4 mt-8">
          <Button 
            variant="outline" 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            Sebelumnya
          </Button>
          <span className="text-sm text-gray-500">
            Halaman {currentPage} dari {Math.ceil(totalItems / maxData)}
          </span>
          <Button 
            variant="outline" 
            disabled={currentPage >= Math.ceil(totalItems / maxData)} 
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Selanjutnya
          </Button>
        </div>
      )}
    </div>
  );
} 