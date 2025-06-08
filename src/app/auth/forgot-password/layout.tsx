'use client';

import { ReactNode } from 'react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';

interface ForgotPasswordLayoutProps {
  children: ReactNode;
}

export default function ForgotPasswordLayout({ children }: ForgotPasswordLayoutProps) {
  return <ResponsiveLayout showBottomNav={true}>{children}</ResponsiveLayout>;
} 