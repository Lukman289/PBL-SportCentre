'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/auth/auth.context';
import { branchApi } from '@/api/branch.api';
import { fieldApi } from '@/api/field.api';
import { Branch, Field, Role, FieldType, FieldStatus } from '@/types';
import useGlobalLoading from '@/hooks/useGlobalLoading.hook';
import Image from 'next/image';

// Interface untuk admin
interface BranchAdmin {
  userId: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

// Validasi form untuk tambah lapangan
const createFieldSchema = z.object({
  name: z.string().min(3, 'Nama lapangan minimal 3 karakter'),
  typeId: z.string().min(1, 'Tipe lapangan harus dipilih'),
  priceDay: z.string().min(1, 'Harga siang harus diisi').regex(/^\d+$/, 'Harga harus berupa angka'),
  priceNight: z.string().min(1, 'Harga malam harus diisi').regex(/^\d+$/, 'Harga harus berupa angka'),
  status: z.string().min(1, 'Status harus dipilih'),
});

type CreateFieldFormValues = z.infer<typeof createFieldSchema>;

export default function BranchDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const { showLoading, hideLoading } = useGlobalLoading();
  
  // State untuk branch data
  const [branch, setBranch] = useState<Branch | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [admins, setAdmins] = useState<BranchAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State untuk form tambah lapangan
  const [showAddFieldForm, setShowAddFieldForm] = useState(false);
  const [fieldTypes, setFieldTypes] = useState<FieldType[]>([]);
  const [isSubmittingField, setIsSubmittingField] = useState(false);
  const [fieldFormError, setFieldFormError] = useState<string | null>(null);
  
  // State untuk file handling
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const branchId = parseInt(params.id as string);

  // Form untuk tambah lapangan
  const fieldForm = useForm<CreateFieldFormValues>({
    resolver: zodResolver(createFieldSchema),
    defaultValues: {
      name: '',
      typeId: '',
      priceDay: '',
      priceNight: '',
      status: 'available',
    },
  });

  // Fetch data cabang
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const branchData = await branchApi.getBranchById(branchId);
        setBranch(Array.isArray(branchData.data) ? branchData.data[0] : branchData.data);

        try {
          const fieldsData = await fieldApi.getFieldsByBranchId(branchId);
          console.log('Fields response:', fieldsData);
          setFields(Array.isArray(fieldsData.data) ? fieldsData.data : []);
        } catch (err) {
          console.error('Error fetching fields:', err);
          setFields([]);
        }

        const adminsData = await branchApi.getBranchAdmins(branchId);
        setAdmins(Array.isArray(adminsData.data) ? adminsData.data : []);

