import { toast } from 'react-hot-toast';
import { BaseService } from '../../../shared/lib/api/baseService';
import { httpClient } from '../../../shared/lib/api/httpClient';
import {
  AssociateCandidatesRequest,
  AssociateCandidatesResponse,
  AssociateRecruiterRequest,
  Candidate,
  CandidateFilterParams,
  CandidateListResponse,
  CandidateStatus,
  CandidateStatusUpdateRequest,
  CreatePublicationRequest,
  CreateRecruiterRequest,
  CreateRecruitmentRequest,
  Publication,
  PublicationFilterParams,
  PublicationListResponse,
  Recruiter,
  RecruiterAssociationResponse,
  RecruiterFilterParams,
  RecruiterListResponse,
  RecruitmentListParams,
  RecruitmentMetrics,
  RecruitmentProcess,
  RecruitmentStatus,
  RecruitmentSummaryStats,
  RecruitmentTimeline,
  UpdatePublicationRequest,
  UpdateRecruitmentRequest,
  UpdateStatusRequest
} from '../types/recruitment';
import { CandidateEmailUpdateData, CandidateEmailUpdateRequest } from '../types/candidate';

/**
 * Servicio de Recruitment que extiende BaseService
 * Proporciona operaciones especÃ­ficas para el manejo de procesos de reclutamiento
 */
class RecruitmentService extends BaseService<
  RecruitmentProcess,
  CreateRecruitmentRequest,
  Partial<RecruitmentProcess>
