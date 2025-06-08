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
  
  // Mengambil selectedDate dari useBooking hook
  const { selectedDate } = useBooking();
  
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
      <div className="col-span-full py-10 text-center bg-red-50 rounded-lg border border-red-100 shadow-md">
        <AlertTriangleIcon className="h-16 w-16 mx-auto mb-3 text-red-400" />
        <p className="text-red-500 font-semibold text-lg">Cabang Belum Memiliki Lapangan</p>
        <p className="text-red-400 text-sm mt-1">Silakan pilih cabang lain atau hubungi admin</p>
      </div>
    );
  }

  return (
    <div className="overflow-visible rounded-lg shadow-md border border-gray-200 touch-pan-x">
      {/* Header dengan informasi tanggal */}
      <div className="sticky top-0 left-0 z-20 bg-blue-600 text-white p-3 flex items-center justify-between">
        <div className="flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2" />
          <span className="font-medium">{formattedDate}</span>
        </div>
        <div className="flex items-center bg-blue-500/50 px-2 py-1 rounded text-xs">
          <ClockIcon className="h-3 w-3 mr-1" />
          <span>Jadwal Lapangan ({TIMEZONE})</span>
        </div>
      </div>
      
      <div className="overflow-x-auto scroll-smooth relative" style={{maxWidth: '100%', WebkitOverflowScrolling: 'touch'}}>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="min-w-[160px] w-[160px] border p-2 bg-gray-50 sticky left-0 z-10"></th>
              {timeSlots.map((time, index) => (
                <th
                  key={index}
                  className="min-w-[70px] w-[70px] border p-1 text-center text-[10px] sm:text-xs font-medium bg-gray-200 text-gray-700"
                >
                  {time}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-[12px] sm:text-sm">
            {filteredFields.map((field) => (
              <tr
                key={field.id}
                className={`hover:bg-gray-50/80 transition-colors ${
                  field.name.includes('Sepak Bola Mini A') ? 'bg-gray-50' : ''
                }`}
              >
                <td
                  className={`min-w-[160px] w-[160px] border p-2 sticky left-0 z-10 font-medium text-gray-800 shadow-sm ${
                    field.name.includes('Sepak Bola Mini A') ? 'bg-gray-50 font-semibold' : 'bg-gray-50'
                  }`}
                >
                  <div className="truncate" title={field.name}>
                    {field.name}
                  </div>
                </td>
                {timeSlots.map((time, index) => {
                  const status = getTimeSlotStatus(field, time);
                  const isDisabled = isTimeSlotDisabled(field, time);
                  const isInRange = isInSelectedRange(field, time);

                  let cellClass = '';
                  let content = null;

                  if (selectedFieldId === field.id && selectedStartTime === time) {
                    cellClass = 'bg-black text-white';
                    content = <div className="text-xs font-bold">Mulai</div>;
                  } else if (selectedFieldId === field.id && selectedEndTime === time) {
                    cellClass = 'bg-black text-white';
                    content = <div className="text-xs font-bold">Selesai</div>;
                  } else if (isInRange) {
                    cellClass = 'bg-gray-800 text-white';
                    content = <div className="w-2 h-2 rounded-full bg-white mx-auto"></div>;
                  } else if (status === 'Terpesan') {
                    cellClass = 'bg-red-100 text-red-700 border border-red-200';
                    content = <XIcon className="h-4 w-4 mx-auto" />;
                  } else if (status === 'Maintenance') {
                    cellClass = 'bg-yellow-100 text-yellow-700 border border-yellow-200';
                    content = <AlertTriangleIcon className="h-4 w-4 mx-auto" />;
                  } else if (status === 'Tersedia') {
                    cellClass = 'bg-green-100 text-green-700 border border-green-200';
                    content = <CheckIcon className="h-4 w-4 mx-auto" />;
                  } else {
                    cellClass = 'bg-gray-100 text-gray-600';
                    content = <XIcon className="h-4 w-4 mx-auto" />;
                  }

                  return (
                    <Tooltip key={index} delayDuration={300}>
                      <TooltipTrigger asChild>
                        <td
                          className={`min-w-[70px] w-[70px] border text-center h-[40px] ${cellClass} ${
                            isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:opacity-90 active:scale-95'
                          } transition-all duration-150`}
                          onClick={() => !isDisabled && handleTimeSlotClick(time, field)}
                        >
                          <motion.div
                            whileHover={!isDisabled ? { scale: 1.05 } : {}}
                            whileTap={!isDisabled ? { scale: 0.95 } : {}}
                            className="h-full flex items-center justify-center"
                          >
                            {content}
                          </motion.div>
                        </td>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        {getTooltipText(field, time)}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Petunjuk scrolling */}
      <div className="p-2 bg-gray-50 text-center border-t border-gray-200 text-xs text-gray-500 flex items-center justify-center">
        <span>Geser ke kanan untuk melihat lebih banyak waktu</span>
        <ChevronRightIcon className="h-4 w-4 ml-1 animate-pulse" />
        <ChevronRightIcon className="h-4 w-4 ml-1 animate-pulse" />
        <ChevronRightIcon className="h-4 w-4 ml-1 animate-pulse" />
      </div>
    </div>
  );
} 