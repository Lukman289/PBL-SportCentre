// Updated code for fields/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { branchApi } from '@/api/branch.api';
import { Button } from '@/components/ui/button';
import { Field, Branch } from '@/types';
import { fieldApi } from '@/api';
import { Input } from '@/components/ui/input';
import Link from 'next/link'; 
import useToastHandler from '@/hooks/useToastHandler';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useGlobalLoading from '@/hooks/useGlobalLoading.hook';
import { Search, X } from 'lucide-react';

export default function FieldPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<number>(0);
  const [selectedBranchName, setSelectedBranchName] = useState<string>("Pilih cabang");
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { showLoading, hideLoading, withLoading } = useGlobalLoading();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const maxData = 10;
  const { showError } = useToastHandler();

  useEffect(() => {
    if (loading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [loading, showLoading, hideLoading]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true);
        const response = await withLoading(branchApi.getUserBranches());
        const branchesData = response.data || [];
        
        if (Array.isArray(branchesData)) {
          setBranches(branchesData);
          
          if (branchesData.length > 0) {
            const firstBranch = branchesData[0];
            setSelectedBranchId(firstBranch.id);
            setSelectedBranchName(firstBranch.name);
          }
        } else {
          console.error("branches is not an array:", branchesData);
          setBranches([]);
          showError("Data cabang tidak dalam format yang diharapkan", "Error Format Data");
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
        setBranches([]);
        showError("Gagal memuat cabang. Silakan coba lagi nanti.", "Error Fetching Cabang");
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  useEffect(() => {
    fetchFields(selectedBranchId, maxData, currentPage, searchQuery);
  }, [currentPage, selectedBranchId]);

  const fetchFields = async (branchId: number, limit: number, page: number, q: string = '') => {
    if (!branchId) {
      setFields([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const fieldData = await withLoading(fieldApi.getBranchFields(
        branchId, 
        {
          limit,
          page,
          q,
        }
      ));

      if (fieldData && fieldData.data && Array.isArray(fieldData.data)) {
        setFields(fieldData.data);
        setTotalItems(fieldData.meta?.totalItems || 0);
      } else {
        console.error("Unexpected field data format:", fieldData);
        setFields([]);
        setError("Format data lapangan tidak sesuai.");
      }
    } catch (error) {
      console.error("Error fetching fields:", error);
      setFields([]);
      setError("Gagal memuat lapangan. Silakan coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (query === '') {
      fetchFields(selectedBranchId, maxData, currentPage);
    } else {
      fetchFields(selectedBranchId, maxData, 1, query);
    }
  };

  const handleBranchChange = (branchId: string) => {
    const id = parseInt(branchId, 10);

    if (isNaN(id)) {
      showError("ID cabang tidak valid", "Error ID Cabang");
      return;
    }

    setSelectedBranchId(id);
    const branch = branches.find(b => b.id === id);
    setSelectedBranchName(branch?.name || "Pilih cabang");
  };

  const handleRefresh = async () => {
    if (selectedBranchId) {
      fetchFields(selectedBranchId, maxData, 1);
    }
  };

  const handleAddField = () => {
    router.push(`/dashboard/fields/create`);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'available';
      case 'booked':
        return 'booked';
      case 'maintenance':
        return 'maintenance';
      case 'closed':
        return 'closed';
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'booked':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && branches.length === 0) {
    return null;
  }

  if (error && branches.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Daftar Lapangan</h1>
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
          <p>{error}</p>
        </div>
        <Button onClick={handleRefresh}>Coba Lagi</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Lapangan</h1>
        <Button onClick={handleAddField}>
          Tambah Lapangan
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Lapangan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Pilih Cabang
              </label>
              <Select
                value={selectedBranchId?.toString() || ""}
                onValueChange={handleBranchChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={selectedBranchName} />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id.toString()}>
                      {branch.name}
                    </SelectItem>
                  ))}
                  {branches.length === 0 && (
                    <SelectItem value="no-branch" disabled>
                      Tidak ada cabang
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Cari Lapangan
              </label>
              <form onSubmit={handleSearch} className="flex items-center gap-2 mb-8">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Cari berdasarkan nama atau tipe lapangan..."
                    name="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-20"
                  />
                  {searchQuery && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 h-6 w-6 text-gray-500 hover:text-red-600"
                      onClick={() => {
                        setSearchQuery('');
                        fetchFields(selectedBranchId, maxData, 1);
                        setCurrentPage(1);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <Button
                  type={searchQuery.trim() !== '' ? 'submit' : 'button'}
                  variant="default"
                  className="p-3 h-10 w-10 flex items-center justify-center"
                  disabled={loading}
                >
                  <Search className="w-5 h-5" />
                </Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Daftar Lapangan {selectedBranchName !== "Pilih cabang" ? `- ${selectedBranchName}` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedBranchId ? (
            <div className="text-center py-8 text-muted-foreground">
              Silakan pilih cabang terlebih dahulu
            </div>
          ) : loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : fields.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'Tidak ada lapangan yang sesuai dengan pencarian' : 'Belum ada lapangan untuk cabang ini'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Harga (Siang)</TableHead>
                    <TableHead>Harga (Malam)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field) => (
                    <TableRow key={field.id}>
                      <TableCell>{field.name}</TableCell>
                      <TableCell>{field.type?.name || '-'}</TableCell>
                      <TableCell>
                        Rp {parseFloat(field.priceDay.toString()).toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell>
                        Rp {parseFloat(field.priceNight.toString()).toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getStatusClass(field.status || 'unknown')}`}
                        >
                          {getStatusLabel(field.status || 'unknown')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/fields/${field.id}`}>Detail</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {totalItems > maxData && (
                <div className="flex justify-between items-center gap-4 mt-8">
                  <Button 
                    variant="outline" 
                    disabled={currentPage === 1} 
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  >
                    Sebelumnya
                  </Button>
                  <span className="text-sm text-gray-500">
                    Halaman {currentPage} dari {Math.ceil(totalItems / maxData)}
                  </span>
                  <Button 
                    variant="outline" 
                    disabled={currentPage >= Math.ceil(totalItems / maxData)} 
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                  >
                    Selanjutnya
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}