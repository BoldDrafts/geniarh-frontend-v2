import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  aiGenerateService,
  type AIGenerateCandidatesRequest,
  type AIGenerateCandidatesResponse,
  type AIGenerationStatus,
  type AIGenerationResults,
  type AIApproveCandidatesRequest,
  type AIApproveCandidatesResponse,
  type AIGenerationOptions,
  type AIGenerationFilterParams,
  type AIGenerateRequest,
  type AIGenerateResponse,
  type PromptFilterParams
} from '../api/aiGenerateService';
import type { AIGenerationSummary } from '../types/aiGeneration.types';

// ==================== Optimized Hook State ====================

interface UseAIGenerationState {
  currentGeneration: {
    response: AIGenerateCandidatesResponse | null;
    status: AIGenerationStatus | null;
    results: AIGenerationResults | null;
  };
  tracking: {
    isTracking: boolean;
    progress: AIGenerationStatus | null;
  };
  prompts: AIGenerateResponse[];
  aiGenerations: {
    data: AIGenerationSummary[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  pagination: {
    current: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

// ==================== Optimized Hook Actions ====================

interface UseAIGenerationActions {
  generateCandidates: (request: AIGenerateCandidatesRequest, options?: AIGenerationOptions) => Promise<AIGenerateCandidatesResponse>;
  getGenerationStatus: (generationId: string) => Promise<AIGenerationStatus>;
  getGenerationResults: (generationId: string) => Promise<AIGenerationResults>;
  approveCandidates: (generationId: string, request: AIApproveCandidatesRequest) => Promise<AIApproveCandidatesResponse>;
  trackGenerationProgress: (generationId: string, onProgress?: (status: AIGenerationStatus) => void) => Promise<AIGenerationResults>;
  clearError: () => void;
  generateJobPrompt: (recruitmentData: unknown) => Promise<string>;
  createPrompt: (request: AIGenerateCandidatesRequest) => Promise<void>;
  fetchPrompts: (recruitmentId: string, params?: PromptFilterParams) => Promise<void>;
  fetchAIGenerations: (recruitmentId: string, params?: AIGenerationFilterParams) => Promise<void>;
  cancelPrompt: (promptId: string) => Promise<void>;
  retryPrompt: (promptId: string) => Promise<void>;
  deletePrompt: (promptId: string) => Promise<void>;
  refreshPrompts: (recruitmentId: string) => Promise<void>;
}

// ==================== Optimized Hook Implementation ====================

/**
 * Optimized hook for AI generation with RPA-compatible async processing
 * Based on OpenAPI specification endpoints:
 * - POST /recruitments/{id}/candidates/ai-generate
 * - GET /recruitments/{id}/candidates/ai-generate/{generationId}/status
 * - GET /recruitments/{id}/candidates/ai-generate/{generationId}/results
 * - POST /recruitments/{id}/candidates/ai-generate/{generationId}/approve
 */
export const useAIGeneration = (recruitmentId: string): UseAIGenerationState & UseAIGenerationActions => {
  const [state, setState] = useState<UseAIGenerationState>({
    currentGeneration: {
      response: null,
      status: null,
      results: null
    },
    tracking: {
      isTracking: false,
      progress: null
    },
    prompts: [],
    aiGenerations: {
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
      }
    },
    pagination: {
      current: 1,
      limit: 20,
      total: 0,
      hasNext: false,
      hasPrevious: false
    },
    loading: false,
    submitting: false,
    error: null
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setSubmitting = useCallback((submitting: boolean) => {
    setState(prev => ({ ...prev, submitting }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Generate candidates using AI
   * POST /recruitments/{id}/candidates/ai-generate
   */
  const generateCandidates = useCallback(async (
    request: AIGenerateCandidatesRequest,
    options?: AIGenerationOptions
  ): Promise<AIGenerateCandidatesResponse> => {
    try {
      setSubmitting(true);
      setError(null);

      const response = await aiGenerateService.generateCandidates(recruitmentId, request, options);

      setState(prev => ({
        ...prev,
        currentGeneration: {
          ...prev.currentGeneration,
          response,
          status: null,
          results: null
        }
      }));

      return response;
    } catch (error: unknown) {
      const err = error as { message?: string };
      setError(err.message || 'Error al iniciar generación IA');
      throw error;
    } finally {
      setSubmitting(false);
    }
  }, [recruitmentId, setSubmitting, setError]);

  /**
   * Get AI generation process status
   * GET /recruitments/{id}/candidates/ai-generate/{generationId}/status
   */
  const getGenerationStatus = useCallback(async (generationId: string): Promise<AIGenerationStatus> => {
    try {
      setError(null);
      const status = await aiGenerateService.getGenerationStatus(recruitmentId, generationId);

      setState(prev => ({
        ...prev,
        currentGeneration: {
          ...prev.currentGeneration,
          status
        }
      }));

      return status;
    } catch (error: unknown) {
      const err = error as { message?: string };
      setError(err.message || 'Error al obtener estado de generación');
      throw error;
    }
  }, [recruitmentId, setError]);

  /**
   * Get detailed AI generation results
   * GET /recruitments/{id}/candidates/ai-generate/{generationId}/results
   */
  const getGenerationResults = useCallback(async (generationId: string): Promise<AIGenerationResults> => {
    try {
      setError(null);
      const results = await aiGenerateService.getGenerationResults(recruitmentId, generationId);

      setState(prev => ({
        ...prev,
        currentGeneration: {
          ...prev.currentGeneration,
          results,
          status: results ? {
            generationId: results.generationId,
            status: results.status,
            progress: {
              requestedCount: results.requestedCount,
              generatedCount: results.generatedCount,
              validatedCount: results.validatedCount ?? results.generatedCount,
              percentageComplete: 100
            },
            startedAt: results.completedAt, // Using completedAt as we don't have startedAt
            completedAt: results.completedAt
          } : null
        }
      }));

      return results;
    } catch (error: unknown) {
      const err = error as { message?: string };
      setError(err.message || 'Error al obtener resultados de generación');
      throw error;
    }
  }, [recruitmentId, setError]);

  /**
   * Approve and add AI-generated candidates to recruitment
   * POST /recruitments/{id}/candidates/ai-generate/{generationId}/approve
   */
  const approveCandidates = useCallback(async (
    generationId: string,
    request: AIApproveCandidatesRequest
  ): Promise<AIApproveCandidatesResponse> => {
    try {
      setSubmitting(true);
      setError(null);

      const response = await aiGenerateService.approveCandidates(recruitmentId, generationId, request);

      return response;
    } catch (error: unknown) {
      const err = error as { message?: string };
      setError(err.message || 'Error al aprobar candidatos');
      throw error;
    } finally {
      setSubmitting(false);
    }
  }, [recruitmentId, setSubmitting, setError]);

  /**
   * Track AI generation progress with polling
   * Uses status endpoint with polling mechanism
   */
  const trackGenerationProgress = useCallback(
    async (
      generationId: string,
      onProgress?: (status: AIGenerationStatus) => void
    ): Promise<AIGenerationResults> => {
      try {
        setError(null);

        setState(prev => ({
          ...prev,
          tracking: { ...prev.tracking, isTracking: true }
        }));

        const results = await aiGenerateService.trackGenerationProgress(
          recruitmentId,
          generationId,
          (status) => {
            setState(prev => ({
              ...prev,
              currentGeneration: {
                ...prev.currentGeneration,
                status
              },
              tracking: {
                ...prev.tracking,
                progress: status
              }
            }));

            if (onProgress) {
              onProgress(status);
            }
          }
        );

        setState(prev => ({
          ...prev,
          currentGeneration: {
            ...prev.currentGeneration,
            results
          },
          tracking: { ...prev.tracking, isTracking: false, progress: null }
        }));

        return results;
      } catch (error: unknown) {
        setState(prev => ({
          ...prev,
          tracking: { ...prev.tracking, isTracking: false, progress: null }
        }));

        const err = error as { message?: string };
        setError(err.message || 'Error al rastrear progreso de generación');
        throw error;
      }
    },
    [recruitmentId, setError]
  );

  /**
   * Generate job prompt using AI
   */
  const generateJobPrompt = useCallback(async (recruitmentData: unknown): Promise<string> => {
    try {
      setError(null);
      return await aiGenerateService.generateJobPrompt(recruitmentData);
    } catch (error: unknown) {
      const err = error as { message?: string };
      setError(err.message || 'Error al generar prompt del trabajo');
      throw error;
    }
  }, [setError]);

  // ==================== Prompt Management Actions ====================

  const fetchPrompts = useCallback(async (id: string, params?: PromptFilterParams): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await aiGenerateService.getPromptsByRecruitment(id, params);

      setState(prev => ({
        ...prev,
        prompts: response.data,
        pagination: response.pagination
      }));
    } catch (error: unknown) {
      const err = error as { message?: string };
      setError(err.message || 'Error al obtener prompts');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const cancelPrompt = useCallback(async (promptId: string): Promise<void> => {
    try {
      setError(null);
      await aiGenerateService.cancelPrompt(promptId);

      // Update local state
      setState(prev => ({
        ...prev,
        prompts: prev.prompts.map(prompt =>
          prompt.id === promptId
            ? { ...prompt, status: 'failed' as const, error: 'Cancelado por el usuario' }
            : prompt
        )
      }));

      toast.success('Prompt cancelado');
    } catch (error: unknown) {
      const err = error as { message?: string };
      setError(err.message || 'Error al cancelar prompt');
      throw error;
    }
  }, [setError]);

  const retryPrompt = useCallback(async (promptId: string): Promise<void> => {
    try {
      setError(null);
      const updatedPrompt = await aiGenerateService.retryPrompt(promptId);

      // Update local state
      setState(prev => ({
        ...prev,
        prompts: prev.prompts.map(prompt =>
          prompt.id === promptId ? updatedPrompt : prompt
        )
      }));
    } catch (error: unknown) {
      const err = error as { message?: string };
      setError(err.message || 'Error al reintentar prompt');
      throw error;
    }
  }, [setError]);

  const deletePrompt = useCallback(async (promptId: string): Promise<void> => {
    try {
      setError(null);
      await aiGenerateService.deletePrompt(promptId);

      // Remove from local state
      setState(prev => ({
        ...prev,
        prompts: prev.prompts.filter(prompt => prompt.id !== promptId),
        pagination: {
          ...prev.pagination,
          total: prev.pagination.total - 1
        }
      }));

      toast.success('Prompt eliminado');
    } catch (error: unknown) {
      const err = error as { message?: string };
      setError(err.message || 'Error al eliminar prompt');
      throw error;
    }
  }, [setError]);

  const updatePromptPriority = useCallback(async (promptId: string, priority: AIGenerateRequest['priority']): Promise<void> => {
    try {
      setError(null);
      const updatedPrompt = await aiGenerateService.updatePromptPriority(promptId, priority);

      // Update local state
      setState(prev => ({
        ...prev,
        prompts: prev.prompts.map(prompt =>
          prompt.id === promptId ? updatedPrompt : prompt
        )
      }));
    } catch (error: unknown) {
      const err = error as { message?: string };
      setError(err.message || 'Error al actualizar prioridad');
      throw error;
    }
  }, [setError]);

  const refreshPrompts = useCallback(async (id: string): Promise<void> => {
    await fetchPrompts(id);
  }, [fetchPrompts]);

  const fetchAIGenerations = useCallback(async (id: string, params?: AIGenerationFilterParams): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await aiGenerateService.listAIGenerations(id, params);

      setState(prev => ({
        ...prev,
        aiGenerations: response
      }));
    } catch (error: unknown) {
      const err = error as { message?: string };
      setError(err.message || 'Error al obtener generaciones IA');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const createPrompt = useCallback(async (request: AIGenerateCandidatesRequest): Promise<void> => {
    try {
      setSubmitting(true);
      setError(null);

      await aiGenerateService.generateCandidates(recruitmentId, request);

      // Refresh AI generations list
      await fetchAIGenerations(recruitmentId);
    } catch (error: unknown) {
      const err = error as { message?: string };
      setError(err.message || 'Error al crear prompt');
      throw error;
    } finally {
      setSubmitting(false);
    }
  }, [recruitmentId, setSubmitting, setError, fetchAIGenerations]);

  return {
    ...state,
    generateCandidates,
    getGenerationStatus,
    getGenerationResults,
    approveCandidates,
    trackGenerationProgress,
    clearError,
    generateJobPrompt,
    createPrompt,
    fetchPrompts,
    fetchAIGenerations,
    cancelPrompt,
    retryPrompt,
    deletePrompt,
    refreshPrompts
  };
};
