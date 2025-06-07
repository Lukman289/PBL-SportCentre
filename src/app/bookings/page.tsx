"use client";

import { useBooking } from "@/hooks/bookings/useBooking.hook";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

// Komponen-komponen terpisah untuk halaman booking
import TimeSlotSelector from "@/components/booking/TimeSlotSelector";
import BookingForm from "@/components/booking/BookingForm";
import useToastHandler from "@/hooks/useToastHandler";
import { CalendarDaysIcon, RefreshCwIcon, InfoIcon, MapPinIcon, CalendarIcon, CheckIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export default function BookingsPage() {
  const { showError, showSuccess } = useToastHandler();
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  // Menggunakan custom hook untuk memisahkan logika state dan efek
  const {
    loading,
    error,
    refreshing,
    refreshAvailability,
    selectedDate,
    selectedBranch,
    branches,
    socketInitialized,
    branchChanged,
    dateValueHandler
  } = useBooking();

  // Efek untuk menampilkan pesan sukses ketika data diperbarui
  useEffect(() => {
    if (socketInitialized) {
      showSuccess("Terhubung ke server real-time untuk pembaruan otomatis ketersediaan lapangan", "Koneksi Sukses");
    }
  }, [socketInitialized, showSuccess]);

  // Render states
  if (loading) {
    return null; // GlobalLoading akan otomatis ditampilkan
  }

  if (error) {
    showError(error, "Gagal memuat data booking");
  }

  // Mendapatkan nama cabang yang dipilih
  const selectedBranchName = branches.find(b => b.id === selectedBranch)?.name || "Cabang";
  
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

  // Main render
  return (
    <div className="w-full max-w-full xl:max-w-none py-8 px-4 sm:px-8 bg-white min-h-screen">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="bg-white border border-gray-200 py-6 px-8 rounded-xl shadow-md">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center text-gray-800">
            <CalendarDaysIcon className="h-8 w-8 mr-3 text-blue-600" />
            Reservasi Lapangan
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Pilih cabang, tanggal, dan waktu yang tersedia untuk booking lapangan olahraga.
            Sistem akan menampilkan ketersediaan lapangan secara real-time.
          </p>
          
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Pemilih Cabang */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pilih Cabang
              </label>
              <Select 
                value={selectedBranch?.toString() || ""} 
                onValueChange={handleBranchChange}
              >
                <SelectTrigger className="w-full">
                  <div className="flex items-center">
                    <MapPinIcon className="mr-2 h-4 w-4 text-gray-500" />
                    <SelectValue placeholder="Pilih Cabang" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
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

            {/* Pemilih Tanggal */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pilih Tanggal
              </label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal border-gray-300 text-gray-700"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                    {selectedDate
                      ? format(new Date(selectedDate), "EEEE, dd MMMM yyyy", { locale: id })
                      : "Pilih Tanggal"}
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
            </div>

            {/* Tombol Refresh */}
            <div className="relative flex items-end">
              <Button 
          onClick={refreshAvailability}
          disabled={refreshing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {refreshing ? (
            <>
                    <RefreshCwIcon className="animate-spin h-4 w-4 mr-2" />
                    <span>Memperbarui Data...</span>
            </>
          ) : (
            <>
                    <RefreshCwIcon className="h-4 w-4 mr-2" />
              <span>Perbarui Ketersediaan</span>
            </>
          )}
              </Button>
            </div>
      </div>

          {/* Informasi yang dipilih */}
          {selectedBranch && selectedDate && (
            <div className="mt-4 px-4 py-3 bg-blue-50 rounded-lg border border-blue-100 flex flex-wrap items-center gap-3">
              <div className="flex items-center text-blue-800">
                <MapPinIcon className="h-4 w-4 mr-1 text-blue-500" />
                <span className="text-sm font-medium">{selectedBranchName}</span>
              </div>
              <div className="w-1 h-4 bg-blue-200 rounded-full mx-1"></div>
              <div className="flex items-center text-blue-800">
                <CalendarIcon className="h-4 w-4 mr-1 text-blue-500" />
                <span className="text-sm font-medium">{formattedDate}</span>
              </div>
              <div className="ml-auto flex items-center text-green-700 bg-green-50 px-2 py-1 rounded-full text-xs">
                <CheckIcon className="h-3 w-3 mr-1" />
                <span>Pemilihan siap</span>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid gap-8 md:grid-cols-3">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="md:col-span-2"
        >
          <Card className="shadow-md overflow-hidden border-gray-200">
            <CardContent className="p-0">
              <TimeSlotSelector />
            </CardContent>
          </Card>
          
          <div className="mt-4 rounded-lg bg-gray-50 border border-gray-200 p-4 flex items-start shadow-sm">
            <InfoIcon className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">Keterangan Status Lapangan:</p>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
                <li className="flex items-center">
                  <div className="w-4 h-4 bg-green-100 border border-green-400 rounded-sm mr-2"></div>
                  <span>Tersedia</span>
                </li>
                <li className="flex items-center">
                  <div className="w-4 h-4 bg-red-100 border border-red-400 rounded-sm mr-2"></div>
                  <span>Terpesan</span>
                </li>
                <li className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-100 border border-yellow-400 rounded-sm mr-2"></div>
                  <span>Maintenance</span>
                </li>
                <li className="flex items-center">
                  <div className="w-4 h-4 bg-black rounded-sm mr-2"></div>
                  <span>Dipilih</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="sticky top-4">
          <BookingForm />
        </div>
        </motion.div>
      </div>
    </div>
  );
}
