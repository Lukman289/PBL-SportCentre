'use client';

import { ReactNode } from 'react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';

interface BookingsLayoutProps {
  children: ReactNode;
}

export default function BookingsLayout({ children }: BookingsLayoutProps) {
  return <ResponsiveLayout>{children}</ResponsiveLayout>;
} 