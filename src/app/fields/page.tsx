'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { branchApi } from '@/api/branch.api';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Branch, Field } from '@/types';
import { fieldApi } from '@/api';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import useGlobalLoading from '@/hooks/useGlobalLoading.hook';
import Image from 'next/image';

export default function FieldPage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { withLoading, showLoading, hideLoading } = useGlobalLoading();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const maxData = 15;

  useEffect(() => {
    if (loading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [loading, showLoading, hideLoading]);

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchFields(maxData, currentPage);
  }, [currentPage]);

  const fetchFields = async (limit: number, page: number, q: string = '', branchId: number = 0) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching fields with params:', { limit, page, q, branchId });
      if (branchId === 0) {
        const response = await withLoading(fieldApi.getAllFields({ limit, page, q }));
        console.log('Response from API:', response);  
        if (response && response.data) {
          const normalizedFields: Field[] = response.data.map((field: any) => ({
            ...field,
            priceDay: field.priceDay || 0,
            priceNight: field.priceNight || 0,
          }));
          setFields(normalizedFields);
          setTotalItems(response.meta?.totalItems || 0);
        } else {
          setFields([]);
        }
      } else {
        const response = await withLoading(fieldApi.getAllFields({ limit, page, q, branchId }));
        console.log('Response from API:', response);
        if (response && response.data) {
          const normalizedFields: Field[] = response.data.map((field: any) => ({
            ...field,
            priceDay: field.priceDay || 0,
            priceNight: field.priceNight || 0,
          }));
          setFields(normalizedFields);
          setTotalItems(response.meta?.totalItems || 0);
        } else {
          setFields([]);
        }
      }
    } catch (error) {
      console.error('Error fetching fields:', error);
      setError('Gagal memuat daftar lapangan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await withLoading(branchApi.getBranches());
      if (response && response.data) {
        setBranches(response.data);
      } else {
        setBranches([]);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      setError('Gagal memuat daftar cabang. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (query === '') {
      fetchFields(maxData, currentPage, '', selectedBranch);
      setSearched(false);
    } else {
      fetchFields(1000, 1, query, selectedBranch);
      setSearched(true);
    }
  };

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBranch(Number(e.target.value));
    fetchFields(1000, 1, searchQuery.trim().toLowerCase(), Number(e.target.value));
  };

  const handleRefresh = () => {
    setSelectedBranch(0);
    setCurrentPage(1);
    setSearchQuery('');
    setSearched(false);
    fetchFields(maxData, 1);
  };

  if (loading) {
    return null;
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

      <form onSubmit={handleSearch} className="flex items-center gap-2 mb-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Cari cabang berdasarkan nama atau lokasi..."
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
                fetchFields(maxData, 1);
                setCurrentPage(1);
                setSearched(false);
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

      {fields.length === 0 ? (
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
                fetchFields(maxData, 1);
                setCurrentPage(1);
                setSearched(false);
                setSelectedBranch(0);
              }}
            >
              Reset Filter
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fields.map(field => (
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
          {totalItems > maxData && !searched &&(
            <div className="flex justify-between items-center gap-4 mt-8">
              <Button 
                variant="outline" 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                Sebelumnya
              </Button>
              <span className="text-sm text-gray-500">Halaman {currentPage} dari {Math.ceil(totalItems / maxData)}</span>
              <Button 
                variant="outline" 
                disabled={currentPage >= Math.ceil(totalItems / maxData)} 
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Selanjutnya
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 