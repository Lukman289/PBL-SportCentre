// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter, useParams } from 'next/navigation';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { userApi, UpdateUserRequest } from '@/api/user.api';
// import { User, Role } from '@/types';
// import { useAuth } from '@/context/auth/auth.context';
// import { toast } from 'sonner';

// export default function EditUserPage() {
//   const router = useRouter();
//   const params = useParams();
//   const { user: authUser } = useAuth();
//   const userId = Number(params.id);

//   const [form, setForm] = useState<UpdateUserRequest>({
//     name: '',
//     email: '',
//     phone: '',
//     password: '',
//     role: undefined,
//   });

//   const [showPassword, setShowPassword] = useState(false);
//   const [currentUser, setCurrentUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [initialLoading, setInitialLoading] = useState(true);
//   const [errors, setErrors] = useState<Record<string, string>>({});

//   // Check authorization
//   if (!authUser || ![Role.SUPER_ADMIN, Role.ADMIN_CABANG, Role.OWNER_CABANG].includes(authUser.role)) {
//     router.push('/dashboard');
//     return null;
//   }

//   // Fetch user data
//   useEffect(() => {
//     async function fetchUser() {
//       try {
//         setInitialLoading(true);
//         const userData = await userApi.getUserById(userId);
        
//         // Handle case where user is not found
//         if (!userData) {
//           toast.error('Pengguna tidak ditemukan');
//           router.push('/dashboard/users');
//           return;
//         }

//         setCurrentUser(userData);

//         setForm({
//           name: userData.name,
//           email: userData.email,
//           phone: userData.phone || '',
//           password: '', // Always empty for security
//           role: userData.role,
//         });
//       } catch (err) {
//         console.error('Failed to fetch user:', err);
//         toast.error('Gagal mengambil data pengguna');
//         router.push('/dashboard/users');
//       } finally {
//         setInitialLoading(false);
//       }
//     }

//     fetchUser();
//   }, [userId, router]);

//   const validateForm = () => {
//     const newErrors: Record<string, string> = {};
    
//     if (!form.name?.trim()) newErrors.name = 'Nama harus diisi';
//     if (!form.email?.trim()) newErrors.email = 'Email harus diisi';
//     if (!form.role) newErrors.role = 'Peran harus dipilih';
    
//     // Validasi format email
//     if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
//       newErrors.email = 'Format email tidak valid';
//     }
    
//     // Validasi format telepon (minimal 8 digit angka) jika diisi
//     if (form.phone && form.phone.trim() && !/^\d{8,}$/.test(form.phone)) {
//       newErrors.phone = 'Nomor telepon harus minimal 8 digit angka';
//     }
    
