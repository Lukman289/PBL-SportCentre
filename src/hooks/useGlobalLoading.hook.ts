'use client';

import { useCallback } from 'react';
import { useLoading } from '@/context/loading/loading.context';

export default function useGlobalLoading() {
  const { isLoading, startLoading, stopLoading } = useLoading();

  const showLoading = useCallback(() => {
    startLoading();
  }, [startLoading]);

  const hideLoading = useCallback(() => {
    stopLoading();
  }, [stopLoading]);

  const withLoading = useCallback(
    async <T,>(promise: Promise<T>): Promise<T> => {
      try {
        startLoading();
        return await promise;
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading]
  );

  return {
    isLoading,
    showLoading,
    hideLoading,
    withLoading
  };
} 