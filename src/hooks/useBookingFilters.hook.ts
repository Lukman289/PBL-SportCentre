import { useState } from 'react';
import { PaymentStatus } from '@/types/booking.types';

export interface BookingFilters {
  status: PaymentStatus | undefined;
  startDate: string;
  endDate: string;
  search: string;
  branchId: number | undefined;
}

const initialFilters: BookingFilters = {
  status: undefined,
  startDate: "",
  endDate: "",
  search: "",
  branchId: undefined,
};

export function useBookingFilters() {
  const [filters, setFilters] = useState<BookingFilters>(initialFilters);

  const handleFilterChange = (newFilters: Partial<BookingFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  return {
    filters,
    handleFilterChange,
    resetFilters
  };
} 