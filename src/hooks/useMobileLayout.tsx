'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useMobile } from '@/context/mobile/MobileContext';

interface UseMobileLayoutOptions {
  excludePaths?: string[];
  includePaths?: string[];
}

export function useMobileLayout(options: UseMobileLayoutOptions = {}) {
  const { isMobile, setShowBottomNav } = useMobile();
  const pathname = usePathname();
  
  const { excludePaths = [], includePaths = [] } = options;

  useEffect(() => {
    if (!isMobile) {
      setShowBottomNav(false);
      return;
    }

    // Jika ada excludePaths, periksa apakah pathname saat ini ada di dalamnya
    if (excludePaths.length > 0) {
      const shouldExclude = excludePaths.some(path => {
        if (path.endsWith('*')) {
          // Untuk path dengan wildcard seperti '/dashboard/*'
          const basePath = path.slice(0, -1);
          return pathname.startsWith(basePath);
        }
        return pathname === path;
      });

      if (shouldExclude) {
        setShowBottomNav(false);
        return;
      }
    }

    // Jika ada includePaths, periksa apakah pathname saat ini ada di dalamnya
    if (includePaths.length > 0) {
      const shouldInclude = includePaths.some(path => {
        if (path.endsWith('*')) {
          // Untuk path dengan wildcard seperti '/bookings/*'
          const basePath = path.slice(0, -1);
          return pathname.startsWith(basePath);
        }
        return pathname === path;
      });

      setShowBottomNav(shouldInclude);
      return;
    }

    // Default: tampilkan bottom nav di semua halaman jika tidak ada filter
    setShowBottomNav(true);
  }, [pathname, isMobile, setShowBottomNav, excludePaths, includePaths]);

  return { isMobile };
} 