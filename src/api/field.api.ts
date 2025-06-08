import axiosInstance from '../config/axios.config';
import {
  Field,
  FieldReview,
  FieldType,
  FieldReviewResponseWithMeta,
  FieldCreateResponse,
  AvailabilityResponse,
  FieldListParams,
  FieldResponseWithMeta
} from '../types';
import { bookingApi } from './booking.api';
import { Booking } from '../types';
import { getLocalHourFromDate } from '../utils/timezone.utils';
import useToastHandler from '../hooks/useToastHandler';

// Type guards for better type checking
function isStandardResponse(data: unknown): data is { status: boolean; data: Field } {
  return !!data && typeof data === 'object' && 'status' in data && 'data' in data;
}

function isLegacyResponse(data: unknown): data is { field: Field } {
  return !!data && typeof data === 'object' && 'field' in data;
}

function isField(data: unknown): data is Field {
  return !!data && typeof data === 'object' && 'id' in data && 'name' in data;
}

class FieldApi {
  /**
   * Dapatkan semua lapangan
   * @returns Promise dengan array data lapangan
   */
  async getAllFields(params?: FieldListParams): Promise<FieldResponseWithMeta> {
    try {
      const response = await axiosInstance.get<FieldResponseWithMeta>('/fields', { params: params });
      return response.data;
    } catch (error) {
      return { data: [], meta: { page: 1, limit: 10, totalItems: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false } };
    }
  }

  /**
   * Dapatkan lapangan berdasarkan ID
   * @param id - ID lapangan
   * @returns Promise dengan data lapangan
   */
  async getFieldById(id: number): Promise<Field | null> {
    try {
      const response = await axiosInstance.get<{ data: Field } | Field>(`/fields/${id}`);

      if ('data' in response.data) {
        return response.data.data;
      } else {
        return response.data;
      }
    } catch (error) {
      return null;
    }
  }

  /**
   * Dapatkan lapangan berdasarkan cabang
   * @param branchId - ID cabang
   * @returns Promise dengan array data lapangan
   */
  async getBranchFields(branchId: number, params?: FieldListParams): Promise<FieldResponseWithMeta> {
    try {
      const response = await axiosInstance.get<FieldResponseWithMeta>(`/branches/${branchId}/fields`, { params: params });
      return response.data;
    } catch (error) {
      return { data: [], meta: { page: 1, limit: 10, totalItems: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false } };
    }
  }

  /**
   * Dapatkan lapangan berdasarkan cabang (alias untuk getBranchFields)
   * @param branchId - ID cabang
   * @returns Promise dengan array data lapangan
   */
  async getFieldsByBranchId(branchId: number, params?: FieldListParams): Promise<FieldResponseWithMeta> {
    return this.getBranchFields(branchId, params);
  }

