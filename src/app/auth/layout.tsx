'use client';

import { ReactNode } from 'react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return <ResponsiveLayout showBottomNav={true}>{children}</ResponsiveLayout>;
}