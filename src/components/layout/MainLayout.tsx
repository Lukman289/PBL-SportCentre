'use client';

import { ReactNode } from 'react';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { LoadingProvider } from '@/context/loading/loading.context';
import GlobalLoading from '@/components/ui/GlobalLoading';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <LoadingProvider>
      <div className="flex flex-col min-h-screen">
        <GlobalLoading />
        <Header />
        <main className="flex-1 container mx-auto py-8">{children}</main>
        <Footer />
      </div>
    </LoadingProvider>
  );
} 