"use client";

import { useAdminBooking } from "@/hooks/bookings/useAdminBooking.hook";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

// Komponen-komponen terpisah untuk halaman booking
import TimeSlotSelector from "@/components/booking/TimeSlotSelector";
import BookingForm from "@/components/booking/BookingForm";
import useToastHandler from "@/hooks/useToastHandler";
import { RefreshCwIcon, InfoIcon, MapPinIcon, CalendarIcon, CheckIcon, UserIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useMobileLayout } from "@/hooks/useMobileLayout";
import { PaymentMethod, PaymentStatus, Role } from "@/types";
import useAuth from "@/hooks/useAuth.hook";
import { hasAuthCookie } from "@/utils/cookie.utils";

export default function AdminBookingPage() {
  // Mengaktifkan bottom navigation di halaman ini
  useMobileLayout({
    includePaths: ['/dashboard/bookings/create']
  });
  
  const { user: currentUser } = useAuth();
  const { showSuccess, showError } = useToastHandler();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [branchSearchOpen, setBranchSearchOpen] = useState(false);
  const [socketNotificationShown, setSocketNotificationShown] = useState(false);
  const [paymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [paymentStatus] = useState<PaymentStatus>(PaymentStatus.PAID);
  
  // Menggunakan custom hook untuk admin booking
  const {
    loading,
    error: bookingError,
    refreshing,
    refreshAvailability,
    selectedDate,
    selectedBranch,
    branches,
    socketInitialized,
    branchChanged,
    dateValueHandler
  } = useAdminBooking();

  // Efek untuk menampilkan pesan sukses ketika data diperbarui
  useEffect(() => {
    if (socketInitialized && !socketNotificationShown) {
      showSuccess("Terhubung ke server real-time untuk pembaruan otomatis ketersediaan lapangan", "Koneksi Sukses");
      setSocketNotificationShown(true);
    }
  }, [socketInitialized, showSuccess, socketNotificationShown]);

  // Verifikasi autentikasi
  useEffect(() => {
    if (!hasAuthCookie() || !currentUser) {
      showError("Anda harus login untuk mengakses halaman ini", "Akses Ditolak");
    }
  }, [currentUser]);

  // Render states
  if (loading) {
    return null; // GlobalLoading akan otomatis ditampilkan
  }

  if (!currentUser) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Booking Manual Admin</h1>
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
          <p>Anda harus login sebagai admin untuk mengakses halaman ini</p>
        </div>
      </div>
    );
  }

  if (bookingError) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Booking Manual Admin</h1>
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
          <p>{bookingError}</p>
        </div>
        <Button onClick={refreshAvailability}>Coba Lagi</Button>
      </div>
    );
  }

  // Filter cabang berdasarkan admin yang login
  const adminBranches = branches.filter(branch => {
    // Jika super admin, tampilkan semua cabang
    if (currentUser?.role === Role.SUPER_ADMIN) {
      return true;
    }
    
    // Jika admin cabang, tampilkan hanya cabang yang dikelola
    if (currentUser?.role === Role.ADMIN_CABANG && currentUser.branches) {
      return currentUser.branches.some(adminBranch => adminBranch.branchId === branch.id);
    }
    
    return false;
  });

  // Mendapatkan nama cabang yang dipilih
  const selectedBranchName = adminBranches.find(b => b.id === selectedBranch)?.name || "Cabang";
  const selectedBranchLocation = adminBranches.find(b => b.id === selectedBranch)?.location;
  
  // Format tanggal untuk tampilan
  const formattedDate = selectedDate ? 
    format(new Date(selectedDate), "EEEE, dd MMMM yyyy", { locale: id }) : 
    "Pilih Tanggal";

  // Handler untuk pemilihan cabang
  const handleBranchChange = (branchId: string) => {
    const event = {
      target: {
        value: branchId,
      },
    } as React.ChangeEvent<HTMLSelectElement>;
    branchChanged(event);
    setBranchSearchOpen(false);
  };

  // Handler untuk pemilihan tanggal
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const event = {
        target: {
          value: format(date, "yyyy-MM-dd"),
        },
      } as React.ChangeEvent<HTMLInputElement>;
      dateValueHandler(event);
      setCalendarOpen(false);
    }
  };
  
  // Filter cabang berdasarkan pencarian
  const filteredBranches = adminBranches;
  
  // Animasi variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  // Main render
  return (
    <motion.div 
      className="max-w-[1400px] mx-auto overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div 
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-3"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Booking Manual Admin</h1>
        
        <Button 
          variant="outline" 
          onClick={refreshAvailability}
          disabled={refreshing}
          className="w-full md:w-auto"
        >
          {refreshing ? (
            <>
              <RefreshCwIcon className="animate-spin h-4 w-4 mr-2" />
              <span>Memperbarui Data...</span>
            </>
          ) : (
            <>
              <RefreshCwIcon className="h-4 w-4 mr-2" />
              <span>Muat Ulang</span>
            </>
          )}
        </Button>
      </motion.div>

      {/* Filter Area - Pastikan tidak bisa di-scroll horizontal */}
      <motion.div 
        className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6 w-full overflow-visible"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Informasi Admin */}
        <motion.div className="relative flex-1 w-full" variants={itemVariants}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Admin
          </label>
          <div className="relative">
            <div className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md flex items-center text-gray-700">
              <UserIcon className="mr-2 h-4 w-4 text-gray-500" />
              <div className="flex flex-col">
                <span className="truncate max-w-[150px] sm:max-w-none">{currentUser.name}</span>
                {currentUser.email && (
                  <span className="text-xs text-muted-foreground truncate max-w-[150px] sm:max-w-none">{currentUser.email}</span>
                )}
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Booking dibuat oleh admin yang sedang login
          </div>
        </motion.div>

        <motion.div className="relative flex-1 w-full" variants={itemVariants}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pilih Cabang
          </label>
          <div className="relative">
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={branchSearchOpen}
              className="w-full justify-between text-left font-normal border-gray-300 text-gray-700 h-10"
              onClick={() => setBranchSearchOpen(!branchSearchOpen)}
              disabled={adminBranches.length <= 1}
            >
              <div className="flex items-center">
                <MapPinIcon className="mr-2 h-4 w-4 text-gray-500" />
                {selectedBranch ? (
                  <div className="flex flex-col">
                    <span className="truncate max-w-[150px] sm:max-w-none">{selectedBranchName}</span>
                    {selectedBranchLocation && (
                      <span className="text-xs text-muted-foreground truncate max-w-[150px] sm:max-w-none">{selectedBranchLocation}</span>
                    )}
                  </div>
                ) : (
                  "Pilih Cabang"
                )}
              </div>
            </Button>
            
            {branchSearchOpen && adminBranches.length > 1 && (
              <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg">
                <div className="max-h-[200px] overflow-auto py-1">
                  {filteredBranches.length === 0 ? (
                    <div className="px-2 py-3 text-center text-sm text-gray-500">
                      Tidak ada cabang ditemukan
                    </div>
                  ) : (
                    filteredBranches.map((branch) => (
                      <div
                        key={branch.id}
                        onClick={() => handleBranchChange(branch.id.toString())}
                        className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                      >
                        <div className="flex items-start">
                          <MapPinIcon className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                          <div>
                            <div>{branch.name}</div>
                            {branch.location && (
                              <div className="text-xs text-gray-500">{branch.location}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          {adminBranches.length <= 1 && (
            <div className="text-xs text-gray-500 mt-1">
              Anda hanya dapat membuat booking untuk cabang tempat Anda bekerja
            </div>
          )}
        </motion.div>

        {/* Pemilih Tanggal */}
        <motion.div className="relative flex-1 w-full" variants={itemVariants}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pilih Tanggal
          </label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal border-gray-300 text-gray-700 h-10"
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                <span className="truncate">
                  {selectedDate
                    ? format(new Date(selectedDate), "EEEE, dd MMMM yyyy", { locale: id })
                    : "Pilih Tanggal"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate ? new Date(selectedDate) : undefined}
                onSelect={handleDateSelect}
                initialFocus
                locale={id}
              />
            </PopoverContent>
          </Popover>
        </motion.div>
      </motion.div>

      {/* Informasi yang dipilih - Pastikan tidak bisa di-scroll horizontal */}
      {selectedBranch && selectedDate && (
        <motion.div 
          className="mb-4 sm:mb-6 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100 flex flex-wrap items-center gap-2 w-full overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center text-blue-800">
            <UserIcon className="h-3 w-3 mr-1 text-blue-500" />
            <span className="text-xs font-medium truncate max-w-[120px] sm:max-w-none">{currentUser.name}</span>
          </div>
          <div className="w-1 h-3 bg-blue-200 rounded-full mx-1"></div>
          <div className="flex items-center text-blue-800">
            <MapPinIcon className="h-3 w-3 mr-1 text-blue-500" />
            <span className="text-xs font-medium truncate max-w-[120px] sm:max-w-none">{selectedBranchName}</span>
          </div>
          <div className="w-1 h-3 bg-blue-200 rounded-full mx-1"></div>
          <div className="flex items-center text-blue-800">
            <CalendarIcon className="h-3 w-3 mr-1 text-blue-500" />
            <span className="text-xs font-medium truncate max-w-[150px] sm:max-w-none">{formattedDate}</span>
          </div>
          <div className="ml-auto flex items-center text-green-700 bg-green-50 px-2 py-1 rounded-full text-xs">
            <CheckIcon className="h-3 w-3 mr-1" />
            <span>Ready</span>
          </div>
        </motion.div>
      )}

      {/* Konten Utama - TimeSlotSelector dan BookingForm */}
      <div className="w-full">
        {/* Layout untuk mobile (stack) dan desktop (side-by-side) */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* TimeSlotSelector - Area Kiri */}
          <motion.div 
            className="w-full lg:w-2/3 overflow-hidden"
            variants={itemVariants}
          >
            <Card className="shadow-md border-gray-200 rounded-lg overflow-hidden">
              <CardContent className="p-0">
                <TimeSlotSelector />
              </CardContent>
            </Card>
            
            <motion.div 
              className="mt-3 sm:mt-4 rounded-lg bg-gray-50 border border-gray-200 p-3 sm:p-4 flex items-start shadow-sm"
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <InfoIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-gray-700">
                <p className="font-medium mb-1 sm:mb-2">Keterangan Status Lapangan:</p>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-1 sm:gap-y-2">
                  <li className="flex items-center">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-100 border border-green-400 rounded-sm mr-1 sm:mr-2"></div>
                    <span>Tersedia</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-100 border border-red-400 rounded-sm mr-1 sm:mr-2"></div>
                    <span>Terpesan</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-100 border border-yellow-400 rounded-sm mr-1 sm:mr-2"></div>
                    <span>Maintenance</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-black rounded-sm mr-1 sm:mr-2"></div>
                    <span>Dipilih</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </motion.div>

          {/* BookingForm - Area Kanan */}
          <motion.div 
            className="w-full lg:w-1/3"
            variants={itemVariants}
          >
            <div className="lg:sticky lg:top-4">
              <BookingForm 
                isAdminBooking={true}
                selectedUser={currentUser}
                initialPaymentMethod={paymentMethod}
                initialPaymentStatus={paymentStatus}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
