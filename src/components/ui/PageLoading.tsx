"use client";

import LoadingSpinner from './LoadingSpinner';

interface PageLoadingProps {
  title?: string;
  message?: string;
  spinnerSize?: "small" | "medium" | "large";
}

export default function PageLoading({ 
  title = "Memuat Data", 
  message = "Mohon tunggu sebentar...", 
  spinnerSize = "large" 
}: PageLoadingProps) {
  return (
    <div className="container mx-auto py-8 px-4">
      {title && <h1 className="text-3xl font-bold mb-6">{title}</h1>}
      <div className="flex flex-col justify-center items-center h-64">
        <LoadingSpinner size={spinnerSize} />
        {message && <p className="mt-4 text-gray-600">{message}</p>}
      </div>
    </div>
  );
} 