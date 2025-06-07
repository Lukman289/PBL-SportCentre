'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { branchApi, fieldApi } from '@/api';
import { Branch, Field, FieldStatus } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Image from 'next/image';
import useGlobalLoading from '@/hooks/useGlobalLoading.hook';
import useToastHandler from '@/hooks/useToastHandler';

export default function BranchDetailPage() {
  const params = useParams<{ id: string }>();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showLoading, hideLoading, withLoading } = useGlobalLoading();
  const { showError, showSuccess } = useToastHandler();
  // Mengelola loading state
  useEffect(() => {
    if (loading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [loading, showLoading, hideLoading]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const branchId = parseInt(params.id);
        const branchResponse = await withLoading(branchApi.getBranchById(branchId));
        if (branchResponse) {
          setBranch(Array.isArray(branchResponse.data) ? branchResponse.data[0] : branchResponse.data);
        } else {
          showError("Gagal memuat data cabang. Silakan coba lagi nanti.");
        }

        // Perbaikan: Langsung menggunakan getBranchFields yang mengembalikan array lapangan
        const fieldsResponse = await withLoading(fieldApi.getBranchFields(branchId));
        setFields(Array.isArray(fieldsResponse.data) ? fieldsResponse.data : []);        
      } catch (err) {
        showError(err, "Gagal memuat data cabang. Silakan coba lagi nanti.");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  if (loading) {
    return null; // GlobalLoading akan otomatis ditampilkan
  }

  if (error || !branch) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertDescription>{error || 'Cabang tidak ditemukan'}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Link href="/branches">
            <Button>Kembali ke Daftar Cabang</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{branch?.name}</h1>
        <p className="text-muted-foreground">{branch?.location}</p>
      </div>

      {branch.imageUrl && (
        <div className="w-full h-64 mb-8 relative">
          <Image
            src={branch.imageUrl || "/images/img_not_found.png"}
            alt={branch.name}
            width={1200}
            height={400}
            className="object-cover rounded-lg w-full h-full"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = "/images/img_not_found.png";
            }}
          />
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Daftar Lapangan</h2>

        {fields.length === 0 ? (
          <p className="text-muted-foreground">Belum ada lapangan tersedia di cabang ini.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fields.map((field) => (
              <Card key={field.id} className="h-full">
                <CardHeader>
                  <CardTitle>{field.name}</CardTitle>
                  <CardDescription>
                    {field.status === FieldStatus.AVAILABLE ? 'Tersedia' : 
                     field.status === FieldStatus.BOOKED ? 'Sedang Dibooking' :
                     field.status === FieldStatus.MAINTENANCE ? 'Dalam Pemeliharaan' : 'Tutup'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[140px] rounded-md bg-muted mb-4 relative">
                    <Image
                      src={field.imageUrl || "/images/img_not_found.png"}
                      alt={field.name}
                      width={400}
                      height={140}
                      className="object-cover rounded-md w-full h-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = "/images/img_not_found.png";
                      }}
                      priority
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Harga (Siang):</span>
                      <span className="font-semibold">
                        Rp {parseInt(field.priceDay.toString()).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Harga (Malam):</span>
                      <span className="font-semibold">
                        Rp {parseInt(field.priceNight.toString()).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/bookings`} className="w-full">
                    <Button 
                      className="w-full"
                      disabled={field.status !== 'available'}
                    >
                      Pesan Sekarang
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Link href="/branches">
          <Button variant="outline">Kembali ke Daftar Cabang</Button>
        </Link>
      </div>
    </div>
  );
} 