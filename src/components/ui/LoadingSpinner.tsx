"use client";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
}

export default function LoadingSpinner({ size = "medium" }: LoadingSpinnerProps) {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  };

  return (
    <div className="flex justify-center">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-solid border-primary border-t-transparent`}
      />
    </div>
  );
} 