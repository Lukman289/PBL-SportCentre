'use client';

import { ReactNode } from 'react';
import { MainLayout } from './MainLayout';
import { MobileLayout } from './MobileLayout';
import { useMobile } from '@/context/mobile/MobileContext';

interface ResponsiveLayoutProps {
  children: ReactNode;
}

export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const { isMobile } = useMobile();

  if (isMobile) {
    return <MobileLayout>{children}</MobileLayout>;
  }

  return <MainLayout>{children}</MainLayout>;
} 