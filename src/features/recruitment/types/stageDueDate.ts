// ==================== TIPOS BASE PARA FECHAS DE VENCIMIENTO POR ETAPA ====================

/**
 * Enumeración de etapas del proceso de reclutamiento
 */
export type StageEnum = 
  | 'applied'
  | 'screening'
  | 'technical'
  | 'cultural'
  | 'offer'
  | 'hired';

/**
 * Interfaz para una fecha de vencimiento por etapa
 */
export interface StageDueDate {
  id: string;
  stage: StageEnum;
  dueDate: string; // YYYY-MM-DD format
  alertDays?: number; // Días antes para enviar alerta
  isCompleted: boolean;
  completedAt?: string; // ISO 8601 datetime
  notes?: string;
  createdAt: string; // ISO 8601 datetime
  updatedAt: string; // ISO 8601 datetime
}

/**
 * Interfaz para crear una nueva fecha de vencimiento
 */
export interface CreateStageDueDateRequest {
  stage: StageEnum;
  dueDate: string; // YYYY-MM-DD format
  alertDays?: number;
  notes?: string;
}

/**
 * Interfaz para actualizar una fecha de vencimiento existente
 */
export interface UpdateStageDueDateRequest {
  dueDate?: string; // YYYY-MM-DD format
  alertDays?: number;
  isCompleted?: boolean;
  notes?: string;
}

/**
 * Parámetros para filtrar fechas de vencimiento
 */
export interface StageDueDateFilterParams {
  stage?: StageEnum;
  isOverdue?: boolean;
  isCompleted?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'stage' | 'dueDate' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Parámetros para obtener fechas vencidas
 */
export interface OverdueStageDueDateParams {
  daysOverdue?: number; // Mínimo días de vencimiento
  sortBy?: 'dueDate' | 'stage' | 'daysOverdue';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Parámetros para obtener alertas próximas
 */
export interface UpcomingStageDueDateAlertsParams {
  daysThreshold?: number; // Umbral en días (default: 7)
  sortBy?: 'dueDate' | 'stage' | 'daysUntilDue';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Interfaz para respuesta paginada de fechas de vencimiento
 */
export interface StageDueDateListResponse {
  data: StageDueDate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Interfaz para cálculo de días de vencimiento
 */
export interface DaysOverdueCalculation {
  daysOverdue: number;
  isOverdue: boolean;
  isAlertDue: boolean;
  daysUntilDue: number;
}

/**
 * Interfaz para estadísticas de fechas de vencimiento
 */
export interface StageDueDateStats {
  total: number;
  completed: number;
  overdue: number;
  upcomingAlerts: number;
  completionRate: number;
}

/**
 * Interfaz para resumen de fechas de vencimiento por etapa
 */
export interface StageDueDateSummary {
  stage: StageEnum;
  dueDate: string;
  isCompleted: boolean;
  daysOverdue?: number;
  daysUntilDue?: number;
  alertDays?: number;
  status: 'completed' | 'on-time' | 'overdue' | 'alert-due';
}

// ==================== TIPOS DE ERROR ESPECÍFICOS ====================

/**
 * Error específico para fechas de vencimiento
 */
export interface StageDueDateError extends Error {
  code: 'STAGE_DUE_DATE_EXISTS' | 'INVALID_DUE_DATE' | 'STAGE_NOT_FOUND' | 'INVALID_STAGE';
  stage?: StageEnum;
  details?: any;
}