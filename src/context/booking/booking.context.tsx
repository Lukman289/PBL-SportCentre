"use client";

import { createContext, useContext, ReactNode, useState, useEffect, useCallback, useMemo } from "react";
import { Field, Branch } from "@/types";
import { branchApi, fieldApi, bookingApi } from "@/api";
import { format } from "date-fns";
import { 
  initializeSockets,
  joinFieldAvailabilityRoom, 
  subscribeToFieldAvailability, 
  requestAvailabilityUpdate
} from "@/services/socket";
import type { FieldAvailabilityData } from "@/services/socket/field-availability.socket";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth/auth.context";
import useGlobalLoading from "@/hooks/useGlobalLoading.hook";

// Schema untuk form booking
const bookingSchema = z.object({
  fieldId: z.number(),
  bookingDate: z.string(),
  startTime: z.string(),
  endTime: z.string(),
});

export type BookingFormValues = z.infer<typeof bookingSchema>;
export type BookingRequest = {
  fieldId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  branchId?: number;
  userId?: number;
};

interface BookingContextType {
  loading: boolean;
  error: string | null;
  fields: Field[];
  branches: Branch[];
  selectedDate: string;
  selectedBranch: number;
  selectedField: number;
  selectedBranchName: string;
  selectedFieldName: string;
  selectedStartTime: string;
  selectedEndTime: string;
  bookedTimeSlots: {[key: number]: string[]};
  refreshing: boolean;
  form: ReturnType<typeof useForm<BookingFormValues>>;
  times: string[];
  socketInitialized: boolean;
  setSelectedBranch: (branchId: number) => void;
  setSelectedDate: (date: string) => void;
  refreshAvailability: () => Promise<void>;
  branchChanged: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  dateValueHandler: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleTimeSelection: (startTime: string, fieldId: number, fieldName: string, endTime?: string) => void;
  showPicker: () => void;
  onSubmit: (formData?: BookingFormValues) => Promise<void>;
}

