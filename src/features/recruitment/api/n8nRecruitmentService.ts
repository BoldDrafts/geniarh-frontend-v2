import axios from 'axios';
import { toast } from 'react-hot-toast';
import { authService } from '../../../shared/lib/api/authService';
import { RecruitmentProcess } from '../types/recruitmentProcess';

// ==================== Configuration ====================

const N8N_BASE_URL = import.meta.env.VITE_N8N_LINKEDINPOST_API_URL || 'https://n8n.synopsis.cloud/webhook-test';
const LINKEDIN_POST_ENDPOINT = '/linkedinpost/create';
const LINKEDIN_PUBLISH_ENDPOINT = '/linkedinpost/publish';

// ==================== Types and Interfaces ====================

export interface N8nLinkedInResponse {
  success: boolean;
  output?: string;
  error?: string;
}

// Nuevos tipos para publicación
export interface N8nLinkedInPublishRequest {
  content: string; // HTML content from TinyMCE
  recruitmentId: string;
  title: string;
}

export interface N8nLinkedInPublishResponse {
  success: boolean;
  text?: string;
  error?: string;
}

// ==================== N8n Service Class ====================

/**
 * N8n Service Class
 * 
 * Service to transform messages using n8n workflow for LinkedIn content with authentication.
 * Follows the same pattern as RecruitmentService for consistency.
 */
