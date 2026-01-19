import { toast } from 'react-hot-toast';
import { authService } from '../../../shared/api/authService';
import { httpClient } from '../../../shared/api/httpClient';
import {
  CreateStageDueDateRequest,
  DaysOverdueCalculation,
  OverdueStageDueDateParams,
  StageDueDate,
  StageDueDateError,
  StageDueDateFilterParams,
  StageDueDateListResponse,
  StageDueDateStats,
  StageDueDateSummary,
  UpcomingStageDueDateAlertsParams,
  UpdateStageDueDateRequest
} from '../types/stageDueDate';
import { RecruitmentStageEnum } from '../types/base';

export const STAGE_NAMES_MAP : Record<string, RecruitmentStageEnum> = {
  CREATED: 'Created' as RecruitmentStageEnum,
  PUBLISHED: 'Published' as RecruitmentStageEnum,
  SOURCING: 'Sourcing' as RecruitmentStageEnum,
  SCREENING: 'Screening' as RecruitmentStageEnum,
  INTERVIEWS: 'Interviews' as RecruitmentStageEnum,
  SHORTLIST: 'Shorlist' as RecruitmentStageEnum,
  HIRING: 'Hiring' as RecruitmentStageEnum
};

/**
 * Servicio de Stage Due Dates
 * Proporciona operaciones específicas para el manejo de fechas de vencimiento por etapa
 */
