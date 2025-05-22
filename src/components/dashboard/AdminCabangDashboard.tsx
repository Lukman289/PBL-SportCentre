import { useDashboardStats, AdminCabangStats } from '@/hooks/useDashboardStats.hook';
import { Role } from '@/types';
import { StatCard } from './StatCard';
import { Icons } from './DashboardIcons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon, Users } from 'lucide-react';
import { useState } from 'react';
import { PeriodFilter, PeriodType } from './filters/PeriodFilter';
import { BookingChart } from './charts/BookingChart';
import { RevenueChart } from './charts/RevenueChart';

export const AdminCabangDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('monthly');
  const { stats, isLoading, error } = useDashboardStats(Role.ADMIN_CABANG, selectedPeriod);
  const typedStats = stats as AdminCabangStats;
  
  // Fungsi untuk mendapatkan teks periode
  const getPeriodText = (period: PeriodType): string => {
    switch(period) {
      case 'daily':
        return 'hari ini';
      case 'yearly':
        return 'tahun ini';
      default:
        return 'bulan ini';
    }
  };
  
  // Default data jika belum tersedia
  const defaultChartData = {
    categories: [],
    series: [],
  };
  
  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Admin Cabang</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola lapangan dan booking dengan mudah
          </p>
        </div>
        <div className="flex gap-2">
          <PeriodFilter 
            onChange={setSelectedPeriod} 
            defaultValue={selectedPeriod}
            isLoading={isLoading}
          />
        </div>
      </div>
      
      {/* Alert Info */}
      <Alert className="mb-6 bg-blue-50 text-blue-800 border-blue-200">
        <InfoIcon className="h-4 w-4 text-blue-600" />
        <AlertDescription>
          Ada <span className="font-bold">{typedStats?.pendingPayments || 0}</span> pembayaran pending yang memerlukan verifikasi {getPeriodText(selectedPeriod)}.
        </AlertDescription>
      </Alert>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title={`Booking ${selectedPeriod === 'daily' ? 'Hari Ini' : selectedPeriod === 'yearly' ? 'Tahun Ini' : 'Bulan Ini'}`}
          value={typedStats?.totalBookings || 0}
          icon={<Icons.Bookings className="h-5 w-5" />}
          colorClass="bg-blue-100 text-blue-600"
          isLoading={isLoading}
          trend={{ value: 12, isUp: true }}
        />
        <StatCard
          title="Pembayaran Pending"
          value={typedStats?.pendingPayments || 0}
          icon={<Icons.PendingPayments className="h-5 w-5" />}
          colorClass="bg-yellow-100 text-yellow-600"
          isLoading={isLoading}
          trend={{ value: 5, isUp: false }}
        />
        <StatCard
          title={`Pendapatan ${selectedPeriod === 'daily' ? 'Hari Ini' : selectedPeriod === 'yearly' ? 'Tahun Ini' : 'Bulan Ini'}`}
          value={`Rp ${typedStats?.totalIncome ? typedStats.totalIncome.toLocaleString() : '0'}`}
          icon={<Icons.Income className="h-5 w-5" />}
          colorClass="bg-green-100 text-green-600"
          isLoading={isLoading}
          trend={{ value: 8, isUp: true }}
        />
        <StatCard
          title="Lapangan Tersedia"
          value={typedStats?.availableFields || 0}
          icon={<Icons.AvailableFields className="h-5 w-5" />}
          colorClass="bg-purple-100 text-purple-600"
          isLoading={isLoading}
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RevenueChart 
          data={typedStats?.revenueData || defaultChartData}
          isLoading={isLoading}
          percentIncrease={8}
          title={`Pendapatan ${selectedPeriod === 'daily' ? 'Harian' : selectedPeriod === 'yearly' ? 'Tahunan' : 'Bulanan'}`}
          description={`Pendapatan dari cabang Anda ${selectedPeriod === 'daily' ? 'dalam 7 hari terakhir' : selectedPeriod === 'yearly' ? 'dalam 6 tahun terakhir' : 'dalam 12 bulan terakhir'}`}
        />
        <BookingChart 
          data={typedStats?.bookingData || defaultChartData}
          isLoading={isLoading}
          percentIncrease={12}
          title={`Jumlah Booking ${selectedPeriod === 'daily' ? 'Harian' : selectedPeriod === 'yearly' ? 'Tahunan' : 'Bulanan'}`}
          description={`Jumlah booking di cabang Anda ${selectedPeriod === 'daily' ? 'dalam 7 hari terakhir' : selectedPeriod === 'yearly' ? 'dalam 6 tahun terakhir' : 'dalam 12 bulan terakhir'}`}
        />
      </div>
      
      {/* Top Customers */}
      <Card className="border-l-4 border-l-indigo-500 shadow-sm">
        <CardHeader className="pb-2 flex items-center">
          <div className="mr-4 bg-indigo-100 p-2 rounded-full">
            <Users className="h-5 w-5 text-indigo-600" />
          </div>
          <CardTitle className="text-base">Pelanggan Teratas {getPeriodText(selectedPeriod)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((_, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-2">
                    <div className="h-4 w-24 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-6 w-16 bg-slate-200 rounded-full animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : typedStats?.topCustomers && typedStats.topCustomers.length > 0 ? (
              typedStats.topCustomers.map((customer, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-2">
                  <p className="text-sm font-medium">{customer.name}</p>
                  <p className="text-sm bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                    {customer.bookingCount} booking
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                Belum ada data pelanggan
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 