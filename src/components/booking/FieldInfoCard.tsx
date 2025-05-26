import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Tag } from "lucide-react";
import { Booking } from "@/types/booking.types";

interface FieldInfoCardProps {
  booking: Booking;
}

/**
 * Komponen untuk menampilkan informasi lapangan booking
 */
export const FieldInfoCard = ({ booking }: FieldInfoCardProps) => (
  <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
    <CardHeader className="pb-2">
      <CardTitle className="text-lg flex items-center">
        <MapPin className="h-5 w-5 mr-2 text-primary" />
        Informasi Lapangan
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid gap-3">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground flex items-center">
            <Tag className="h-4 w-4 mr-2" />
            Nama Lapangan
          </span>
          <span className="font-medium">{booking.field?.name}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            Cabang
          </span>
          <span className="font-medium">{booking.field?.branch?.name}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground flex items-center">
            <Tag className="h-4 w-4 mr-2" />
            Jenis
          </span>
          <span className="font-medium">{booking.field?.type?.name}</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default FieldInfoCard; 