class StageDueDateService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_RECRUITMENT_API_URL || import.meta.env.VITE_API_URL;
  }

  /**
   * Validar autenticación y permisos
   */
  private async validateAuth(): Promise<void> {
    if (!authService.hasPermission(['recruiter-supervisor', 'recruiter'], false)) {
      toast.error('No tiene permisos para realizar esta operación');
      throw new Error('Insufficient permissions');
    }
  }

  /**
   * Manejo de errores específicos
   */
  private handleError(error: any, operation: string): void {
    const errorMessage = error.response?.data?.message || `${operation} failed`;
    toast.error(errorMessage);
    throw error;
  }

  private handleStageDueDateError(error: any, operation: string): never {
    const stageDueDateError = error as StageDueDateError;

    if (stageDueDateError.code === 'STAGE_DUE_DATE_EXISTS') {
      toast.error(`A due date for this stage already exists`);
    } else if (stageDueDateError.code === 'INVALID_DUE_DATE') {
      toast.error('Due date must be in future');
    } else if (stageDueDateError.code === 'INVALID_STAGE') {
      toast.error('Invalid stage specified');
    } else {
      this.handleError(error, operation);
    }

    throw error;
  }

  /**
   * Obtener nombre para mostrar de la etapa
   */
  private getStageDisplayName(stage: StageDueDate['stage']): string {
    return STAGE_NAMES_MAP[stage] || stage;
  }

  // ==================== MÉTODOS PRINCIPALES ====================

  /**
   * Obtener todas las fechas de vencimiento de un proceso de reclutamiento
   */
  async getStageDueDates(
    recruitmentId: string,
    params?: StageDueDateFilterParams
  ): Promise<StageDueDateListResponse> {
    await this.validateAuth();

    try {
      const queryParams = {
        ...params,
        page: params?.page || 1,
        limit: params?.limit || 20
      };

      const response = await httpClient.get(
        `${this.baseUrl}/recruitments/${recruitmentId}/stage-due-dates`,
        { params: queryParams }
      );

      return response.data;
    } catch (error: any) {
      this.handleError(error, 'fetch stage due dates');
      throw error;
    }
  }

  /**
   * Crear una nueva fecha de vencimiento para una etapa
   */
  async createStageDueDate(
    recruitmentId: string,
    request: CreateStageDueDateRequest
  ): Promise<StageDueDate> {
    await this.validateAuth();

    try {
      const response = await httpClient.post(
        `${this.baseUrl}/recruitments/${recruitmentId}/stage-due-dates`,
        request
      );

      toast.success(`Due date created for ${this.getStageDisplayName(request.stage)} stage`);
      return response.data;
    } catch (error: any) {
      this.handleStageDueDateError(error, 'create stage due date');
      throw error;
    }
  }

  /**
   * Obtener una fecha de vencimiento específica
   */
  async getStageDueDate(
    recruitmentId: string,
    stageDueDateId: string
  ): Promise<StageDueDate> {
    await this.validateAuth();

    try {
      const response = await httpClient.get(
        `${this.baseUrl}/recruitments/${recruitmentId}/stage-due-dates/${stageDueDateId}`
      );

      return response.data;
    } catch (error: any) {
      this.handleError(error, 'fetch stage due date');
      throw error;
    }
  }

  /**
   * Actualizar una fecha de vencimiento existente
   */
  async updateStageDueDate(
    recruitmentId: string,
    stageDueDateId: string,
    request: UpdateStageDueDateRequest
  ): Promise<StageDueDate> {
    await this.validateAuth();

    try {
      const response = await httpClient.put(
        `${this.baseUrl}/recruitments/${recruitmentId}/stage-due-dates/${stageDueDateId}`,
        request
      );

      toast.success('Stage due date updated successfully');
      return response.data;
    } catch (error: any) {
      this.handleError(error, 'update stage due date');
      throw error;
    }
  }

  /**
   * Eliminar una fecha de vencimiento
   */
  async deleteStageDueDate(
    recruitmentId: string,
    stageDueDateId: string
  ): Promise<void> {
    await this.validateAuth();

    try {
      await httpClient.delete(
        `${this.baseUrl}/recruitments/${recruitmentId}/stage-due-dates/${stageDueDateId}`
      );

      toast.success('Stage due date deleted successfully');
    } catch (error: any) {
      this.handleError(error, 'delete stage due date');
      throw error;
    }
  }

  // ==================== MÉTODOS ESPECIALIZADOS ====================

  /**
   * Obtener fechas de vencimiento vencidas
   */
  async getOverdueStageDueDates(
    recruitmentId: string,
    params?: OverdueStageDueDateParams
  ): Promise<StageDueDateListResponse> {
    await this.validateAuth();

    try {
      const queryParams = {
        daysOverdue: params?.daysOverdue || 0,
        sortBy: params?.sortBy || 'daysOverdue',
        sortOrder: params?.sortOrder || 'desc'
      };

      const response = await httpClient.get(
        `${this.baseUrl}/recruitments/${recruitmentId}/stage-due-dates/overdue`,
        { params: queryParams }
      );

      return response.data;
    } catch (error: any) {
      this.handleError(error, 'fetch overdue stage due dates');
      throw error;
    }
  }

  /**
   * Obtener alertas de fechas de vencimiento próximas
   */
  async getUpcomingStageDueDateAlerts(
    recruitmentId: string,
    params?: UpcomingStageDueDateAlertsParams
  ): Promise<StageDueDateListResponse> {
    await this.validateAuth();

    try {
      const queryParams = {
        daysThreshold: params?.daysThreshold || 7,
        sortBy: params?.sortBy || 'daysUntilDue',
        sortOrder: params?.sortOrder || 'asc'
      };

      const response = await httpClient.get(
        `${this.baseUrl}/recruitments/${recruitmentId}/stage-due-dates/alerts`,
        { params: queryParams }
      );

      return response.data;
    } catch (error: any) {
      this.handleError(error, 'fetch upcoming stage due date alerts');
      throw error;
    }
  }

  // ==================== MÉTODOS DE CONVENIENCIA ====================

  /**
   * Crear fecha de vencimiento para etapa específica
   */
  async createForStage(
    recruitmentId: string,
    stage: StageDueDate['stage'],
    status: StageDueDate['status'],
    dueDate: string,
    options?: {
      alertDays?: number;
      notes?: string;
    }
  ): Promise<StageDueDate> {
    return this.createStageDueDate(recruitmentId, {
      stage,
      status,
      dueDate,
      ...options
    });
  }

  /**
   * Marcar etapa como completada
   */
  async markAsCompleted(
    recruitmentId: string,
    stageDueDateId: string,
    notes?: string
  ): Promise<StageDueDate> {
    return this.updateStageDueDate(recruitmentId, stageDueDateId, {
      isCompleted: true,
      notes
    });
  }

  /**
   * Actualizar fecha de vencimiento
   */
  async updateDueDate(
    recruitmentId: string,
    stageDueDateId: string,
    dueDate: string,
    notes?: string
  ): Promise<StageDueDate> {
    return this.updateStageDueDate(recruitmentId, stageDueDateId, {
      dueDate,
      notes
    });
  }

  /**
   * Actualizar configuración de alertas
   */
  async updateAlertConfig(
    recruitmentId: string,
    stageDueDateId: string,
    alertDays: number
  ): Promise<StageDueDate> {
    return this.updateStageDueDate(recruitmentId, stageDueDateId, {
      alertDays
    });
  }

  /**
   * Obtener fechas de vencimiento por etapa
   */
  async getByStage(
    recruitmentId: string,
    stage: StageDueDate['stage']
  ): Promise<StageDueDate[]> {
    const response = await this.getStageDueDates(recruitmentId, { stage });
    return response.data;
  }

  /**
   * Obtener fechas de vencimiento no completadas
   */
  async getPending(
    recruitmentId: string,
    params?: Partial<StageDueDateFilterParams>
  ): Promise<StageDueDate[]> {
    const response = await this.getStageDueDates(recruitmentId, {
      ...params,
      isCompleted: false
    });
    return response.data;
  }

  /**
   * Obtener fechas de vencimiento completadas
   */
  async getCompleted(
    recruitmentId: string,
    params?: Partial<StageDueDateFilterParams>
  ): Promise<StageDueDate[]> {
    const response = await this.getStageDueDates(recruitmentId, {
      ...params,
      isCompleted: true
    });
    return response.data;
  }

  // ==================== MÉTODOS DE ANÁLISIS ====================

  /**
   * Calcular días de vencimiento
   */
  calculateDaysOverdue(dueDate: string): DaysOverdueCalculation {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      daysOverdue: -diffDays,
      isOverdue: diffDays < 0,
      isAlertDue: diffDays <= 7 && diffDays > 0,
      daysUntilDue: diffDays
    };
  }

  /**
   * Obtener estadísticas de fechas de vencimiento
   */
  async getStats(recruitmentId: string): Promise<StageDueDateStats> {
    const response = await this.getStageDueDates(recruitmentId, { limit: 1000 });
    const dueDates = response.data;

    const completed = dueDates.filter(dd => dd.isCompleted).length;
    const overdue = dueDates.filter(dd =>
      !dd.isCompleted && this.calculateDaysOverdue(dd.dueDate).isOverdue
    ).length;
    const upcomingAlerts = dueDates.filter(dd =>
      !dd.isCompleted && this.calculateDaysOverdue(dd.dueDate).isAlertDue
    ).length;

    return {
      total: dueDates.length,
      completed,
      overdue,
      upcomingAlerts,
      completionRate: dueDates.length > 0 ? (completed / dueDates.length) * 100 : 0
    };
  }

  /**
   * Obtener resumen de fechas de vencimiento por etapa
   */
  async getSummary(recruitmentId: string): Promise<StageDueDateSummary[]> {
    const response = await this.getStageDueDates(recruitmentId, { limit: 1000 });
    const dueDates = response.data;

    return dueDates.map((dd): StageDueDateSummary => {
      const calculation = this.calculateDaysOverdue(dd.dueDate);

      let status: StageDueDateSummary['status'] = 'ON_TIME';
      if (dd.isCompleted) {
        status = 'COMPLETED';
      } else if (calculation.isOverdue) {
        status = 'OVERDUE';
      } else if (calculation.isAlertDue) {
        status = 'ALERT_DUE';
      }

      return {
        stage: dd.stage,
        dueDate: dd.dueDate,
        isCompleted: dd.isCompleted,
        daysOverdue: calculation.daysOverdue,
        daysUntilDue: calculation.daysUntilDue,
        alertDays: dd.alertDays,
        status
      };
    });
  }

  // ==================== MÉTODOS DE LOTE ====================

  /**
   * Creación masiva de fechas de vencimiento
   */
  async bulkCreate(
    recruitmentId: string,
    requests: CreateStageDueDateRequest[]
  ): Promise<Array<{ stage: StageDueDate['stage']; success: boolean; data?: StageDueDate; error?: string }>> {
    const results = await Promise.allSettled(
      requests.map(async (request) => {
        try {
          const data = await this.createStageDueDate(recruitmentId, request);
          return { stage: request.stage, success: true, data };
        } catch (error: any) {
          return {
            stage: request.stage,
            success: false,
            error: error.response?.data?.message || 'Creation failed'
          };
        }
      })
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          stage: requests[index].stage,
          success: false,
          error: 'Promise rejected'
        };
      }
    });
  }

  /**
   * Actualización masiva de fechas de vencimiento
   */
  async bulkUpdate(
    recruitmentId: string,
    updates: Array<{
      stageDueDateId: string;
      request: UpdateStageDueDateRequest;
    }>
  ): Promise<Array<{ stageDueDateId: string; success: boolean; data?: StageDueDate; error?: string }>> {
    const results = await Promise.allSettled(
      updates.map(async (update) => {
        try {
          const data = await this.updateStageDueDate(
            recruitmentId,
            update.stageDueDateId,
            update.request
          );
          return { stageDueDateId: update.stageDueDateId, success: true, data };
        } catch (error: any) {
          return {
            stageDueDateId: update.stageDueDateId,
            success: false,
            error: error.response?.data?.message || 'Update failed'
          };
        }
      })
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          stageDueDateId: updates[index].stageDueDateId,
          success: false,
          error: 'Promise rejected'
        };
      }
    });
  }
}

// Instancia singleton del servicio
export const stageDueDateService = new StageDueDateService();
export default stageDueDateService;