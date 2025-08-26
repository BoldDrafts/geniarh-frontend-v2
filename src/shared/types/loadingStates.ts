// Tipos específicos para el sistema de loading

export interface LoadingRowData {
  requirementId: string;
  requirementTitle: string;
  startTime: number;
  progress: number;
  estimatedDuration?: number;
}

export interface FullScreenLoadingState {
  isActive: boolean;
  operation: 'row-click' | 'form-submit' | 'bulk-action' | 'other';
  data?: LoadingRowData;
  canCancel?: boolean;
}

export interface LoadingConfig {
  minDisplayTime?: number; // Tiempo mínimo para mostrar el loader
  showProgress?: boolean;
  variant?: 'default' | 'blur' | 'dark';
  allowCancel?: boolean;
}

// Configuraciones predefinidas para diferentes operaciones
export const LOADING_CONFIGS = {
  ROW_CLICK: {
    minDisplayTime: 800,
    showProgress: true,
    variant: 'blur' as const,
    allowCancel: true
  },
  FORM_SUBMIT: {
    minDisplayTime: 1000,
    showProgress: false,
    variant: 'default' as const,
    allowCancel: false
  },
  BULK_OPERATION: {
    minDisplayTime: 1200,
    showProgress: true,
    variant: 'dark' as const,
    allowCancel: true
  }
} as const;