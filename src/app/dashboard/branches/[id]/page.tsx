"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/auth/auth.context";
import { branchApi } from "@/api/branch.api";
import { fieldApi } from "@/api/field.api";
import { Branch, Field, Role, FieldType, FieldStatus, BranchAdmin } from "@/types";
import useGlobalLoading from "@/hooks/useGlobalLoading.hook";
import useToastHandler from "@/hooks/useToastHandler";
import Image from "next/image";

// Interface untuk admin

// Validasi form untuk tambah lapangan
const createFieldSchema = z.object({
  name: z.string().min(3, "Nama lapangan minimal 3 karakter"),
  typeId: z.string().min(1, "Tipe lapangan harus dipilih"),
  priceDay: z
    .string()
    .min(1, "Harga siang harus diisi")
    .regex(/^\d+$/, "Harga harus berupa angka"),
  priceNight: z
    .string()
    .min(1, "Harga malam harus diisi")
    .regex(/^\d+$/, "Harga harus berupa angka"),
  status: z.string().min(1, "Status harus dipilih"),
});

type CreateFieldFormValues = z.infer<typeof createFieldSchema>;

// Komponen Pagination
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}: PaginationProps) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  
  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-sm text-muted-foreground hidden md:block">
        Menampilkan {startItem}-{endItem} dari {totalItems} item
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden md:block">Sebelumnya</span>
      </Button>

      <div className="flex items-center space-x-1">
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNumber;
          if (totalPages <= 5) {
            pageNumber = i + 1;
          } else if (currentPage <= 3) {
            pageNumber = i + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNumber = totalPages - 4 + i;
          } else {
            pageNumber = currentPage - 2 + i;
          }

          return (
            <Button
              key={pageNumber}
              variant={currentPage === pageNumber ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(pageNumber)}
              className="w-8 h-8 p-0"
            >
              {pageNumber}
            </Button>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        <span className="hidden md:block">Selanjutnya</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default function BranchDetailPage() {
  const router = useRouter();
  const { showError, showSuccess } = useToastHandler();
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const { showLoading, hideLoading } = useGlobalLoading();

  // State untuk branch data
  const [branch, setBranch] = useState<Branch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk fields pagination
  const [fields, setFields] = useState<Field[]>([]);
  const [fieldsTotal, setFieldsTotal] = useState(0);
  const [fieldsCurrentPage, setFieldsCurrentPage] = useState(1);
  const [fieldsTotalPages, setFieldsTotalPages] = useState(1);
  const [fieldsLoading, setFieldsLoading] = useState(false);
  const fieldsPerPage = 5;

  // State untuk admins pagination
  const [admins, setAdmins] = useState<BranchAdmin[]>([]);
  const [adminsTotal, setAdminsTotal] = useState(0);
  const [adminsCurrentPage, setAdminsCurrentPage] = useState(1);
  const [adminsTotalPages, setAdminsTotalPages] = useState(1);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const adminsPerPage = 5;

  // State untuk form tambah lapangan
  const [showAddFieldForm, setShowAddFieldForm] = useState(false);
  const [fieldTypes, setFieldTypes] = useState<FieldType[]>([]);
  const [isSubmittingField, setIsSubmittingField] = useState(false);
  const [fieldFormError, setFieldFormError] = useState<string | null>(null);

  // State untuk file handling
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const branchId = parseInt(params?.id as string);

  // Form untuk tambah lapangan
  const fieldForm = useForm<CreateFieldFormValues>({
    resolver: zodResolver(createFieldSchema),
    defaultValues: {
      name: "",
      typeId: "",
      priceDay: "",
      priceNight: "",
      status: "available",
    },
  });

  // Fetch fields dengan pagination
  const fetchFields = async (page: number = 1) => {
    setFieldsLoading(true);
    try {
      // Simulasi API call dengan pagination
      // Ganti dengan actual API call yang mendukung pagination
      const fieldsData = await fieldApi.getFieldsByBranchId(branchId);
      const allFields = Array.isArray(fieldsData.data) ? fieldsData.data : [];

      // Client-side pagination (idealnya dilakukan di server)
      const startIndex = (page - 1) * fieldsPerPage;
      const endIndex = startIndex + fieldsPerPage;
      const paginatedFields = allFields.slice(startIndex, endIndex);

      setFields(paginatedFields);
      setFieldsTotal(allFields.length);
      setFieldsTotalPages(Math.ceil(allFields.length / fieldsPerPage));
      setFieldsCurrentPage(page);
    } catch (err) {
      showError(err, "Gagal memuat data lapangan");
      setFields([]);
      setFieldsTotal(0);
      setFieldsTotalPages(1);
    } finally {
      setFieldsLoading(false);
    }
  };

  // Fetch admins dengan pagination
  const fetchAdmins = async (page: number = 1) => {
    setAdminsLoading(true);
    try {
      // Simulasi API call dengan pagination
      // Ganti dengan actual API call yang mendukung pagination
      const adminsData = await branchApi.getBranchAdmins(branchId);
      const allAdmins = Array.isArray(adminsData.data) ? adminsData.data : [];

      // Client-side pagination (idealnya dilakukan di server)
      const startIndex = (page - 1) * adminsPerPage;
      const endIndex = startIndex + adminsPerPage;
      const paginatedAdmins = allAdmins.slice(startIndex, endIndex);

      setAdmins(paginatedAdmins);
      setAdminsTotal(allAdmins.length);
      setAdminsTotalPages(Math.ceil(allAdmins.length / adminsPerPage));
      setAdminsCurrentPage(page);
    } catch (err) {
      showError(err, "Gagal memuat data admin");
      setAdmins([]);
      setAdminsTotal(0);
      setAdminsTotalPages(1);
    } finally {
      setAdminsLoading(false);
    }
  };

  // Fetch data cabang
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const branchData = await branchApi.getBranchById(branchId);
        setBranch(
          Array.isArray(branchData.data) ? branchData.data[0] : branchData.data
        );

        // Fetch field types untuk form
        const fieldTypeResponse = await fieldApi.getFieldTypes();
        setFieldTypes(fieldTypeResponse || []);

        // Fetch fields dan admins dengan pagination
        await Promise.all([fetchFields(1), fetchAdmins(1)]);
      } catch (err) {
        showError(err, "Gagal memuat data cabang. Silakan coba lagi.");
      } finally {
        setIsLoading(false);
      }
    };

    if (branchId) {
      fetchData();
    }
  }, [branchId]);

  // Authorization check
  if (
    user &&
    user.role !== Role.SUPER_ADMIN &&
    user.role !== Role.OWNER_CABANG &&
    user.role !== Role.ADMIN_CABANG
  ) {
    router.push("/dashboard");
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
      const selectedType = fieldTypes.find(
        (type) => type.id === selectedTypeId
      );

      if (!selectedType) {
        throw new Error("Tipe lapangan tidak ditemukan");
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
          name: selectedType.name,
        },
      };

      if (selectedImage) {
        const formData = new FormData();

        Object.entries(submitData).forEach(([key, value]) => {
          if (key === "type") {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        });

        formData.append("imageUrl", selectedImage);
        await fieldApi.createFieldWithImage(formData);
      } else {
        await fieldApi.createField(submitData);
      }

      // Reset form dan refresh data
      fieldForm.reset();
      setSelectedImage(null);
      setPreviewUrl(null);
      setShowAddFieldForm(false);

      // Refresh fields data dengan pagination
      await fetchFields(fieldsCurrentPage);

      showSuccess("Lapangan berhasil ditambahkan");
    } catch (error) {
      showError(error, "Gagal membuat lapangan. Silakan coba lagi.");
    } finally {
      hideLoading();
      setIsSubmittingField(false);
    }
  };

  // Handle pagination changes
  const handleFieldsPageChange = (page: number) => {
    fetchFields(page);
  };

  const handleAdminsPageChange = (page: number) => {
    fetchAdmins(page);
  };

  const handleEdit = () => {
    router.push(`/dashboard/branches/${branchId}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm("Anda yakin ingin menghapus cabang ini?")) {
      try {
        await branchApi.deleteBranch(branchId);
        if (user?.role === Role.SUPER_ADMIN) {
          router.push("/dashboard/branches");
        } else {
          router.push("/dashboard/my-branches");
        }
      } catch (err) {
        showError(err, "Gagal menghapus cabang. Silakan coba lagi.");
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
        <AlertDescription>{error || "Cabang tidak ditemukan"}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Detail Cabang: {branch.name}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit}>
            Edit
          </Button>
          <Button variant="destructive" className="text-white" onClick={handleDelete}>
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
              <p className="text-sm font-medium text-muted-foreground">
                Alamat:
              </p>
              <p>{branch.location}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Owner:
              </p>
              <p>{branch.owner?.name || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Status:
              </p>
              <p>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    branch.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {branch.status === "active" ? "Aktif" : "Nonaktif"}
                </span>
              </p>
            </div>
          </div>
          {branch.imageUrl && (
            <div className="mt-4">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Gambar:
              </p>
              <Image
                src={branch.imageUrl}
                alt={branch.name}
                width={300}
                height={200}
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
                {showAddFieldForm ? "Tutup Form" : "Tambah Lapangan"}
              </Button>
            </CardHeader>
            <CardContent>
              {showAddFieldForm && (
                <div className="mb-6 p-6 border rounded-md bg-gray-50">
                  <h3 className="text-lg font-semibold mb-4">
                    Form Tambah Lapangan
                  </h3>

                  {fieldFormError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>{fieldFormError}</AlertDescription>
                    </Alert>
                  )}

                  <Form {...fieldForm}>
                    <form
                      onSubmit={fieldForm.handleSubmit(onSubmitField)}
                      className="space-y-4"
                    >
                      <FormField
                        control={fieldForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nama Lapangan</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Masukkan nama lapangan"
                              />
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
                                    <SelectItem
                                      key={type.id}
                                      value={type.id.toString()}
                                    >
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
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Pilih status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="available">
                                    Tersedia
                                  </SelectItem>
                                  <SelectItem value="maintenance">
                                    Pemeliharaan
                                  </SelectItem>
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
                          {isSubmittingField
                            ? "Menyimpan..."
                            : "Simpan Lapangan"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              )}

              {fieldsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : !fields || fields.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Belum ada lapangan di cabang ini
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead>Harga (Siang)</TableHead>
                        <TableHead>Harga (Malam)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field) => (
                        <TableRow key={field.id}>
                          <TableCell>{field.id}</TableCell>
                          <TableCell>{field.name}</TableCell>
                          <TableCell>{field.type?.name || "-"}</TableCell>
                          <TableCell>
                            Rp{" "}
                            {parseInt(field.priceDay.toString()).toLocaleString(
                              "id-ID"
                            )}
                          </TableCell>
                          <TableCell>
                            Rp{" "}
                            {parseInt(
                              field.priceNight.toString()
                            ).toLocaleString("id-ID")}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                field.status === "available"
                                  ? "bg-green-100 text-green-800"
                                  : field.status === "booked"
                                  ? "bg-blue-100 text-blue-800"
                                  : field.status === "maintenance"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {field.status === "available"
                                ? "Tersedia"
                                : field.status === "booked"
                                ? "Dibooking"
                                : field.status === "maintenance"
                                ? "Pemeliharaan"
                                : "Tutup"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(
                                  `/dashboard/branches/${branchId}/fields/${field.id}`
                                )
                              }
                            >
                              Detail
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {fieldsTotalPages > 1 && (
                    <Pagination
                      currentPage={fieldsCurrentPage}
                      totalPages={fieldsTotalPages}
                      onPageChange={handleFieldsPageChange}
                      totalItems={fieldsTotal}
                      itemsPerPage={fieldsPerPage}
                    />
                  )}
                </>
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
              {adminsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : !admins || admins.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Belum ada admin di cabang ini
                </div>
              ) : (
                <>
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

                  {adminsTotalPages > 1 && (
                    <Pagination
                      currentPage={adminsCurrentPage}
                      totalPages={adminsTotalPages}
                      onPageChange={handleAdminsPageChange}
                      totalItems={adminsTotal}
                      itemsPerPage={adminsPerPage}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
