import Cookies from 'js-cookie';

/**
 * Cek apakah cookie dengan nama tertentu ada
 * @param name Nama cookie yang dicari
 * @returns boolean true jika cookie ada, false jika tidak
 */
export const hasCookie = (name: string): boolean => {
  if (typeof window === 'undefined') {
    return false; 
  }
  
  return Cookies.get(name) !== undefined;
};

/**
 * Cek apakah user memiliki cookie autentikasi
 * @returns boolean true jika ada cookie auth, false jika tidak
 */
export const hasAuthCookie = (): boolean => {
  return hasCookie('is_logged_in');
};

/**
 * Mengatur cookie is_logged_in secara manual
 */
export const setIsLoggedInCookie = (): void => {
  if (typeof window === 'undefined') {
    return; 
  }
  Cookies.set('is_logged_in', 'true', { 
    expires: 1/24, 
    path: '/' 
  });
};

/**
 * Menghapus cookie is_logged_in secara manual
 */
export const removeIsLoggedInCookie = (): void => {
  if (typeof window === 'undefined') {
    return; 
  }
  
  Cookies.remove('is_logged_in', { path: '/' });
};

const cookieUtils = {
  hasCookie,
  hasAuthCookie,
  setIsLoggedInCookie,
  removeIsLoggedInCookie
};

export default cookieUtils; 