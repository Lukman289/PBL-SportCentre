'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldType, Role } from '@/types';
import { useAuth } from '@/context/auth/auth.context';
import { fieldApi } from '@/api/field.api';
import axiosInstance from '@/config/axios.config';
import { toast } from '@/components/ui/use-toast';

// Tipe untuk error
interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export default function FieldTypeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user: authUser } = useAuth();
    const fieldTypeId = Number(params?.id);
    const [fieldType, setFieldType] = useState<FieldType | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const fetchFieldType = async () => {
            try {
                const fieldTypeData = await fieldApi.getFieldTypeById(fieldTypeId);
                setFieldType(fieldTypeData);
            } catch (err) {
                console.error('Failed to fetch field type:', err);
                const error = err as ApiError;

                if (error.response?.status === 403) {
                    toast({
                        title: 'Access Denied',
                        description: 'You do not have permission to view this field type',
                        variant: 'destructive',
                    });
                    router.push('/dashboard');
                } else if (error.response?.status === 404) {
                    toast({
                        title: 'Field Type Not Found',
                        description: 'The field type you requested was not found',
                        variant: 'destructive',
                    });
                    router.push('/dashboard/fieldtypes');
                } else {
                    toast({
                        title: 'Error',
                        description: 'Failed to load field type data',
                        variant: 'destructive',
                    });
                    router.push('/dashboard/fieldtypes');
                }
            } finally {
                setLoading(false);
            }
        };

        if (authUser) {
            fetchFieldType();
        }
    }, [fieldTypeId, router, authUser]);

    const handleDelete = async () => {
        if (!authUser || !fieldType) return;

        const confirmDelete = window.confirm(
            `Are you sure you want to delete field type "${fieldType.name}"? This action cannot be undone.`
        );

        if (confirmDelete) {
            setDeleting(true);
            try {
                await axiosInstance.delete(`/fieldtypes/${fieldTypeId}`);

                toast({
                    title: 'Success',
                    description: `Field type "${fieldType.name}" has been deleted`,
                });

                router.push('/dashboard/fieldtypes');
            } catch (error) {
                console.error('Failed to delete field type:', error);
                const apiError = error as ApiError;

                const errorMessage = apiError.response?.data?.message ||
                    'Failed to delete field type. Please try again.';

                toast({
                    title: 'Deletion Failed',
                    description: errorMessage,
                    variant: 'destructive',
                });
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
        <div className="p-6 max-w-6xl mx-auto">
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

                        <div className="flex flex-wrap gap-4 pt-6 border-t bg-gray-50 -mx-8 -mb-8 px-8 py-6 rounded-b-lg">
                            <Button
                                variant="outline"
                                onClick={() => router.push('/dashboard/fieldtypes')}
                                className="px-6 py-2 border-gray-300 hover:bg-gray-50"
                            >
                                Back
                            </Button>
                            <Button
                                onClick={() => router.push(`/dashboard/fieldtypes/${fieldTypeId}/edit`)}
                                className="px-6 py-2"
                            >
                                Edit
                            </Button>
                            {canDelete && (
                                <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                    className="px-6 py-2"
                                    disabled={deleting}
                                >
                                    {deleting ? 'Deleting...' : 'Delete '}
                                </Button>
                            )}
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