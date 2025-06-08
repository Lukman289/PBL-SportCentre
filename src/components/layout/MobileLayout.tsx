'use client';

import { ReactNode } from 'react';
import { ResponsiveLayout } from './ResponsiveLayout';

interface MobileLayoutProps {
  children: ReactNode;
}

/**
 * MobileLayout - Layout khusus untuk tampilan mobile
 * Menggunakan ResponsiveLayout dengan konfigurasi mobile
 */
export function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <ResponsiveLayout showBottomNav={true}>
      {children}
    </ResponsiveLayout>
  );
} 