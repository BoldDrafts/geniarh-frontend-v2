import { BaseService } from '../../../shared/api/baseService';
import { httpClient } from '../../../shared/api/httpClient';
import { toast } from 'react-hot-toast';
import axios from 'axios';

export interface AIGenerateRequest {
  recruitmentId: string;
  prompt: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface AIGenerateResponse {
  id: string;
  recruitmentId: string;
  prompt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  processedAt?: string;
  result?: any;
  error?: string;
}

export interface PromptListResponse {
  data: AIGenerateResponse[];
  pagination: {
    current: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface PromptFilterParams {
  page?: number;
  limit?: number;
  status?: AIGenerateResponse['status'];
  priority?: AIGenerateResponse['priority'];
}

/**
 * Servicio para generación con IA de candidatos
 */
class AIGenerateService extends BaseService<AIGenerateResponse, AIGenerateRequest, Partial<AIGenerateRequest>> {
  constructor() {
    super({
      baseUrl: import.meta.env.VITE_RECRUITMENT_API_URL,
      resourceName: '/ai-prompts',
      requireAuth: true,
      requiredRoles: ['recruiter-supervisor', 'recruiter'],
      requireAllRoles: false
    });
  }

  /**
   * Guarda un nuevo prompt para ser procesado
   */
  async savePrompt(request: AIGenerateRequest): Promise<AIGenerateResponse> {
    try {
      const response = await this.create(request);
      if (!response) {
        throw new Error('No response received from server');
      }
      toast.success('Prompt saved successfully and queued for processing');
      return response;
    } catch (error: any) {
      console.error('Error saving prompt:', error);
      toast.error(error.message || 'Failed to save prompt');
      throw error;
    }
  }

  /**
   * Obtiene la lista de prompts para un proceso de reclutamiento (POST)
   */
  async getPromptsByRecruitment(recruitmentId: string, params?: PromptFilterParams): Promise<PromptListResponse> {
    try {
      const requestData = {
        recruitmentId,
        ...params
      };

      const response = await httpClient.post(`${this.baseUrl}${this.resourceName}`, requestData);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching prompts:', error);
      toast.error(error.message || 'Failed to fetch prompts');
      throw error;
    }
  }

  /**
   * Obtiene detalles de un prompt específico
   */
  async getPromptDetails(promptId: string): Promise<AIGenerateResponse> {
    try {
      const response = await this.get(promptId);
      if (!response) {
        throw new Error('Prompt not found');
      }
      return response;
    } catch (error: any) {
      console.error('Error fetching prompt details:', error);
      toast.error(error.message || 'Failed to fetch prompt details');
      throw error;
    }
  }

  /**
   * Cancela un prompt pendiente
   */
  async cancelPrompt(promptId: string): Promise<void> {
    try {
      await this.customOperation(promptId, 'cancel', {}, 'POST');
      toast.success('Prompt cancelled successfully');
    } catch (error: any) {
      console.error('Error cancelling prompt:', error);
      toast.error(error.message || 'Failed to cancel prompt');
      throw error;
    }
  }

  /**
   * Reintenta un prompt fallido
   */
  async retryPrompt(promptId: string): Promise<AIGenerateResponse> {
    try {
      const response = await this.customOperation(promptId, 'retry', {}, 'POST') as AIGenerateResponse;
      toast.success('Prompt queued for retry');
      return response;
    } catch (error: any) {
      console.error('Error retrying prompt:', error);
      toast.error(error.message || 'Failed to retry prompt');
      throw error;
    }
  }

  /**
   * Elimina un prompt
   */
  async deletePrompt(promptId: string): Promise<void> {
    try {
      await this.delete(promptId);
      toast.success('Prompt deleted successfully');
    } catch (error: any) {
      console.error('Error deleting prompt:', error);
      toast.error(error.message || 'Failed to delete prompt');
      throw error;
    }
  }

  /**
   * Actualiza la prioridad de un prompt
   */
  async updatePromptPriority(promptId: string, priority: AIGenerateRequest['priority']): Promise<AIGenerateResponse> {
    try {
      const response = await this.update(promptId, { priority }) as AIGenerateResponse;
      toast.success('Prompt priority updated successfully');
      return response;
    } catch (error: any) {
      console.error('Error updating prompt priority:', error);
      toast.error(error.message || 'Failed to update prompt priority');
      throw error;
    }
  }

  /**
   * Genera un prompt inicial basado en los detalles del trabajo usando Job Prompt Recruiter
   */
  async generateJobPrompt(recruitmentData: any): Promise<string> {
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
    } catch (error: any) {
      console.error('Error generating job prompt:', error);
      toast.error(error.message || 'Failed to generate job prompt');
      throw error;
    }
  }
}

export const aiGenerateService = new AIGenerateService();