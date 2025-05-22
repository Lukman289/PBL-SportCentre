"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth/auth.context";
import BookingsTable from "@/components/dashboard/tables/BookingsTable";
import BookingFilters from "@/components/dashboard/filters/BookingFilters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { Booking, Role } from "@/types";
import { bookingApi } from "@/api/booking.api";
import PageTitle from "@/components/common/PageTitle";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function BookingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
    search: "",
  });

  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true);
      try {
        console.log("Loading bookings for user role:", user?.role);
        
        if (user?.role === Role.SUPER_ADMIN) {
          // Admin dapat melihat semua booking
          const data = await bookingApi.getAllBookings();
          console.log("Admin bookings loaded:", data);
          setBookings(data);
        } else if (user?.role === Role.ADMIN_CABANG) {
          // Cek apakah ada branches dari user
          if (user.branches && user.branches.length > 0) {
            const branchId = user.branches[0].branchId;
            console.log("Loading branch bookings for branch ID:", branchId);
            const data = await bookingApi.getBranchBookings(branchId);
            console.log("Branch bookings loaded:", data);
            setBookings(data);
          } else {
            // Jika tidak ada branches, coba untuk mengambil dari API
            try {
              const { userApi } = await import('@/api/user.api');
              console.log("Fetching branch data for admin...");
              const branches = await userApi.getBranchesForAdmin(user.id);
              
              if (branches && branches.length > 0) {
                const branchId = branches[0].branchId;
                console.log("Got branch ID from API:", branchId);
                const data = await bookingApi.getBranchBookings(branchId);
                console.log("Branch bookings loaded:", data);
                setBookings(data);
              } else {
                console.error("Admin cabang tidak memiliki branches:", user);
                toast({
                  title: "Terjadi kesalahan",
                  description: "Admin cabang tidak terhubung dengan cabang manapun",
                  variant: "destructive",
                });
              }
            } catch (branchError) {
              console.error("Error fetching branch data:", branchError);
              toast({
                title: "Terjadi kesalahan",
                description: "Gagal mendapatkan data cabang",
                variant: "destructive",
              });
            }
          }
        } else if (user?.role === Role.USER && user.id) {
          // User hanya melihat booking miliknya
          console.log("Loading user bookings for user ID:", user.id);
          const data = await bookingApi.getUserBookings(user.id);
          console.log("User bookings loaded:", data);
          setBookings(data);
        } else {
          console.log("No valid role or required ID found:", user);
        }
      } catch (error) {
        console.error("Error loading bookings:", error);
        toast({
          title: "Gagal memuat data booking",
          description: "Terjadi kesalahan saat memuat data booking",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadBookings();
    }
  }, [user, filters, toast]);

  const handleFilterChange = (newFilters: {
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) => {
    setFilters({ ...filters, ...newFilters });
  };

  const getCreateButtonLink = () => {
    if (user?.role === Role.ADMIN_CABANG && user.branches && user.branches.length > 0) {
      return `/dashboard/branches/${user.branches[0].branchId}/bookings/create`;
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

      <BookingFilters onFilterChange={handleFilterChange} />

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