'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Field, FieldStatus } from '@/types';
import { fieldApi } from '@/api/field.api';

import FieldAvailabilityClient from '@/components/field/FieldAvailability';
import FieldReviewsClient from '@/components/field/FieldReview';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import useGlobalLoading from '@/hooks/useGlobalLoading.hook';
import useToastHandler from '@/hooks/useToastHandler';

export default function FieldDetailPage() {
  const params = useParams();
  const fieldIdParam = params?.id as string;
  const { showError } = useToastHandler();
  const [field, setField] = useState<Field | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showLoading, hideLoading, withLoading } = useGlobalLoading();

  useEffect(() => {
    if (loading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [loading, showLoading, hideLoading]);

  useEffect(() => {
      const fetchField = async () => {
        setLoading(true);
        setError(null);
        
        try {
          const fieldId = parseInt(fieldIdParam);
          const fieldResponse = await withLoading(fieldApi.getFieldById(fieldId));
          if (fieldResponse) {
            setField(Array.isArray(fieldResponse) ? fieldResponse[0] : fieldResponse);
          } else {
            throw new Error('Data lapangan tidak ditemukan.');
          }
        } catch (error) {
          setField(null);
          showError("Gagal memuat data lapangan. Silakan coba lagi nanti.");
        } finally {
          setLoading(false);
        }
      };

      fetchField();
    }, [fieldIdParam]);

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">{error}</h1>
          <Button asChild className="mt-4">
            <Link href="/fields">Kembali ke Daftar Lapangan</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!field && !loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Lapangan tidak ditemukan</h1>
          <Button asChild className="mt-4">
            <Link href="/branches">Kembali ke Daftar Cabang</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isAvailable = field?.status === FieldStatus.AVAILABLE;

  return (
    <div className="container mx-auto mt-5 py-8 px-4">
      {!loading && field && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
              <Image
                src={field.imageUrl || "/images/img_not_found.png"}
                alt={field.name}
                className="h-full w-full object-cover"
                width={500}
                height={300}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = "/images/img_not_found.png";
                  target.className = "h-full w-full object-contain";
                }}
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-4">{field.name}</h1>
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">Tipe Lapangan</h2>
                <p className="text-gray-700">{field.type?.name || 'Tidak ada informasi'}</p>
              </div>
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">Harga</h2>
                <p className="text-gray-700">Siang: Rp{field.priceDay.toLocaleString()}</p>
                <p className="text-gray-700">Malam: Rp{field.priceNight.toLocaleString()}</p>
              </div>
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">Status</h2>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  field.status === FieldStatus.AVAILABLE ? 'bg-green-100 text-green-800' : 
                  field.status === FieldStatus.BOOKED ? 'bg-yellow-100 text-yellow-800' : 
                  field.status === FieldStatus.MAINTENANCE ? 'bg-orange-100 text-orange-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {field.status === FieldStatus.AVAILABLE ? 'Tersedia' : 
                    field.status === FieldStatus.BOOKED ? 'Sudah Dibooking' : 
                    field.status === FieldStatus.MAINTENANCE ? 'Maintenance' : 
                    'Tutup'}
                </span>
              </div>
              <div className="mt-6">
                <Button asChild className="w-full" disabled={!isAvailable}>
                  <Link href={isAvailable ? "/booking" : "#"}>
                    {isAvailable ? 'Pesan Sekarang' : 'Tidak Tersedia'}
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-10 md:flex-row md:gap-8 mt-10">
            <div className="md:w-1/2 w-full bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Jadwal Ketersediaan</h2>
              <FieldAvailabilityClient field={field} />
            </div>
            <div className="md:w-1/2 w-full bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Ulasan</h2>
              <FieldReviewsClient fieldId={field.id} />
            </div>
          </div>

          <div className="mt-8">
            <Button asChild variant="outline">
              <Link href={`/fields`}>Kembali ke Daftar Lapangan</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}