//     // Validasi password minimal 6 karakter jika diisi
//     if (form.password && form.password.length < 6) {
//       newErrors.password = 'Password minimal 6 karakter';
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleChange = (field: keyof UpdateUserRequest, value: string) => {
//     setForm(prev => ({
//       ...prev,
//       [field]: value,
//     }));
    
//     // Clear error when user starts typing
//     if (errors[field]) {
//       setErrors(prev => ({
//         ...prev,
//         [field]: '',
//       }));
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       return;
//     }

//     setLoading(true);
//     setErrors({});

//     try {
//       // Prepare update data (only send fields that have values)
//       const updateData: UpdateUserRequest = {};
      
//       if (form.name?.trim()) updateData.name = form.name.trim();
//       if (form.email?.trim()) updateData.email = form.email.trim();
//       if (form.phone?.trim()) updateData.phone = form.phone.trim();
      
//       // Only send password if it's not empty
//       if (form.password?.trim() && form.password.length >= 6) {
//         updateData.password = form.password.trim();
//       }
      
//       if (form.role) updateData.role = form.role;

//       console.log('Sending update data:', updateData); // Debug log

//       await userApi.updateUserById(userId, updateData);
      
//       toast.success('Pengguna berhasil diperbarui');
      
//       setTimeout(() => {
//         router.push(`/dashboard/users/${userId}?refresh=true`);
//       }, 100);
      
//     } catch (err: any) {
//       console.error('Error updating user:', err);
      
//       // Enhanced error handling
//       if (err.response?.data?.message) {
//         if (err.response.data.message.includes('Email sudah digunakan')) {
//           setErrors({ email: 'Email sudah digunakan oleh pengguna lain' });
//         } else if (err.response.data.message.includes('Peran yang diizinkan')) {
//           setErrors({ role: err.response.data.message });
//         } else {
//           toast.error(err.response.data.message);
//         }
//       } else if (err.response?.status === 401) {
//         toast.error('Anda tidak memiliki izin untuk melakukan aksi ini');
//         router.push('/login');
//       } else if (err.response?.status === 403) {
//         toast.error('Anda tidak memiliki akses untuk mengedit pengguna ini');
//       } else if (err.response?.status === 404) {
//         toast.error('Pengguna tidak ditemukan');
//         router.push('/dashboard/users');
//       } else {
//         toast.error('Gagal memperbarui pengguna. Silakan coba lagi.');
//         console.error('Full error:', err);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Get allowed roles based on current user's role
//   const getAllowedRoles = () => {
//     if (authUser?.role === Role.SUPER_ADMIN) {
//       return [Role.SUPER_ADMIN, Role.ADMIN_CABANG, Role.OWNER_CABANG, Role.USER];
//     } else if (authUser?.role === Role.ADMIN_CABANG || authUser?.role === Role.OWNER_CABANG) {
//       return [Role.USER, Role.ADMIN_CABANG];
//     }
//     return [Role.USER];
//   };

//   const getRoleLabel = (role: Role) => {
//     switch (role) {
//       case Role.SUPER_ADMIN:
//         return 'Super Admin';
//       case Role.ADMIN_CABANG:
//         return 'Admin Cabang';
//       case Role.OWNER_CABANG:
//         return 'Owner Cabang';
//       case Role.USER:
//         return 'Pengguna';
//       default:
//         return role;
//     }
//   };

//   if (initialLoading) {
//     return (
//       <div className="flex justify-center p-8">
//         <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
//       </div>
//     );
//   }

//   if (!currentUser) {
//     return <p className="p-4 text-red-600">Pengguna tidak ditemukan.</p>;
//   }

//   return (
//     <div className="container mx-auto">
//       <div className="mb-6">
//         <h1 className="text-2xl font-bold">Edit Pengguna</h1>
//         <p className="text-muted-foreground">Edit informasi pengguna</p>
//       </div>
//       <Card>
//         <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
//           <CardTitle className="text-2xl font-bold text-gray-800">
//             Edit Pengguna: {currentUser.name}
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="p-6">
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <Label htmlFor="name">Nama Lengkap</Label>
//                 <Input
//                   id="name"
//                   type="text"
//                   placeholder="Nama pengguna"
//                   value={form.name}
//                   onChange={(e) => handleChange('name', e.target.value)}
//                   className={errors.name ? 'border-red-500' : ''}
//                   disabled={loading}
//                 />
//                 {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
//               </div>

//               <div>
//                 <Label htmlFor="email">Alamat Email</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="Email pengguna"
//                   value={form.email}
//                   onChange={(e) => handleChange('email', e.target.value)}
//                   className={errors.email ? 'border-red-500' : ''}
//                   disabled={loading}
//                 />
//                 {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
//               </div>

//               <div>
//                 <Label htmlFor="phone">Nomor Telepon</Label>
//                 <Input
//                   id="phone"
//                   type="tel"
//                   placeholder="Nomor telepon pengguna"
//                   value={form.phone}
//                   onChange={(e) => handleChange('phone', e.target.value)}
//                   className={errors.phone ? 'border-red-500' : ''}
//                   disabled={loading}
//                 />
//                 {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
//               </div>

//               <div>
//                 <Label htmlFor="role">Peran Pengguna</Label>
//                 <Select 
//                   value={form.role} 
//                   onValueChange={(value: Role) => handleChange('role', value)}
//                   disabled={loading}
//                 >
//                   <SelectTrigger id="role" className={errors.role ? 'border-red-500' : ''}>
//                     <SelectValue placeholder="Pilih peran" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {getAllowedRoles().map((role) => (
//                       <SelectItem key={role} value={role}>
//                         {getRoleLabel(role)}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
//               </div>

//               <div className="relative">
//                 <Label htmlFor="password">Password Baru</Label>
//                 <Input
//                   id="password"
//                   type={showPassword ? 'text' : 'password'}
//                   placeholder="kosongkan jika tidak ingin mengubah "
//                   value={form.password}
//                   onChange={(e) => handleChange('password', e.target.value)}
//                   className={errors.password ? 'border-red-500' : ''}
//                   disabled={loading}
//                 />
//                 <button
//                   type="button"
//                   className="absolute right-2 top-8 text-gray-500 hover:text-gray-700"
//                   onClick={() => setShowPassword(!showPassword)}
//                 >
//                   {showPassword ? (
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                       <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
//                       <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
//                     </svg>
//                   ) : (
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                       <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
//                       <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
//                     </svg>
//                   )}
//                 </button>
//                 {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
//                 <p className="text-xs text-gray-500 mt-1">Minimal 6 karakter</p>
//               </div>
//             </div>
//             <div className="flex flex-wrap gap-4 pt-6 border-t">
//               <Button type="submit" disabled={loading} className="px-8">
//                 {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
//               </Button>
//               <Button 
//                 type="button"
//                 variant="outline" 
//                 onClick={() => router.push(`/dashboard/users`)}
//                 disabled={loading}
//                 className="px-8"
//               >
//                 Batal
//               </Button>
//             </div>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }