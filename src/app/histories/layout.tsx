'use client';

import { ReactNode } from 'react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';

interface HistoriesLayoutProps {
  children: ReactNode;
}

export default function HistoriesLayout({ children }: HistoriesLayoutProps) {
  return <ResponsiveLayout showBottomNav={true}>{children}</ResponsiveLayout>;
} 