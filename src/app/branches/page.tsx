'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { branchApi } from '@/api/branch.api';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Branch } from '@/types';
import { RefreshCw, Search, X } from 'lucide-react';
import useGlobalLoading from '@/hooks/useGlobalLoading.hook';
import useToastHandler from '@/hooks/useToastHandler';
import { motion } from 'framer-motion';

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const { withLoading } = useGlobalLoading();
  const { showError } = useToastHandler();
  const maxData = 15;

  useEffect(() => {
    fetchBranches(maxData, currentPage);
  }, [currentPage]);

  const fetchBranches = async (limit: number, page: number, q: string = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await withLoading(branchApi.getBranches({limit, page, q}));
      
      if (response && response.data) {
        setBranches(response.data);
        setTotalItems(response.meta?.totalItems || 0);
      } else {
        setBranches([]);
      }
    } catch {
      const errorMsg = 'Gagal memuat daftar cabang. Silakan coba lagi nanti.';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (query === '') {
      fetchBranches(maxData, currentPage);
      setSearched(false);
    } else {
      fetchBranches(maxData, 1, query);
      setSearched(true);
    }
  };

  const handleRefresh = async () => {
    setSearchQuery('');
    setSearched(false);
    fetchBranches(maxData, 1);
  };

  // Animasi variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  if (loading) {
    return null;
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
    <motion.div 
      className="container mx-auto mt-8 py-8 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="flex justify-between items-center mb-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">Daftar Cabang</h1>
        <Button variant="outline" onClick={handleRefresh}>
          <span className="hidden sm:block">Muat Ulang</span>
          <RefreshCw size={16} className="block sm:hidden" />
        </Button>
      </motion.div>

      <motion.form 
        onSubmit={handleSearch} 
        className="flex items-center gap-2 mb-8"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
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
                fetchBranches(maxData, 1);
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
      </motion.form>

      {branches.length === 0 ? (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-gray-500 mb-4">
            {searchQuery.trim() !== '' 
              ? 'Tidak ada cabang yang sesuai dengan pencarian Anda.' 
              : 'Belum ada cabang tersedia.'}
          </p>
          {searchQuery.trim() !== '' && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('');
                fetchBranches(maxData, 1);
                setCurrentPage(1);
                setSearched(false);
              }}>
              Reset Pencarian
            </Button>
          )}
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches.map((branch) => (
              <motion.div 
                key={branch.id}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
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
              </motion.div>
            ))}
          </motion.div>
          {totalItems > maxData && !searched &&(
            <motion.div 
              className="flex justify-between items-center gap-4 mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
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
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}