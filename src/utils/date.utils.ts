/**
 * Utility functions for date handling
 */

/**
 * Konversi waktu UTC dari server ke waktu lokal
 * @param utcDateString - String ISO format dari backend
 * @returns Date dalam timezone lokal
 */
export const utcToLocal = (utcDateString: string): Date => {
  const date = new Date(utcDateString);
  return date;
};

/**
 * Format tanggal ke format lokal yang mudah dibaca
 * @param date - Objek Date
 * @returns String tanggal format "DD/MM/YYYY HH:MM"
 */
export const formatDate = (date: Date): string => {
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

/**
 * Ekstrak jam dari objek Date
 * @param date - Objek Date
 * @returns String jam format "HH:00"
 */
export const extractHour = (date: Date): string => {
  return `${date.getHours().toString().padStart(2, '0')}:00`;
};

/**
 * Konversi waktu lokal ke UTC untuk dikirim ke server
 * @param localDate - Date dalam timezone lokal
 * @returns String dalam format ISO UTC
 */
export const localToUTC = (localDate: Date): string => {
  return localDate.toISOString();
};

/**
 * Parse string waktu HH:MM dan gabungkan dengan tanggal
 * @param dateStr - String tanggal format YYYY-MM-DD
 * @param timeStr - String waktu format HH:MM
 * @returns Date object yang menggabungkan tanggal dan waktu
 */
export const combineDateAndTime = (dateStr: string, timeStr: string): Date => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(dateStr);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

/**
 * Format rentang waktu dari dua string waktu UTC menjadi format jam saja
 * @param startTimeUTC - String waktu mulai format ISO UTC atau format jam HH:MM
 * @param endTimeUTC - String waktu selesai format ISO UTC atau format jam HH:MM
 * @returns String rentang jam format "HH:MM - HH:MM"
 */
export const formatTimeRange = (startTime: string, endTime: string): string => {
  // Cek apakah input sudah dalam format HH:MM
  if (startTime.length <= 5 && endTime.length <= 5) {
    return `${startTime} - ${endTime}`;
  }
  
  // Jika format ISO UTC, konversi ke objek Date
  const startDate = startTime.includes('T') ? utcToLocal(startTime) : new Date(`1970-01-01T${startTime}`);
  const endDate = endTime.includes('T') ? utcToLocal(endTime) : new Date(`1970-01-01T${endTime}`);
  
  // Format hanya jam dan menit
  const startTimeFormatted = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;
  const endTimeFormatted = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
  
  return `${startTimeFormatted} - ${endTimeFormatted}`;
}; 