"use client";

import { useTimeSlot } from "@/hooks/useTimeSlot.hook";
import { useBooking } from "@/hooks/bookings/useBooking.hook";
import { CalendarIcon, CheckIcon, XIcon, ClockIcon, AlertTriangleIcon, ChevronRightIcon } from "lucide-react";
import { Field } from "@/types";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  formatDateShort, 
  TIMEZONE, 
  formatTimeRange
} from "@/utils/timezone.utils";
import { useEffect } from "react";

/**
 * Time Slot Selector Component
 * 
 * CATATAN PENTING TENTANG TIME SLOTS:
 * - Semua endTime bersifat exclusive (tidak termasuk dalam booking)
 * - Contoh: booking 08:00-10:00 berarti dari jam 08:00 sampai 09:59:59
 * - Dalam tampilan UI, slot 08:00 dan 09:00 akan ditampilkan sebagai "Terpesan"
 * - Slot 10:00 akan tersedia untuk booking berikutnya
 * - Ini penting agar tidak terjadi overlap booking
 */

export default function TimeSlotSelector() {
  // Menggunakan custom hook untuk memisahkan logika
  const {
    filteredFields,
    getTimeSlotStatus,
    isTimeSlotDisabled,
    handleTimeClick,
    selectedStartTime,
    selectedEndTime,
    selectedFieldId
  } = useTimeSlot();
  
  // Mengambil selectedDate dan selectedBranch dari useBooking hook
  const { selectedDate, selectedBranch, bookedTimeSlots } = useBooking();
  
  // Log untuk debugging
  useEffect(() => {
  }, [selectedBranch, filteredFields, bookedTimeSlots]);
  
  // Membuat array untuk jam dari 08:00 sampai 23:00
  const timeSlots = Array.from({ length: 16 }, (_, i) => 
    `${(i + 8).toString().padStart(2, '0')}:00`
  );
  
  // Format tanggal untuk header menggunakan timezone.utils
  const formattedDate = selectedDate ? 
    formatDateShort(new Date(selectedDate)) : 
    "Pilih Tanggal";
  
  // Fungsi untuk memeriksa apakah slot waktu berada dalam rentang yang dipilih
  const isInSelectedRange = (field: Field, time: string): boolean => {
    if (selectedFieldId !== field.id || !selectedStartTime || !selectedEndTime) return false;
    
    const timeIndex = timeSlots.indexOf(time);
    const startIndex = timeSlots.indexOf(selectedStartTime);
    const endIndex = timeSlots.indexOf(selectedEndTime);
    
    return timeIndex > startIndex && timeIndex < endIndex;
  };
  
  // Handler khusus untuk mengimplementasikan logika pemilihan waktu yang fleksibel
  const handleTimeSlotClick = (time: string, field: Field): void => {
    if (isTimeSlotDisabled(field, time)) return;
    
    // Panggil handleTimeClick langsung untuk menangani pemilihan waktu
    handleTimeClick(time, field);
  };
  
  // Mendapatkan tooltip text berdasarkan status
  const getTooltipText = (field: Field, time: string): string => {
    const status = getTimeSlotStatus(field, time);
    
    // Format rentang waktu untuk menampilkan waktu mulai dan selesai
    const displayTimeRange = (start: string, end: string): string => {
      if (!selectedDate) return "";
      
      // Gunakan formatTimeRange dari timezone.utils untuk waktu yang sederhana
      return formatTimeRange(start, end);
    };
    
    if (selectedFieldId === field.id && selectedStartTime === time) {
      return `Waktu Mulai: ${time}`;
    }
    
    if (selectedFieldId === field.id && selectedEndTime === time) {
      return `Waktu Selesai: ${time}`;
    }
    
    if (isInSelectedRange(field, time)) {
      if (selectedStartTime && selectedEndTime) {
        return `Dalam Rentang: ${displayTimeRange(selectedStartTime, selectedEndTime)}`;
      }
      return `Dalam Rentang Booking: ${time}`;
    }
    
    switch (status) {
      case "Tersedia":
        return `Tersedia untuk booking: ${time}`;
      case "Terpesan":
        return `Sudah terpesan: ${time}`;
      case "Maintenance":
        return `Dalam maintenance: ${time}`;
      default:
        return `Status: ${status} - ${time}`;
    }
  };
  
  
  if (filteredFields.length === 0) {
    return (
      <div className="col-span-full py-6 sm:py-10 text-center bg-red-50 rounded-lg border border-red-100 shadow-md">
        <AlertTriangleIcon className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-2 sm:mb-3 text-red-400" />
        <p className="text-red-500 font-semibold text-base sm:text-lg">Cabang Belum Memiliki Lapangan</p>
        <p className="text-red-400 text-xs sm:text-sm mt-1">Silakan pilih cabang lain atau hubungi admin</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header dengan informasi tanggal - fixed, tidak bisa di-scroll */}
      <div className="bg-blue-600 text-white p-3 sm:p-4 flex items-center justify-between w-full">
        <div className="flex items-center">
          <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
          <span className="font-medium text-sm sm:text-base">{formattedDate}</span>
        </div>
        <div className="flex items-center bg-blue-500/50 px-2 py-1 rounded text-xs sm:text-sm">
          <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
          <span>Jadwal ({TIMEZONE})</span>
        </div>
      </div>
      
      {/* Tabel dengan kolom kiri tetap dan area timeslot yang bisa di-scroll */}
      <div className="w-full relative">
        {/* Tabel dengan struktur baru untuk mobile dan desktop */}
        <div className="flex w-full">
          {/* Kolom nama lapangan yang tetap (sticky) */}
          <div className="min-w-[100px] sm:min-w-[150px] w-[100px] sm:w-[150px] flex-shrink-0">
            {/* Header kolom lapangan */}
            <div className="h-[42px] sm:h-[48px] border-b border-r border-gray-200 bg-gray-50 flex items-center justify-start p-2 sm:p-3 font-medium text-xs sm:text-sm">
              Lapangan
            </div>
            
            {/* Daftar nama lapangan */}
            {filteredFields.map((field) => (
              <div 
                key={`field-name-${field.id}`} 
                className={`h-[40px] sm:h-[45px] border-b border-r border-gray-200 flex items-center p-2 sm:p-3 text-xs sm:text-sm font-medium text-gray-800 ${
                  field.name.includes("Sepak Bola Mini A") ? "bg-blue-50 font-semibold" : "bg-gray-50"
                }`}
              >
                <div className="truncate" title={field.name}>
                  {field.name}
                </div>
              </div>
            ))}
          </div>
          
          {/* Area scroll untuk timeslot */}
          <div className="overflow-x-auto flex-grow scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <div className="w-full" style={{ minWidth: "800px" }}>
              {/* Header jam */}
              <div className="flex border-b border-gray-200 w-full">
                {timeSlots.map((time, index) => (
                  <div 
                    key={index} 
                    className="flex-1 p-1 sm:p-2 text-center font-medium text-xs sm:text-sm text-gray-700 bg-gray-200 h-[42px] sm:h-[48px] flex items-center justify-center"
                  >
                    {time}
                  </div>
                ))}
              </div>
              
              {/* Baris untuk setiap lapangan */}
              {filteredFields.map((field) => (
                <div key={field.id} className="flex w-full">
                  {timeSlots.map((time, index) => {
                    const status = getTimeSlotStatus(field, time);
                    const isDisabled = isTimeSlotDisabled(field, time);
                    const isInRange = isInSelectedRange(field, time);
                    
                    let cellClass = "";
                    let content = null;
                    
                    if (selectedFieldId === field.id && selectedStartTime === time) {
                      cellClass = "bg-black text-white";
                      content = <div className="text-[9px] sm:text-xs font-bold">Mulai</div>;
                    } else if (selectedFieldId === field.id && selectedEndTime === time) {
                      cellClass = "bg-black text-white";
                      content = <div className="text-[9px] sm:text-xs font-bold">Selesai</div>;
                    } else if (isInRange) {
                      cellClass = "bg-gray-800 text-white";
                      content = <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white mx-auto"></div>;
                    } else if (status === "Terpesan") {
                      cellClass = "bg-red-100 text-red-700 border border-red-200";
                      content = <XIcon className="h-3 w-3 sm:h-4 sm:w-4 mx-auto" />;
                    } else if (status === "Maintenance") {
                      cellClass = "bg-yellow-100 text-yellow-700 border border-yellow-200";
                      content = <AlertTriangleIcon className="h-3 w-3 sm:h-4 sm:w-4 mx-auto" />;
                    } else if (status === "Tersedia") {
                      cellClass = "bg-green-100 text-green-700 border border-green-200";
                      content = <CheckIcon className="h-3 w-3 sm:h-4 sm:w-4 mx-auto" />;
                    } else {
                      cellClass = "bg-gray-100 text-gray-600";
                      content = <XIcon className="h-3 w-3 sm:h-4 sm:w-4 mx-auto" />;
                    }
                    
                    return (
                      <Tooltip key={index} delayDuration={300}>
                        <TooltipTrigger asChild>
                          <div 
                            className={`flex-1 border-b border-r border-gray-200 h-[40px] sm:h-[45px] ${cellClass} ${
                              isDisabled 
                              ? 'cursor-not-allowed opacity-80' 
                              : 'cursor-pointer hover:opacity-90 active:scale-95'
                            } flex items-center justify-center transition-all duration-150`}
                            onClick={() => !isDisabled && handleTimeSlotClick(time, field)}
                          >
                            <motion.div
                              whileHover={!isDisabled ? { scale: 1.05 } : {}}
                              whileTap={!isDisabled ? { scale: 0.95 } : {}}
                              className="h-full w-full flex items-center justify-center"
                            >
                              {content}
                            </motion.div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs sm:text-sm">
                          {getTooltipText(field, time)}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Petunjuk scrolling - tampilkan di semua perangkat dengan animasi */}
      <div className="p-1.5 sm:p-2 bg-gray-50 text-center border-t border-gray-200 text-xs sm:text-sm text-gray-500 flex items-center justify-center">
        <span className="flex items-center">
          <span className="mr-1 sm:mr-2">Geser ke kanan</span>
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ChevronRightIcon className="h-3 w-3 sm:h-4 sm:w-4" />
          </motion.div>
        </span>
      </div>
    </div>
  );
} 