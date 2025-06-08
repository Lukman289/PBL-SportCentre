'use client';

import { ReactNode, useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '@/context/auth/auth.context';
import { Role } from '@/types';

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
        <header className="bg-background border-b border-border h-16 flex items-center px-4 sticky top-0 z-10">
          <button
            onClick={toggleSidebar}
            className="mr-4 p-2 rounded-md hover:bg-muted text-foreground transition-colors"
            aria-label="Toggle Sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-menu"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <div className="font-medium text-foreground">
            Dashboard {user.role === Role.SUPER_ADMIN
              ? 'Super Admin'
              : user.role === Role.ADMIN_CABANG
              ? 'Admin Cabang'
              : user.role === Role.OWNER_CABANG
              ? 'Owner Cabang'
              : 'Pengguna'}
          </div>
        </header>
        <main className="p-6 overflow-auto flex-1 bg-background">{children}</main>
      </div>
    </div>
  );
}