'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { branchApi } from '@/api/branch.api';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Branch } from '@/types';
import { Search } from 'lucide-react';
import useGlobalLoading from '@/hooks/useGlobalLoading.hook';

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [filteredBranches, setFilteredBranches] = useState<Branch[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const { withLoading } = useGlobalLoading();
  const limit = 15;

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    setFilteredBranches(branches.slice((page - 1) * limit, page * limit));
  }, [page]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBranches(branches.slice((page - 1) * limit, page * limit));
      setSearched(false);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = branches.filter(
        (branch) =>
          branch.name.toLowerCase().includes(query) ||
          branch.location.toLowerCase().includes(query)
      );
      setFilteredBranches(filtered);
      setSearched(true);
    }
  }, [searchQuery]);

  const fetchBranches = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await withLoading(branchApi.getBranches());
      
      if (response && response.data) {
        const data = response.data;
        setBranches(data);
        setFilteredBranches(data.slice((page - 1) * limit, page * limit));
        setTotalItems(response.meta?.totalItems || 0);
      } else {
        setBranches([]);
        setFilteredBranches([]);
      }
    } catch (error) {
      setError('Gagal memuat daftar cabang. Silakan coba lagi nanti.');
      console.error('Error fetching branches:', error);
    } finally {
      setLoading(false);
    }
  };

const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const handleRefresh = async () => {
    fetchBranches();
  };

  if (loading) {
    return null; // GlobalLoading akan otomatis ditampilkan
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Daftar Cabang</h1>
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
        <h1 className="text-3xl font-bold">Daftar Cabang ({filteredBranches.length})</h1>
        <Button variant="outline" onClick={handleRefresh}>
          Muat Ulang
        </Button>
      </div>

      <form onSubmit={handleSearch} className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        <Input
          type="text"
          placeholder="Cari cabang berdasarkan nama atau lokasi..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </form>

      {filteredBranches.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            {searchQuery.trim() !== '' 
              ? 'Tidak ada cabang yang sesuai dengan pencarian Anda.' 
              : 'Belum ada cabang tersedia.'}
          </p>
          {searchQuery.trim() !== '' && (
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Reset Pencarian
            </Button>
          )}
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBranches.map((branch) => (
              <Card key={branch.id} className="overflow-hidden">
                <div className="relative h-48 bg-muted">
                  <img
                    src={branch.imageUrl || "images/img_not_found.png"}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = "images/img_not_found.png";
                      target.className = "h-full w-full object-contain";
                    }}
                    alt={branch.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h2 className="text-xl font-bold mb-2">{branch.name}</h2>
                  <p className="text-gray-700 mb-2 line-clamp-2" title={branch.location}>{branch.location}</p>
                  <div className="mb-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        branch.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {branch.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </div>
                  {branch.owner && (
                    <p className="text-sm text-gray-500">
                      Pemilik: {branch.owner.name}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="pt-0 pb-4 px-4">
                  <Button asChild className="w-full">
                    <Link href={`/branches/${branch.id}`}>Lihat Detail</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          {totalItems > limit && !searched &&(
            <div className="flex justify-between items-center gap-4 mt-8">
              <Button 
                variant="outline" 
                disabled={page === 1} 
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              >
                Sebelumnya
              </Button>
              <span className="text-sm text-gray-500">Halaman {page} dari {Math.ceil(totalItems / limit)}</span>
              <Button 
                variant="outline" 
                disabled={page >= Math.ceil(totalItems / limit)} 
                onClick={() => setPage((prev) => prev + 1)}
              >
                Selanjutnya
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}