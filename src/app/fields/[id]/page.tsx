'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Field, FieldStatus } from '@/types';
import { fieldApi } from '@/api/field.api';
import { branchApi } from '@/api/branch.api';

import FieldAvailabilityClient from '@/components/field/FieldAvailability';
import FieldReviewsClient from '@/components/field/FieldReview';
import { useParams } from 'next/navigation';
import PageLoading from '@/components/ui/PageLoading';

export default function FieldDetailPage() {
  const params = useParams<{ id: string }>();
  const [field, setField] = useState<Field | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
      const fetchBranches = async () => {
        try {
          const response = await branchApi.getBranches();
          console.log("branches: ", response.data || []);
        } catch (error) {
          console.error("Error fetching branches:", error);
        } finally {
          setLoading(false);
        }
      };
      
      const fetchFields = async () => {
        setLoading(true);
        setError(null);
        try {
          const fieldsData = await fieldApi.getAllFields();
          console.log("fields data:", fieldsData);
        } catch (error) {
          console.error("Error fetching user bookings:", error);
          setError("Gagal memuat lapangan. Silakan coba lagi nanti.");
        } finally {
          setLoading(false);
        }
      };
      
      const fetchField = async () => {
        try {
          const fieldId = parseInt(params.id);
          console.log("fieldId: ", fieldId);
          const fieldResponse = await fieldApi.getFieldById(fieldId);
          console.log("field data page: ", fieldResponse);
          if (fieldResponse) {
            console.log("field data decision: ", fieldResponse);
            setField(Array.isArray(fieldResponse) ? fieldResponse[0] : fieldResponse);
          } else {
            throw new Error('Data lapangan tidak ditemukan.');
          }
        } catch (error) {
          console.error("Error fetching field:", error);
          setField(null);
          setError("Gagal memuat data lapangan. Silakan coba lagi nanti.");
        } finally {
          setLoading(false);
        }
      };

      fetchBranches();
      fetchFields();
      fetchField();
    }, []);

  if (loading) {
    return <PageLoading title="Detail Lapangan" message="Memuat data lapangan..." />;
  }

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

  if (!field) {
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

  const isAvailable = field.status === FieldStatus.AVAILABLE;

  return (
    <div className="container mx-auto mt-5 py-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
          <img
            src={field.imageUrl || "images/img_not_found.png"}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = "images/img_not_found.png";
              target.className = "h-full w-full object-contain";
            }}
            alt={field.name}
            className="h-full w-full object-cover"
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

      <div className="flex flex-row justify-between">
        <div className="mt-10 w-auto">
          <h2 className="text-2xl font-bold mb-6">Jadwal Ketersediaan</h2>
          <FieldAvailabilityClient field={field}/>
        </div>

        <div className="mt-10 w-[50%]">
          <h2 className="text-2xl font-bold mb-6">Ulasan</h2>
          <FieldReviewsClient fieldId={field.id} />
        </div>
      </div>

      <div className="mt-8">
        <Button asChild variant="outline">
          <Link href={`/fields`}>Kembali ke Daftar Lapangan</Link>
        </Button>
      </div>
    </div>
  );
}


