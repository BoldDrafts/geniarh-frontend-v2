// hooks/useFullScreenLoading.ts - Versión optimizada para navegador

import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FullScreenLoadingState, LoadingRowData, LoadingConfig, LOADING_CONFIGS } from '../../shared/types/loadingStates';

export const useFullScreenLoading = () => {
  const [loadingState, setLoadingState] = useState<FullScreenLoadingState>({
    isActive: false,
    operation: 'other'
  });
  
  // Usar ReturnType para obtener el tipo correcto de setInterval
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const loadingStartTime = useRef<number>(0);

  // Función para simular progreso de carga
  const simulateProgress = useCallback((startTime: number, duration: number = 2000): number => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min((elapsed / duration) * 100, 95);
    return progress;
  }, []);

  // Función para limpiar interval de forma segura
  const clearProgressInterval = useCallback(() => {
    if (progressInterval.current !== null) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  }, []);

  // Iniciar loading de pantalla completa
  const startFullScreenLoading = useCallback((
    operation: FullScreenLoadingState['operation'],
    data?: Partial<LoadingRowData>,
    config?: LoadingConfig
  ) => {
    const finalConfig = { ...LOADING_CONFIGS.ROW_CLICK, ...config };
    loadingStartTime.current = Date.now();

    setLoadingState({
      isActive: true,
      operation,
      data: data ? {
        requirementId: data.requirementId || '',
        requirementTitle: data.requirementTitle || '',
        startTime: loadingStartTime.current,
        progress: 0,
        estimatedDuration: finalConfig.minDisplayTime,
        ...data
      } : undefined,
      canCancel: finalConfig.allowCancel
    });

    // Iniciar simulación de progreso si está habilitada
    if (finalConfig.showProgress) {
      progressInterval.current = setInterval(() => {
        setLoadingState(prev => {
          if (!prev.data) return prev;
          
          const newProgress = simulateProgress(loadingStartTime.current, finalConfig.minDisplayTime);
          return {
            ...prev,
            data: { ...prev.data, progress: newProgress }
          };
        });
      }, 100);
    }

    console.log(`🔄 Full screen loading started: ${operation}`);
  }, [simulateProgress]);

  // Detener loading de pantalla completa
  const stopFullScreenLoading = useCallback(async (
    success: boolean = true,
    message?: string,
    config?: LoadingConfig
  ) => {
    const finalConfig = { ...LOADING_CONFIGS.ROW_CLICK, ...config };
    
    // Completar progreso si está activo
    if (loadingState.data && progressInterval.current) {
      setLoadingState(prev => ({
        ...prev,
        data: prev.data ? { ...prev.data, progress: 100 } : undefined
      }));
      
      // Pequeña pausa para mostrar 100%
      await new Promise<void>(resolve => setTimeout(resolve, 200));
    }

    // Asegurar tiempo mínimo de display
    const elapsedTime = Date.now() - loadingStartTime.current;
    if (elapsedTime < finalConfig.minDisplayTime) {
      await new Promise<void>(resolve => 
        setTimeout(resolve, finalConfig.minDisplayTime - elapsedTime)
      );
    }

    // Limpiar interval de progreso
    clearProgressInterval();

    // Mostrar toast si hay mensaje
    if (message) {
      if (success) {
        toast.success(message);
      } else {
        toast.error(message);
      }
    }

    // Resetear estado
    setLoadingState({
      isActive: false,
      operation: 'other'
    });

    console.log(`🏁 Full screen loading stopped: ${success ? 'success' : 'error'}`);
  }, [loadingState, clearProgressInterval]);

  // Cancelar loading
  const cancelFullScreenLoading = useCallback(() => {
    if (!loadingState.canCancel) {
      console.warn('Loading cannot be cancelled');
      return false;
    }

    clearProgressInterval();

    setLoadingState({
      isActive: false,
      operation: 'other'
    });

    toast.dismiss('Loading cancelled');
    console.log('🚫 Full screen loading cancelled');
    return true;
  }, [loadingState.canCancel, clearProgressInterval]);

  // Wrapper para ejecutar operación con full screen loading
  const withFullScreenLoading = useCallback(async <T>(
    operation: FullScreenLoadingState['operation'],
    asyncFunction: () => Promise<T>,
    options: {
      data?: Partial<LoadingRowData>;
      config?: LoadingConfig;
      successMessage?: string;
      errorMessage?: string;
    } = {}
  ): Promise<T | null> => {
    const { data, config, successMessage, errorMessage } = options;

    try {
      startFullScreenLoading(operation, data, config);
      const result = await asyncFunction();
      await stopFullScreenLoading(true, successMessage, config);
      return result;
    } catch (error) {
      console.error(`Error in ${operation}:`, error);
      await stopFullScreenLoading(false, errorMessage, config);
      throw error;
    }
  }, [startFullScreenLoading, stopFullScreenLoading]);

  // Cleanup effect para limpiar intervals al desmontar
  useEffect(() => {
    return () => {
      clearProgressInterval();
    };
  }, [clearProgressInterval]);

  return {
    loadingState,
    isFullScreenLoading: loadingState.isActive,
    startFullScreenLoading,
    stopFullScreenLoading,
    cancelFullScreenLoading,
    withFullScreenLoading
  };
};

// Versión simplificada usando solo estados booleanos (sin intervals)
export const useSimpleFullScreenLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');

  const showFullScreenLoader = useCallback((message: string = 'Loading...') => {
    setLoadingMessage(message);
    setIsLoading(true);
  }, []);

  const hideFullScreenLoader = useCallback((delay: number = 0) => {
    if (delay > 0) {
      setTimeout(() => setIsLoading(false), delay);
    } else {
      setIsLoading(false);
    }
  }, []);

  const withLoader = useCallback(async <T>(
    asyncFunction: () => Promise<T>,
    message: string = 'Loading...'
  ): Promise<T> => {
    try {
      showFullScreenLoader(message);
      const result = await asyncFunction();
      hideFullScreenLoader(300); // 300ms delay para mostrar completado
      return result;
    } catch (error) {
      hideFullScreenLoader();
      throw error;
    }
  }, [showFullScreenLoader, hideFullScreenLoader]);

  return {
    isLoading,
    loadingMessage,
    showFullScreenLoader,
    hideFullScreenLoader,
    withLoader
  };
};