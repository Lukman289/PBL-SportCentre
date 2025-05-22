import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Booking, Branch, Role, User, BranchAdmin } from "@/types";
import { bookingApi } from "@/api/booking.api";
import { branchApi } from "@/api/branch.api";
import { BookingFilters } from './useBookingFilters.hook';

interface UseBookingDataProps {
  user: User | null;
  filters: BookingFilters;
}

export function useBookingData({ user, filters }: UseBookingDataProps) {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
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
        console.error("Error loading branches:", error);
      }
    };

    if (user) {
      loadBranches();
    }
  }, [user]);

  // Mendapatkan data booking dan menerapkan filter
  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true);
      try {
        if (user?.role === Role.SUPER_ADMIN) {
          let data = await bookingApi.getAllBookings();
          data = applyFilters(data, filters);
          setBookings(data);
        } else if (user?.role === Role.ADMIN_CABANG) {
          await loadAdminCabangBookings();
        } else if (user?.role === Role.USER && user.id) {
          let data = await bookingApi.getUserBookings(user.id);
          data = applyFilters(data, filters);
          setBookings(data);
        }
      } catch (error) {
        console.error("Error loading bookings:", error);
        toast({
          title: "Gagal memuat data booking",
          description: "Terjadi kesalahan saat memuat data booking",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadBookings();
    }
  }, [user, filters, toast]);

  // Fungsi untuk memuat data booking admin cabang
  const loadAdminCabangBookings = async () => {
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
          const branchId = filters.branchId && userBranchIds.includes(filters.branchId) 
            ? filters.branchId 
            : branchAdmins[0].branchId;

          let data = await bookingApi.getBranchBookings(branchId);
          data = applyFilters(data, filters, false); // Skip branch filter
          setBookings(data);
        } else {
          handleNoBranchError();
        }
      } catch (error) {
        console.error("Error fetching branch data:", error);
        toast({
          title: "Terjadi kesalahan",
          description: "Gagal mendapatkan data cabang",
          variant: "destructive",
        });
      }
      return;
    }

    // Jika user sudah punya data branches
    const userBranchIds = user.branches.map((b: BranchAdmin) => b.branchId);
    const branchId = filters.branchId && userBranchIds.includes(filters.branchId) 
      ? filters.branchId 
      : user.branches[0].branchId;

    let data = await bookingApi.getBranchBookings(branchId);
    data = applyFilters(data, filters, false); // Skip branch filter
    setBookings(data);
  };

  // Helper untuk menampilkan error jika tidak ada cabang
  const handleNoBranchError = () => {
    console.error("Admin cabang tidak memiliki branches:", user);
    toast({
      title: "Terjadi kesalahan",
      description: "Admin cabang tidak terhubung dengan cabang manapun",
      variant: "destructive",
    });
  };

  // Fungsi untuk menerapkan filter ke data booking
  const applyFilters = (data: Booking[], filters: BookingFilters, includeBranchFilter = true) => {
    let filteredData = [...data];
    
    // Branch filter (for super admin only)
    if (includeBranchFilter && filters.branchId) {
      filteredData = filteredData.filter(booking => 
        booking.field?.branchId === filters.branchId
      );
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
    showBranchFilter
  };
}