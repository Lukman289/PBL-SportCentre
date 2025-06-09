'use client';

import { Menu } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
}

export function Header({ toggleSidebar }: HeaderProps) {
  return (
    <header className="bg-background border-b border-border sticky top-0 z-10">
      <div className="flex items-center h-16 px-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-muted text-foreground transition-colors"
          aria-label="Toggle Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
