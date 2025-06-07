import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/context";
import { Toaster } from "@/components/ui/sonner"
import NextTopLoader from 'nextjs-toploader';

export const metadata: Metadata = {
  title: "Jadwal.in - Sport Center",
  description: "Aplikasi reservasi lapangan olahraga terbaik dan terlengkap",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <NextTopLoader 
          color="#000000"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px rgba(0,0,0,0.5),0 0 5px rgba(0,0,0,0.3)"
        />
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
