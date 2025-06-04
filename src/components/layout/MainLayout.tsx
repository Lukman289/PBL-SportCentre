'use client';

import { ReactNode } from 'react';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-8">{children}</main>
      <Footer />
    </div>
  );
} 