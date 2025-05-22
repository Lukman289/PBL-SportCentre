"use client";

import { FileX } from "lucide-react";

interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
}

export default function EmptyState({ message, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-gray-50">
      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center mb-4">
        {icon || <FileX className="h-6 w-6 text-gray-500" />}
      </div>
      <p className="text-gray-500 text-center">{message}</p>
    </div>
  );
} 