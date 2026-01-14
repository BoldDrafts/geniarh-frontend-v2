// hooks/useLoading.ts
import { useState, useCallback } from 'react';

interface LoadingOptions {
  onSuccess?: (result?: any) => void;
  onError?: (error: any) => void;
}

export const useLoading = () => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const isLoading = useCallback((key: string): boolean => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const withLoading = useCallback(async <T>(
    key: string,
    asyncFunction: () => Promise<T>,
    options?: LoadingOptions
  ): Promise<T | undefined> => {
    try {
      setLoadingStates(prev => ({ ...prev, [key]: true }));
      const result = await asyncFunction();
      options?.onSuccess?.(result);
      return result;
    } catch (error) {
      options?.onError?.(error);
      throw error;
    } finally {
      setLoadingStates(prev => ({ ...prev, [key]: false }));
    }
  }, []);

  return {
    isLoading,
    withLoading,
    loadingStates
  };
};