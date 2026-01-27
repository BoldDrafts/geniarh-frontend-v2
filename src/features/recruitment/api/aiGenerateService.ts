import { BaseService } from '../../../shared/api/baseService';
import { httpClient } from '../../../shared/api/httpClient';
import { toast } from 'react-hot-toast';
import axios from 'axios';

// Import optimized AI Generation types
// Export all types for external use
export type {
  AIGenerateCandidatesRequest,
  AIGenerateCandidatesResponse,
  AIGenerationStatus,
  AIGenerationResults,
  AIApproveCandidatesRequest,
  AIApproveCandidatesResponse,
  AIGenerationOptions,
  AIGenerationApiError,
  AIGenerationListResponse,
  AIGenerationFilterParams,
  // Legacy types for backward compatibility
  AIGenerateRequest,
  AIGenerateResponse,
  PromptListResponse,
  PromptFilterParams
} from '../types/aiGeneration.types';

// Import types internally
import {
  AIGenerateCandidatesRequest,
  AIGenerateCandidatesResponse,
  AIGenerationStatus,
  AIGenerationResults,
  AIApproveCandidatesRequest,
  AIApproveCandidatesResponse,
  AIGenerationOptions,
  AIGenerationApiError,
  AIGenerationListResponse,
  AIGenerationFilterParams,
  // Legacy types for backward compatibility
  AIGenerateRequest,
  AIGenerateResponse,
  PromptListResponse,
  PromptFilterParams
} from '../types/aiGeneration.types';

/**
 * Servicio para generación con IA de candidatos
 * Based on OpenAPI specification for AI Generation endpoints
 *
 * Available endpoints (from OpenAPI):
 * - POST /recruitments/{id}/candidates/ai-generate - Generate candidates
 * - GET /recruitments/{id}/candidates/ai-generate - List AI generations
 * - GET /recruitments/{id}/candidates/ai-generate/{generationId}/status - Get status
 * - GET /recruitments/{id}/candidates/ai-generate/{generationId}/results - Get results
 * - POST /recruitments/{id}/candidates/ai-generate/{generationId}/approve - Approve candidates
 */
class AIGenerateService extends BaseService<AIGenerateResponse, AIGenerateRequest, Partial<AIGenerateRequest>> {
  constructor() {
    super({
      baseUrl: import.meta.env.VITE_RECRUITMENT_API_URL,
      resourceName: '',
      requireAuth: true,
      requiredRoles: ['recruiter-supervisor', 'recruiter'],
      requireAllRoles: false
    });
  }

  // ==================== AI Generation Methods (OpenAPI Spec) ====================

