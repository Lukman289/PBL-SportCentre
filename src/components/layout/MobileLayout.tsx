'use client';

import { ReactNode } from 'react';
import { Header } from '@/components/common/Header';
import { BottomNavigation } from './BottomNavigation';
import { useMobile } from '@/context/mobile/MobileContext';

interface MobileLayoutProps {
  children: ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const { showBottomNav } = useMobile();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className={`flex-1 container mx-auto py-4 ${showBottomNav ? 'pb-16' : ''}`}>
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
} 