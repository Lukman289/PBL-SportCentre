import { useState, useEffect, useMemo } from "react";
import { Field } from "@/types";
import { useBooking } from "./bookings/useBooking.hook";

export const useTimeSlot = () => {
  const { 
    fields, 
    times, 
    selectedBranch, 
    bookedTimeSlots, 
    handleTimeSelection 
  } = useBooking();
  
  // State untuk waktu yang dipilih
  const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null);
  const [selectedEndTime, setSelectedEndTime] = useState<string | null>(null);
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);
  const [selectionMode, setSelectionMode] = useState<'start' | 'end'>('start');
  
  // Gunakan useMemo untuk mencegah pembuatan ulang filteredFields pada setiap render
  const filteredFields = useMemo(() => {
    return fields.filter((field) => field.branchId === selectedBranch);
  }, [fields, selectedBranch]);

  // Reset seleksi jika slot yang dipilih sudah terpesan
  useEffect(() => {
    if (selectedStartTime && selectedFieldId) {
      const isStartTimeBooked = bookedTimeSlots[selectedFieldId]?.includes(selectedStartTime);
      
      if (isStartTimeBooked) {
        console.log('Resetting selection in useTimeSlot because selected time is now booked:', selectedStartTime);
        resetSelection();
      } else if (selectedEndTime) {
        // Cek apakah ada jam dalam rentang yang dipilih yang sudah terpesan
        const startIdx = times.indexOf(selectedStartTime);
        const endIdx = times.indexOf(selectedEndTime);
        
        let isAnyTimeInRangeBooked = false;
        if (startIdx >= 0 && endIdx > startIdx) {
          for (let i = startIdx; i < endIdx; i++) {
            if (bookedTimeSlots[selectedFieldId]?.includes(times[i])) {
              isAnyTimeInRangeBooked = true;
              break;
            }
          }
        }
        
        if (isAnyTimeInRangeBooked) {
          resetSelection();
        }
      }
    }
  }, [bookedTimeSlots, selectedStartTime, selectedEndTime, selectedFieldId, times]);

  useEffect(() => {
    // Fungsi untuk menghitung status konsekutif untuk satu lapangan
    const calculateConsecutiveStatus = (field: Field) => {
      const fieldStatus: {[key: string]: boolean} = {};
      
      // Semuanya dianggap tersedia secara default
      times.forEach(time => {
        fieldStatus[time] = true;
      });
      
      // Kemudian kita cek slot yang terpesan
      times.forEach((time) => {
        // Cek apakah slot ini terpesan
        const isBooked = bookedTimeSlots[field.id]?.includes(time);
        
        // Jika slot saat ini terpesan, maka tidak tersedia
        if (isBooked) {
          fieldStatus[time] = false;
        }
      });
      
      return fieldStatus;
    };
    
    // Objek untuk melacak status konsekutif
    const newConsecutiveStatus: {[key: number]: {[key: string]: boolean}} = {};
    
    filteredFields.forEach(field => {
      newConsecutiveStatus[field.id] = calculateConsecutiveStatus(field);
    });
  }, [filteredFields, bookedTimeSlots, times]);

  // Reset selection saat cabang berubah
  useEffect(() => {
    resetSelection();
  }, [selectedBranch]);
  
  const resetSelection = () => {
    setSelectedStartTime(null);
    setSelectedEndTime(null);
    setSelectedFieldId(null);
    setSelectionMode('start');
  };

  // Gunakan fungsi untuk menentukan status slot waktu
  const getTimeSlotStatus = (field: Field, time: string) => {
    // Prioritaskan status seleksi
    if (selectedFieldId === field.id) {
      if (selectedStartTime === time) {
        return "Waktu Mulai";
      }
      if (selectedEndTime === time) {
        return "Waktu Selesai";
      }
      if (selectedStartTime && selectedEndTime && 
          times.indexOf(time) > times.indexOf(selectedStartTime) &&
          times.indexOf(time) < times.indexOf(selectedEndTime)) {
        return "Dipilih";
      }
    }
    
    // Cek apakah slot waktu terpesan
    const isTimeBooked = bookedTimeSlots[field.id]?.includes(time);
    
    // Prioritaskan status lapangan dan ketersediaan
    if (isTimeBooked) return "Terpesan";
    if (field.status !== "available") {
      return field.status === "maintenance" ? "Maintenance" : field.status;
    }
    
    // Slot tersedia jika tidak termasuk kategori di atas
    return "Tersedia";
  };

  // Gunakan fungsi untuk menentukan kelas CSS untuk slot waktu
  const getTimeSlotClass = (field: Field, time: string) => {
    const status = getTimeSlotStatus(field, time);
    
    switch(status) {
      case "Waktu Mulai":
        return "bg-black text-white";
      case "Waktu Selesai":
        return "bg-black text-white";
      case "Dipilih":
        return "bg-amber-100 text-amber-900";
      case "Terpesan":
        return "bg-red-100 text-red-700";
      case "Maintenance":
        return "bg-yellow-100 text-yellow-700";
      case "closed":
        return "bg-red-100 text-red-700";
      case "Tersedia":
        return "bg-green-50 text-green-700 hover:bg-green-100";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  // Mendapatkan icon status untuk setiap slot waktu sebagai string
  const getStatusIcon = (field: Field, time: string) => {
    const status = getTimeSlotStatus(field, time);
    
    const checkIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
    `;
    
    const xIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
      </svg>
    `;
    
    switch(status) {
      case "Waktu Mulai":
      case "Waktu Selesai":
      case "Tersedia":
      case "Dipilih":
        return checkIcon;
      case "Terpesan":
        return xIcon;
      default:
        return "";
    }
  };

  const isTimeSlotDisabled = (field: Field, time: string) => {
    // Jam dianggap tidak tersedia hanya jika:
    // 1. Slot tersebut sudah dipesan (terpesan di backend)
    // 2. Status lapangan bukan 'available'
    const isTimeBooked = bookedTimeSlots[field.id]?.includes(time);
    
    return field.status !== "available" || isTimeBooked;
  };
  
  const isValidEndTime = (time: string, field: Field) => {
    if (!selectedStartTime || selectedFieldId !== field.id) return false;
    
    // Pastikan waktu akhir lebih besar dari waktu mulai
    if (times.indexOf(time) <= times.indexOf(selectedStartTime)) return false;
    
    // Periksa bahwa tidak ada slot terpesan di antara waktu mulai dan akhir
    const startIndex = times.indexOf(selectedStartTime);
    const endIndex = times.indexOf(time);
    
    // Hanya periksa slot waktu di antara waktu mulai dan waktu akhir (exclusive)
    for (let i = startIndex + 1; i < endIndex; i++) {
      const slotTime = times[i];
      if (bookedTimeSlots[field.id]?.includes(slotTime)) {
        return false;
      }
    }
    
    // Juga pastikan bahwa waktu mulai itu sendiri tidak terpesan
    if (bookedTimeSlots[field.id]?.includes(selectedStartTime)) {
      return false;
    }
    
    return true;
  };

  const handleTimeClick = (time: string, field: Field) => {
    // Jika slot tidak tersedia, tidak lakukan apa-apa
    if (isTimeSlotDisabled(field, time)) {
      console.log(`Slot ${time} disabled: Already booked or field not available`);
      return;
    }

    // Jika mode pemilihan adalah 'start' atau berbeda lapangan, pilih waktu mulai
    if (selectionMode === 'start' || selectedFieldId !== field.id) {
      console.log(`Setting ${time} as start time for field ${field.id}`, field.name);
      resetSelection();
      setSelectedStartTime(time);
      setSelectedFieldId(field.id);
      setSelectionMode('end');
      // Hanya kirim informasi waktu mulai untuk inisialisasi
      handleTimeSelection(time, field.id, field.name);
      return;
    }
    
    // Jika mode pemilihan adalah 'end', pilih waktu akhir jika valid
    if (selectionMode === 'end' && selectedFieldId === field.id) {
      // Jika klik waktu mulai lagi, batalkan pemilihan
      if (time === selectedStartTime) {
        console.log(`Canceled selection for ${time}`);
        resetSelection();
        return;
      }
      
      // Pastikan bahwa waktu akhir valid
      if (isValidEndTime(time, field) && selectedStartTime) {
        console.log(`Setting ${time} as end time. Range: ${selectedStartTime} - ${time}`);
        setSelectedEndTime(time);
        setSelectionMode('start');
        
        // Inform parent component about the selected time range with endTime
        handleTimeSelection(selectedStartTime, field.id, field.name, time);
      } else {
        console.log(`Invalid end time: ${time}. There are booked slots between start and end.`);
      }
    }
  };

  return {
    filteredFields,
    selectedStartTime,
    selectedEndTime,
    selectedFieldId,
    getTimeSlotStatus,
    getTimeSlotClass,
    getStatusIcon,
    isTimeSlotDisabled,
    handleTimeClick
  };
}; 