import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface BookingHeaderProps {
  bookingId: number;
  createdAt: string;
}

/**
 * Header komponen untuk halaman detail booking
 */
export const BookingDetailHeader = ({ bookingId, createdAt }: BookingHeaderProps) => (
  <div className="bg-white dark:bg-gray-950 rounded-lg p-4 mb-6 shadow-sm border border-gray-100 dark:border-gray-800">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href="/dashboard/bookings" className="text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar Booking
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Detail Booking #{bookingId}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Dibuat pada {format(new Date(createdAt), "dd MMMM yyyy, HH:mm", { locale: id })}
        </p>
      </div>
      <Button onClick={() => window.print()} variant="outline" size="sm" className="print:hidden">
        <Printer className="mr-2 h-4 w-4" />
        Cetak
      </Button>
    </div>
  </div>
);

export default BookingDetailHeader; 