import { useState, useEffect } from 'react';
import { Booking, Branch, Role, User, BranchAdmin, BookingMeta } from "@/types";
import { bookingApi } from "@/api/booking.api";
import { branchApi } from "@/api/branch.api";
import { BookingFilters } from './useBookingFilters.hook';
import useToastHandler from '../useToastHandler';
interface UseBookingDataProps {
  user: User | null;
  filters: BookingFilters;
}

export function useBookingData({ user, filters }: UseBookingDataProps, limit: number = 10, page: number = 1, ) {
  const { showError } = useToastHandler();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [meta, setMeta] = useState<BookingMeta | null>(null);
  const [loading, setLoading] = useState(true);

  // Mendapatkan daftar cabang
  useEffect(() => {
    const loadBranches = async () => {
      try {
        if (user?.role === Role.SUPER_ADMIN) {
          const response = await branchApi.getBranches();
          setBranches(response.data || []);
        } else if (user?.role === Role.ADMIN_CABANG && user.branches) {
          const branchesData = user.branches
            .map((ba: BranchAdmin) => ba.branch)
            .filter(branch => branch !== undefined) as Branch[];
          setBranches(branchesData);
        }
      } catch (error) {
        showError("Gagal memuat data cabang");
      }
    };

    if (user) {
      loadBranches();
    }
  }, [user]);

  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true);
      try {
        if (user?.role === Role.SUPER_ADMIN) {
          // Kirim semua filter ke API
          const apiFilters = {
            branchId: filters.branchId,
            status: filters.status,
            startDate: filters.startDate,
            endDate: filters.endDate,
            search: filters.search
          };
          console.log("Fetching super admin bookings with filters:", apiFilters);
          
          // Dapatkan data dengan filter dari API
          const data = await bookingApi.getAllBookings(apiFilters, {
            page: page,
            limit: limit,
          });
          
          // Log data untuk debugging
          console.log("Data booking diterima:", data);
          console.log("Contoh data booking pertama:", data.data[0]);
          
          // Tidak perlu melakukan filter lagi karena backend sudah menerapkan filter
          setBookings(data.data);
          setMeta(data.meta);
        } else if (user?.role === Role.ADMIN_CABANG) {
          await loadAdminCabangBookings(page, limit);
        } else if (user?.role === Role.USER && user.id) {
          let data = await bookingApi.getUserBookings(user.id);
          
          // Log data untuk debugging
          console.log("Data booking user diterima:", data);
          if (data[0]?.field) {
            console.log("Field data:", data[0].field);
            console.log("Branch data:", data[0].field.branch);
          }
          
          // Untuk user reguler, tetap lakukan filter di frontend
          data = applyFilters(data, filters);
          setBookings(data);
        }
      } catch (error) {
        showError("Gagal memuat data booking");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadBookings();
    }
  }, [user, filters, page]);

  const loadAdminCabangBookings = async (page: number, limit: number) => {
    if (!user?.branches?.length) {
      try {
        const { userApi } = await import('@/api/user.api');
        const branchAdmins = await userApi.getBranchesForAdmin(user?.id || 0);
        
        if (branchAdmins?.length) {
          const branchesData = branchAdmins
            .map((ba: BranchAdmin) => ba.branch)
            .filter(branch => branch !== undefined) as Branch[];
          setBranches(branchesData);

          const userBranchIds = branchAdmins.map((b: BranchAdmin) => b.branchId);
          
          // Periksa apakah filter.branchId valid dan gunakan jika ada
          const branchId = filters.branchId && userBranchIds.includes(filters.branchId) 
            ? filters.branchId 
            : branchAdmins[0].branchId;

          console.log("Admin cabang menggunakan branchId:", branchId);
          console.log("Daftar branch admin:", userBranchIds);
          console.log("Branch filter yang diminta:", filters.branchId);
          
          // Kirim filter ke API kecuali branchId (karena sudah di path)
          const apiFilters = {
            status: filters.status,
            startDate: filters.startDate,
            endDate: filters.endDate,
            search: filters.search
          };
          console.log(`Fetching branch bookings for ID ${branchId} with filters:`, apiFilters);
          
          // Dapatkan data dengan filter dari API
          const data = await bookingApi.getBranchBookings(
            branchId, 
            apiFilters,
            { page, limit }
          );
          
          // Log data untuk debugging
          console.log("Data booking admin cabang diterima:", data);
          
          // Tidak perlu melakukan filter lagi karena backend sudah menerapkan filter
          setBookings(data.data);
          setMeta(data.meta);
        } else {
          handleNoBranchError();
        }
      } catch (error) {
        showError("Gagal mendapatkan data cabang");
      }
      return;
    }

    // Jika user sudah punya data branches
    const userBranchIds = user.branches.map((b: BranchAdmin) => b.branchId);
    console.log("Filters diterapkan:", filters);
    if (
      filters.endDate !== '' && 
      filters.startDate !== '' && 
      filters.status !== undefined && 
      filters.search !== ''
    ) 
    {
      page = 1
    }
    
    // Periksa apakah filter.branchId valid dan gunakan jika ada
    const branchId = filters.branchId && userBranchIds.includes(filters.branchId) 
      ? filters.branchId 
      : user.branches[0].branchId;

    console.log("Fetching bookings for branch ID:", branchId);
    
    // Kirim filter ke API kecuali branchId (karena sudah di path)
    const apiFilters = {
      status: filters.status,
      startDate: filters.startDate,
      endDate: filters.endDate,
      search: filters.search
    };
    
    // Dapatkan data dengan filter dari API
    const data = await bookingApi.getBranchBookings(
      branchId, 
      apiFilters,
      { page, limit }
    );
    
    // Log data untuk debugging
    console.log("Data booking admin cabang diterima:", data);
    
    // Tidak perlu melakukan filter lagi karena backend sudah menerapkan filter
    setBookings(data.data);
    setMeta(data.meta);
  };

  // Helper untuk menampilkan error jika tidak ada cabang
  const handleNoBranchError = () => {
    showError("Admin cabang tidak memiliki branches");
  };

  // Fungsi untuk menerapkan filter ke data booking
  const applyFilters = (data: Booking[], filters: BookingFilters, includeBranchFilter = true) => {
    let filteredData = [...data];
    
    // Branch filter (for super admin only)
    if (includeBranchFilter && filters.branchId) {
      console.log("Applying branch filter:", filters.branchId);
      filteredData = filteredData.filter(booking => {
        const bookingBranchId = booking.field?.branch?.id || booking.field?.branchId;
        const match = bookingBranchId === filters.branchId;
        return match;
      });
    }
    
    // Status filter
    if (filters.status) {
      filteredData = filteredData.filter(booking => 
        booking.payment?.status === filters.status
      );
    }
    
    // Date filters
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filteredData = filteredData.filter(booking => {
        const bookingDate = new Date(booking.bookingDate);
        return bookingDate >= startDate;
      });
    }
    
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setDate(endDate.getDate() + 1); // Include end date
      filteredData = filteredData.filter(booking => {
        const bookingDate = new Date(booking.bookingDate);
        return bookingDate < endDate;
      });
    }
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredData = filteredData.filter(booking => 
        (booking.user?.name?.toLowerCase().includes(searchLower)) || 
        (booking.field?.name?.toLowerCase().includes(searchLower)) ||
        (booking.id?.toString().includes(searchLower))
      );
    }
    
    return filteredData;
  };

  // Determine if branch filter should be shown
  const showBranchFilter = user?.role === Role.SUPER_ADMIN || 
    (user?.role === Role.ADMIN_CABANG && branches.length > 1);

  return {
    bookings,
    branches,
    loading,
    showBranchFilter,
    meta,
  };
}