        // Fetch field types untuk form
        const fieldTypeResponse = await fieldApi.getFieldTypes();
        setFieldTypes(fieldTypeResponse || []);
      } catch (err) {
        console.error('Error fetching branch details:', err);
        setError('Gagal memuat data cabang. Silakan coba lagi.');
        setAdmins([]);
        setFields([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (branchId) {
      fetchData();
    }
  }, [branchId]);

  // Authorization check
  if (user && user.role !== Role.SUPER_ADMIN && user.role !== Role.OWNER_CABANG && user.role !== Role.ADMIN_CABANG) {
    router.push('/dashboard');
    return null;
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedImage(null);
      setPreviewUrl(null);
    }
  };

  // Submit form tambah lapangan
  const onSubmitField = async (data: CreateFieldFormValues) => {
    try {
      showLoading();
      setIsSubmittingField(true);
      setFieldFormError(null);

      const selectedTypeId = parseInt(data.typeId);
      const selectedType = fieldTypes.find(type => type.id === selectedTypeId);
      
      if (!selectedType) {
        throw new Error('Tipe lapangan tidak ditemukan');
      }

      const submitData = {
        name: data.name,
        typeId: selectedTypeId,
        branchId: branchId,
        priceDay: parseFloat(data.priceDay),
        priceNight: parseFloat(data.priceNight),
        status: data.status as FieldStatus,
        type: {
          id: selectedTypeId,
          name: selectedType.name
        },
      };

      if (selectedImage) {
        const formData = new FormData();
        
        Object.entries(submitData).forEach(([key, value]) => {
          if (key === 'type') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        });
        
        formData.append('imageUrl', selectedImage);
        await fieldApi.createFieldWithImage(formData);
      } else {
        await fieldApi.createField(submitData);
      }
      
      // Reset form dan refresh data
      fieldForm.reset();
      setSelectedImage(null);
      setPreviewUrl(null);
      setShowAddFieldForm(false);
      
      // Refresh fields data
      const fieldsData = await fieldApi.getFieldsByBranchId(branchId);
      setFields(Array.isArray(fieldsData) ? fieldsData : []);
      
    } catch (error) {
      console.error('Error creating field:', error);
      setFieldFormError('Gagal membuat lapangan. Silakan coba lagi.');
    } finally {
      hideLoading();
      setIsSubmittingField(false);
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/branches/${branchId}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm('Anda yakin ingin menghapus cabang ini?')) {
      try {
        await branchApi.deleteBranch(branchId);
        if (user?.role === Role.SUPER_ADMIN) {
          router.push('/dashboard/branches');
        } else {
          router.push('/dashboard/my-branches');
        }
      } catch (err) {
        console.error('Error deleting branch:', err);
        setError('Gagal menghapus cabang. Silakan coba lagi.');
      }
    }
  };

  const handleAddField = () => {
    setShowAddFieldForm(!showAddFieldForm);
    if (!showAddFieldForm) {
      // Reset form dan file saat membuka form
      fieldForm.reset();
      setSelectedImage(null);
      setPreviewUrl(null);
      setFieldFormError(null);
    }
  };

  const handleAddAdmin = () => {
    router.push(`/dashboard/branches/${branchId}/add-admin`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !branch) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error || 'Cabang tidak ditemukan'}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Detail Cabang: {branch.name}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit}>
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Hapus
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Informasi Cabang</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">ID:</p>
              <p>{branch.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nama:</p>
              <p>{branch.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Alamat:</p>
              <p>{branch.location}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Owner:</p>
              <p>{branch.owner?.name || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status:</p>
              <p>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${branch.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                    }`}
                >
                  {branch.status === 'active' ? 'Aktif' : 'Nonaktif'}
                </span>
              </p>
            </div>
          </div>
          {branch.imageUrl && (
            <div className="mt-4">
              <p className="text-sm font-medium text-muted-foreground mb-2">Gambar:</p>
              <img
                src={branch.imageUrl}
                alt={branch.name}
                className="w-full max-w-md h-auto rounded-md"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="fields" className="w-full">
        <TabsList>
          <TabsTrigger value="fields">Lapangan</TabsTrigger>
          <TabsTrigger value="admins">Admin</TabsTrigger>
        </TabsList>

        <TabsContent value="fields" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Daftar Lapangan</CardTitle>
              <Button onClick={handleAddField}>
                {showAddFieldForm ? 'Tutup Form' : 'Tambah Lapangan'}
              </Button>
            </CardHeader>
            <CardContent>
              {showAddFieldForm && (
                <div className="mb-6 p-6 border rounded-md bg-gray-50">
                  <h3 className="text-lg font-semibold mb-4">Form Tambah Lapangan</h3>
                  
                  {fieldFormError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>{fieldFormError}</AlertDescription>
                    </Alert>
                  )}

                  <Form {...fieldForm}>
                    <form onSubmit={fieldForm.handleSubmit(onSubmitField)} className="space-y-4">
                      <FormField
                        control={fieldForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nama Lapangan</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Masukkan nama lapangan" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={fieldForm.control}
                          name="typeId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipe Lapangan</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Pilih tipe lapangan" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {fieldTypes.map((type) => (
                                    <SelectItem key={type.id} value={type.id.toString()}>
                                      {type.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={fieldForm.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Pilih status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="available">Tersedia</SelectItem>
                                  <SelectItem value="maintenance">Pemeliharaan</SelectItem>
                                  <SelectItem value="closed">Tutup</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={fieldForm.control}
                          name="priceDay"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Harga Siang (Rp)</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  placeholder="Masukkan harga siang"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={fieldForm.control}
                          name="priceNight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Harga Malam (Rp)</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  placeholder="Masukkan harga malam"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormItem>
                        <FormLabel>Gambar Lapangan</FormLabel>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                            />
                            <p className="text-sm text-gray-500 mt-1">
                              Ukuran maksimal: 5MB. Format: JPG, PNG
                            </p>
                          </div>
                          <div>
                            {previewUrl && (
                              <Image
                                src={previewUrl}
                                alt="Preview"
                                width={160}
                                height={120}
                                className="mt-2 max-h-30 rounded object-cover"
                              />
                            )}
                          </div>
                        </div>
                      </FormItem>

                      <div className="flex justify-end gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setShowAddFieldForm(false)}
                        >
                          Batal
                        </Button>
                        <Button type="submit" disabled={isSubmittingField}>
                          {isSubmittingField ? 'Menyimpan...' : 'Simpan Lapangan'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              )}

              {!fields || fields.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Belum ada lapangan di cabang ini
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Harga (Siang)</TableHead>
                      <TableHead>Harga (Malam)</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field) => (
                      <TableRow key={field.id}>
                        <TableCell>{field.id}</TableCell>
                        <TableCell>{field.name}</TableCell>
                        <TableCell>{field.type?.name || '-'}</TableCell>
                        <TableCell>
                          Rp {parseInt(field.priceDay.toString()).toLocaleString('id-ID')}
                        </TableCell>
                        <TableCell>
                          Rp {parseInt(field.priceNight.toString()).toLocaleString('id-ID')}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${field.status === 'available'
                                ? 'bg-green-100 text-green-800'
                                : field.status === 'booked'
                                  ? 'bg-blue-100 text-blue-800'
                                  : field.status === 'maintenance'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                              }`}
                          >
                            {field.status === 'available'
                              ? 'Tersedia'
                              : field.status === 'booked'
                                ? 'Dibooking'
                                : field.status === 'maintenance'
                                  ? 'Pemeliharaan'
                                  : 'Tutup'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admins" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Daftar Admin</CardTitle>
              <Button onClick={handleAddAdmin}>Tambah Admin</Button>
            </CardHeader>
            <CardContent>
              {!admins || admins.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Belum ada admin di cabang ini
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.map((admin) => (
                      <TableRow key={admin.userId}>
                        <TableCell>{admin.userId}</TableCell>
                        <TableCell>{admin.user.name}</TableCell>
                        <TableCell>{admin.user.email}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}