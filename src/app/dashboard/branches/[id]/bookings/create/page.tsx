"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { bookingApi } from "@/api/booking.api";
import { PaymentMethod, PaymentStatus } from "@/types/booking.types";
import { fieldApi } from "@/api/field.api";
import { userApi } from "@/api/user.api";
import { Field } from "@/types/field.types";
import { User } from "@/types/user.types";
import PageTitle from "@/components/common/PageTitle";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function CreateManualBookingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const branchId = parseInt(params.id);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fields, setFields] = useState<Field[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [availableTimeSlots, setAvailableTimeSlots] = useState<{ startTime: string; endTime: string }[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    userId: "",
    fieldId: "",
    startTime: "",
    endTime: "",
    paymentStatus: PaymentStatus.PAID,
    paymentMethod: PaymentMethod.CASH,
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        // Fetch fields for this branch
        const branchFields = await fieldApi.getBranchFields(branchId);
        setFields(branchFields);
        
        // Fetch users for dropdown
        const allUsers = await userApi.getAllUsers();
        setUsers(allUsers);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast({
          title: "Error",
          description: "Gagal memuat data awal",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [branchId]);

  useEffect(() => {
    const fetchAvailableTimeSlots = async () => {
      try {
        if (formData.fieldId && selectedDate) {
          const formattedDate = format(selectedDate, "yyyy-MM-dd");
          const { availableSlots } = await bookingApi.checkFieldAvailability(
            parseInt(formData.fieldId),
            formattedDate
          );
          setAvailableTimeSlots(availableSlots);
        }
      } catch (error) {
        console.error("Error fetching available time slots:", error);
        toast({
          title: "Error",
          description: "Gagal memuat slot waktu yang tersedia",
          variant: "destructive",
        });
      }
    };
    
    if (formData.fieldId && selectedDate) {
      fetchAvailableTimeSlots();
    }
  }, [formData.fieldId, selectedDate]);

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    // Reset time slots when date changes
    setFormData((prev) => ({ ...prev, startTime: "", endTime: "" }));
  };

  const validateForm = () => {
    if (!formData.userId) {
      toast({
        title: "Error",
        description: "Silahkan pilih pengguna",
        variant: "destructive",
      });
      return false;
    }
    
    if (!formData.fieldId) {
      toast({
        title: "Error",
        description: "Silahkan pilih lapangan",
        variant: "destructive",
      });
      return false;
    }
    
    if (!selectedDate) {
      toast({
        title: "Error",
        description: "Silahkan pilih tanggal booking",
        variant: "destructive",
      });
      return false;
    }
    
    if (!formData.startTime) {
      toast({
        title: "Error",
        description: "Silahkan pilih waktu mulai",
        variant: "destructive",
      });
      return false;
    }
    
    if (!formData.endTime) {
      toast({
        title: "Error",
        description: "Silahkan pilih waktu selesai",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      
      const bookingData = {
        userId: parseInt(formData.userId),
        fieldId: parseInt(formData.fieldId),
        branchId,
        bookingDate: format(selectedDate!, "yyyy-MM-dd"),
        startTime: formData.startTime,
        endTime: formData.endTime,
        paymentStatus: formData.paymentStatus,
        paymentMethod: formData.paymentMethod,
      };
      
      // Call API to create manual booking
      await bookingApi.createManualBooking(bookingData);
      
      toast({
        title: "Sukses",
        description: "Booking manual berhasil dibuat",
      });
      
      // Redirect back to bookings page
      router.push(`/dashboard/bookings`);
    } catch (error) {
      console.error("Error creating manual booking:", error);
      toast({
        title: "Error",
        description: "Gagal membuat booking manual",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container flex items-center justify-center h-[calc(100vh-200px)]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="container p-4">
      <div className="flex items-center gap-4 mb-6">
        <Button onClick={() => router.back()} variant="outline" size="icon">
          <ArrowLeft size={16} />
        </Button>
        <PageTitle title="Buat Booking Manual" />
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Form Booking Manual</CardTitle>
          <CardDescription>
            Silahkan isi form berikut untuk membuat booking manual
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userId">Pilih Pengguna</Label>
                <Select
                  value={formData.userId}
                  onValueChange={(value) => handleSelectChange("userId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih pengguna" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fieldId">Pilih Lapangan</Label>
                <Select
                  value={formData.fieldId}
                  onValueChange={(value) => handleSelectChange("fieldId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih lapangan" />
                  </SelectTrigger>
                  <SelectContent>
                    {fields.map((field) => (
                      <SelectItem key={field.id} value={field.id.toString()}>
                        {field.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tanggal Booking</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        format(selectedDate, "EEEE, dd MMMM yyyy", { locale: id })
                      ) : (
                        "Pilih tanggal"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      initialFocus
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paymentStatus">Status Pembayaran</Label>
                <Select
                  value={formData.paymentStatus}
                  onValueChange={(value) => handleSelectChange("paymentStatus", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PaymentStatus.PAID}>Lunas</SelectItem>
                    <SelectItem value={PaymentStatus.PENDING}>Menunggu Pembayaran</SelectItem>
                    <SelectItem value={PaymentStatus.DP_PAID}>DP Terbayar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Waktu Mulai</Label>
                <Select
                  value={formData.startTime}
                  onValueChange={(value) => handleSelectChange("startTime", value)}
                  disabled={!formData.fieldId || !selectedDate || availableTimeSlots.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih waktu mulai" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimeSlots.map((slot, index) => (
                      <SelectItem key={`start-${index}`} value={slot.startTime}>
                        {slot.startTime}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">Waktu Selesai</Label>
                <Select
                  value={formData.endTime}
                  onValueChange={(value) => handleSelectChange("endTime", value)}
                  disabled={!formData.startTime}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih waktu selesai" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimeSlots
                      .filter((slot) => slot.startTime >= formData.startTime)
                      .map((slot, index) => (
                        <SelectItem key={`end-${index}`} value={slot.endTime}>
                          {slot.endTime}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Metode Pembayaran</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => handleSelectChange("paymentMethod", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih metode pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PaymentMethod.CASH}>Tunai</SelectItem>
                    <SelectItem value={PaymentMethod.TRANSFER}>Transfer</SelectItem>
                    <SelectItem value={PaymentMethod.CREDIT_CARD}>Kartu Kredit</SelectItem>
                    <SelectItem value={PaymentMethod.EWALLET}>E-Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Menyimpan..." : "Simpan Booking"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 