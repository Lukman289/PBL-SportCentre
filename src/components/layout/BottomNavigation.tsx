'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, Calendar, User, MapPin } from 'lucide-react';
import { useMobile } from '@/context/mobile/MobileContext';
import { cn } from '@/lib/utils';

export function BottomNavigation() {
  const { isMobile, showBottomNav } = useMobile();
  const pathname = usePathname();
  const router = useRouter();

  if (!isMobile || !showBottomNav) {
    return null;
  }

  const navItems = [
    {
      icon: Home,
      label: 'Beranda',
      href: '/',
      active: pathname === '/',
    },
    {
      icon: Search,
      label: 'Cari',
      href: '/fields',
      active: pathname === '/fields' || pathname.startsWith('/fields/'),
    },
    {
      icon: Calendar,
      label: 'Booking',
      href: '/bookings',
      active: pathname === '/bookings' || pathname.startsWith('/bookings/'),
    },
    {
      icon: MapPin,
      label: 'Cabang',
      href: '/branches',
      active: pathname === '/branches' || pathname.startsWith('/branches/'),
    },
    {
      icon: User,
      label: 'Profil',
      href: '/profile',
      active: pathname === '/profile',
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex justify-between items-center px-2">
        {navItems.map((item) => (
          <button
            key={item.href}
            className={cn(
              'flex flex-col items-center justify-center py-2 px-3 w-full',
              item.active ? 'text-primary' : 'text-gray-500'
            )}
            onClick={() => router.push(item.href)}
          >
            <item.icon className={cn('h-5 w-5', item.active ? 'text-primary' : 'text-gray-500')} />
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
} 