  /**
   * List AI generation processes for a recruitment
   * GET /recruitments/{id}/candidates/ai-generate
   *
   * @param recruitmentId - UUID of the recruitment process
   * @param params - Optional filter parameters
   * @returns Promise with paginated list of AI generations
   */
  async listAIGenerations(
    recruitmentId: string,
    params?: AIGenerationFilterParams
  ): Promise<AIGenerationListResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params) {
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.status) queryParams.append('status', params.status);
        if (params.experienceLevel) queryParams.append('experienceLevel', params.experienceLevel);
        if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
        if (params.dateTo) queryParams.append('dateTo', params.dateTo);
        if (params.minMatchScore) queryParams.append('minMatchScore', params.minMatchScore.toString());
        if (params.maxMatchScore) queryParams.append('maxMatchScore', params.maxMatchScore.toString());
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      }

      const url = `${this.baseUrl}/recruitments/${recruitmentId}/candidates/ai-generate${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await httpClient.get(url);

      const listResponse: AIGenerationListResponse = response.data;
      return listResponse;
    } catch (error: unknown) {
      console.error('Error listing AI generations:', error);
      this.handleAIError(error, 'obtener lista de generaciones IA');
      throw error;
    }
  }

  /**
   * Generate candidates using AI
   * POST /recruitments/{id}/candidates/ai-generate
   *
   * @param recruitmentId - UUID of the recruitment process
   * @param request - Generation request parameters
   * @param options - Optional generation options
   * @returns Promise with generation response containing generationId
   */
  async generateCandidates(
    recruitmentId: string,
    request: AIGenerateCandidatesRequest,
    options?: AIGenerationOptions
  ): Promise<AIGenerateCandidatesResponse> {
    try {
      const requestData = {
        ...request,
        ...options
      };

      const response = await httpClient.post(
        `${this.baseUrl}/recruitments/${recruitmentId}/candidates/ai-generate`,
        requestData
      );

      const generationResponse: AIGenerateCandidatesResponse = response.data;
      toast.success(`Generación IA iniciada (ID: ${generationResponse.generationId})`);
      return generationResponse;
    } catch (error: unknown) {
      console.error('Error starting AI generation:', error);
      this.handleAIError(error, 'iniciar generación IA');
      throw error;
    }
  }

  /**
   * Get AI generation process status
   * GET /recruitments/{id}/candidates/ai-generate/{generationId}/status
   *
   * @param recruitmentId - UUID of the recruitment process
   * @param generationId - UUID of the AI generation process
   * @returns Promise with current generation status
   */
  async getGenerationStatus(
    recruitmentId: string,
    generationId: string
  ): Promise<AIGenerationStatus> {
    try {
      const response = await httpClient.get(
        `${this.baseUrl}/recruitments/${recruitmentId}/candidates/ai-generate/${generationId}/status`
      );

      return response.data;
    } catch (error: unknown) {
      console.error('Error fetching AI generation status:', error);
      this.handleAIError(error, 'obtener estado de generación IA');
      throw error;
    }
  }

  /**
   * Get detailed AI generation results
   * GET /recruitments/{id}/candidates/ai-generate/{generationId}/results
   *
   * @param recruitmentId - UUID of the recruitment process
   * @param generationId - UUID of the AI generation process
   * @returns Promise with generation results including candidates
   */
  async getGenerationResults(
    recruitmentId: string,
    generationId: string
  ): Promise<AIGenerationResults> {
    try {
      const response = await httpClient.get(
        `${this.baseUrl}/recruitments/${recruitmentId}/candidates/ai-generate/${generationId}/results`
      );

      const results: AIGenerationResults = response.data;
      const candidateCount = results.candidates?.length ?? 0;
      toast.success(`Se obtuvieron ${candidateCount} candidatos generados por IA`);
      return results;
    } catch (error: unknown) {
      console.error('Error fetching AI generation results:', error);
      this.handleAIError(error, 'obtener resultados de generación IA');
      throw error;
    }
  }

  /**
   * Approve and add AI-generated candidates to recruitment
   * POST /recruitments/{id}/candidates/ai-generate/{generationId}/approve
   *
   * @param recruitmentId - UUID of the recruitment process
   * @param generationId - UUID of the AI generation process
   * @param request - Approval request with candidate IDs
   * @returns Promise with approval response
   */
  async approveCandidates(
    recruitmentId: string,
    generationId: string,
    request: AIApproveCandidatesRequest
  ): Promise<AIApproveCandidatesResponse> {
    try {
      const response = await httpClient.post(
        `${this.baseUrl}/recruitments/${recruitmentId}/candidates/ai-generate/${generationId}/approve`,
        request
      );

      const approvalResponse: AIApproveCandidatesResponse = response.data;
      toast.success(`Se aprobaron ${approvalResponse.approvedCount} candidatos exitosamente`);
      return approvalResponse;
    } catch (error: unknown) {
      console.error('Error approving AI-generated candidates:', error);
      this.handleAIError(error, 'aprobar candidatos generados por IA');
      throw error;
    }
  }

  /**
   * Track AI generation progress with polling
   * Polls status endpoint until generation completes
   *
   * @param recruitmentId - UUID of the recruitment process
   * @param generationId - UUID of the AI generation process
   * @param onProgress - Optional callback for progress updates
   * @param pollingInterval - Interval between status checks (default: 2000ms)
   * @param maxPollingTime - Maximum polling duration (default: 5 minutes)
   * @returns Promise with final generation results
   */
  async trackGenerationProgress(
    recruitmentId: string,
    generationId: string,
    onProgress?: (status: AIGenerationStatus) => void,
    pollingInterval: number = 2000,
    maxPollingTime: number = 300000 // 5 minutes
  ): Promise<AIGenerationResults> {
    const startTime = Date.now();
    let lastStatus: AIGenerationStatus | null = null;

    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          // Check if we've exceeded max polling time
          if (Date.now() - startTime > maxPollingTime) {
            reject(new Error('Tiempo de espera de generación IA excedido'));
            return;
          }

          const status = await this.getGenerationStatus(recruitmentId, generationId);

          // Call progress callback if status changed
          if (onProgress && (!lastStatus || JSON.stringify(status) !== JSON.stringify(lastStatus))) {
            onProgress(status);
          }
          lastStatus = status;

          // Check if generation is complete (lowercase per OpenAPI spec)
          if (status.status === 'completed') {
            const results = await this.getGenerationResults(recruitmentId, generationId);
            resolve(results);
            return;
          }

          // Check if generation failed (lowercase per OpenAPI spec)
          if (status.status === 'failed' || status.status === 'cancelled') {
            const errorMessages = status.errors?.map(e => e.message).join(', ') || 'Error desconocido';
            reject(new Error(`Generación IA ${status.status}: ${errorMessages}`));
            return;
          }

          // Continue polling
          setTimeout(poll, pollingInterval);
        } catch (error) {
          reject(error);
        }
      };

      // Start polling
      poll();
    });
  }

  // ==================== Enhanced Error Handling ====================

  /**
   * Enhanced error handling for AI generation specific errors
   * Based on OpenAPI error responses
   */
  private handleAIError(error: unknown, operation: string): void {
    const axiosError = error as { response?: { data?: AIGenerationApiError } };

    if (axiosError.response?.data) {
      const apiError = axiosError.response.data;

      switch (apiError.code) {
        case 'RATE_LIMIT_EXCEEDED':
          toast.error('Límite de generación IA excedido. Intente más tarde.');
          break;
        case 'VALIDATION_ERROR':
        case 'INVALID_GENERATION_REQUEST':
          toast.error('Parámetros de generación IA inválidos.');
          break;
        case 'PROCESS_NOT_COMPLETED':
          toast.error('El proceso de generación IA aún no ha completado.');
          break;
        case 'GENERATION_NOT_FOUND':
          toast.error('Proceso de generación IA no encontrado.');
          break;
        case 'NOT_FOUND':
          toast.error('Proceso de reclutamiento o generación no encontrado.');
          break;
        default:
          toast.error(`Error al ${operation}: ${apiError.message}`);
      }
    } else {
      const genericError = error as { message?: string };
      toast.error(`Error al ${operation}: ${genericError.message || 'Error desconocido'}`);
    }
  }

  // ==================== Legacy Methods (for backward compatibility) ====================

  /**
   * Guarda un nuevo prompt para ser procesado
   * Note: This method is deprecated, use generateCandidates instead
   */
  async savePrompt(_request: AIGenerateRequest): Promise<AIGenerateResponse> {
    throw new Error('savePrompt is deprecated. Use generateCandidates method with the new AI generation endpoints.');
  }

  /**
   * Obtiene la lista de prompts para un proceso de reclutamiento
   * Simulated method using AI generation status endpoints
   */
  async getPromptsByRecruitment(_recruitmentId: string, _params?: PromptFilterParams): Promise<PromptListResponse> {
    try {
      // Since there's no specific prompts endpoint in OpenAPI, 
      // this is a simulated response for backward compatibility
      const response: PromptListResponse = {
        data: [],
        pagination: {
          current: 1,
          limit: 20,
          total: 0,
          hasNext: false,
          hasPrevious: false
        }
      };

      return response;
    } catch (error: unknown) {
      console.error('Error fetching prompts:', error);
      const err = error as { message?: string };
      toast.error(err.message || 'Error al obtener prompts');
      throw error;
    }
  }

  /**
   * Cancela un prompt pendiente
   * Note: This endpoint is not available in the current OpenAPI specification
   */
  async cancelPrompt(_promptId: string): Promise<void> {
    throw new Error('cancelPrompt endpoint is not available in the current API specification.');
  }

  /**
   * Reintenta un prompt fallido
   * Note: This endpoint is not available in current OpenAPI specification
   */
  async retryPrompt(_promptId: string): Promise<AIGenerateResponse> {
    throw new Error('retryPrompt endpoint is not available in current API specification. Use generateCandidates instead.');
  }

  /**
   * Elimina un prompt
   * Note: This endpoint is not available in current OpenAPI specification
   */
  async deletePrompt(_promptId: string): Promise<void> {
    throw new Error('deletePrompt endpoint is not available in current API specification.');
  }

  /**
   * Actualiza la prioridad de un prompt
   * Note: This endpoint is not available in current OpenAPI specification
   */
  async updatePromptPriority(_promptId: string, _priority: AIGenerateRequest['priority']): Promise<AIGenerateResponse> {
    throw new Error('updatePromptPriority endpoint is not available in current API specification. Priority is now handled through AI generation options.');
  }

  /**
   * Genera un prompt inicial basado en los detalles del trabajo usando Job Prompt Recruiter
   * Helper method for generating AI prompts
   */
  async generateJobPrompt(recruitmentData: unknown): Promise<string> {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_AIGENERATE_PROMPT}`,
        recruitmentData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 30000
        }
      );

      if (!response.data?.output) {
        throw new Error('No prompt generated');
      }

      return response.data.output;
    } catch (error: unknown) {
      console.error('Error generating job prompt:', error);
      const err = error as { message?: string };
      toast.error(err.message || 'Error al generar prompt del trabajo');
      throw error;
    }
  }
}

export const aiGenerateService = new AIGenerateService();
