import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, ClockIcon, CheckCircleIcon } from "lucide-react";
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
  <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
    <CardHeader className="pb-2 bg-primary text-primary-foreground">
      <CardTitle className="text-lg flex items-center">
        <CheckCircleIcon className="h-5 w-5 mr-2" />
        Informasi Booking
      </CardTitle>
    </CardHeader>
    <CardContent className="p-0">
      <div className="p-4 bg-accent/30">
        <div className="flex justify-between items-center mb-3 bg-card p-3 rounded-md shadow-sm">
          <span className="text-muted-foreground flex items-center">
            <CalendarIcon className="h-4 w-4 mr-2 text-primary" />
            Tanggal
          </span>
          <span className="font-medium">
            {format(new Date(booking.bookingDate), "EEEE, dd MMMM yyyy", { locale: id })}
          </span>
        </div>
        <div className="flex justify-between items-center bg-card p-3 rounded-md shadow-sm">
          <span className="text-muted-foreground flex items-center">
            <ClockIcon className="h-4 w-4 mr-2 text-primary" />
            Waktu
          </span>
          <span className="font-medium">
            {formatTimeRange(booking.startTime, booking.endTime)}
          </span>
        </div>
      </div>
      
      <div className="p-2 bg-muted/50 border-t border-border text-xs text-center text-muted-foreground">
        ID Booking: {booking.id}
      </div>
    </CardContent>
  </Card>
);

export default BookingTimeCard; 