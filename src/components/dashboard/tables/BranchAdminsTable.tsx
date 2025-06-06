import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, Mail, Phone } from "lucide-react";
import { BranchAdmin } from "@/types";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface BranchAdminsTableProps {
  admins: BranchAdmin[];
  title?: string;
  caption?: string;
  isLoading?: boolean;
}

export function BranchAdminsTable({
  admins,
  title = "Daftar Admin Cabang",
  caption = "Daftar semua admin cabang yang terdaftar dalam sistem",
  isLoading = false,
}: BranchAdminsTableProps) {
  console.log("Admins:", admins);
  const [adminPaginate, setAdminPaginate] = useState<BranchAdmin[]>(admins);
  const [page, setPage] = useState(1);
  const totalItems = admins.length;
  const limit = 10;

  useEffect(() => {
    setAdminPaginate(admins.slice((page - 1) * limit, page * limit));
  }, [page, admins]);
  console.log("Paginated Admins:", adminPaginate);

  return (
    <Card className="border shadow-sm">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-medium">{title}</h3>
        </div>
        
        {isLoading ? (
          <div className="h-52 flex items-center justify-center">
            <p className="text-muted-foreground">Memuat data...</p>
          </div>
        ) : totalItems === 0 ? (
          <div className="h-52 flex items-center justify-center">
            <p className="text-muted-foreground">Tidak ada data admin cabang</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Cabang</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminPaginate.map((admin, index) => (
                <TableRow key={`${admin.userId}-${index}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={admin.user.name} />
                        <AvatarFallback className="bg-purple-100 text-purple-700">
                          {admin.user.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{admin.user.name}</div>
                        <div className="text-xs text-muted-foreground">{admin.user.role}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-slate-400" />
                        <span className="text-sm">{admin.user.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-slate-400" />
                        <span className="text-sm">{admin.user.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {admin.branch?.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      <Link 
                        href={`/dashboard/users/${admin.userId}`}
                        className="flex items-center gap-1"
                      >
                        Detail
                      </Link>
                    </Button>
                      </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableCaption>
              {totalItems > limit ? (
                <div className="flex justify-between items-center gap-4 mt-8">
                  <Button 
                    variant="outline" 
                    disabled={page === 1} 
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  >
                    Sebelumnya
                  </Button>
                  {caption}
                  <Button 
                    variant="outline" 
                    disabled={page >= Math.ceil(totalItems / limit)} 
                    onClick={() => setPage((prev) => prev + 1)}
                  >
                    Selanjutnya
                  </Button>
                </div>
              ) : (
                caption
              )}
            </TableCaption>
          </Table>
        )}
      </div>
    </Card>
  );
} 