class N8nRecruitmentService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = N8N_BASE_URL;
  }

  // ==================== Authentication Methods ====================

  /**
   * Get authorization headers with bearer token
   */
  private getAuthHeaders(): Record<string, string> {
    const token = authService.getToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }
  
  /**
   * Validar autenticación y permisos antes de realizar operaciones
   */
  protected async validateAuth(): Promise<void> {
    if (!await authService.ensureAuthenticated()) {
      throw new Error('Authentication required');
    }
  }

  /**
   * Handle errors consistently
   */
  private handleError(error: any, operation: string): never {
    console.error(`Error ${operation}:`, error);
    
    let errorMessage = `Failed to ${operation}`;

    if (error.response) {
      // Server responded with error status
      const serverError = error.response.data?.error || error.response.data?.message;
      
      if (error.response.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
        authService.logout();
      } else if (error.response.status === 403) {
        errorMessage = 'Access denied. Insufficient permissions.';
      } else if (serverError) {
        errorMessage = serverError;
      } else {
        errorMessage = `Server error: ${error.response.status}`;
      }
    } else if (error.request) {
      // Network error
      errorMessage = 'Network error: Unable to connect to n8n service';
    } else if (error.message) {
      // Other errors
      errorMessage = error.message;
    }

    toast.error(errorMessage);
    throw new Error(errorMessage);
  }

  // ==================== Core Service Methods ====================

  /**
   * Transform message using n8n workflow
   * POST /webhook-test/linkedinpost/create
   * 
   * @param recruitment - Original message to transform
   * @returns Promise<string> - Transformed message content
   * @throws Error if transformation fails
   */
  async transformMessage(recruitment: RecruitmentProcess): Promise<string> {
    try {
      // Validate authentication
      await this.validateAuth();

      const { data } = await axios.post(
        `${this.baseUrl}${LINKEDIN_POST_ENDPOINT}`,
        recruitment,
        {
          headers: this.getAuthHeaders(),
          timeout: 30000 // 30 second timeout
        }
      );

      const response: N8nLinkedInResponse = data;

      if (!response.output) {
        throw new Error('No transformed content received');
      }

      toast.success('Message transformed successfully');
      console.log('Message transformed successfully');

      return response.output;

    } catch (error: any) {
      this.handleError(error, 'transform message');
    }
  }

  /**
   * Publish content to LinkedIn
   * POST /webhook-test/linkedinpost/publish
   * 
   * @param recruitmentId - ID of the recruitment process
   * @param htmlContent - HTML content from TinyMCE
   * @returns Promise<N8nLinkedInPublishResponse> - Publication response
   * @throws Error if publication fails
   */
  async publishToLinkedIn(recruitmentId: string, htmlContent: string, title: string): Promise<N8nLinkedInPublishResponse> {
    try {
      // Validate authentication
      await this.validateAuth();

      // Validate input
      if (!htmlContent || htmlContent.trim().length === 0) {
        throw new Error('Content is required for publishing');
      }

      if (!recruitmentId) {
        throw new Error('Recruitment ID is required for publishing');
      }

      // Remove HTML tags for LinkedIn (convert to plain text with formatting)
      const cleanContent = this.sanitizeHtmlContent(htmlContent);

      if (cleanContent.length > 3000) {
        toast.custom('Content is longer than LinkedIn recommended length (3000 characters). It will be truncated.');
      }

      console.log('Publishing to LinkedIn via n8n:', {
        endpoint: `${this.baseUrl}${LINKEDIN_PUBLISH_ENDPOINT}`,
        contentLength: cleanContent.length,
        originalHtmlLength: htmlContent.length,
        recruitmentId
      });

      const request: N8nLinkedInPublishRequest = {
        content: cleanContent,
        recruitmentId: recruitmentId,
        title: title
      };

      const { data } = await axios.post(
        `${this.baseUrl}${LINKEDIN_PUBLISH_ENDPOINT}`,
        request,
        {
          headers: this.getAuthHeaders(),
          timeout: 60000 // 60 second timeout for publishing
        }
      );

      const response: N8nLinkedInPublishResponse = data;

      toast.success('Published to LinkedIn successfully!');

      return response;

    } catch (error: any) {
      this.handleError(error, 'publish to LinkedIn');
    }
  }

  // ==================== Utility Methods ====================

  /**
   * Sanitize HTML content for LinkedIn
   */
  private sanitizeHtmlContent(htmlContent: string): string {
    return htmlContent
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<p>/gi, '')
      .replace(/<strong>(.*?)<\/strong>/gi, '*$1*')
      .replace(/<b>(.*?)<\/b>/gi, '*$1*')
      .replace(/<em>(.*?)<\/em>/gi, '_$1_')
      .replace(/<i>(.*?)<\/i>/gi, '_$1_')
      .replace(/<h[1-6]>(.*?)<\/h[1-6]>/gi, '\n$1\n')
      .replace(/<li>(.*?)<\/li>/gi, '• $1\n')
      .replace(/<ul>|<\/ul>|<ol>|<\/ol>/gi, '')
      .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
      .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newlines
      .trim();
  }

  /**
   * Check if service is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.validateAuth();
      
      const response = await axios.get(`${this.baseUrl}/health`, {
        headers: this.getAuthHeaders(),
        timeout: 5000
      });
      
      return response.status === 200;
    } catch (error) {
      console.warn('N8n service health check failed:', error);
      return false;
    }
  }

  /**
   * Get service configuration
   */
  getConfig(): {
    baseUrl: string;
    endpoints: {
      transform: string;
      publish: string;
    };
  } {
    return {
      baseUrl: this.baseUrl,
      endpoints: {
        transform: LINKEDIN_POST_ENDPOINT,
        publish: LINKEDIN_PUBLISH_ENDPOINT
      }
    };
  }

  // ==================== Convenience Methods ====================

  /**
   * Transform and prepare content for LinkedIn (without publishing)
   */
  async prepareLinkedInContent(recruitment: RecruitmentProcess): Promise<string> {
    const transformedMessage = await this.transformMessage(recruitment);
    return this.sanitizeHtmlContent(transformedMessage);
  }

  /**
   * Transform and publish in one step
   */
  async transformAndPublish(recruitment: RecruitmentProcess): Promise<N8nLinkedInPublishResponse> {
    try {
      // First transform the message
      const transformedContent = await this.transformMessage(recruitment);
      
      // Then publish it
      return await this.publishToLinkedIn(recruitment.id, transformedContent, recruitment.requirement.title);
    } catch (error: any) {
      this.handleError(error, 'transform and publish content');
    }
  }

}

// ==================== Singleton Export ====================

// Instancia singleton del servicio
export const n8nRecruitmentService = new N8nRecruitmentService();
export default n8nRecruitmentService;