'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { fieldApi } from '@/api/field.api';
import { Field } from '@/types';
import { useAuth } from '@/context/auth/auth.context';
import { Role } from '@/types';
import Image from 'next/image';
import { toast } from '@/components/ui/use-toast';

export default function FieldDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string; fieldId: string }>();
  const { user } = useAuth();
  
  const [field, setField] = useState<Field | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const branchId = parseInt(params.id as string);
  const fieldId = parseInt(params.fieldId as string);

  useEffect(() => {
    const fetchField = async () => {
      try {
        setIsLoading(true);
        
        const fieldData = await fieldApi.getFieldById(fieldId);
        
        if (fieldData) {
          setField(fieldData);
        } else {
          toast({
            title: 'Lapangan Tidak Ditemukan',
            description: 'Lapangan yang Anda cari tidak ditemukan',
            variant: 'destructive',
          });
          router.push(`/dashboard/branches/${branchId}`);
        }
      } catch (err) {
        console.error('Error fetching field:', err);
        toast({
          title: 'Terjadi Kesalahan',
          description: 'Gagal memuat data lapangan',
          variant: 'destructive',
        });
        router.push(`/dashboard/branches/${branchId}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (fieldId) {
      fetchField();
    }
  }, [fieldId, branchId, router]);

  const handleEdit = () => {
    router.push(`/dashboard/branches/${branchId}/fields/${fieldId}/edit`);
  };

 const handleDelete = async () => {
  if (!user || !field) return;

  const confirmDelete = window.confirm(
    `Apakah Anda yakin ingin menghapus lapangan ${field.name}? Tindakan ini tidak dapat dibatalkan.`
  );

  if (confirmDelete) {
    setIsDeleting(true);
    try {
      // Pass both fieldId and branchId
      await fieldApi.deleteField(fieldId);
      
      toast({
        title: 'Berhasil',
        description: `Lapangan ${field.name} berhasil dihapus`,
      });
      router.push(`/dashboard/branches/${branchId}`);
    } catch (err) {
      console.error('Error deleting field:', err);
      toast({
        title: 'Gagal Menghapus',
        description: 'Gagal menghapus lapangan. Silakan coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  }
};

  const handleBack = () => {
    router.push(`/dashboard/branches/${branchId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'booked':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'closed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Tersedia';
      case 'booked':
        return 'Sedang Dibooking';
      case 'maintenance':
        return 'Dalam Pemeliharaan';
      case 'closed':
        return 'Tutup';
      default:
        return 'Tidak Diketahui';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const canEditField = user && (
    user.role === Role.SUPER_ADMIN || 
    user.role === Role.OWNER_CABANG || 
    user.role === Role.ADMIN_CABANG
  );

  if (!user) {
    router.push('/login');
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!field) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Card className="w-full">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 text-lg">Lapangan tidak ditemukan.</p>
            <Button
              onClick={handleBack}
              className="mt-4"
            >
              Kembali ke Daftar Lapangan
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Card className="w-full">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Detail Lapangan
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <DetailItem label="ID Lapangan" value={field.id} />
              <DetailItem label="Nama Lapangan" value={field.name} />
              <DetailItem 
                label="Tipe Lapangan" 
                value={field.type?.name || 'Tidak tersedia'} 
              />
              <DetailItem 
                label="Cabang" 
                value={field.branch?.name || 'Tidak tersedia'} 
              />
              <DetailItem
                label="Status"
                value={
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(field.status || 'available')}`}
                  >
                    {getStatusText(field.status || 'available')}
                  </span>
                }
              />
              <DetailItem
                label="Dibuat Pada"
                value={field.createdAt ? new Date(field.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                }) : 'Tidak diketahui'}
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Informasi Harga
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailItem 
                  label="Harga Siang (06:00 - 17:00)" 
                  value={formatCurrency(field.priceDay)} 
                />
                <DetailItem 
                  label="Harga Malam (18:00 - 23:00)" 
                  value={formatCurrency(field.priceNight)} 
                />
              </div>
            </div>

            {field.imageUrl && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Gambar Lapangan
                </h3>
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                  <Image
                    src={field.imageUrl}
                    alt={field.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-4 pt-6 border-t bg-gray-50 -mx-8 -mb-8 px-8 py-6 rounded-b-lg">
              {canEditField && (
                <>
                  <Button
                    variant="default"
                    onClick={handleEdit}
                    className="px-6 py-2"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Lapangan
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    className="px-6 py-2"
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Menghapus...' : 'Hapus Lapangan'}
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                onClick={handleBack}
                className="px-6 py-2 border-gray-300 hover:bg-gray-50"
              >
                Kembali
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
      <p className="text-sm font-semibold text-gray-600 mb-2">{label}</p>
      <div className="text-base text-gray-900">{value}</div>
    </div>
  );
}