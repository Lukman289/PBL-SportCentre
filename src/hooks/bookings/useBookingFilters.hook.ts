import { useState, useCallback } from 'react';
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

export function useBookingFilters(defaultBranchId?: number) {
  // Inisialisasi dengan defaultBranchId jika disediakan
  const [filters, setFilters] = useState<BookingFilters>({
    ...initialFilters,
    branchId: defaultBranchId
  });

  const handleFilterChange = useCallback((newFilters: Partial<BookingFilters>) => {
    // Hanya update jika ada perubahan nilai
    setFilters(prev => {
      // Periksa apakah ada perubahan nilai sebenarnya
      const hasChanges = Object.entries(newFilters).some(
        ([key, value]) => prev[key as keyof BookingFilters] !== value
      );
      
      // Jika tidak ada perubahan, jangan update state
      if (!hasChanges) {
        return prev;
      }
      
      return { ...prev, ...newFilters };
    });
  }, []);

  const resetFilters = useCallback((preserveBranchId?: boolean) => {
    if (preserveBranchId && filters.branchId) {
      setFilters({
        ...initialFilters,
        branchId: filters.branchId
      });
    } else {
      setFilters(initialFilters);
    }
  }, [filters.branchId]);

  return {
    filters,
    handleFilterChange,
    resetFilters
  };
} 