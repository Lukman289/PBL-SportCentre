"use client";

import { useAuth } from "@/context/auth/auth.context";
import BookingsTable from "@/components/dashboard/tables/BookingsTable";
import BookingFilters from "@/components/dashboard/filters/BookingFilters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Role } from "@/types";
import PageTitle from "@/components/common/PageTitle";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useBookingFilters } from "@/hooks/useBookingFilters.hook";
import { useBookingData } from "@/hooks/useBookingData.hook";

export default function BookingsPage() {
  const { user } = useAuth();
  const { filters, handleFilterChange } = useBookingFilters();
  const { bookings, branches, loading, showBranchFilter } = useBookingData({ 
    user, 
    filters 
  });

  const getCreateButtonLink = () => {
    if (user?.role === Role.ADMIN_CABANG && user.branches && user.branches.length > 0) {
      return `/dashboard/bookings/create`;
    }
    return "#";
  };

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
      />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : (
        <BookingsTable bookings={bookings} userRole={user?.role} />
      )}
    </div>
  );
} 