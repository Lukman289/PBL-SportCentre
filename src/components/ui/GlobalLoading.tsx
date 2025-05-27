'use client';

import { useLoading } from '@/context/loading/loading.context';

export default function GlobalLoading() {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center animate-in fade-in zoom-in duration-300">
        <div className="relative w-24 h-24 mb-6">
          <div className="absolute top-0 right-0 bottom-0 left-0 animate-pulse rounded-full bg-primary/20"></div>
          <div className="absolute top-0 right-0 bottom-0 left-0 animate-spin">
            <div className="h-24 w-24 rounded-full border-t-4 border-l-4 border-primary"></div>
          </div>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-8 w-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Memuat</h1>
        <p className="text-gray-600">Mohon tunggu sebentar...</p>
      </div>
    </div>
  );
} 