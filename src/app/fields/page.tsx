'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { branchApi } from '@/api/branch.api';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Branch, Field } from '@/types';
import { fieldApi } from '@/api';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import useGlobalLoading from '@/hooks/useGlobalLoading.hook';
import Image from 'next/image';

export default function FieldPage() {
  // Implementasi state
  const [fields, setFields] = useState<Field[]>([]);
  const [filteredFields, setFilteredFields] = useState<Field[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { withLoading, showLoading, hideLoading } = useGlobalLoading();

  // Mengelola loading state
  useEffect(() => {
    if (loading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [loading, showLoading, hideLoading]);

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  // Filter fields based on selected branch
  useEffect(() => {
    filterFields();
  }, [selectedBranch, fields, searchQuery]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch branches
      const branchResponse = await withLoading(branchApi.getBranches());
      if (branchResponse && branchResponse.data) {
        setBranches(branchResponse.data);
      }

      // Fetch fields
      const fieldResponse = await withLoading(fieldApi.getAllFields());
      if (Array.isArray(fieldResponse)) {
        setFields(fieldResponse);
        setFilteredFields(fieldResponse);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Gagal memuat data. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const filterFields = () => {
    let filtered = [...fields];

    // Filter by branch if selected
    if (selectedBranch !== 0) {
      filtered = filtered.filter(field => field.branchId === selectedBranch);
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(field => 
        field.name.toLowerCase().includes(query) || 
        field.type?.name.toLowerCase().includes(query) ||
        field.branch?.name.toLowerCase().includes(query)
      );
    }

    setFilteredFields(filtered);
  };

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBranch(Number(e.target.value));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleRefresh = () => {
    fetchData();
  };

  if (loading) {
    return null; // GlobalLoading akan otomatis ditampilkan
  }

  if (error) {
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Daftar Lapangan</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <select
            value={selectedBranch}
            onChange={handleBranchChange}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value={0}>Semua Cabang</option>
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
          
          <Button variant="outline" onClick={handleRefresh}>
            Muat Ulang
          </Button>
        </div>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        <Input
          type="text"
          placeholder="Cari lapangan berdasarkan nama, deskripsi, atau cabang..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="pl-10"
        />
      </div>

      {filteredFields.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            {searchQuery.trim() !== '' || selectedBranch !== 0
              ? 'Tidak ada lapangan yang sesuai dengan filter yang dipilih.'
              : 'Belum ada lapangan tersedia.'}
          </p>
          {(searchQuery.trim() !== '' || selectedBranch !== 0) && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('');
                setSelectedBranch(0);
              }}
            >
              Reset Filter
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFields.map(field => (
            <Card key={field.id} className="overflow-hidden">
              <div className="relative h-48 bg-muted">
                <Image 
                  src={field.imageUrl || "/images/field-placeholder.jpg"}
                  alt={field.name}
                  width={500}
                  height={300}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = "/images/field-placeholder.jpg";
                  }}
                />
              </div>
              
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold mb-1">{field.name}</h2>
                  <span className="text-xl font-semibold text-primary">
                    {field.priceDay.toLocaleString('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                    <span className="text-sm text-gray-500">/jam</span>
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">
                  {field.branch?.name}
                </p>
                
                {field.type?.name && (
                  <p className="text-gray-700 mt-2 line-clamp-3">
                    {field.type?.name}
                  </p>
                )}
                
                <div className="flex items-center mt-3 gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      field.status === 'available'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {field.status === 'available' ? 'Tersedia' : 'Tidak Tersedia'}
                  </span>
                  
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {field.type?.name || '-'}
                  </span>
                </div>
              </CardContent>
              
              <CardFooter className="pt-0 px-4 pb-4">
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <Button asChild className="flex-1">
                    <Link href="/bookings">
                      Booking Sekarang
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="flex-1">
                    <Link href={`/fields/${field.id}`}>
                      Detail
                    </Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 