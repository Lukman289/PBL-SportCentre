'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Role } from '@/types';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  role: Role;
}

// Menu konfigurasi berdasarkan role
const menuItemsByRole = {
  [Role.SUPER_ADMIN]: [
    { label: 'Dashboard', href: '/dashboard', icon: 'home' },
    { label: 'Cabang', href: '/dashboard/branches', icon: 'building' },
    { label: 'Pengguna', href: '/dashboard/users', icon: 'users' },
  ],
  [Role.OWNER_CABANG]: [
    { label: 'Dashboard', href: '/dashboard', icon: 'home' },
    { label: 'Cabang Saya', href: '/dashboard/my-branches', icon: 'building' },
    { label: 'Admin Cabang', href: '/dashboard/admins', icon: 'user-check' },
  ],
  [Role.ADMIN_CABANG]: [
    { label: 'Dashboard', href: '/dashboard', icon: 'home' },
    { label: 'Lapangan', href: '/dashboard/fields', icon: 'layout' },
    { label: 'Reservasi', href: '/dashboard/bookings', icon: 'calendar' },
  ],
  [Role.USER]: [
    { label: 'Dashboard', href: '/dashboard', icon: 'home' },
    { label: 'Reservasi Saya', href: '/dashboard/my-bookings', icon: 'calendar' },
    { label: 'Profil', href: '/dashboard/profile', icon: 'user' },
  ],
};

export default function Sidebar({ isOpen, role }: SidebarProps) {
  const pathname = usePathname();
  const menuItems = menuItemsByRole[role] || menuItemsByRole[Role.USER];
  const activeItem = getActiveItem(pathname, menuItems);

  function getActiveItem(pathname: string, menuItems: { href: string }[]) {
    if (pathname.startsWith('/dashboard/branches')) {
      const myBranches = menuItems.find(item => item.href === '/dashboard/my-branches');
      if (myBranches) return myBranches.href;
    }

    let matched: { href: string } | undefined;
    for (const item of menuItems) {
      if (pathname === item.href || pathname.startsWith(item.href + '/')) {
        if (!matched || item.href.length > matched.href.length) {
          matched = item;
        }
      }
    }

    return matched?.href;
  }

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-20 w-64 transform bg-background border-r border-border transition-all duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex h-16 items-center border-b border-border px-6">
        <h2 className="text-xl font-bold text-foreground">Sport Center</h2>
      </div>
      
      <nav className="mt-6 px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = activeItem === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <SidebarIcon name={item.icon} className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
        <Link
          href="/profile"
          className="flex items-center px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-colors"
        >
          <SidebarIcon name="user-circle" className="mr-3 h-5 w-5" />
          Profil Saya
        </Link>
        <Link
          href="/auth/logout"
          className="flex items-center px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-colors mt-2"
        >
          <SidebarIcon name="log-out" className="mr-3 h-5 w-5" />
          Keluar
        </Link>
      </div>
    </div>
  );
}

// Komponen ikon sederhana
function SidebarIcon({ name, className }: { name: string; className?: string }) {
  // Daftar ikon SVG minimal
  const icons: Record<string, React.ReactNode> = {
    home: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    ),
    building: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
        <line x1="12" y1="6" x2="12" y2="6"></line>
        <line x1="12" y1="12" x2="12" y2="12"></line>
        <line x1="12" y1="18" x2="12" y2="18"></line>
      </svg>
    ),
    users: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    ),
    settings: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
    ),
    'user-check': (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="8.5" cy="7" r="4"></circle>
        <polyline points="17 11 19 13 23 9"></polyline>
      </svg>
    ),
    layout: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="3" y1="9" x2="21" y2="9"></line>
        <line x1="9" y1="21" x2="9" y2="9"></line>
      </svg>
    ),
    calendar: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
    ),
    user: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    ),
    'user-circle': (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20a6 6 0 0 0-12 0"></path>
        <circle cx="12" cy="10" r="4"></circle>
        <circle cx="12" cy="12" r="10"></circle>
      </svg>
    ),
    'log-out': (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
      </svg>
    ),
  };

  return <span className={className}>{icons[name] || null}</span>;
} 