import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { aiGenerateService, AIGenerateRequest, AIGenerateResponse, PromptFilterParams } from '../api/aiGenerateService';

interface UseAIGenerateState {
  prompts: AIGenerateResponse[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
  pagination: {
    current: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

interface UseAIGenerateActions {
  createPrompt: (request: AIGenerateRequest) => Promise<void>;
  fetchPrompts: (recruitmentId: string, params?: PromptFilterParams) => Promise<void>;
  cancelPrompt: (promptId: string) => Promise<void>;
  retryPrompt: (promptId: string) => Promise<void>;
  deletePrompt: (promptId: string) => Promise<void>;
  updatePromptPriority: (promptId: string, priority: AIGenerateRequest['priority']) => Promise<void>;
  refreshPrompts: (recruitmentId: string) => Promise<void>;
  clearError: () => void;
  generateJobPrompt: (recruitmentData: any) => Promise<string>;
}

export const useAIGenerate = (recruitmentId: string): UseAIGenerateState & UseAIGenerateActions => {
  const [state, setState] = useState<UseAIGenerateState>({
    prompts: [],
    loading: false,
    submitting: false,
    error: null,
    pagination: {
      current: 1,
      limit: 20,
      total: 0,
      hasNext: false,
      hasPrevious: false
    }
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

  const createPrompt = useCallback(async (request: AIGenerateRequest) => {
    try {
      setSubmitting(true);
      setError(null);
      
      await aiGenerateService.savePrompt(request);
      
      // Refresh prompts list
      await fetchPrompts(recruitmentId);
    } catch (error: any) {
      setError(error.message || 'Failed to create prompt');
      throw error;
    } finally {
      setSubmitting(false);
    }
  }, [recruitmentId]);

  const fetchPrompts = useCallback(async (id: string, params?: PromptFilterParams) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await aiGenerateService.getPromptsByRecruitment(id, params);
      
      setState(prev => ({
        ...prev,
        prompts: response.output,
        pagination: response.pagination
      }));
    } catch (error: any) {
      setError(error.message || 'Failed to fetch prompts');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const cancelPrompt = useCallback(async (promptId: string) => {
    try {
      setError(null);
      await aiGenerateService.cancelPrompt(promptId);
      
      // Update local state
      setState(prev => ({
        ...prev,
        prompts: prev.prompts.map(prompt =>
          prompt.id === promptId
            ? { ...prompt, status: 'failed' as const, error: 'Cancelled by user' }
            : prompt
        )
      }));
      
      toast.success('Prompt cancelled');
    } catch (error: any) {
      setError(error.message || 'Failed to cancel prompt');
      throw error;
    }
  }, []);

  const retryPrompt = useCallback(async (promptId: string) => {
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
    } catch (error: any) {
      setError(error.message || 'Failed to retry prompt');
      throw error;
    }
  }, []);

  const deletePrompt = useCallback(async (promptId: string) => {
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
      
      toast.success('Prompt deleted');
    } catch (error: any) {
      setError(error.message || 'Failed to delete prompt');
      throw error;
    }
  }, []);

  const updatePromptPriority = useCallback(async (promptId: string, priority: AIGenerateRequest['priority']) => {
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
    } catch (error: any) {
      setError(error.message || 'Failed to update prompt priority');
      throw error;
    }
  }, []);

  const refreshPrompts = useCallback(async (id: string) => {
    await fetchPrompts(id);
  }, [fetchPrompts]);

  const generateJobPrompt = useCallback(async (recruitmentData: any) => {
    try {
      setError(null);
      return await aiGenerateService.generateJobPrompt(recruitmentData);
    } catch (error: any) {
      setError(error.message || 'Failed to generate job prompt');
      throw error;
    }
  }, [setError]);

  return {
    ...state,
    createPrompt,
    fetchPrompts,
    cancelPrompt,
    retryPrompt,
    deletePrompt,
    updatePromptPriority,
    refreshPrompts,
    clearError,
    generateJobPrompt
  };
};