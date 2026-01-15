import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  StageDueDate,
  CreateStageDueDateRequest,
  UpdateStageDueDateRequest,
  StageDueDateFilterParams,
  StageDueDateStats,
  StageDueDateSummary,
  DaysOverdueCalculation
} from '../types/stageDueDate';
import { stageDueDateService } from '../api/stageDueDateService';
import { authService } from '../../../shared/api/authService';

interface UseStageDueDateOptions {
  recruitmentId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseStageDueDateReturn {
  dueDates: StageDueDate[];
  loading: boolean;
  error: string | null;
  stats: StageDueDateStats | null;
  summary: StageDueDateSummary[];
  refresh: () => Promise<void>;
  createDueDate: (request: CreateStageDueDateRequest) => Promise<StageDueDate>;
  updateDueDate: (id: string, request: UpdateStageDueDateRequest) => Promise<StageDueDate>;
  deleteDueDate: (id: string) => Promise<void>;
  markAsCompleted: (id: string, notes?: string) => Promise<StageDueDate>;
  getByStage: (stage: StageDueDate['stage']) => Promise<StageDueDate[]>;
  getOverdue: (daysOverdue?: number) => Promise<StageDueDate[]>;
  getUpcomingAlerts: (daysThreshold?: number) => Promise<StageDueDate[]>;
  calculateDaysOverdue: (dueDate: string) => DaysOverdueCalculation;
}

/**
 * Hook personalizado para manejar fechas de vencimiento por etapa
 */
export const useStageDueDates = ({
  recruitmentId,
  autoRefresh = false,
  refreshInterval = 30000
}: UseStageDueDateOptions): UseStageDueDateReturn => {
  const [dueDates, setDueDates] = useState<StageDueDate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StageDueDateStats | null>(null);
  const [summary, setSummary] = useState<StageDueDateSummary[]>([]);

  /**
   * Validar permisos
   */
  const validatePermissions = useCallback((): boolean => {
    return authService.hasPermission(['recruiter-supervisor', 'recruiter'], false);
  }, []);

  /**
   * Obtener fechas de vencimiento
   */
  const fetchDueDates = useCallback(async (params?: StageDueDateFilterParams) => {
    if (!validatePermissions()) {
      toast.error('No tiene permisos para ver fechas de vencimiento');
      return;
    }

    if (!recruitmentId) {
      setError('ID de proceso de reclutamiento es requerido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await stageDueDateService.getStageDueDates(recruitmentId, params);
      setDueDates(response.data);
      
      // Actualizar estadísticas y resumen
      const statsData = await stageDueDateService.getStats(recruitmentId);
      setStats(statsData);
      
      const summaryData = await stageDueDateService.getSummary(recruitmentId);
      setSummary(summaryData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar fechas de vencimiento');
    } finally {
      setLoading(false);
    }
  }, [recruitmentId, validatePermissions]);

  /**
   * Refrescar datos
   */
  const refresh = useCallback(async () => {
    await fetchDueDates();
  }, [fetchDueDates]);

  /**
   * Crear fecha de vencimiento
   */
  const createDueDate = useCallback(async (request: CreateStageDueDateRequest): Promise<StageDueDate> => {
    if (!validatePermissions()) {
      toast.error('No tiene permisos para crear fechas de vencimiento');
      throw new Error('Insufficient permissions');
    }

    return await stageDueDateService.createStageDueDate(recruitmentId, request);
  }, [recruitmentId, validatePermissions]);

  /**
   * Actualizar fecha de vencimiento
   */
  const updateDueDate = useCallback(async (id: string, request: UpdateStageDueDateRequest): Promise<StageDueDate> => {
    if (!validatePermissions()) {
      toast.error('No tiene permisos para actualizar fechas de vencimiento');
      throw new Error('Insufficient permissions');
    }

    return await stageDueDateService.updateStageDueDate(recruitmentId, id, request);
  }, [recruitmentId, validatePermissions]);

  /**
   * Eliminar fecha de vencimiento
   */
  const deleteDueDate = useCallback(async (id: string): Promise<void> => {
    if (!validatePermissions()) {
      toast.error('No tiene permisos para eliminar fechas de vencimiento');
      throw new Error('Insufficient permissions');
    }

    return await stageDueDateService.deleteStageDueDate(recruitmentId, id);
  }, [recruitmentId, validatePermissions]);

  /**
   * Marcar como completada
   */
  const markAsCompleted = useCallback(async (id: string, notes?: string): Promise<StageDueDate> => {
    if (!validatePermissions()) {
      toast.error('No tiene permisos para actualizar fechas de vencimiento');
      throw new Error('Insufficient permissions');
    }

    return await stageDueDateService.markAsCompleted(recruitmentId, id, notes);
  }, [recruitmentId, validatePermissions]);

  /**
   * Obtener por etapa
   */
  const getByStage = useCallback(async (stage: StageDueDate['stage']): Promise<StageDueDate[]> => {
    if (!validatePermissions()) {
      toast.error('No tiene permisos para ver fechas de vencimiento');
      throw new Error('Insufficient permissions');
    }

    return await stageDueDateService.getByStage(recruitmentId, stage);
  }, [recruitmentId, validatePermissions]);

  /**
   * Obtener fechas vencidas
   */
  const getOverdue = useCallback(async (daysOverdue?: number): Promise<StageDueDate[]> => {
    if (!validatePermissions()) {
      toast.error('No tiene permisos para ver fechas de vencimiento');
      throw new Error('Insufficient permissions');
    }

    const response = await stageDueDateService.getOverdueStageDueDates(recruitmentId, { daysOverdue });
    return response.data;
  }, [recruitmentId, validatePermissions]);

  /**
   * Obtener alertas próximas
   */
  const getUpcomingAlerts = useCallback(async (daysThreshold?: number): Promise<StageDueDate[]> => {
    if (!validatePermissions()) {
      toast.error('No tiene permisos para ver fechas de vencimiento');
      throw new Error('Insufficient permissions');
    }

    const response = await stageDueDateService.getUpcomingStageDueDateAlerts(recruitmentId, { daysThreshold });
    return response.data;
  }, [recruitmentId, validatePermissions]);

  /**
   * Calcular días de vencimiento
   */
  const calculateDaysOverdue = useCallback((dueDate: string): DaysOverdueCalculation => {
    return stageDueDateService.calculateDaysOverdue(dueDate);
  }, []);

  // Efecto para carga inicial
  useEffect(() => {
    if (recruitmentId) {
      fetchDueDates();
    }
  }, [recruitmentId, fetchDueDates]);

  // Auto-refresh configurado
  useEffect(() => {
    if (autoRefresh && recruitmentId) {
      const interval = setInterval(() => {
        fetchDueDates();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, fetchDueDates, recruitmentId]);

  return {
    dueDates,
    loading,
    error,
    stats,
    summary,
    refresh,
    createDueDate,
    updateDueDate,
    deleteDueDate,
    markAsCompleted,
    getByStage,
    getOverdue,
    getUpcomingAlerts,
    calculateDaysOverdue
  };
};

export default useStageDueDates;