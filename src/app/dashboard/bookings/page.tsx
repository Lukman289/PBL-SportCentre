"use client";

import { useAuth } from "@/context/auth/auth.context";
import BookingsTable from "@/components/dashboard/tables/BookingsTable";
import BookingCalendar from "@/components/dashboard/tables/BookingCalendar";
import BookingFilters from "@/components/dashboard/filters/BookingFilters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar, Clock, CheckCircle, XCircle, TrendingUp, Table } from "lucide-react";
import Link from "next/link";
import { Role } from "@/types";
import { PaymentStatus } from "@/types/booking.types";
import PageTitle from "@/components/common/PageTitle";
import { useBookingFilters } from "@/hooks/bookings/useBookingFilters.hook";
import { useBookingData } from "@/hooks/bookings/useBookingData.hook";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useMemo, useState } from "react";
import useGlobalLoading from "@/hooks/useGlobalLoading.hook";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BookingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { showLoading, hideLoading } = useGlobalLoading();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");
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
    viewMode === "calendar" ? 100 : maxData,
    currentPage,
  );

  useEffect(() => {
    setCurrentPage(1);
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

  // Menghitung statistik booking
  const bookingStats = useMemo(() => {
    if (!bookings || bookings.length === 0) {
      return {
        total: 0,
        paid: 0,
        pending: 0,
        failed: 0,
        todayCount: 0
      };
    }

    const today = new Date().toISOString().split('T')[0];
    
    return bookings.reduce((stats, booking) => {
      // Total booking
      stats.total++;
      
      // Status pembayaran
      if (booking.payment?.status === PaymentStatus.PAID) {
        stats.paid++;
      } else if (booking.payment?.status === PaymentStatus.PENDING) {
        stats.pending++;
      } else if (booking.payment?.status === PaymentStatus.FAILED) {
        stats.failed++;
      }
      
      // Booking hari ini
      const bookingDate = new Date(booking.bookingDate).toISOString().split('T')[0];
      if (bookingDate === today) {
        stats.todayCount++;
      }
      
      return stats;
    }, { total: 0, paid: 0, pending: 0, failed: 0, todayCount: 0 });
  }, [bookings]);

  // Debugging
  useEffect(() => {
    if (bookings && bookings.length > 0) {
      console.log("Bookings data available:", bookings.length);
      console.log("Sample booking:", bookings[0]);
    } else {
      console.log("No bookings data available");
    }
  }, [bookings]);

  // Jika loading, GlobalLoading akan ditampilkan
  if (loading) {
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <PageTitle title="Daftar Booking" />
        
        {user?.role === Role.ADMIN_CABANG && (
          <Link href="/dashboard/bookings/create">
            <Button variant="default" className="flex items-center gap-2">
              <Plus size={16} /> Tambah Booking Manual
            </Button>
          </Link>
        )}
      </div>

      {/* Statistik Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Total Booking
            </CardTitle>
            <CardDescription>Jumlah seluruh booking</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-700">{bookingStats.total}</p>
            <p className="text-sm text-blue-600 mt-1">Dari total {totalItems} booking</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Booking Lunas
            </CardTitle>
            <CardDescription>Booking yang sudah dibayar</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-700">{bookingStats.paid}</p>
            <p className="text-sm text-green-600 mt-1">{bookingStats.total > 0 ? Math.round((bookingStats.paid / bookingStats.total) * 100) : 0}% dari total booking</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              Menunggu Pembayaran
            </CardTitle>
            <CardDescription>Booking yang belum dibayar</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-700">{bookingStats.pending}</p>
            <p className="text-sm text-yellow-600 mt-1">{bookingStats.total > 0 ? Math.round((bookingStats.pending / bookingStats.total) * 100) : 0}% dari total booking</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Pembayaran Gagal
            </CardTitle>
            <CardDescription>Booking dengan pembayaran gagal</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-700">{bookingStats.failed}</p>
            <p className="text-sm text-red-600 mt-1">{bookingStats.total > 0 ? Math.round((bookingStats.failed / bookingStats.total) * 100) : 0}% dari total booking</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Section */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Filter Booking
          </CardTitle>
          <CardDescription>Gunakan filter untuk mencari booking tertentu</CardDescription>
        </CardHeader>
        <CardContent>
          <BookingFilters 
            onFilterChange={handleFilterChange} 
            branches={branches}
            showBranchFilter={showBranchFilter}
            initialBranchId={defaultBranchId}
          />
        </CardContent>
      </Card>

      {/* Table/Calendar Section */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <CardTitle className="text-lg">Data Booking</CardTitle>
              <CardDescription>
                Menampilkan {bookings.length} dari {totalItems} booking
              </CardDescription>
            </div>
            
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "table" | "calendar")}>
              <TabsList>
                <TabsTrigger value="table" className="flex items-center gap-2">
                  <Table className="h-4 w-4" />
                  <span className="hidden sm:inline">Tabel</span>
                </TabsTrigger>
                <TabsTrigger value="calendar" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Kalender</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "table" ? (
            <>
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
            </>
          ) : (
            <BookingCalendar bookings={bookings} userRole={user?.role} />
          )}
        </CardContent>
      </Card>
    </div>
  );
} 