'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldType } from '@/types';
import { fieldApi } from '@/api/field.api';
import { useAuth } from '@/context/auth/auth.context';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

// Tipe untuk error
interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
      errors?: string[];
    };
  };
  message?: string;
}

export default function EditFieldTypePage() {
  const params = useParams();
  const router = useRouter();
  const { user: authUser } = useAuth();
  const fieldTypeId = Number(params?.id);
  const [fieldType, setFieldType] = useState<FieldType | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
  });

  useEffect(() => {
    const fetchFieldType = async () => {
      try {
        const fieldTypeData = await fieldApi.getFieldTypeById(fieldTypeId);
        setFieldType(fieldTypeData);
        setFormData({
          name: fieldTypeData.name,
        });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fieldType) return;

    try {
      setUpdating(true);
      
      await fieldApi.updateFieldType(fieldTypeId, formData);
      
      toast({
        title: 'Success',
        description: 'Field type updated successfully',
      });
      
      router.push(`/dashboard/fieldtypes/${fieldTypeId}`);
    } catch (error) {
      console.error('Failed to update field type:', error);
      const apiError = error as ApiError;
      
      const errorMessage = apiError.response?.data?.message || 
        apiError.response?.data?.errors?.join('\n') || 
        'Failed to update field type. Please try again.';
      
      toast({
        title: 'Update Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Card className="w-full">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Edit Field Type
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <Label htmlFor="name">Nama Jenis Lapangan</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-2"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/dashboard/fieldtypes/${fieldTypeId}`)}
                disabled={updating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updating}>
                {updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Simpan'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}