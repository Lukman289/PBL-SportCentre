'use client';

import { ReactNode, useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '@/context/auth/auth.context';
import { ResponsiveLayout } from '../ResponsiveLayout';
import { Header } from './Header';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, isLoading } = useAuth();
  const layoutRef = useRef<HTMLDivElement>(null);

  // Responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Otomatis tutup sidebar pada tampilan mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        layoutRef.current &&
        !layoutRef.current.contains(event.target as Node) &&
        window.innerWidth < 768 &&
        isSidebarOpen
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <div className="text-center py-10 bg-background">Silakan login untuk mengakses dashboard</div>;
  }

  return (
    <ResponsiveLayout hideHeader={true} hideFooter={true} showBottomNav={false} isDashboard={true}>
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          role={user.role}
          onLinkClick={() => {
            if (window.innerWidth < 768) {
              setIsSidebarOpen(false);
            }
          }}
        />

        <div
          ref={layoutRef}
          className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'md:ml-64' : 'ml-0'
          } overflow-hidden`}
        >
          <Header toggleSidebar={toggleSidebar} />
          <main className="p-4 md:p-6 overflow-auto flex-1 bg-background">{children}</main>
        </div>
      </div>
    </ResponsiveLayout>
  );
}