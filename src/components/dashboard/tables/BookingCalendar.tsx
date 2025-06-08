"use client";

import { useState, useMemo, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addDays, isSameDay, addMonths, subMonths, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { Booking, PaymentStatus } from "@/types/booking.types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatTimeRange } from "@/utils/timezone.utils";
import Link from "next/link";
import { getDetailLink } from "./BookingTableUtils";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface BookingCalendarProps {
  bookings: Booking[];
  userRole?: string;
}

export default function BookingCalendar({ bookings, userRole }: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isDataAvailable, setIsDataAvailable] = useState(false);
  const [selectedDayBookings, setSelectedDayBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAllBookings, setShowAllBookings] = useState(false);
  
  useEffect(() => {
    // Periksa apakah data booking tersedia
    if (bookings && bookings.length > 0) {
      setIsDataAvailable(true);
    } else {
      setIsDataAvailable(false);
    }
  }, [bookings]);
  
  const handleShowAllBookings = (date: string, dayBookings: Booking[]) => {
    setSelectedDate(date);
    setSelectedDayBookings(dayBookings);
    setShowAllBookings(true);
  };
  
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
              className="min-h-[90px] p-2 bg-gray-50 border-b border-r text-gray-400"
            >
              <div className="text-right">
                {format(date, "d")}
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
                  "min-h-[90px] p-2 bg-white border-b border-r relative",
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
                  {dayBookings.length > 0 ? (
                    dayBookings.slice(0, 3).map((booking) => (
                      <TooltipProvider key={booking.id}>
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger asChild>
                            <Link 
                              href={getDetailLink(booking, userRole)}
                              className="block"
                            >
                              <div 
                                className={cn(
                                  "text-xs p-1 rounded border-l-2",
                                  getBookingColor(booking.field?.name)
                                )}
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{formatTimeRange(booking.startTime, booking.endTime)}</span>
                                  {booking.payment?.status === PaymentStatus.PAID && (
                                    <span className="ml-1">✓</span>
                                  )}
                                </div>
                                <div className="truncate flex items-center gap-1">
                                  <span className="font-medium">{booking.field?.name || 'Lapangan'}</span>
                                  <span className="text-gray-500">•</span>
                                  <span className="truncate text-gray-500">{booking.user?.name || 'Pengguna'}</span>
                                </div>
                              </div>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="p-3 max-w-[250px]">
                            <div className="space-y-2">
                              <div className="font-bold">{booking.field?.name || 'Lapangan'}</div>
                              <div className="space-y-1 text-xs">
                                <div><span className="font-semibold">ID:</span> #{booking.id}</div>
                                <div><span className="font-semibold">Tanggal:</span> {format(new Date(booking.bookingDate), "dd MMMM yyyy", { locale: id })}</div>
                                <div><span className="font-semibold">Waktu:</span> {formatTimeRange(booking.startTime, booking.endTime)}</div>
                                <div><span className="font-semibold">Penyewa:</span> {booking.user?.name || '-'}</div>
                                {booking.field?.branch?.name && (
                                  <div><span className="font-semibold">Cabang:</span> {booking.field.branch.name}</div>
                                )}
                                <div>
                                  <span className="font-semibold">Status:</span> 
                                  <Badge 
                                    variant="outline" 
                                    className={cn(
                                      "ml-1 text-[9px] py-0 px-1 h-4",
                                      booking.payment?.status === PaymentStatus.PAID 
                                        ? "bg-green-50 text-green-700 border-green-200" 
                                        : booking.payment?.status === PaymentStatus.PENDING 
                                          ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                          : booking.payment?.status === PaymentStatus.FAILED
                                            ? "bg-red-50 text-red-700 border-red-200"
                                            : "bg-gray-50 text-gray-700 border-gray-200"
                                    )}
                                  >
                                    {booking.payment?.status === PaymentStatus.PAID 
                                      ? "Lunas" 
                                      : booking.payment?.status === PaymentStatus.PENDING 
                                        ? "Menunggu"
                                        : booking.payment?.status === PaymentStatus.DP_PAID
                                          ? "DP Terbayar"
                                          : booking.payment?.status === PaymentStatus.FAILED
                                            ? "Gagal"
                                            : booking.payment?.status || '-'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))
                  ) : (
                    <div className="text-xs text-center mt-6 text-gray-400">
                      Tidak ada booking
                    </div>
                  )}
                  
                  {dayBookings.length > 3 && (
                    <button 
                      className="text-xs text-center w-full mt-1 bg-gray-100 hover:bg-gray-200 rounded-sm py-0.5 transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        handleShowAllBookings(dateStr, dayBookings);
                      }}
                    >
                      +{dayBookings.length - 3} lainnya
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Hari-hari dari bulan berikutnya */}
          {nextDays.map((date) => (
            <div 
              key={`next-${date.toString()}`}
              className="min-h-[90px] p-2 bg-gray-50 border-b border-r text-gray-400"
            >
              <div className="text-right">
                {format(date, "d")}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Dialog untuk menampilkan semua booking */}
      <Dialog open={showAllBookings} onOpenChange={setShowAllBookings}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedDate ? format(new Date(selectedDate), "EEEE, dd MMMM yyyy", { locale: id }) : "Daftar Booking"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 mt-2">
            {selectedDayBookings.map((booking) => (
              <Link 
                href={getDetailLink(booking, userRole)}
                key={booking.id}
                className="block"
              >
                <div 
                  className={cn(
                    "text-sm p-3 rounded border-l-4 border hover:bg-gray-50 transition-colors",
                    getBookingColor(booking.field?.name)
                  )}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{formatTimeRange(booking.startTime, booking.endTime)}</span>
                    <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">#{booking.id}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="font-medium">{booking.field?.name || 'Lapangan'}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <div className="flex items-center text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-gray-700">{booking.user?.name || 'Pengguna'}</span>
                    </div>
                    {booking.payment?.status && (
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs",
                          booking.payment.status === PaymentStatus.PAID 
                            ? "bg-green-50 text-green-700 border-green-200" 
                            : booking.payment.status === PaymentStatus.PENDING 
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : booking.payment.status === PaymentStatus.FAILED
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-gray-50 text-gray-700 border-gray-200"
                        )}
                      >
                        {booking.payment.status === PaymentStatus.PAID 
                          ? "Lunas" 
                          : booking.payment.status === PaymentStatus.PENDING 
                            ? "Menunggu"
                            : booking.payment.status === PaymentStatus.DP_PAID
                              ? "DP Terbayar"
                              : booking.payment.status === PaymentStatus.FAILED
                                ? "Gagal"
                                : booking.payment.status}
                      </Badge>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 