export const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [fields, setFields] = useState<Field[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [selectedBranch, setSelectedBranch] = useState<number>(0);
  const [selectedField, setSelectedField] = useState<number>(0);
  const [selectedBranchName, setSelectedBranchName] = useState<string>("Cabang");
  const [selectedFieldName, setSelectedFieldName] = useState<string>("Lapangan");
  const [selectedStartTime, setSelectedStartTime] = useState<string>("-");
  const [selectedEndTime, setSelectedEndTime] = useState<string>("");
  const [bookedTimeSlots, setBookedTimeSlots] = useState<{[key: number]: string[]}>({});
  const [refreshing, setRefreshing] = useState(false);
  const [socketInitialized, setSocketInitialized] = useState(false);
  
  const router = useRouter();
  const { user } = useAuth();
  const { withLoading, showLoading, hideLoading } = useGlobalLoading();
  const limit = 1000;
  
  useEffect(() => {
    if (loading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [loading, showLoading, hideLoading]);
  
  const times = useMemo(() => [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00",
    "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00",
  ], []);
  
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      fieldId: 0,
      bookingDate: "",
      startTime: "",
      endTime: "",
    },
  });

  // Fungsi untuk memperbarui data ketersediaan lapangan
  const refreshAvailability = useCallback(async () => {
    if (!selectedBranch || !selectedDate) return;
    
    setRefreshing(true);
    
    try {
      console.log("Manually refreshing availability data for date:", selectedDate);
      
      // Hapus cache untuk memastikan data di-refresh
      sessionStorage.removeItem(`${selectedBranch}_${selectedDate}`);
      
      // Request update melalui socket.io
      requestAvailabilityUpdate(selectedDate, selectedBranch);
      
      // Fallback ke API REST jika socket tidak berfungsi
      const bookedSlots = await fieldApi.fetchBookedTimeSlots(
        selectedBranch,
        selectedDate,
        fields,
        times
      );
      
      setBookedTimeSlots(bookedSlots);
    } catch (error) {
      console.error("Error refreshing availability data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [selectedBranch, selectedDate, fields, times]);

  // Fungsi untuk mengambil data ketersediaan awal
  const fetchInitialAvailability = useCallback(async () => {
    if (selectedBranch && selectedDate && fields.length > 0) {
      console.log("Fetching initial availability data for date:", selectedDate);
      
      try {
        const bookedSlots = await fieldApi.fetchBookedTimeSlots(
          selectedBranch,
          selectedDate,
          fields,
          times
        );
        setBookedTimeSlots(bookedSlots);
        
        // Minta pembaruan real-time melalui socket
        requestAvailabilityUpdate(selectedDate, selectedBranch);
      } catch (error) {
        console.error("Error fetching initial availability:", error);
      }
    }
  }, [selectedBranch, selectedDate, fields, times]);

  // Mengambil data cabang dan lapangan
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Ambil data cabang
        const response = await branchApi.getBranches();
        const branches = response.data || [];
        
        if (Array.isArray(branches) && branches.length > 0) {
          // Jika user adalah admin cabang, pilih cabang yang dikelola
          if (user?.role === 'admin_cabang' && user?.branches && user.branches.length > 0) {
            const adminBranchId = user.branches[0].branchId;
            const adminBranch = branches.find(branch => branch.id === adminBranchId);
            
            if (adminBranch) {
              setSelectedBranch(adminBranchId);
              setSelectedBranchName(adminBranch.name);
            } else {
              setSelectedBranch(branches[0].id);
              setSelectedBranchName(branches[0].name);
            }
          } else {
            // Untuk user biasa, pilih cabang pertama
            setSelectedBranch(branches[0].id);
            setSelectedBranchName(branches[0].name);
          }
          
          setBranches(branches);
        } else {
          console.error("branches is not an array or empty:", branches);
          setBranches([]);
        }
        
        // Ambil data lapangan
        const fields = await fieldApi.getAllFields({limit});
        const normalizedFields: Field[] = fields.data.map((field: any) => ({
          ...field,
          priceDay: field.priceDay || 0,
          priceNight: field.priceNight || 0,
        }));
        setFields(normalizedFields);
        // setFields(Array.isArray(fields) ? fields : []);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setError("Gagal memuat data. Silakan coba lagi nanti.");
        setLoading(false);
      }
    };

    fetchData();
    
    // Inisialisasi semua socket termasuk fields socket
    try {
      const { rootSocket, fieldsSocket, notificationSocket } = initializeSockets();
      console.log('Sockets initialized in booking context:', { 
        rootId: rootSocket?.id, 
        fieldsId: fieldsSocket?.id,
        notificationId: notificationSocket?.id
      });
      setSocketInitialized(true);
    } catch (error) {
      console.error('Error initializing sockets:', error);
    }
  }, [user?.role, user?.branches]);

  // Setup socket.io subscription untuk update real-time
  useEffect(() => {
    if (selectedDate && selectedBranch) {
      // Gabung room berdasarkan tanggal dan cabang
      joinFieldAvailabilityRoom(selectedBranch, selectedDate);
      
      // Subscribe untuk pembaruan ketersediaan lapangan
      const unsubscribe = subscribeToFieldAvailability((data: FieldAvailabilityData) => {
        console.log('Received field availability update from socket.io:', data);
        // Update bookedTimeSlots berdasarkan data dari server
        if (data && Array.isArray(data.fields)) {
          const newBookedSlots: {[key: number]: string[]} = {};
          
          // Proses data dari socket
          data.fields.forEach((fieldData) => {
            if (fieldData.id) {
              const fieldId = fieldData.id;
              const availableHours = fieldData.availableHours || [];
              
              // Konversi slot waktu tersedia menjadi jam
              const availableHourSet = new Set<string>();
              availableHours.forEach((slot) => {
                if (slot.isAvailable) {
                  availableHourSet.add(`${slot.hour.toString().padStart(2, '0')}:00`);
                }
              });
              
              // Cari jam yang tidak tersedia (terpesan)
              const bookedHours = times.filter(time => !Array.from(availableHourSet).includes(time));
              newBookedSlots[fieldId] = bookedHours;
            }
          });
          
          // Cek apakah waktu yang dipilih sudah terpesan
          if (selectedField && selectedStartTime !== "-" && selectedEndTime) {
            const fieldId = selectedField;
            const bookedHoursForField = newBookedSlots[fieldId] || [];
            
            // Cek apakah waktu mulai atau waktu dalam rentang yang dipilih sudah terpesan
            const isStartTimeBooked = bookedHoursForField.includes(selectedStartTime);
            
            // Cek apakah ada jam dalam rentang yang dipilih yang sudah terpesan
            let isAnyTimeInRangeBooked = false;
            const startIdx = times.indexOf(selectedStartTime);
            const endIdx = times.indexOf(selectedEndTime);
            
            if (startIdx >= 0 && endIdx > startIdx) {
              for (let i = startIdx; i < endIdx; i++) {
                if (bookedHoursForField.includes(times[i])) {
                  isAnyTimeInRangeBooked = true;
                  break;
                }
              }
            }
            
            // Jika waktu mulai atau waktu dalam rentang sudah terpesan, reset pemilihan
            if (isStartTimeBooked || isAnyTimeInRangeBooked) {
              console.log('Reset selection because selected time slot is now booked:', selectedStartTime, selectedEndTime);
              setSelectedStartTime("-");
              setSelectedEndTime("");
              // Jangan reset field karena user masih melihat lapangan yang sama
            }
          }
          
          setBookedTimeSlots(newBookedSlots);
        }
      });
      
      // Set up interval untuk meminta pembaruan data setiap 30 detik
      const refreshInterval = setInterval(() => {
        requestAvailabilityUpdate(selectedDate, selectedBranch);
      }, 30000); // 30 detik
      
      // Cleanup subscription dan interval saat unmount atau dependency berubah
      return () => {
        unsubscribe();
        clearInterval(refreshInterval);
      };
    }
  }, [selectedDate, selectedBranch, times, selectedField, selectedStartTime, selectedEndTime]);

  // Ambil data ketersediaan saat pertama kali atau ketika cabang/tanggal berubah
  useEffect(() => {
    fetchInitialAvailability();
  }, [fetchInitialAvailability]);

  const onSubmit = async (formData?: BookingFormValues) => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    let bookingData: BookingRequest;

    if (formData) {
      bookingData = {
        ...formData,
        branchId: selectedBranch
      };
    } else {
      bookingData = {
        fieldId: selectedField,
        bookingDate: selectedDate,
        startTime: selectedStartTime,
        endTime: selectedEndTime || calculateEndTime(selectedStartTime),
        branchId: selectedBranch
      };
    }

    try {
      const result = await withLoading(bookingApi.createBooking(bookingData));
      
      if (result.payment?.paymentUrl) {
        window.location.href = result.payment.paymentUrl;
      } else {
        console.error("No payment URL returned from API");
        alert("Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("Gagal membuat booking. Silakan coba lagi nanti.");
    }
  };

  // Helper function untuk menghitung waktu berakhir (1 jam setelah waktu mulai)
  const calculateEndTime = (startTime: string): string => {
    const startIndex = times.indexOf(startTime);
    if (startIndex >= 0 && startIndex < times.length - 1) {
      return times[startIndex + 1];
    }
    return ""; // fallback jika tidak ditemukan
  };

  // Event handlers
  const branchChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const branchId = Number(e.target.value);
    setSelectedBranch(branchId);

    const branch = branches.find((branch) => branch.id === branchId);
    setSelectedBranchName(branch?.name || "Cabang");
    
    // Reset seleksi waktu saat cabang berubah
    setSelectedStartTime("-");
    setSelectedEndTime("");
    setSelectedField(0);
    setSelectedFieldName("Lapangan");
  };

  const dateValueHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    
    // Reset seleksi waktu saat tanggal berubah
    setSelectedStartTime("-");
    setSelectedEndTime("");
    setSelectedField(0);
    setSelectedFieldName("Lapangan");
  };

  const handleTimeSelection = (startTime: string, fieldId: number, fieldName: string, endTime?: string) => {
    // Selalu update field dan waktu mulai
    setSelectedStartTime(startTime);
    setSelectedField(fieldId);
    setSelectedFieldName(fieldName);
    
    // Jika endTime disediakan, gunakan endTime tersebut
    if (endTime) {
      setSelectedEndTime(endTime);
      
      // Update form dengan rentang waktu lengkap
      form.setValue("startTime", startTime);
      form.setValue("endTime", endTime);
      form.setValue("fieldId", fieldId);
      form.setValue("bookingDate", selectedDate);
      return;
    }
    
    // Jika endTime tidak disediakan (untuk kompatibilitas mundur)
    // Hitung waktu akhir default (1 jam setelah waktu mulai)
    const startIndex = times.indexOf(startTime);
    if (startIndex >= 0 && startIndex < times.length - 1) {
      const nextTime = times[startIndex + 1];
      setSelectedEndTime(nextTime);
      
      // Update form
      form.setValue("startTime", startTime);
      form.setValue("endTime", nextTime);
      form.setValue("fieldId", fieldId);
      form.setValue("bookingDate", selectedDate);
    }
  };

  const showPicker = () => {
    const dateInput = document.getElementById(
      "hiddenDateInput"
    ) as HTMLInputElement;
    if (dateInput) {
      dateInput.showPicker();
    }
  };

  // Update form values ketika waktu berubah
  useEffect(() => {
    if (selectedStartTime !== "-" && selectedEndTime) {
      form.setValue("startTime", selectedStartTime);
      form.setValue("endTime", selectedEndTime);
      form.setValue("fieldId", selectedField);
      form.setValue("bookingDate", selectedDate);
    }
  }, [selectedStartTime, selectedEndTime, selectedField, selectedDate, form]);

  return (
    <BookingContext.Provider
      value={{
        loading,
        error,
        fields,
        branches,
        selectedDate,
        selectedBranch,
        selectedField,
        selectedBranchName,
        selectedFieldName,
        selectedStartTime,
        selectedEndTime,
        bookedTimeSlots,
        refreshing,
        form,
        times,
        socketInitialized,
        setSelectedBranch,
        setSelectedDate,
        refreshAvailability,
        branchChanged,
        dateValueHandler,
        handleTimeSelection,
        showPicker,
        onSubmit
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBookingContext = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBookingContext must be used within a BookingProvider");
  }
  return context;
}; 