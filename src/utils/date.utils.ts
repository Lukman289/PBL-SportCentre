/**
 * @deprecated Gunakan timezone.utils.ts sebagai gantinya
 * File ini dipertahankan untuk kompatibilitas dengan kode yang sudah ada
 */

import { format, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

/**
 * Utility functions for date handling
 */

/**
 * Tetapkan timezone WIB
 */
export const TIMEZONE = 'Asia/Jakarta';

/**
 * Konversi waktu UTC dari server ke waktu lokal WIB
 * @param utcDateString - String ISO format dari backend
 * @returns Date dalam timezone lokal
 */
export const utcToLocal = (utcDateString: string): Date => {
  const date = new Date(utcDateString);
  return toZonedTime(date, TIMEZONE);
};

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
 * Ekstrak jam dari objek Date dalam timezone WIB
 * @param date - Objek Date
 * @returns String jam format "HH:00"
 */
export const extractHour = (date: Date): string => {
  const zonedDate = toZonedTime(date, TIMEZONE);
  return format(zonedDate, 'HH:00');
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
 * Format rentang waktu dari dua string waktu UTC menjadi format jam saja
 * @param startTime - String waktu mulai format ISO UTC atau format jam HH:MM
 * @param endTime - String waktu selesai format ISO UTC atau format jam HH:MM
 * @returns String rentang jam format "HH:MM - HH:MM"
 */
export const formatTimeRange = (startTime: string, endTime: string): string => {
  // Cek apakah input sudah dalam format HH:MM
  if (startTime.length <= 5 && endTime.length <= 5) {
    return `${startTime} - ${endTime}`;
  }
  
  // Jika format ISO UTC, konversi ke objek Date dalam timezone WIB
  const startDate = startTime.includes('T') ? utcToLocal(startTime) : toZonedTime(new Date(`1970-01-01T${startTime}`), TIMEZONE);
  const endDate = endTime.includes('T') ? utcToLocal(endTime) : toZonedTime(new Date(`1970-01-01T${endTime}`), TIMEZONE);
  
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
 * Mengkonversi tanggal ke awal hari dalam timezone WIB
 * @param date Tanggal yang akan dikonversi
 * @returns Date object yang menunjukkan awal hari dalam WIB
 */
export const getStartOfDayWIB = (date: Date): Date => {
  const zonedDate = toZonedTime(date, TIMEZONE);
  // Set jam, menit, detik, milidetik ke 0
  const startOfDay = setMilliseconds(setSeconds(setMinutes(setHours(zonedDate, 0), 0), 0), 0);
  return startOfDay;
};

/**
 * Membuat Date dengan jam tertentu dalam timezone WIB
 * @param baseDate Tanggal dasar
 * @param hour Jam yang diinginkan (0-23)
 * @returns Date object dengan jam yang ditentukan dalam WIB
 */
export const createDateWithHourWIB = (baseDate: Date, hour: number): Date => {
  const zonedDate = toZonedTime(baseDate, TIMEZONE);
  // Set jam spesifik dan reset menit, detik, milidetik
  const dateWithHour = setMilliseconds(setSeconds(setMinutes(setHours(zonedDate, hour), 0), 0), 0);
  return dateWithHour;
};

/**
 * Mendapatkan jam lokal (WIB) dari Date UTC
 * @param utcDate - Date dalam UTC
 * @returns Jam dalam integer (0-23) dalam timezone WIB
 */
export const getLocalHourFromUTC = (utcDate: Date): number => {
  return parseInt(format(toZonedTime(utcDate, TIMEZONE), 'H'));
};

/**
 * Mengkonversi waktu UTC ke format jam WIB
 * @param utcDate - Date dalam UTC
 * @returns String jam format "HH:00" dalam timezone WIB
 */
export const formatUTCtoWIBHour = (utcDate: Date): string => {
  const localHour = getLocalHourFromUTC(utcDate);
  return `${localHour.toString().padStart(2, '0')}:00`;
};