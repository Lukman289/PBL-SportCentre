'use client';

import { ReactNode } from 'react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';

interface BranchesLayoutProps {
  children: ReactNode;
}

export default function BranchesLayout({ children }: BranchesLayoutProps) {
  return <ResponsiveLayout showBottomNav={true}>{children}</ResponsiveLayout>;
} 