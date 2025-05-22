import { useDashboardStats, UserStats } from '@/hooks/useDashboardStats.hook';
import { Role } from '@/types';
import { StatCard } from './StatCard';
import { Icons } from './DashboardIcons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { PeriodFilter, PeriodType } from './filters/PeriodFilter';
import { BookingChart } from './charts/BookingChart';

export const UserDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('monthly');
  const { stats, isLoading, error } = useDashboardStats(Role.USER, selectedPeriod);
  const typedStats = stats as UserStats;
  
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
          <h1 className="text-2xl font-bold">Dashboard Pengguna</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Lihat dan kelola booking Anda
          </p>
        </div>
        <div className="flex gap-2">
          <PeriodFilter 
            onChange={setSelectedPeriod} 
            defaultValue={selectedPeriod}
            isLoading={isLoading}
          />
          <Button variant="outline" size="sm" className="gap-1">
            <Search className="h-4 w-4" />
            <span className="hidden md:inline">Cari Lapangan</span>
          </Button>
          <Button className="gap-1">
            <Plus className="h-4 w-4" />
            <span className="hidden md:inline">Booking Baru</span>
          </Button>
        </div>
      </div>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title={`Booking Aktif ${getPeriodText(selectedPeriod)}`}
          value={typedStats?.activeBookings || 0}
          icon={<Icons.ActiveBookings className="h-5 w-5" />}
          colorClass="bg-blue-100 text-blue-600"
          isLoading={isLoading}
        />
        <StatCard
          title={`Booking Selesai ${getPeriodText(selectedPeriod)}`}
          value={typedStats?.completedBookings || 0}
          icon={<Icons.CompletedBookings className="h-5 w-5" />}
          colorClass="bg-green-100 text-green-600"
          isLoading={isLoading}
          trend={{ value: 5, isUp: true }}
        />
        <StatCard
          title="Lapangan Favorit"
          value={typedStats?.favoriteField || '-'}
          icon={<Icons.FavoriteField className="h-5 w-5" />}
          colorClass="bg-purple-100 text-purple-600"
          isLoading={isLoading}
        />
        <StatCard
          title="Notifikasi Baru"
          value={typedStats?.unreadNotifications || 0}
          icon={<Icons.Notifications className="h-5 w-5" />}
          colorClass="bg-red-100 text-red-600"
          isLoading={isLoading}
        />
      </div>

      {/* Chart */}
      <div className="mb-6">
        <BookingChart 
          title={`Aktivitas Booking ${selectedPeriod === 'daily' ? 'Harian' : selectedPeriod === 'yearly' ? 'Tahunan' : 'Bulanan'}`}
          description={`Jumlah booking Anda ${selectedPeriod === 'daily' ? 'dalam 7 hari terakhir' : selectedPeriod === 'yearly' ? 'dalam 6 tahun terakhir' : 'dalam 12 bulan terakhir'}`}
          data={typedStats?.activityData || defaultChartData}
          isLoading={isLoading}
          percentIncrease={5.8}
        />
      </div>
      
      {/* Recent Bookings */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span>Booking Terbaru {getPeriodText(selectedPeriod)}</span>
            </CardTitle>
            <Button variant="ghost" size="sm">Lihat Semua</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-pulse h-4 w-32 bg-muted rounded"></div>
              </div>
            ) : typedStats?.recentBookings && typedStats.recentBookings.length > 0 ? (
              typedStats.recentBookings.map((booking) => (
                <div key={booking.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 rounded-md bg-blue-100">
                      <AvatarImage src="" alt="Field" />
                      <AvatarFallback className="rounded-md bg-blue-100 text-blue-600">
                        {booking.fieldName.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{booking.fieldName}</div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {booking.branchName}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs bg-slate-100">
                          {booking.date}
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-slate-100">
                          {booking.time}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 md:mt-0 flex gap-2">
                    <Badge className={
                      booking.status === 'confirmed' || booking.status === 'completed' 
                        ? 'bg-green-100 text-green-700 border-green-200' 
                        : booking.status === 'cancelled' 
                          ? 'bg-red-100 text-red-700 border-red-200'
                          : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                    }>
                      {booking.status === 'confirmed' ? 'Terkonfirmasi' : 
                       booking.status === 'completed' ? 'Selesai' : 
                       booking.status === 'cancelled' ? 'Dibatalkan' : 'Menunggu'}
                    </Badge>
                    {booking.paymentStatus && (
                      <Badge className={
                        booking.paymentStatus === 'paid' 
                          ? 'bg-blue-100 text-blue-700 border-blue-200' 
                          : 'bg-orange-100 text-orange-700 border-orange-200'
                      }>
                        {booking.paymentStatus === 'paid' ? 'Lunas' : 'Belum Bayar'}
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                Belum ada booking terbaru
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 