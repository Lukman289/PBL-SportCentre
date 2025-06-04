'use client';

import { useCallback } from 'react';

/**
 * Hook dummy untuk kompatibilitas dengan kode lama.
 * Tidak melakukan apa-apa karena loading ditangani oleh NextTopLoader.
 */
export default function useGlobalLoading() {
  const showLoading = useCallback(() => {
    // NextTopLoader otomatis menangani loading
  }, []);

  const hideLoading = useCallback(() => {
    // NextTopLoader otomatis menangani loading
  }, []);

  const updateProgress = useCallback(() => {
    // NextTopLoader otomatis menangani progress
  }, []);

  const withLoading = useCallback(
    async <T,>(promise: Promise<T>): Promise<T> => {
      try {
        return await promise;
      } catch (error) {
        throw error;
      }
    },
    []
  );

  return {
    isLoading: false,
    progress: 0,
    showLoading,
    hideLoading,
    updateProgress,
    withLoading
  };
} 