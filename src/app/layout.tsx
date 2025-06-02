import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/context";
import { Toaster } from "@/components/ui/toaster"
import GlobalLoading from "@/components/ui/GlobalLoading";

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
        <Providers>
          {children}
          <Toaster />
          <GlobalLoading />
        </Providers>
      </body>
    </html>
  );
}
