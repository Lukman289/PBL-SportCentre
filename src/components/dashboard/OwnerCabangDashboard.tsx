import { useDashboardStats, OwnerCabangStats } from '@/hooks/useDashboardStats.hook';
import { Role, BranchAdminView, BranchView } from '@/types';
import { StatCard } from './StatCard';
import { Icons } from './DashboardIcons';
import { RevenueChart } from './charts/RevenueChart';
import { BookingChart } from './charts/BookingChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import { BranchesTable } from './tables/BranchesTable';
import { BranchAdminsTable } from './tables/BranchAdminsTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PeriodFilter, PeriodType } from './filters/PeriodFilter';
import { useState } from 'react';

// Mendefinisikan tipe data yang diharapkan oleh komponen tabel

export const OwnerCabangDashboard = () => {
  // State untuk periode yang dipilih
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('monthly');
  
  // Menggunakan hook dengan period yang dipilih
  const { stats, isLoading, error } = useDashboardStats(Role.OWNER_CABANG, selectedPeriod);
  const typedStats = stats as OwnerCabangStats;
  
  // Default data jika belum tersedia
  const defaultChartData = {
    categories: [],
    series: [],
  };
  
  // Fungsi untuk mendapatkan teks periode untuk deskripsi
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
  
  // Fungsi untuk mendapatkan judul periode
  const getPeriodTitle = (period: PeriodType): string => {
    switch(period) {
      case 'daily':
        return 'Harian';
      case 'yearly':
        return 'Tahunan';
      default:
        return 'Bulanan';
    }
  };
  
  // Fungsi untuk mendapatkan deskripsi periode
  const getPeriodDescription = (period: PeriodType, type: 'revenue' | 'booking'): string => {
    const baseText = type === 'revenue' ? 'Pendapatan dari seluruh cabang' : 'Jumlah booking di seluruh cabang';
    
    switch(period) {
      case 'daily':
        return `${baseText} dalam 7 hari terakhir`;
      case 'yearly':
        return `${baseText} dalam 6 tahun terakhir`;
      default:
        return `${baseText} dalam 12 bulan terakhir`;
    }
  };
  
  // Mendapatkan persentase perubahan
  const getPercentChange = (period: PeriodType, type: 'revenue' | 'booking'): number => {
    // Nilai default jika tidak ada data
    if (type === 'revenue') {
      return period === 'daily' ? 8.2 : period === 'yearly' ? 15 : 12.5;
    } else {
      return period === 'daily' ? 5.5 : period === 'yearly' ? 22 : 8.3;
    }
  };

  // Fungsi untuk mengkonversi data cabang dari API ke format yang diharapkan oleh komponen
  const formatBranches = (branches: OwnerCabangStats['branches'] = []): BranchView[] => {
    return branches.map(branch => ({
      id: branch.id,
      name: branch.name,
      location: branch.location,
      // Mengkonversi status string menjadi "active" | "inactive"
      status: branch.status?.toLowerCase() === 'active' ? 'active' : 'inactive',
      adminCount: branch.adminCount,
      fieldCount: branch.fieldCount
    }));
  };

  // Fungsi untuk mengkonversi data admin dari API ke format yang diharapkan oleh komponen
  const formatAdmins = (admins: OwnerCabangStats['admins'] = []): BranchAdminView[] => {
    return admins.map((admin, index) => ({
      id: `${admin.id}-${index}`, // Menambahkan index untuk memastikan keunikan
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      branch: admin.branch,
      role: admin.role,
      lastActive: admin.lastActive,
      // Mengkonversi status string menjadi "active" | "inactive"
      status: admin.status.toLowerCase() === 'active' ? 'active' : 'inactive'
    }));
  };
  
  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Owner Cabang</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gambaran performa bisnis Anda {getPeriodText(selectedPeriod)}
          </p>
        </div>
        <div className="flex gap-2">
          <PeriodFilter 
            onChange={setSelectedPeriod} 
            defaultValue={selectedPeriod}
            isLoading={isLoading}
          />
          <Button variant="outline" size="sm" className="gap-1">
            <RefreshCw className="h-4 w-4" />
            <span className="hidden md:inline">Refresh</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="h-4 w-4" />
            <span className="hidden md:inline">Ekspor</span>
          </Button>
        </div>
      </div>
      
      {/* Quick Summary */}
      <Card className="mb-8 border-l-4 border-l-blue-500 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Ringkasan {getPeriodText(selectedPeriod)}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            {selectedPeriod === 'monthly' ? (
              <>
                Selamat datang kembali! Pendapatan bulan ini naik <span className="font-bold text-green-500">12.5%</span> dibandingkan bulan lalu.
                Anda memiliki <span className="font-bold text-blue-500">{typedStats?.totalBranches || 0} cabang</span> dengan total <span className="font-bold text-purple-500">{typedStats?.totalAdmins || 0} admin</span>.
              </>
            ) : selectedPeriod === 'daily' ? (
              <>
                Hari ini telah terdapat <span className="font-bold text-blue-500">{typedStats?.totalBookings || 0} booking</span> dengan total pendapatan <span className="font-bold text-green-500">Rp {(typedStats?.totalIncome || 0).toLocaleString()}</span>.
                Tingkat okupansi lapangan mencapai <span className="font-bold text-purple-500">72%</span>.
              </>
            ) : (
              <>
                Tahun ini pendapatan cabang Anda mencapai <span className="font-bold text-green-500">Rp {(typedStats?.totalIncome || 0).toLocaleString()}</span>, naik <span className="font-bold text-green-500">15%</span> dari tahun lalu.
                Total booking meningkat sebesar <span className="font-bold text-blue-500">22%</span>.
              </>
            )}
          </p>
        </CardContent>
      </Card>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Cabang"
          value={typedStats?.totalBranches || 0}
          icon={<Icons.TotalBranches className="h-5 w-5" />}
          colorClass="bg-blue-100 text-blue-600"
          isLoading={isLoading}
          trend={{ value: 5, isUp: true }}
        />
        <StatCard
          title="Total Admin"
          value={typedStats?.totalAdmins || 0}
          icon={<Icons.Admins className="h-5 w-5" />}
          colorClass="bg-purple-100 text-purple-600"
          isLoading={isLoading}
          trend={{ value: 8, isUp: true }}
        />
        <StatCard
          title={`Pendapatan ${selectedPeriod === 'daily' ? 'Hari Ini' : selectedPeriod === 'yearly' ? 'Tahun Ini' : 'Bulan Ini'}`}
          value={`Rp ${typedStats?.totalIncome ? typedStats.totalIncome.toLocaleString() : '0'}`}
          icon={<Icons.Revenue className="h-5 w-5" />}
          colorClass="bg-green-100 text-green-600"
          isLoading={isLoading}
          trend={{ value: getPercentChange(selectedPeriod, 'revenue'), isUp: true }}
        />
        <StatCard
          title={`Total Booking ${selectedPeriod === 'daily' ? 'Hari Ini' : selectedPeriod === 'yearly' ? 'Tahun Ini' : 'Bulan Ini'}`}
          value={typedStats?.totalBookings || 0}
          icon={<Icons.TotalBookings className="h-5 w-5" />}
          colorClass="bg-yellow-100 text-yellow-600"
          isLoading={isLoading}
          trend={{ value: getPercentChange(selectedPeriod, 'booking'), isUp: true }}
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RevenueChart 
          data={typedStats?.revenueData || defaultChartData}
          isLoading={isLoading}
          percentIncrease={getPercentChange(selectedPeriod, 'revenue')}
          title={`Pendapatan ${getPeriodTitle(selectedPeriod)}`}
          description={getPeriodDescription(selectedPeriod, 'revenue')}
        />
        <BookingChart 
          data={typedStats?.bookingData || defaultChartData}
          isLoading={isLoading}
          percentIncrease={getPercentChange(selectedPeriod, 'booking')}
          title={`Jumlah Booking ${getPeriodTitle(selectedPeriod)}`}
          description={getPeriodDescription(selectedPeriod, 'booking')}
        />
      </div>

      {/* Cabang & Admin Tabs */}
      <Tabs defaultValue="branches" className="mb-6">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="branches">Cabang Saya</TabsTrigger>
          <TabsTrigger value="admins">Admin Cabang</TabsTrigger>
        </TabsList>
        <TabsContent value="branches">
          <BranchesTable 
            branches={formatBranches(typedStats?.branches)} 
            isLoading={isLoading} 
            title="Cabang Saya" 
            caption="Daftar cabang yang Anda kelola"
          />
        </TabsContent>
        <TabsContent value="admins">
          <BranchAdminsTable 
            admins={formatAdmins(typedStats?.admins)} 
            isLoading={isLoading} 
            title="Admin Cabang Saya" 
            caption="Daftar admin yang mengelola cabang Anda"
          />
        </TabsContent>
      </Tabs>

      {/* Tips */}
      <Card className="border-t-4 border-t-green-500 shadow-sm mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">💡 Tips Bisnis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            {selectedPeriod === 'daily' ? (
              <>
                Berdasarkan analisis harian, jam puncak pemesanan adalah sekitar jam 18:00-21:00. Pertimbangkan untuk menambah staf admin dan kebersihan di jam-jam tersebut.
              </>
            ) : selectedPeriod === 'yearly' ? (
              <>
                Berdasarkan tren tahunan, pendapatan tertinggi biasanya terjadi di kuartal pertama dan terakhir tahun. Tingkatkan promosi dan acara khusus di kuartal tengah tahun untuk meningkatkan pendapatan.
              </>
            ) : (
              <>
                Berdasarkan data, waktu pemesanan terbanyak adalah di akhir pekan. Pertimbangkan untuk membuat promo khusus di hari kerja untuk meningkatkan penyewaan lapangan di jam-jam sepi.
              </>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};