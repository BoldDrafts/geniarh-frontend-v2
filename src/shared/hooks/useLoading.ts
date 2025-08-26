import { useState, useCallback, useRef } from 'react';

interface LoadingState {
  [key: string]: boolean;
}

export const useLoading = () => {
  const [loading, setLoading] = useState<LoadingState>({});
  const pendingRequests = useRef<Set<string>>(new Set());

  const setLoadingState = useCallback((key: string, isLoading: boolean) => {
    if (isLoading) {
      pendingRequests.current.add(key);
    } else {
      pendingRequests.current.delete(key);
    }

    setLoading(prev => ({
      ...prev,
      [key]: isLoading
    }));
  }, []);

  const withLoading = useCallback(async <T>(
    key: string,
    asyncFunction: () => Promise<T>,
    options: {
      preventDuplicates?: boolean;
      onError?: (error: any) => void;
      onSuccess?: (result: T) => void;
    } = {}
  ): Promise<T | null> => {
    const { preventDuplicates = true, onError, onSuccess } = options;

    // Prevenir peticiones duplicadas
    if (preventDuplicates && pendingRequests.current.has(key)) {
      console.log(`Request ${key} already in progress, skipping...`);
      return null;
    }

    try {
      setLoadingState(key, true);
      const result = await asyncFunction();
      onSuccess?.(result);
      return result;
    } catch (error) {
      console.error(`Error in ${key}:`, error);
      onError?.(error);
      throw error;
    } finally {
      setLoadingState(key, false);
    }
  }, [setLoadingState]);

  const isLoading = useCallback((key: string) => {
    return loading[key] || false;
  }, [loading]);

  const isAnyLoading = useCallback(() => {
    return Object.values(loading).some(Boolean);
  }, [loading]);

  const clearLoading = useCallback((key?: string) => {
    if (key) {
      pendingRequests.current.delete(key);
      setLoading(prev => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });
    } else {
      pendingRequests.current.clear();
      setLoading({});
    }
  }, []);

  return {
    loading,
    isLoading,
    isAnyLoading,
    withLoading,
    clearLoading,
    setLoadingState
  };
};