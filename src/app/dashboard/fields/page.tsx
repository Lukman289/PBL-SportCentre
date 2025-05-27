// Updated code for fields/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { branchApi } from '@/api/branch.api';
import { Button } from '@/components/ui/button';
import { Field, Branch } from '@/types';
import { fieldApi } from '@/api';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link'; 
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

export default function FieldPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [selectedBranchName, setSelectedBranchName] = useState<string>("Pilih cabang");
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFields, setFilteredFields] = useState<Field[]>([]);
  const { toast } = useToast();
  const router = useRouter();
  const { showLoading, hideLoading, withLoading } = useGlobalLoading();

  // Mengelola loading state
  useEffect(() => {
    if (loading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [loading, showLoading, hideLoading]);

  // Function to fetch fields by branch ID
  const fetchFields = useCallback(async (branchId: number) => {
    if (!branchId) {
      setFields([]);
      setFilteredFields([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const fieldData = await withLoading(fieldApi.getBranchFields(branchId));
      
      if (Array.isArray(fieldData)) {
        setFields(fieldData);
        setFilteredFields(searchQuery
          ? fieldData.filter(field => field.name.toLowerCase().includes(searchQuery.toLowerCase()))
          : fieldData
        );
      } else {
        console.error("Unexpected field data format:", fieldData);
        setFields([]);
        setFilteredFields([]);
        setError("Format data lapangan tidak sesuai.");
      }
    } catch (error) {
      console.error("Error fetching fields:", error);
      setFields([]);
      setFilteredFields([]);
      setError("Gagal memuat lapangan. Silakan coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, withLoading]);

  // Fetch branches when component mounts
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
            fetchFields(firstBranch.id);
          }
        } else {
          console.error("branches is not an array:", branchesData);
          setBranches([]);
          toast({
            title: "Error Format Data",
            description: "Data cabang tidak dalam format yang diharapkan",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
        setBranches([]);
        setError("Gagal memuat cabang. Silakan coba lagi nanti.");
        toast({
          title: "Error",
          description: "Gagal memuat data cabang",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, [toast, fetchFields, withLoading]);

  // Apply search filter when search query changes
  useEffect(() => {
    if (fields.length > 0) {
      const filtered = searchQuery
        ? fields.filter(field =>
            field.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (field.type && field.type.name.toLowerCase().includes(searchQuery.toLowerCase()))
          )
        : fields;

      setFilteredFields(filtered);
    }
  }, [searchQuery, fields]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleBranchChange = (branchId: string) => {
    const id = parseInt(branchId, 10);

    if (isNaN(id)) {
      toast({
        title: "Error",
        description: "ID cabang tidak valid",
        variant: "destructive"
      });
      return;
    }

    setSelectedBranchId(id);
    const branch = branches.find(b => b.id === id);
    setSelectedBranchName(branch?.name || "Pilih cabang");
    fetchFields(id);
    setSearchQuery('');
  };

  const handleRefresh = async () => {
    if (selectedBranchId) {
      fetchFields(selectedBranchId);
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
    return null; // GlobalLoading akan otomatis ditampilkan
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
    <div className="container mx-auto mt-8 py-8 px-4">
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
              <Input
                placeholder="Cari berdasarkan nama lapangan..."
                value={searchQuery}
                onChange={handleSearch}
                disabled={!selectedBranchId || loading}
              />
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
          ) : filteredFields.length === 0 ? (
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
                  {filteredFields.map((field) => (
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}