'use client';

import { ReactNode } from 'react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';

interface RegisterLayoutProps {
  children: ReactNode;
}

export default function RegisterLayout({ children }: RegisterLayoutProps) {
  return <ResponsiveLayout showBottomNav={true}>{children}</ResponsiveLayout>;
} 