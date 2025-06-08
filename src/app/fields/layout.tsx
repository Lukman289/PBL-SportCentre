'use client';

import { ReactNode } from 'react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';

interface FieldsLayoutProps {
  children: ReactNode;
}

export default function FieldsLayout({ children }: FieldsLayoutProps) {
  return <ResponsiveLayout>{children}</ResponsiveLayout>;
} 