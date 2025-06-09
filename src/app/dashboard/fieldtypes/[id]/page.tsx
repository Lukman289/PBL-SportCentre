'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldType, Role } from '@/types';
import { useAuth } from '@/context/auth/auth.context';
import { fieldApi } from '@/api/field.api';
import axiosInstance from '@/config/axios.config';
import useToastHandler from '@/hooks/useToastHandler';

export default function FieldTypeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user: authUser } = useAuth();
    const fieldTypeId = Number(params?.id);
    const [fieldType, setFieldType] = useState<FieldType | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const { showError, showSuccess } = useToastHandler();

    useEffect(() => {
        const fetchFieldType = async () => {
            try {
                const fieldTypeData = await fieldApi.getFieldTypeById(fieldTypeId);
                setFieldType(fieldTypeData);
            } catch (err) {
                showError(err, 'Gagal memuat data jenis lapangan');
                
                // Redirect ke halaman field types jika terjadi error
                router.push('/dashboard/fieldtypes');
            } finally {
                setLoading(false);
            }
        };

        if (authUser) {
            fetchFieldType();
        }
    }, [fieldTypeId, router, authUser, showError]);

    const handleDelete = async () => {
        if (!authUser || !fieldType) return;

        const confirmDelete = window.confirm(
            `Apakah Anda yakin ingin menghapus jenis lapangan "${fieldType.name}"? Tindakan ini tidak dapat dibatalkan.`
        );

        if (confirmDelete) {
            setDeleting(true);
            try {
                await axiosInstance.delete(`/fieldtypes/${fieldTypeId}`);

                showSuccess(`Jenis lapangan "${fieldType.name}" berhasil dihapus`);

                router.push('/dashboard/fieldtypes');
            } catch (error) {
                showError(error, 'Gagal menghapus jenis lapangan');
            } finally {
                setDeleting(false);
            }
        }
    };

    if (!authUser) {
        router.push('/login');
        return null;
    }

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!fieldType) {
        return (
            <div className="p-6 max-w-6xl mx-auto">
                <Card className="w-full">
                    <CardContent className="p-8 text-center">
                        <p className="text-red-600 text-lg">Field type not found.</p>
                        <Button
                            onClick={() => router.push('/dashboard/fieldtypes')}
                            className="mt-4"
                        >
                            Back to Field Types
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Check if current user can delete this field type
    const canDelete = authUser &&
        (authUser.role === Role.SUPER_ADMIN ||
            authUser.role === Role.OWNER_CABANG);

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">
                    Detail Tipe Lapangan
                </h1>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/dashboard/fieldtypes/${fieldTypeId}/edit`)}
                    >
                        Edit
                    </Button>
                    {canDelete && (
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleting}
                        >
                            {deleting ? 'Deleting...' : 'Hapus'}
                        </Button>
                    )}
                </div>
            </div>
            <Card className="w-full">
                <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardTitle className="text-2xl font-bold text-gray-800">
                        Field Type Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <DetailItem label="ID" value={fieldType.id} />
                            <DetailItem label="Name" value={fieldType.name} />
                            {/* <DetailItem
                label="Created At"
                value={new Date(fieldType.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              /> */}
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