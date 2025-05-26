import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone } from "lucide-react";
import { User as UserType } from "@/types/user.types";


interface UserInfoCardProps {
  user: UserType;
}

/**
 * Komponen untuk menampilkan informasi pengguna/pemesan
 */
export const UserInfoCard = ({ user }: UserInfoCardProps) => {
  if (!user) return null;

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <User className="h-5 w-5 mr-2 text-primary" />
          Informasi Pemesan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center">
              <User className="h-4 w-4 mr-2" />
              Nama
            </span>
            <span className="font-medium">{user.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              Telepon
            </span>
            <span className="font-medium">{user.phone || "-"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserInfoCard;
