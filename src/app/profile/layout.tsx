'use client';

import { ReactNode } from 'react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';

interface ProfileLayoutProps {
  children: ReactNode;
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  return <ResponsiveLayout showBottomNav={true}>{children}</ResponsiveLayout>;
} 