import { useDashboardStats, SuperAdminStats } from '@/hooks/useDashboardStats.hook';
import { Role } from '@/types';
import { StatCard } from './StatCard';
import { Icons } from './DashboardIcons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CircleUser, Download, Globe, MapPin, Plus, Rocket } from 'lucide-react';
import { BranchesTable } from './tables/BranchesTable';
import { BranchAdminsTable } from './tables/BranchAdminsTable';
import { useState } from 'react';
import { PeriodFilter, PeriodType } from './filters/PeriodFilter';
import { useRouter } from 'next/navigation';

export const SuperAdminDashboard = () => {
  // State untuk toggle view dan periode
  const [showAdmins, setShowAdmins] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('monthly');
  
  const { stats, isLoading, error } = useDashboardStats(Role.SUPER_ADMIN, selectedPeriod);
  const typedStats = stats as SuperAdminStats;

  const router = useRouter();
    const handleAddBranch = () => {
    router.push('/dashboard/branches/create');
  };
  
  // Fungsi untuk mengkonversi data cabang dari API ke format yang diharapkan oleh komponen
  const formatBranches = (branches: SuperAdminStats['branches'] = []): { id: string; name: string; location: string; status: 'active' | 'inactive'; adminCount: number; fieldCount: number; }[] => {
    return branches.map(branch => ({
      id: branch.id,
      name: branch.name,
      location: branch.location,
      adminCount: branch.adminCount,
      fieldCount: branch.fieldCount,
      // Mengkonversi status string menjadi "active" | "inactive"
      status: branch.status.toLowerCase() === 'active' ? 'active' : 'inactive'
    }));
  };

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

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Super Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Lihat semua statistik platform Anda {getPeriodText(selectedPeriod)}
          </p>
        </div>
        <div className="flex gap-2">
          <PeriodFilter 
            onChange={setSelectedPeriod} 
            defaultValue={selectedPeriod}
            isLoading={isLoading}
          />
          <Button onClick={handleAddBranch} className="gap-1">
            <Plus className="h-4 w-4" />
            <span>Tambah Cabang</span>
          </Button>
        </div>
      </div>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Cabang"
          value={typedStats?.totalBranches || 0}
          icon={<Icons.Branches className="h-5 w-5" />}
          colorClass="bg-blue-100 text-blue-600"
          isLoading={isLoading}
          trend={{ value: 10, isUp: true }}
        />
        <StatCard
          title="Total Pengguna"
          value={typedStats?.totalUsers || 0}
          icon={<Icons.Users className="h-5 w-5" />}
          colorClass="bg-green-100 text-green-600"
          isLoading={isLoading}
          trend={{ value: 15, isUp: true }}
        />
        <StatCard
          title={`Total Lapangan`}
          value={typedStats?.totalFields || 0}
          icon={<Icons.Fields className="h-5 w-5" />}
          colorClass="bg-purple-100 text-purple-600"
          isLoading={isLoading}
          trend={{ value: 8, isUp: true }}
        />
        <StatCard
          title={`Promosi Aktif ${selectedPeriod === 'daily' ? 'Hari Ini' : selectedPeriod === 'yearly' ? 'Tahun Ini' : 'Bulan Ini'}`}
          value={typedStats?.activePromotions || 0}
          icon={<Icons.Promotions className="h-5 w-5" />}
          colorClass="bg-yellow-100 text-yellow-600"
          isLoading={isLoading}
        />
      </div>
      
      {/* Segmented control for table view */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-md shadow-sm bg-muted mb-2">
          <button
            className={`px-4 py-2 text-sm font-medium rounded-l-md ${
              !showAdmins 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-transparent hover:bg-muted/80'
            }`}
            onClick={() => setShowAdmins(false)}
            disabled={isLoading}
          >
            Daftar Cabang
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-r-md ${
              showAdmins 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-transparent hover:bg-muted/80'
            }`}
            onClick={() => setShowAdmins(true)}
            disabled={isLoading}
          >
            Daftar Admin
          </button>
        </div>
      </div>
      
      {/* Tables */}
      <div className="mb-6">
        {showAdmins ? (
          <BranchAdminsTable 
            admins={[]} // API belum menyediakan data admin untuk SuperAdmin
            isLoading={isLoading} 
            title={`Daftar Admin Cabang - Data ${selectedPeriod === 'daily' ? 'Harian' : selectedPeriod === 'yearly' ? 'Tahunan' : 'Bulanan'}`} 
            caption={`Daftar admin dari semua cabang ${getPeriodText(selectedPeriod)}`}
          />
        ) : (
          <BranchesTable 
            branches={formatBranches(typedStats?.branches)} 
            isLoading={isLoading} 
            title={`Daftar Cabang - Data ${selectedPeriod === 'daily' ? 'Harian' : selectedPeriod === 'yearly' ? 'Tahunan' : 'Bulanan'}`} 
            caption={`Daftar semua cabang yang terdaftar dalam platform ${getPeriodText(selectedPeriod)}`}
          />
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regions Distribution */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2 flex items-center flex-row space-y-0 gap-2">
            <MapPin className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-base">Distribusi Regional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((_, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="h-4 w-24 bg-slate-200 rounded animate-pulse"></div>
                        <div className="h-4 w-12 bg-slate-200 rounded animate-pulse"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-full bg-slate-200 rounded animate-pulse"></div>
                        <div className="h-4 w-8 bg-slate-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : typedStats?.regions && typedStats.regions.length > 0 ? (
                typedStats.regions.map((region, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{region.name}</span>
                      <span className="text-sm text-muted-foreground">{region.value} cabang</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={region.percentage} className="h-2" />
                      <span className="text-xs w-[40px]">{region.percentage}%</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  Tidak ada data region
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Quick Actions */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2 flex items-center flex-row space-y-0 gap-2">
            <Rocket className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-base">Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={() => router.push('/dashboard/admins/add')}
              variant="outline" className="h-20 flex flex-col gap-1 border-dashed">
                <CircleUser className="h-5 w-5" />
                <span className="text-xs">Tambah Admin Baru</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-1 border-dashed">
                <Globe className="h-5 w-5" />
                <span className="text-xs">Tambah Region Baru</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-1 border-dashed">
                <Icons.Promotions className="h-5 w-5" />
                <span className="text-xs">Buat Promosi</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-1 border-dashed">
                <Download className="h-5 w-5" />
                <span className="text-xs">Laporan Bulanan</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 