> {
  constructor() {
    super({
      baseUrl: import.meta.env.VITE_RECRUITMENT_API_URL || import.meta.env.VITE_API_URL,
      resourceName: 'recruitments',
      requireAuth: true,
      requiredRoles: ['recruiter-supervisor', 'recruiter'], // Roles requeridos para acceder al servicio
      requireAllRoles: false // Solo necesita uno de los roles
    });
  }

  // ==================== MÃ©todos especÃ­ficos de Recruitment ====================

  /**
   * Actualizar el estado de un proceso de reclutamiento
   */
  async updateStatus(id: string, request: UpdateStatusRequest): Promise<RecruitmentProcess> {
    try {
      const data = await this.customOperation<RecruitmentProcess>(
        id,
        'status',
        request,
        'PATCH'
      );
      toast.success(`Recruitment status updated to ${request.status}`);
      return data;
    } catch (error: any) {
      this.handleError(error, 'update recruitment status');
    }
  }

  /**
   * Obtener mÃ©tricas detalladas de un proceso de reclutamiento
   */
  async getMetrics(id: string): Promise<RecruitmentMetrics> {
    return this.customOperation<RecruitmentMetrics>(id, 'metrics', undefined, 'GET');
  }

  /**
   * Obtener timeline de un proceso de reclutamiento
   */
  async getTimeline(id: string): Promise<RecruitmentTimeline> {
    return this.customOperation<RecruitmentTimeline>(id, 'timeline', undefined, 'GET');
  }

  // ==================== GestiÃ³n de Candidatos ====================

  /**
   * Obtener candidatos de un proceso de reclutamiento
   */
  async getCandidates(
    id: string,
    params?: CandidateFilterParams
  ): Promise<CandidateListResponse> {
    await this.validateAuth();

    try {
      const queryParams = {
        ...params,
        page: params?.page || 1,
        limit: params?.limit || 20
      };

      const response = await httpClient.get(`${this.buildUrl(id)}/candidates`, {
        params: queryParams
      });

      return response.data;
    } catch (error: any) {
      this.handleError(error, 'fetch recruitment candidates');
    }
  }

  /**
   * Obtener detalles de un candidato en el contexto del proceso de reclutamiento
   */
  async getCandidate(id: string, candidateId: string): Promise<Candidate> {
    await this.validateAuth();

    try {
      const response = await httpClient.get(`${this.buildUrl(id)}/candidate/${candidateId}`);
      return response.data;
    } catch (error: any) {
      this.handleError(error, 'fetch candidate details');
    }
  }

  /**
   * Remover candidato de un proceso de reclutamiento
   */
  async removeCandidate(id: string, candidateId: string): Promise<void> {
    await this.validateAuth();

    try {
      await httpClient.delete(`${this.buildUrl(id)}/candidate/${candidateId}`);
      toast.success('Candidate removed from recruitment process');
    } catch (error: any) {
      this.handleError(error, 'remove candidate');
    }
  }

  /**
   * Actualizar estado de un candidato en el proceso de reclutamiento
   */
  async updateCandidateStatus(
    id: string,
    candidateId: string,
    request: CandidateStatusUpdateRequest
  ): Promise<Candidate> {
    await this.validateAuth();

    try {
      const response = await httpClient.patch(
        `${this.buildUrl(id)}/candidate/${candidateId}/status`,
        request
      );
      toast.success(`Candidate status updated to ${request.status}`);
      return response.data;
    } catch (error: any) {
      this.handleError(error, 'update candidate status');
    }
  }

  // ==================== Gestión de Publicaciones ====================

  /**
   * Obtener publicaciones de un proceso de reclutamiento
   */
  async getPublications(
    id: string,
    params?: PublicationFilterParams
  ): Promise<PublicationListResponse> {
    await this.validateAuth();

    try {
      const queryParams = {
        ...params,
        page: params?.page || 1,
        limit: params?.limit || 20
      };

      const response = await httpClient.get(`${this.buildUrl(id)}/publications`, {
        params: queryParams
      });

      return response.data;
    } catch (error: any) {
      this.handleError(error, 'fetch recruitment publications');
    }
  }

  /**
   * Crear una nueva publicación para el proceso de reclutamiento
   */
  async createPublication(
    id: string,
    request: CreatePublicationRequest
  ): Promise<Publication> {
    try {
      const data = await this.customOperation<Publication>(
        id,
        'publications',
        request,
        'POST'
      );
      toast.success('Publication created successfully');
      return data;
    } catch (error: any) {
      this.handleError(error, 'create publication');
    }
  }

  /**
   * Obtener una publicación específica
   */
  async getPublication(id: string, publicationId: string): Promise<Publication> {
    await this.validateAuth();

    try {
      const response = await httpClient.get(`${this.buildUrl(id)}/publications/${publicationId}`);
      return response.data;
    } catch (error: any) {
      this.handleError(error, 'fetch publication details');
    }
  }

  /**
   * Actualizar una publicación existente
   */
  async updatePublication(
    id: string,
    publicationId: string,
    request: UpdatePublicationRequest
  ): Promise<Publication> {
    await this.validateAuth();

    try {
      const response = await httpClient.put(
        `${this.buildUrl(id)}/publications/${publicationId}`,
        request
      );
      toast.success('Publication updated successfully');
      return response.data;
    } catch (error: any) {
      this.handleError(error, 'update publication');
    }
  }

  /**
   * Eliminar una publicación
   */
  async deletePublication(id: string, publicationId: string): Promise<void> {
    await this.validateAuth();

    try {
      await httpClient.delete(`${this.buildUrl(id)}/publications/${publicationId}`);
      toast.success('Publication deleted successfully');
    } catch (error: any) {
      this.handleError(error, 'delete publication');
    }
  }

  // ==================== Gestión de Reclutadores ====================

  /**
   * Obtener reclutadores disponibles
   */
  async getAvailableRecruiters(params?: RecruiterFilterParams): Promise<RecruiterListResponse> {
    await this.validateAuth();

    try {
      const queryParams = {
        ...params,
        page: params?.page || 1,
        limit: params?.limit || 20
      };

      const response = await httpClient.get(
        `${this.baseUrl}/recruitments/recruiters`,
        { params: queryParams }
      );

      return response.data;
    } catch (error: any) {
      this.handleError(error, 'fetch available recruiters');
    }
  }

  /**
   * Crear un nuevo reclutador
   */
  async createRecruiter(request: CreateRecruiterRequest): Promise<Recruiter> {
    await this.validateAuth();

    try {
      const response = await httpClient.post(
        `${this.baseUrl}/recruitments/recruiters`,
        request
      );
      toast.success(`Recruiter ${request.name} created successfully`);
      return response.data;
    } catch (error: any) {
      this.handleError(error, 'create recruiter');
    }
  }

  /**
   * Asociar un reclutador a un proceso de reclutamiento
   */
  async associateRecruiter(
    id: string,
    request: AssociateRecruiterRequest
  ): Promise<RecruiterAssociationResponse> {
    try {
      const data = await this.customOperation<RecruiterAssociationResponse>(
        id,
        'recruiters',
        request,
        'POST'
      );
      toast.success('Recruiter associated successfully');
      return data;
    } catch (error: any) {
      this.handleError(error, 'associate recruiter');
    }
  }

  // ==================== MÃ©todos de conveniencia ====================

  /**
   * Crear proceso de reclutamiento desde un requirement ID
   */
  async createFromRequirement(requirementId: string): Promise<RecruitmentProcess> {
    return this.create({ requirementId });
  }

  /**
   * Actualizar estado simplificado (compatibilidad hacia atrÃ¡s)
   */
  async setStatus(
    id: string,
    status: RecruitmentStatus,
    reason?: string
  ): Promise<RecruitmentProcess> {
    return this.updateStatus(id, { status, reason });
  }

  /**
   * Obtener procesos filtrados por estado
   */
  async getByStatus(status: RecruitmentStatus): Promise<RecruitmentProcess[]> {
    const response = await this.list({ status } as RecruitmentListParams);
    return response.data;
  }

  /**
   * Obtener procesos activos
   */
  async getActive(): Promise<RecruitmentProcess[]> {
    return this.getByStatus('Active');
  }

  /**
   * Obtener procesos completados
   */
  async getCompleted(): Promise<RecruitmentProcess[]> {
    return this.getByStatus('Completed');
  }

  /**
 * Actualizar proceso de reclutamiento (PATCH operation)
 */
  async updateRecruitmentProcess(
    id: string, 
    request: UpdateRecruitmentRequest
  ): Promise<RecruitmentProcess> {
    await this.validateAuth();

    try {
      const response = await httpClient.patch(`${this.buildUrl(id)}`, request);
      toast.success('Recruitment process updated successfully');
      return response.data;
    } catch (error: any) {
      this.handleError(error, 'update recruitment process');
    }
  }

  /**
   * Obtener procesos por departamento
   */
  async getByDepartment(department: string): Promise<RecruitmentProcess[]> {
    const response = await this.list({ department } as RecruitmentListParams);
    return response.data;
  }

  // ==================== MÃ©todos de control de estado ====================

  /**
   * Pausar proceso de reclutamiento
   */
  async pause(id: string, reason?: string): Promise<RecruitmentProcess> {
    return this.updateStatus(id, { status: 'Paused', reason });
  }

  /**
   * Reanudar proceso de reclutamiento
   */
  async resume(id: string, reason?: string): Promise<RecruitmentProcess> {
    return this.updateStatus(id, { status: 'Active', reason });
  }

  /**
   * Completar proceso de reclutamiento
   */
  async complete(id: string, reason?: string): Promise<RecruitmentProcess> {
    return this.updateStatus(id, { status: 'Completed', reason });
  }

  /**
   * Cancelar proceso de reclutamiento
   */
  async cancel(id: string, reason?: string): Promise<RecruitmentProcess> {
    return this.updateStatus(id, { status: 'Cancelled', reason });
  }

  // ==================== MÃ©todos de candidatos simplificados ====================

  /**
   * Asociar un solo candidato por profileLink
   */
  async associateCandidate(
    id: string,
    profileLink: string,
    profileName: string,
    additionalData?: Partial<AssociateCandidatesRequest>
  ): Promise<AssociateCandidatesResponse> {
    return this.associateCandidates(id, { 
      profileLink, 
      profileName,
      ...additionalData 
    });
  }

  /**
 * Asociar candidato a un proceso de reclutamiento (actualizado según Swagger)
 */
  async associateCandidates(
    id: string,
    request: AssociateCandidatesRequest
  ): Promise<AssociateCandidatesResponse> {
    try {
      const data = await this.customOperation<AssociateCandidatesResponse>(
        id,
        'candidates',
        request,
        'POST'
      );

      toast.success(`Successfully created candidate: ${data.firstName} ${data.lastName}`);
      return data;
    } catch (error: any) {
      this.handleError(error, 'associate candidate');
    }
  }

  /**
   * Obtener candidatos por estado
   */
  async getCandidatesByStatus(id: string, status: CandidateStatus): Promise<Candidate[]> {
    const response = await this.getCandidates(id, { status });
    return response.data;
  }

  /**
   * Obtener informaciÃ³n completa del proceso (proceso + mÃ©tricas + timeline)
   */
  async getFullDetails(id: string): Promise<{
    process: RecruitmentProcess;
    metrics: RecruitmentMetrics;
    timeline: RecruitmentTimeline;
  }> {
    await this.validateAuth();

    try {
      const [process, metrics, timeline] = await Promise.all([
        this.get(id),
        this.getMetrics(id),
        this.getTimeline(id)
      ]);

      return { process, metrics, timeline };
    } catch (error: any) {
      this.handleError(error, 'fetch full recruitment details');
    }
  }

  // ==================== Métodos de publicaciones simplificados ====================

  /**
   * Crear publicación en LinkedIn
   */
  async publishToLinkedIn(
    id: string,
    params: Omit<CreatePublicationRequest, 'platform'>
  ): Promise<Publication> {
    return this.createPublication(id, {
      platform: 'LinkedIn',
      ...params
    });
  }

  /**
   * Crear publicación en Indeed
   */
  async publishToIndeed(
    id: string,
    params: Omit<CreatePublicationRequest, 'platform'>
  ): Promise<Publication> {
    return this.createPublication(id, {
      platform: 'Indeed',
      ...params
    });
  }

  /**
   * Crear publicación en Computrabajo
   */
  async publishToComputrabajo(
    id: string,
    params: Omit<CreatePublicationRequest, 'platform'>
  ): Promise<Publication> {
    return this.createPublication(id, {
      platform: 'Computrabajo',
      ...params
    });
  }

  /**
   * Obtener publicaciones por plataforma
   */
  async getPublicationsByPlatform(
    id: string,
    platform: 'LinkedIn' | 'Computrabajo' | 'Indeed' | 'Glassdoor' | 'CompanyWebsite' | 'Other'
  ): Promise<Publication[]> {
    const response = await this.getPublications(id, { platform });
    return response.data;
  }

  /**
   * Obtener publicaciones activas
   */
  async getActivePublications(id: string): Promise<Publication[]> {
    const response = await this.getPublications(id, { status: 'Published' });
    return response.data;
  }

  /**
   * Suspender una publicación
   */
  async suspendPublication(id: string, publicationId: string): Promise<Publication> {
    return this.updatePublication(id, publicationId, { status: 'Suspended' });
  }

  /**
   * Reactivar una publicación suspendida
   */
  async reactivatePublication(id: string, publicationId: string): Promise<Publication> {
    return this.updatePublication(id, publicationId, { status: 'Published' });
  }

  /**
   * Archivar una publicación
   */
  async archivePublication(id: string, publicationId: string): Promise<Publication> {
    return this.updatePublication(id, publicationId, { status: 'Archived' });
  }

  // ==================== Operaciones en lote ====================

  /**
   * ActualizaciÃ³n masiva de estados de candidatos
   */
  async bulkUpdateCandidateStatus(
    id: string,
    candidateUpdates: Array<{
      candidateId: string;
      status: CandidateStatus;
      reason?: string;
      notes?: string;
    }>
  ): Promise<Array<{ candidateId: string; success: boolean; data?: Candidate; error?: string }>> {
    const results = await Promise.allSettled(
      candidateUpdates.map(async (update) => {
        try {
          const data = await this.updateCandidateStatus(
            id,
            update.candidateId,
            {
              status: update.status,
              reason: update.reason,
              notes: update.notes
            }
          );
          return { candidateId: update.candidateId, success: true, data };
        } catch (error: any) {
          return {
            candidateId: update.candidateId,
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
          candidateId: candidateUpdates[index].candidateId,
          success: false,
          error: 'Promise rejected'
        };
      }
    });
  }

  /**
   * RemociÃ³n masiva de candidatos
   */
  async bulkRemoveCandidates(
    id: string,
    candidateIds: string[]
  ): Promise<Array<{ candidateId: string; success: boolean; error?: string }>> {
    const results = await Promise.allSettled(
      candidateIds.map(async (candidateId) => {
        try {
          await this.removeCandidate(id, candidateId);
          return { candidateId, success: true };
        } catch (error: any) {
          return {
            candidateId,
            success: false,
            error: error.response?.data?.message || 'Removal failed'
          };
        }
      })
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          candidateId: candidateIds[index],
          success: false,
          error: 'Promise rejected'
        };
      }
    });
  }

  /**
   * Actualización masiva de métricas de publicaciones
   */
  async bulkUpdatePublicationMetrics(
    id: string,
    updates: Array<{
      publicationId: string;
      views?: number;
      applications?: number;
      likes?: number;
      shares?: number;
      clicks?: number;
      comments?: number;
    }>
  ): Promise<Array<{ publicationId: string; success: boolean; data?: Publication; error?: string }>> {
    const results = await Promise.allSettled(
      updates.map(async (update) => {
        try {
          const { publicationId, ...metrics } = update;
          const data = await this.updatePublication(id, publicationId, metrics);
          return { publicationId, success: true, data };
        } catch (error: any) {
          return {
            publicationId: update.publicationId,
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
          publicationId: updates[index].publicationId,
          success: false,
          error: 'Promise rejected'
        };
      }
    });
  }

  /**
   * Suspender múltiples publicaciones
   */
  async bulkSuspendPublications(
    id: string,
    publicationIds: string[]
  ): Promise<Array<{ publicationId: string; success: boolean; error?: string }>> {
    const results = await Promise.allSettled(
      publicationIds.map(async (publicationId) => {
        try {
          await this.suspendPublication(id, publicationId);
          return { publicationId, success: true };
        } catch (error: any) {
          return {
            publicationId,
            success: false,
            error: error.response?.data?.message || 'Suspension failed'
          };
        }
      })
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          publicationId: publicationIds[index],
          success: false,
          error: 'Promise rejected'
        };
      }
    });
  }

  // ==================== EstadÃ­sticas y reportes ====================

  /**
   * Obtener estadÃ­sticas resumidas de todos los procesos
   */
  async getSummaryStats(params?: Partial<RecruitmentListParams>): Promise<RecruitmentSummaryStats> {
    await this.validateAuth();

    try {
      const response = await this.list({ ...params, limit: 100 } as RecruitmentListParams);
      const processes = response.data;

      const stats: RecruitmentSummaryStats = {
        total: response.pagination.total,
        active: processes.filter(p => p.status === 'Active').length,
        completed: processes.filter(p => p.status === 'Completed').length,
        paused: processes.filter(p => p.status === 'Paused').length,
        cancelled: processes.filter(p => p.status === 'Cancelled').length,
        totalCandidates: processes.reduce((sum, p) => sum + p.metrics.totalCandidates, 0),
        avgTimeToHire: processes.length > 0 
          ? processes.reduce((sum, p) => sum + p.metrics.timeToHire, 0) / processes.length 
          : 0
      };

      return stats;
    } catch (error: any) {
      this.handleError(error, 'fetch summary stats');
    }
  }

  // ==================== MÃ©todos especÃ­ficos con permisos ====================

  /**
   * MÃ©todos que requieren permisos especÃ­ficos de manager
   */
  async deleteProcess(id: string): Promise<void> {
    // Verificar que tenga permisos de manager para eliminar
    if (!this.hasRole('hr-manager')) {
      toast.error('Solo los managers pueden eliminar procesos de reclutamiento');
      throw new Error('Insufficient permissions to delete recruitment process');
    }
    
    return this.delete(id);
  }

  /**
   * Aprobar proceso (solo managers)
   */
  async approve(id: string, reason?: string): Promise<RecruitmentProcess> {
    if (!this.hasRole('hr-manager')) {
      toast.error('Solo los managers pueden aprobar procesos');
      throw new Error('Insufficient permissions to approve recruitment process');
    }
    
    return this.updateStatus(id, { status: 'Active', reason: reason || 'Approved by manager' });
  }

  /**
   * Rechazar proceso (solo managers)
   */
  async reject(id: string, reason: string): Promise<RecruitmentProcess> {
    if (!this.hasRole('hr-manager')) {
      toast.error('Solo los managers pueden rechazar procesos');
      throw new Error('Insufficient permissions to reject recruitment process');
    }
    
    return this.updateStatus(id, { status: 'Cancelled', reason });
  }

  /**
   * Actualizar email de un candidato en el proceso de reclutamiento
   */
  async updateCandidateEmail(
    id: string,
    candidateId: string,
    request: CandidateEmailUpdateRequest
  ): Promise<CandidateEmailUpdateData> {
    await this.validateAuth();

    try {
      const response = await httpClient.patch(
        `${this.buildUrl(id)}/candidate/${candidateId}/email`,
        request
      );
      
      toast.success(`Candidate email updated to ${request.email}`);
      return response.data;
    } catch (error: any) {
      // Manejo específico de errores del endpoint
      if (error.response?.status === 409) {
        toast.error('A candidate with this email already exists in the system');
      } else if (error.response?.status === 404) {
        toast.error('Candidate is not associated with this recruitment process');
      } else if (error.response?.status === 400) {
        const validationMessage = error.response?.data?.details?.[0]?.message || 'Invalid email format';
        toast.error(validationMessage);
      }
      
      this.handleError(error, 'update candidate email');
    }
  }

}

// Instancia singleton del servicio
export const recruitmentService = new RecruitmentService();
export default recruitmentService;