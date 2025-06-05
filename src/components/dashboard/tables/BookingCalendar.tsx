"use client";

import { useState, useMemo, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addDays, isSameDay, addMonths, subMonths, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { Booking } from "@/types/booking.types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatTimeRange } from "@/utils/date.utils";
import Link from "next/link";
import { getDetailLink } from "./BookingTableUtils";
import { Badge } from "@/components/ui/badge";

interface BookingCalendarProps {
  bookings: Booking[];
  userRole?: string;
}

export default function BookingCalendar({ bookings, userRole }: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isDataAvailable, setIsDataAvailable] = useState(false);
  
  useEffect(() => {
    // Periksa apakah data booking tersedia
    if (bookings && bookings.length > 0) {
      setIsDataAvailable(true);
      console.log(`${bookings.length} booking tersedia untuk ditampilkan`);
      console.log("Contoh booking pertama:", bookings[0]);
    } else {
      setIsDataAvailable(false);
      console.log("Tidak ada data booking tersedia");
    }
  }, [bookings]);
  
  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);
  
  // Mendapatkan hari dari minggu sebelumnya untuk mengisi awal kalender
  const startDay = startOfMonth(currentMonth).getDay();
  const prevDays = useMemo(() => {
    const firstDay = startOfMonth(currentMonth);
    return Array.from({ length: startDay }).map((_, i) => 
      addDays(firstDay, -(startDay - i))
    );
  }, [currentMonth, startDay]);
  
  // Mendapatkan hari dari minggu berikutnya untuk mengisi akhir kalender
  const endDay = 6 - endOfMonth(currentMonth).getDay();
  const nextDays = useMemo(() => {
    const lastDay = endOfMonth(currentMonth);
    return Array.from({ length: endDay }).map((_, i) => 
      addDays(lastDay, i + 1)
    );
  }, [currentMonth, endDay]);
  
  // Mengelompokkan booking berdasarkan tanggal
  const bookingsByDate = useMemo(() => {
    const grouped: Record<string, Booking[]> = {};
    
    if (!bookings || bookings.length === 0) {
      return grouped;
    }
    
    bookings.forEach(booking => {
      if (!booking.bookingDate) {
        console.warn("Booking tanpa tanggal:", booking);
        return;
      }
      
      // Format tanggal ke format yyyy-MM-dd
      let dateKey = booking.bookingDate;
      
      // Pastikan dateKey dalam format yang benar
      if (dateKey && dateKey.includes('T')) {
        try {
          const date = parseISO(dateKey);
          dateKey = format(date, "yyyy-MM-dd");
        } catch {
          // Gunakan format asli jika gagal
        }
      }
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(booking);
    });
    
    // Urutkan booking berdasarkan waktu mulai
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => {
        return a.startTime.localeCompare(b.startTime);
      });
    });
    
    return grouped;
  }, [bookings]);
  
  const nextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };
  
  const prevMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };
  
  const today = new Date();
  
  const getBookingColor = (fieldName?: string) => {
    if (!fieldName) return "bg-gray-200 text-gray-800";
    
    // Menghasilkan warna berdasarkan nama lapangan
    const colorMap: Record<string, string> = {
      "Basket A": "bg-blue-100 text-blue-800",
      "Basket B": "bg-green-100 text-green-800",
      "Voli A": "bg-purple-100 text-purple-800",
      "Voli B": "bg-yellow-100 text-yellow-800",
      "Futsal A": "bg-pink-100 text-pink-800",
      "Futsal B": "bg-indigo-100 text-indigo-800",
      "Badminton A": "bg-orange-100 text-orange-800",
      "Badminton B": "bg-teal-100 text-teal-800",
      "Lapangan A": "bg-blue-100 text-blue-800",
      "Lapangan B": "bg-green-100 text-green-800",
      "Lapangan C": "bg-purple-100 text-purple-800",
      "Lapangan D": "bg-yellow-100 text-yellow-800",
    };
    
    // Jika nama lapangan tidak ada di map, gunakan hash sederhana untuk menghasilkan warna
    if (!colorMap[fieldName]) {
      const hash = fieldName.split("").reduce((acc, char) => {
        return acc + char.charCodeAt(0);
      }, 0);
      
      const colorOptions = Object.values(colorMap);
      return colorOptions[hash % colorOptions.length];
    }
    
    return colorMap[fieldName];
  };
  
  // Format tanggal untuk header bulan
  const formattedMonth = format(currentMonth, "MMMM yyyy", { locale: id });
  
  return (
    <div className="booking-calendar">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">
            {formattedMonth}
          </h2>
          {!isDataAvailable && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50">
              Tidak ada data booking
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setCurrentMonth(new Date())}
            className="whitespace-nowrap"
          >
            Hari Ini
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 border-b">
          {/* Header hari */}
          {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day) => (
            <div 
              key={day} 
              className="text-center py-2 font-semibold bg-gray-50 border-r last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7">
          {/* Hari-hari dari bulan sebelumnya */}
          {prevDays.map((date) => (
            <div 
              key={`prev-${date.toString()}`}
              className="min-h-[100px] p-2 bg-gray-50 border-b border-r text-gray-400"
            >
              <div className="text-right">
                {format(date, "d")}
              </div>
              <div className="text-xs text-center mt-8 text-gray-400">
                Tidak ada booking
              </div>
            </div>
          ))}
          
          {/* Hari-hari dalam bulan ini */}
          {daysInMonth.map((date) => {
            const dateStr = format(date, "yyyy-MM-dd");
            const dayBookings = bookingsByDate[dateStr] || [];
            const isToday = isSameDay(date, today);
            
            return (
              <div 
                key={dateStr}
                className={cn(
                  "min-h-[100px] p-2 bg-white border-b border-r relative",
                  isToday ? "bg-blue-50" : ""
                )}
              >
                <div className={cn(
                  "text-right",
                  isToday ? "font-bold text-blue-600" : ""
                )}>
                  {format(date, "d")}
                </div>
                
                <div className="mt-1 space-y-1">
                  {dayBookings.map((booking) => (
                    <Link 
                      href={getDetailLink(booking, userRole)}
                      key={booking.id}
                      className="block"
                    >
                      <div 
                        className={cn(
                          "text-xs p-1 rounded",
                          getBookingColor(booking.field?.name)
                        )}
                      >
                        <div className="font-medium">
                          {formatTimeRange(booking.startTime, booking.endTime)}
                        </div>
                        <div className="truncate">
                          {booking.field?.name || 'Lapangan'}
                        </div>
                      </div>
                    </Link>
                  ))}
                  
                  {dayBookings.length === 0 && (
                    <div className="text-xs text-center mt-8 text-gray-400">
                      Tidak ada booking
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Hari-hari dari bulan berikutnya */}
          {nextDays.map((date) => (
            <div 
              key={`next-${date.toString()}`}
              className="min-h-[100px] p-2 bg-gray-50 border-b border-r text-gray-400"
            >
              <div className="text-right">
                {format(date, "d")}
              </div>
              <div className="text-xs text-center mt-8 text-gray-400">
                Tidak ada booking
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 