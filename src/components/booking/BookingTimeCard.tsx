import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import { Booking } from "@/types/booking.types";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { formatTimeRange } from "@/utils/timezone.utils";

interface BookingTimeCardProps {
  booking: Booking;
}

/**
 * Komponen untuk menampilkan informasi waktu booking
 */
export const BookingTimeCard = ({ booking }: BookingTimeCardProps) => (
  <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
    <CardHeader className="pb-2">
      <CardTitle className="text-lg flex items-center">
        <Calendar className="h-5 w-5 mr-2 text-primary" />
        Informasi Booking
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid gap-3">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Tanggal
          </span>
          <span className="font-medium">
            {format(new Date(booking.bookingDate), "EEEE, dd MMMM yyyy", { locale: id })}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Waktu
          </span>
          <span className="font-medium">
            {formatTimeRange(booking.startTime, booking.endTime)}
          </span>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default BookingTimeCard; 