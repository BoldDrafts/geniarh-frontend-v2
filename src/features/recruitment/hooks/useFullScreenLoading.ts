import { useState, useCallback } from 'react';

export interface FullScreenLoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
  variant?: 'default' | 'blur' | 'overlay';
  data?: any;
}

export interface FullScreenLoadingConfig {
  minDisplayTime?: number;
  showProgress?: boolean;
  variant?: 'default' | 'blur' | 'overlay';
}

export interface FullScreenLoadingOptions {
  data?: any;
  config?: FullScreenLoadingConfig;
  successMessage?: string;
  errorMessage?: string;
}

export const useFullScreenLoading = () => {
  const [loadingState, setLoadingState] = useState<FullScreenLoadingState>({
    isLoading: false,
    variant: 'default'
  });

  const withFullScreenLoading = useCallback(
    async <T>(
      key: string,
      asyncOperation: () => Promise<T>,
      options: FullScreenLoadingOptions = {}
    ): Promise<T> => {
      const {
        data,
        config = {},
        successMessage,
        errorMessage
      } = options;

      const {
        minDisplayTime = 500,
        showProgress = false,
        variant = 'default'
      } = config;

      try {
        // Start loading
        setLoadingState({
          isLoading: true,
          message: `Loading ${key}...`,
          progress: showProgress ? 0 : undefined,
          variant,
          data
        });

        const startTime = Date.now();

        // Simulate progress if enabled
        let progressInterval: NodeJS.Timeout | undefined;
        if (showProgress) {
          progressInterval = setInterval(() => {
            setLoadingState(prev => ({
              ...prev,
              progress: Math.min((prev.progress || 0) + Math.random() * 20, 90)
            }));
          }, 200);
        }

        // Execute the async operation
        const result = await asyncOperation();

        // Clear progress interval
        if (progressInterval) {
          clearInterval(progressInterval);
        }

        // Ensure minimum display time
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minDisplayTime - elapsedTime);

        if (remainingTime > 0) {
          await new Promise(resolve => setTimeout(resolve, remainingTime));
        }

        // Complete loading
        if (showProgress) {
          setLoadingState(prev => ({ ...prev, progress: 100 }));
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        setLoadingState({
          isLoading: false,
          variant: 'default'
        });

        return result;
      } catch (error) {
        setLoadingState({
          isLoading: false,
          variant: 'default'
        });
        throw error;
      }
    },
    []
  );

  const isFullScreenLoading = loadingState.isLoading;

  return {
    withFullScreenLoading,
    isFullScreenLoading,
    loadingState
  };
};