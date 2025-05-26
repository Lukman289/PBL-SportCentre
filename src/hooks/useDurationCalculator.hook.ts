import { useMemo } from "react";
import { useBooking } from "./bookings/useBooking.hook";

export const useDurationCalculator = () => {
  const { selectedStartTime, selectedEndTime, times } = useBooking();
  
  // Menghitung durasi booking dalam jam
  const durationInHours = useMemo(() => {
    if (selectedStartTime === "-" || !selectedEndTime) return 0;
    
    const startIndex = times.indexOf(selectedStartTime);
    const endIndex = times.indexOf(selectedEndTime);
    
    if (startIndex < 0 || endIndex < 0) return 0;
    return endIndex - startIndex;
  }, [selectedStartTime, selectedEndTime, times]);

  return { durationInHours };
}; 