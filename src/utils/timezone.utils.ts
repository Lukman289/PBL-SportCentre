import { format, setHours, setMinutes, setSeconds, setMilliseconds, addHours, startOfDay, endOfDay } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

/**
 * Tetapkan timezone WIB
 */
export const TIMEZONE = 'Asia/Jakarta';

/**
 * Format tanggal ke format lokal yang mudah dibaca
 * @param date - Objek Date
 * @returns String tanggal format "DD/MM/YYYY HH:MM"
 */
export const formatDate = (date: Date): string => {
  const zonedDate = toZonedTime(date, TIMEZONE);
  return format(zonedDate, 'dd/MM/yyyy HH:mm');
};

/**
 * Format tanggal ke format yang lebih lengkap
 * @param date - Objek Date
 * @returns String tanggal format "DD MMMM YYYY, HH:MM"
 */
export const formatDateLong = (date: Date): string => {
  const zonedDate = toZonedTime(date, TIMEZONE);
  return format(zonedDate, 'dd MMMM yyyy, HH:mm');
};

/**
 * Format tanggal ke format yang lebih sederhana
 * @param date - Objek Date
 * @returns String tanggal format "DD MMM YYYY"
 */
export const formatDateShort = (date: Date): string => {
  const zonedDate = toZonedTime(date, TIMEZONE);
  return format(zonedDate, 'dd MMM yyyy');
};

/**
 * Ekstrak jam dari objek Date dalam timezone WIB
 * @param date - Objek Date
 * @returns String jam format "HH:00"
 */
export const extractHour = (date: Date): string => {
  const zonedDate = toZonedTime(date, TIMEZONE);
  return format(zonedDate, 'HH:00');
};

/**
 * Parse string waktu HH:MM dan gabungkan dengan tanggal dalam timezone WIB
 * @param dateStr - String tanggal format YYYY-MM-DD
 * @param timeStr - String waktu format HH:MM
 * @returns Date object yang menggabungkan tanggal dan waktu
 */
export const combineDateAndTime = (dateStr: string, timeStr: string): Date => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(dateStr);
  const zonedDate = toZonedTime(date, TIMEZONE);
  return setMilliseconds(setSeconds(setMinutes(setHours(zonedDate, hours), minutes), 0), 0);
};

/**
 * Format rentang waktu dari dua string waktu menjadi format jam saja
 * @param startTime - String waktu mulai format HH:MM atau ISO date string
 * @param endTime - String waktu selesai format HH:MM atau ISO date string
 * @returns String rentang jam format "HH:MM - HH:MM"
 */
export const formatTimeRange = (startTime: string, endTime: string): string => {
  // Cek apakah input sudah dalam format HH:MM
  if (startTime.length <= 5 && endTime.length <= 5) {
    return `${startTime} - ${endTime}`;
  }
  
  // Jika format ISO, konversi ke objek Date dalam timezone WIB
  const startDate = startTime.includes('T') 
    ? toZonedTime(new Date(startTime), TIMEZONE) 
    : toZonedTime(new Date(`1970-01-01T${startTime}`), TIMEZONE);
  
  const endDate = endTime.includes('T') 
    ? toZonedTime(new Date(endTime), TIMEZONE) 
    : toZonedTime(new Date(`1970-01-01T${endTime}`), TIMEZONE);
  
  // Format hanya jam dan menit
  const startTimeFormatted = format(startDate, 'HH:mm');
  const endTimeFormatted = format(endDate, 'HH:mm');
  
  return `${startTimeFormatted} - ${endTimeFormatted}`;
};

/**
 * Mengkonversi tanggal ke string format WIB
 * @param date Tanggal yang akan diformat
 * @returns String tanggal dalam format WIB
 */
export const formatDateToWIB = (date: Date): string => {
  return formatInTimeZone(date, TIMEZONE, 'yyyy-MM-dd HH:mm:ss xxxx');
};

/**
 * Mendapatkan awal hari dalam timezone WIB
 * @param date Tanggal input
 * @returns Date object yang menunjukkan awal hari dalam WIB
 */
export const getStartOfDayWIB = (date: Date): Date => {
  const zonedDate = toZonedTime(date, TIMEZONE);
  return startOfDay(zonedDate);
};

/**
 * Mendapatkan akhir hari dalam timezone WIB
 * @param date Tanggal input
 * @returns Date object yang menunjukkan akhir hari dalam WIB
 */
export const getEndOfDayWIB = (date: Date): Date => {
  const zonedDate = toZonedTime(date, TIMEZONE);
  return endOfDay(zonedDate);
};

/**
 * Menambahkan jam ke tanggal dalam timezone WIB
 * @param date Tanggal dasar
 * @param hours Jumlah jam yang akan ditambahkan
 * @returns Date object hasil penambahan jam
 */
export const addHoursWIB = (date: Date, hours: number): Date => {
  const zonedDate = toZonedTime(date, TIMEZONE);
  return addHours(zonedDate, hours);
};

/**
 * Format tanggal dan waktu untuk ditampilkan di UI
 * @param date Tanggal yang akan diformat
 * @returns String tanggal dan waktu dalam format yang mudah dibaca
 */
export const formatDateTimeForDisplay = (date: Date | string): string => {
  if (!date) return '-';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const zonedDate = toZonedTime(dateObj, TIMEZONE);
  return format(zonedDate, 'dd MMM yyyy, HH:mm');
};

/**
 * Mendapatkan jam lokal (WIB) dari Date
 * @param date - Date
 * @returns Jam dalam integer (0-23) dalam timezone WIB
 */
export const getLocalHourFromDate = (date: Date): number => {
  return parseInt(format(toZonedTime(date, TIMEZONE), 'H'));
}; 