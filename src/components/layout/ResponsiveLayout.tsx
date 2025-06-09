'use client';

import { ReactNode, useEffect } from 'react';
import { useMobile } from '@/context/mobile/MobileContext';
import { MainLayout } from './MainLayout';
import { Header } from '@/components/common/Header';
import { BottomNavigation } from './BottomNavigation';

interface ResponsiveLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
  hideHeader?: boolean;
  hideFooter?: boolean;
  customLayout?: boolean;
  isDashboard?: boolean;
}

/**
 * ResponsiveLayout - Komponen untuk menangani layout responsif
 * 
 * @param children - Konten yang akan ditampilkan
 * @param showBottomNav - Apakah menampilkan bottom navigation di mobile
 * @param hideHeader - Apakah menyembunyikan header
 * @param hideFooter - Apakah menyembunyikan footer
 * @param customLayout - Jika true, tidak menambahkan struktur layout tambahan
 * @param isDashboard - Jika true, menggunakan layout khusus untuk dashboard
 */
export function ResponsiveLayout({ 
  children, 
  showBottomNav = false,
  hideHeader = false,
  hideFooter = false,
  customLayout = false,
  isDashboard = false
}: ResponsiveLayoutProps) {
  const { isMobile, setShowBottomNav } = useMobile();

  // Mengatur tampilan bottom navigation jika diperlukan
  useEffect(() => {
    if (isMobile) {
      setShowBottomNav(showBottomNav);
    }
  }, [isMobile, setShowBottomNav, showBottomNav]);

  // Jika menggunakan custom layout, hanya render children dan bottom navigation jika diperlukan
  if (customLayout || isDashboard) {
    return (
      <>
        {children}
        {isMobile && showBottomNav && <BottomNavigation />}
      </>
    );
  }

  // Untuk perangkat mobile
  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen">
        {!hideHeader && <Header />}
        <main className={`flex-1 container mx-auto py-4 ${showBottomNav ? 'pb-16' : ''}`}>
          {children}
        </main>
        {showBottomNav && <BottomNavigation />}
      </div>
    );
  }

  // Untuk perangkat desktop
  if (hideHeader && hideFooter) {
    // Jika header dan footer disembunyikan, render hanya konten
    return <div className="flex-1">{children}</div>;
  }

  // Gunakan MainLayout untuk desktop dengan header dan footer
  return <MainLayout>{children}</MainLayout>;
}