  /**
   * Dapatkan semua tipe lapangan
   * @returns Promise dengan array tipe lapangan
   */
  async getFieldTypes(): Promise<FieldType[]> {
    try {
      const response = await axiosInstance.get<{ data: FieldType[] } | { fieldTypes: FieldType[] } | FieldType[]>('/field-types');

      // Handle format respons yang berbeda-beda
      if (response.data && typeof response.data === 'object') {
        // Format 1: { data: [...], meta: {...} }
        if ('data' in response.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
        // Format 2: { fieldTypes: [...] }
        else if ('fieldTypes' in response.data && Array.isArray(response.data.fieldTypes)) {
          return response.data.fieldTypes;
        }
        // Format 3: Array langsung [...]
        else if (Array.isArray(response.data)) {
          return response.data;
        }
      }

      // Jika format tidak dikenali, kembalikan array kosong
      return [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Buat lapangan baru
   * @param data - Data lapangan baru
   * @returns Promise dengan data lapangan yang berhasil dibuat
   */
  async createField(data: Omit<Field, 'id' | 'createdAt'>): Promise<Field> {
    const response = await axiosInstance.post<{ field: Field }>('/fields', data);
    return response.data.field;
  }

  /**
   * Update data lapangan
   * @param id - ID lapangan
   * @param data - Data lapangan yang akan diupdate
   * @returns Promise dengan data lapangan yang berhasil diupdate
   */
  async updateField(id: number, data: Partial<Omit<Field, 'id' | 'createdAt'>>): Promise<Field> {
    const response = await axiosInstance.put<{ field: Field }>(`/fields/${id}`, data);
    return response.data.field;
  }

  /**
   * Hapus lapangan
   * @param id - ID lapangan
   * @returns Promise dengan pesan sukses
   */
  async deleteField(fieldId: number): Promise<{ message: string }> {
    const response = await axiosInstance.delete<{ message: string }>(`/fields/${fieldId}`);
    return response.data;
}

  /**
   * Upload gambar untuk lapangan
   * @param id - ID lapangan
   * @param image - File gambar
   * @returns Promise dengan URL gambar yang berhasil diupload
   */
  async uploadFieldImage(id: number, image: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', image);

    const response = await axiosInstance.post<{ imageUrl: string }>(`/fields/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Dapatkan review lapangan
   * @param fieldId - ID lapangan
   * @returns Promise dengan array data review
   */
  async getFieldReviews(fieldId: number): Promise<FieldReviewResponseWithMeta> {
    const response = await axiosInstance.get<FieldReviewResponseWithMeta>(`/field-reviews?fieldId=${fieldId}`);
    return response.data;
  }

  /**
   * Buat review lapangan
   * @param fieldId - ID lapangan
   * @param data - Data review baru
   * @returns Promise dengan data review yang berhasil dibuat
   */
  async createFieldReview(
    fieldId: number,
    data: { rating: number; review?: string }
  ): Promise<FieldReview> {
    const response = await axiosInstance.post<{ data: FieldReview }>(`/field-reviews/field/${fieldId}`, {
      fieldId,
      ...data
    });
    return response.data.data;
  }

  /**
   * Cek ketersediaan lapangan
   * @param fieldId - ID lapangan
   * @param date - Tanggal booking (format: YYYY-MM-DD)
   * @returns Promise dengan data slot waktu tersedia
   */
  async checkFieldAvailability(fieldId: number, date: string): Promise<{ slots: { time: string, available: boolean }[] }> {

    try {
      try {
        // Coba endpoint pertama
        const response = await axiosInstance.get<{ data: { slots: { time: string, available: boolean }[] } } | { slots: { time: string, available: boolean }[] }>(`/fields/${fieldId}/availability?date=${date}&noCache=true`);

        // Format 1: { data: { slots: [...] } }
        if ('data' in response.data && response.data.data && response.data.data.slots) {
          return { slots: response.data.data.slots };
        }
        // Format 2: { slots: [...] }
        else if ('slots' in response.data) {
          return { slots: response.data.slots };
        }

        throw new Error('Unexpected response format');
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        // Gunakan endpoint alternatif jika endpoint utama tidak ditemukan
        const response = await axiosInstance.get<AvailabilityResponse>(`/fields/availability`, {
          params: {
            date,
            fieldId,
            noCache: true
          }
        });

        // Dapatkan data yang relevan untuk lapangan tertentu
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          const fieldData = response.data.data.find((f) => f.fieldId === fieldId);

          if (fieldData && fieldData.availableTimeSlots) {
            // Konversi format dari availableTimeSlots ke format slot yang diharapkan
            const timeSlots = Array.from({ length: 14 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`);
            const slots: { time: string, available: boolean }[] = [];

            // Buat set dari jam yang tersedia
            const availableHoursSet = new Set<string>();
            fieldData.availableTimeSlots.forEach((slot) => {
              // Parse ISO string ke objek Date
              const startTimeUTC = new Date(slot.start);
              const endTimeUTC = new Date(slot.end);

              // Gunakan utility function untuk mendapatkan jam lokal (WIB)
              const localStartHour = getLocalHourFromDate(startTimeUTC);
              const localEndHour = getLocalHourFromDate(endTimeUTC);


              // Handle kasus di mana end hour lebih kecil dari start hour (melewati tengah malam)
              if (localEndHour < localStartHour) {
                // Dari start hour sampai tengah malam
                for (let hour = localStartHour; hour < 24; hour++) {
                  availableHoursSet.add(`${hour.toString().padStart(2, '0')}:00`);
                }
                // Dari tengah malam sampai end hour
                for (let hour = 0; hour < localEndHour; hour++) {
                  availableHoursSet.add(`${hour.toString().padStart(2, '0')}:00`);
                }
              } else {
                // Kasus normal: start hour lebih kecil dari end hour
                for (let hour = localStartHour; hour < localEndHour; hour++) {
                  availableHoursSet.add(`${hour.toString().padStart(2, '0')}:00`);
                }
              }
            });

            // Buat array slot dengan status ketersediaan
            timeSlots.forEach(time => {
              slots.push({
                time,
                available: availableHoursSet.has(time)
              });
            });

            return { slots };
          }
        }

        // Jika tidak berhasil mendapatkan data dari API alternatif
        throw new Error('Tidak dapat menemukan data ketersediaan lapangan');
      }
    } catch (error) {

      // Fallback: buat semua slot tersedia
      const timeSlots = Array.from({ length: 14 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`);
      const slots = timeSlots.map(time => ({ time, available: true }));

      return { slots };
    }
  }

  /**
   * Mendapatkan data slot waktu yang terpesan untuk lapangan berdasarkan cabang, tanggal dan waktu
   * @param selectedBranch - ID cabang
   * @param selectedDate - Tanggal booking (format: YYYY-MM-DD)
   * @param fields - Data lapangan
   * @param times - Array waktu dalam format "HH:MM"
   * @returns Promise dengan object yang berisi ID lapangan dan array waktu yang terpesan
   */
  async fetchBookedTimeSlots(
    selectedBranch: number,
    selectedDate: string,
    fields: Field[],
    times: string[]
  ): Promise<{ [key: number]: string[] }> {
    try {
      // Force refresh data - hapus cache dari tanggal yang dipilih
      const cacheKey = `${selectedBranch}_${selectedDate}`;
      sessionStorage.removeItem(cacheKey);

      const booked: { [key: number]: string[] } = {};

      // Gunakan endpoint untuk mendapatkan ketersediaan semua lapangan sekaligus
      try {
        const response = await axiosInstance.get<AvailabilityResponse>(`/fields/availability`, {
          params: {
            date: selectedDate,
            branchId: selectedBranch > 0 ? selectedBranch : undefined,
            noCache: true
          }
        });

        // Proses respons API
        const responseData = response.data;

        if (responseData && responseData.success && Array.isArray(responseData.data)) {
          // Iterasi setiap lapangan dalam respons
          responseData.data.forEach((fieldAvailability) => {
            const fieldId = fieldAvailability.fieldId;
            const availableTimeSlots = fieldAvailability.availableTimeSlots || [];

            // Konversi slot waktu tersedia menjadi rentang jam yang tersedia
            // Kita akan membuat set dari semua jam yang tersedia
            const availableHoursSet = new Set<string>();

            // Iterasi setiap slot waktu tersedia
            availableTimeSlots.forEach((slot) => {
              // Parse ISO string ke objek Date
              const startTimeUTC = new Date(slot.start);
              const endTimeUTC = new Date(slot.end);
              const localStartHour = getLocalHourFromDate(startTimeUTC);
              const localEndHour = getLocalHourFromDate(endTimeUTC);


              // Penanganan khusus: jika slot mencakup 00:00-24:00 (seluruh hari)
              if (localStartHour === 0 && localEndHour === 0 &&
                startTimeUTC.getUTCDate() === endTimeUTC.getUTCDate() - 1) {
                // Seluruh hari tersedia, tambahkan semua jam
                times.forEach(time => availableHoursSet.add(time));
              } else {
                // Dapatkan semua jam di antara waktu mulai dan selesai (end time exclusive)
                // PENTING: endTime bersifat exclusive sehingga booking 8:00-10:00 berarti 
                // hanya jam 8:00 dan 9:00 yang terpesan, sementara jam 10:00 masih tersedia
                
                // Handle kasus di mana end hour lebih kecil dari start hour (melewati tengah malam)
                if (localEndHour < localStartHour) {
                  // Dari start hour sampai tengah malam
                  for (let hour = localStartHour; hour < 24; hour++) {
                    availableHoursSet.add(`${hour.toString().padStart(2, '0')}:00`);
                  }
                  // Dari tengah malam sampai end hour
                  for (let hour = 0; hour < localEndHour; hour++) {
                    availableHoursSet.add(`${hour.toString().padStart(2, '0')}:00`);
                  }
                } else {
                  // Kasus normal: start hour lebih kecil dari end hour
                  for (let hour = localStartHour; hour < localEndHour; hour++) {
                    availableHoursSet.add(`${hour.toString().padStart(2, '0')}:00`);
                  }
                }
              }
            });

            // Semua jam yang tidak ada dalam availableHoursSet dianggap terpesan
            const bookedHours = times.filter(time => !Array.from(availableHoursSet).includes(time));
            booked[fieldId] = bookedHours;  
          });
        } else {
        }
      } catch (error) {

        // Fallback ke metode alternatif jika endpoint utama gagal
        try {
          const filteredFields = fields.filter(field => field.branchId === selectedBranch);

          // Inisialisasi booked entries untuk semua lapangan (penting untuk reset)
          filteredFields.forEach(field => {
            booked[field.id] = [];
          });

          // Dapatkan semua booking
          const bookings = await bookingApi.getUserBookings();
          const allBookings = Array.isArray(bookings) ? bookings : [];

          // Filter booking berdasarkan tanggal yang dipilih
          const relevantBookings = allBookings.filter((booking: Booking) => {
            const bookingDate = new Date(booking.bookingDate).toISOString().split('T')[0];
            return bookingDate === selectedDate;
          });


          // Kelompokkan booking berdasarkan lapangan
          relevantBookings.forEach((booking: Booking) => {
            const fieldId = booking.fieldId;

            if (!booked[fieldId]) {
              booked[fieldId] = [];
            }

            // Konversi waktu dengan benar ke zona waktu lokal menggunakan utility function
            const startTimeUTC = new Date(booking.startTime);
            const endTimeUTC = new Date(booking.endTime);
            
            const localStartHour = getLocalHourFromDate(startTimeUTC);
            const localEndHour = getLocalHourFromDate(endTimeUTC);

            // Tandai semua jam dalam rentang sebagai terpesan (inclusive startTime, exclusive endTime)
            // Contoh: Booking 21:00-23:00 akan menandai jam 21:00 dan 22:00 sebagai terpesan
            if (localEndHour < localStartHour) {
              // Kasus melewati tengah malam
              for (let hour = localStartHour; hour < 24; hour++) {
                const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
                if (!booked[fieldId].includes(timeSlot)) {
                  booked[fieldId].push(timeSlot);
                }
              }
              for (let hour = 0; hour < localEndHour; hour++) {
                const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
                if (!booked[fieldId].includes(timeSlot)) {
                  booked[fieldId].push(timeSlot);
                }
              }
            } else {
              // Kasus normal
              for (let hour = localStartHour; hour < localEndHour; hour++) {
                const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
                if (!booked[fieldId].includes(timeSlot)) {
                  booked[fieldId].push(timeSlot);
                }
              }
            }
          });
        } catch (fallbackError) {
        }
      }

      return booked;
    } catch (error) {
      return {};
    }
  }
  /**
     * Buat field baru dengan gambar
     * @param formData - FormData yang berisi data field dan gambar
     */
  async createFieldWithImage(formData: FormData): Promise<Field> {
    try {
      const response = await axiosInstance.post<FieldCreateResponse>('/fields', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Handle berbagai format respons yang mungkin
      const responseData = response.data;

      // Format API baru: { status, message, data }
      if ('status' in responseData && 'data' in responseData) {
        return responseData.data;
      }
      // Format lama: { field: {...} }
      else if ('field' in responseData) {
        return responseData.field;
      }
      // Field object directly returned
      else if ('id' in responseData) {
        return responseData;
      }

      throw new Error('Unexpected response format');
    } catch (error) {
      throw error;
    }
  }
  /**
   * Update field with image
   * @param fieldId - ID field yang akan diupdate
   */
  async updateFieldWithImage(fieldId: number, formData: FormData): Promise<Field> {
    try {
      const response = await axiosInstance.put(`/fields/${fieldId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Handle different response formats
      const responseData = response.data;

      if (isStandardResponse(responseData)) {
        return responseData.data;
      }
      if (isLegacyResponse(responseData)) {
        return responseData.field;
      }
      if (isField(responseData)) {
        return responseData;
      }

      throw new Error('Unexpected response format');
    } catch (error) {
      throw error;
    }
  }
  /**
   * Buat tipe field baru
   * @param data - Data tipe field baru
   */
  async createFieldType(data: Omit<FieldType, 'id' | 'createdAt'>): Promise<FieldType> {
    const response = await axiosInstance.post<{ data: FieldType }>('/field-types', data);
    return response.data.data;
  }
  /**
   * Dapatkan tipe field berdasarkan ID
   */
  async getFieldTypeById(fieldTypes: number): Promise<FieldType> {
    const response = await axiosInstance.get<{ data: FieldType }>(`/field-types/${fieldTypes}`);
    return response.data.data;
  }
  /**
   * Update tipe field
   * @param id - ID tipe field
   * @param data - Data tipe field yang akan diupdate
   */
  async updateFieldType(id: number, data: { name: string }): Promise<FieldType> {
  const response = await axiosInstance.put<{ data: FieldType }>(`/field-types/${id}`, data);
  return response.data.data;
}
}


export const fieldApi = new FieldApi(); 