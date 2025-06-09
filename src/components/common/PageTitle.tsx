"use client";

interface PageTitleProps {
  title: string;
  subtitle?: string;
}

export default function PageTitle({ title, subtitle }: PageTitleProps) {
  return (
    <div className="mb-2 sm:mb-3">
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h1>
      {subtitle && (
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">{subtitle}</p>
      )}
    </div>
  );
} 