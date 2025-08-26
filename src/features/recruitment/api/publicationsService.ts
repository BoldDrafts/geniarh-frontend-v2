import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_RECRUITMENT_API_URL;

// ==================== Types and Interfaces ====================

export interface Publication {
  id: string;
  platform: 'LinkedIn' | 'Computrabajo' | 'Indeed' | 'Glassdoor' | 'CompanyWebsite' | 'Other';
  platformJobId?: string;
  url: string;
  title?: string;
  description?: string;
  status: 'draft' | 'published' | 'expired' | 'suspended' | 'archived';
  publishedAt?: string;
  expiresAt?: string;
  autoRenewal: boolean;
  views: number;
  applications: number;
  likes: number;
  shares: number;
  clicks: number;
  comments: number;
  budgetAllocated?: number;
  costSpent: number;
  engagement?: {
    likes?: number;
    shares?: number;
    clicks?: number;
    comments?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreatePublicationRequest {
  platform: Publication['platform'];
  platformJobId?: string;
  url: string;
  title?: string;
  description?: string;
  publishedAt?: string;
  expiresAt?: string;
  autoRenewal?: boolean;
  budgetAllocated?: number;
}

export interface UpdatePublicationRequest {
  platformJobId?: string;
  url?: string;
  title?: string;
  description?: string;
  status?: Publication['status'];
  publishedAt?: string;
  expiresAt?: string;
  autoRenewal?: boolean;
  budgetAllocated?: number;
  views?: number;
  applications?: number;
  likes?: number;
  shares?: number;
  clicks?: number;
  comments?: number;
  costSpent?: number;
}

export interface PublicationListParams {
  status?: Publication['status'];
  platform?: Publication['platform'];
  page?: number;
  limit?: number;
}

export interface PublicationListResponse {
  data: Publication[];
  pagination: {
    total: number;
    pages: number;
    current: number;
    limit: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
  };
}

export interface PublicationMetrics {
  totalPublications: number;
  activePublications: number;
  totalViews: number;
  totalApplications: number;
  totalCost: number;
  totalBudget: number;
  averageViews: number;
  applicationRate: number;
  costPerApplication: number;
  platformBreakdown: Array<{
    platform: string;
    publications: number;
    views: number;
    applications: number;
    cost: number;
  }>;
}

export interface BulkUpdateRequest {
  publicationIds: string[];
  updates: UpdatePublicationRequest;
}

export interface BulkUpdateResponse {
  updated: string[];
  failed: Array<{
    publicationId: string;
    reason: string;
  }>;
  totalUpdated: number;
  totalFailed: number;
}

export interface StatusUpdateRequest {
  status: Publication['status'];
  reason?: string;
  publishedAt?: string;
  expiresAt?: string;
}

// ==================== n8n Integration Types ====================

export interface N8nContentGenerationRequest {
  position: string;
  department: string;
  recruitmentId: string;
  targetAudience: string;
  tone: 'professional' | 'casual' | 'enthusiastic' | 'urgent';
  includeCompanyInfo: boolean;
  includeSalaryRange: boolean;
  includeRemoteOption: boolean;
}

export interface N8nContentGenerationResponse {
  content: string;
  success: boolean;
  metadata?: {
    generatedAt: string;
    model: string;
    tokensUsed: number;
  };
}

export interface N8nPublishRequest {
  publicationId: string;
  recruitmentId: string;
  content: string;
  hashtags: string[];
  targetAudience: string;
  scheduledDate?: string;
}

export interface N8nPublishResponse {
  success: boolean;
  linkedinUrl?: string;
  linkedinJobId?: string;
  error?: string;
  metadata?: {
    publishedAt: string;
    platform: string;
    estimatedReach: number;
  };
}

/**
 * Publications Service
 * 
 * This service provides methods to interact with the Publications API.
 * It handles all publication operations including creation, updates, metrics,
 * and integration with n8n for content generation and LinkedIn publishing.
 * 
 * API Base URL: {API_URL}/recruitment/{id}/publications
 */
export const publicationsService = {
  // ==================== Core Publication Operations ====================

  /**
   * Get all publications for a recruitment process
   * GET /recruitment/{id}/publications
   * 
   * @param recruitmentId - Recruitment process UUID
   * @param params - Optional filtering and pagination parameters
   * @returns Promise<PublicationListResponse> - Paginated list of publications
   */
  list: async (
    recruitmentId: string,
    params?: PublicationListParams
  ): Promise<PublicationListResponse> => {
    try {
      const queryParams = {
        ...params,
        page: params?.page || 1,
        limit: params?.limit || 20
      };
      
      const { data } = await axios.get(
        `${API_URL}/recruitment/${recruitmentId}/publications`,
        { params: queryParams }
      );
      return data;
    } catch (error: any) {
      console.error('Error fetching publications:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch publications';
      toast.error(errorMessage);
      throw error;
    }
  },

  /**
   * Get a specific publication
   * GET /recruitment/{id}/publications/{publicationId}
   * 
   * @param recruitmentId - Recruitment process UUID
   * @param publicationId - Publication UUID
   * @returns Promise<Publication> - Publication details
   */
  get: async (recruitmentId: string, publicationId: string): Promise<Publication> => {
    try {
      const { data } = await axios.get(
        `${API_URL}/recruitment/${recruitmentId}/publications/${publicationId}`
      );
      return data;
    } catch (error: any) {
      console.error('Error fetching publication:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch publication';
      toast.error(errorMessage);
      throw error;
    }
  },

  /**
   * Create a new publication
   * POST /recruitment/{id}/publications
   * 
   * @param recruitmentId - Recruitment process UUID
   * @param request - Publication creation request
   * @returns Promise<Publication> - Created publication
   */
  create: async (
    recruitmentId: string,
    request: CreatePublicationRequest
  ): Promise<Publication> => {
    try {
      const { data } = await axios.post(
        `${API_URL}/recruitment/${recruitmentId}/publications`,
        request
      );
      toast.success('Publication created successfully');
      return data;
    } catch (error: any) {
      console.error('Error creating publication:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create publication';
      toast.error(errorMessage);
      throw error;
    }
  },

  /**
   * Update a publication
   * PUT /recruitment/{id}/publications/{publicationId}
   * 
   * @param recruitmentId - Recruitment process UUID
   * @param publicationId - Publication UUID
   * @param request - Publication update request
   * @returns Promise<Publication> - Updated publication
   */
  update: async (
    recruitmentId: string,
    publicationId: string,
    request: UpdatePublicationRequest
  ): Promise<Publication> => {
    try {
      const { data } = await axios.put(
        `${API_URL}/recruitment/${recruitmentId}/publications/${publicationId}`,
        request
      );
      toast.success('Publication updated successfully');
      return data;
    } catch (error: any) {
      console.error('Error updating publication:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update publication';
      toast.error(errorMessage);
      throw error;
    }
  },

  /**
   * Delete a publication
   * DELETE /recruitment/{id}/publications/{publicationId}
   * 
   * @param recruitmentId - Recruitment process UUID
   * @param publicationId - Publication UUID
   * @returns Promise<void>
   */
  delete: async (recruitmentId: string, publicationId: string): Promise<void> => {
    try {
      await axios.delete(
        `${API_URL}/recruitment/${recruitmentId}/publications/${publicationId}`
      );
      toast.success('Publication deleted successfully');
    } catch (error: any) {
      console.error('Error deleting publication:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete publication';
      toast.error(errorMessage);
      throw error;
    }
  },

  // ==================== Status Management ====================

  /**
   * Update publication status
   * PATCH /recruitment/{id}/publications/{publicationId}/status
   * 
   * @param recruitmentId - Recruitment process UUID
   * @param publicationId - Publication UUID
   * @param request - Status update request
   * @returns Promise<Publication> - Updated publication
   */
  updateStatus: async (
    recruitmentId: string,
    publicationId: string,
    request: StatusUpdateRequest
  ): Promise<Publication> => {
    try {
      const { data } = await axios.patch(
        `${API_URL}/recruitment/${recruitmentId}/publications/${publicationId}/status`,
        request
      );
      toast.success(`Publication status updated to ${request.status}`);
      return data;
    } catch (error: any) {
      console.error('Error updating publication status:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update publication status';
      toast.error(errorMessage);
      throw error;
    }
  },

  // ==================== Bulk Operations ====================

  /**
   * Bulk update publications
   * PATCH /recruitment/{id}/publications/bulk
   * 
   * @param recruitmentId - Recruitment process UUID
   * @param request - Bulk update request
   * @returns Promise<BulkUpdateResponse> - Bulk update results
   */
  bulkUpdate: async (
    recruitmentId: string,
    request: BulkUpdateRequest
  ): Promise<BulkUpdateResponse> => {
    try {
      const { data } = await axios.patch(
        `${API_URL}/recruitment/${recruitmentId}/publications/bulk`,
        request
      );
      
      if (data.totalUpdated > 0) {
        toast.success(`Successfully updated ${data.totalUpdated} publication(s)`);
      }
      
      if (data.totalFailed > 0) {
        toast.dismiss(`Failed to update ${data.totalFailed} publication(s)`);
      }
      
      return data;
    } catch (error: any) {
      console.error('Error bulk updating publications:', error);
      const errorMessage = error.response?.data?.message || 'Failed to bulk update publications';
      toast.error(errorMessage);
      throw error;
    }
  },

  // ==================== Analytics and Metrics ====================

  /**
   * Get aggregated publication metrics
   * GET /recruitment/{id}/publications/metrics
   * 
   * @param recruitmentId - Recruitment process UUID
   * @param params - Optional filtering parameters
   * @returns Promise<PublicationMetrics> - Aggregated metrics
   */
  getMetrics: async (
    recruitmentId: string,
    params?: {
      platform?: Publication['platform'];
      dateFrom?: string;
      dateTo?: string;
    }
  ): Promise<PublicationMetrics> => {
    try {
      const { data } = await axios.get(
        `${API_URL}/recruitment/${recruitmentId}/publications/metrics`,
        { params }
      );
      return data;
    } catch (error: any) {
      console.error('Error fetching publication metrics:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch publication metrics';
      toast.error(errorMessage);
      throw error;
    }
  },

  // ==================== n8n Integration ====================

  /**
   * Generate LinkedIn content using n8n
   * POST /api/n8n/generate-linkedin-content
   * 
   * @param request - Content generation request
   * @returns Promise<N8nContentGenerationResponse> - Generated content
   */
  generateContent: async (
    request: N8nContentGenerationRequest
  ): Promise<N8nContentGenerationResponse> => {
    try {
      const { data } = await axios.post('/api/n8n/generate-linkedin-content', request);
      return data;
    } catch (error: any) {
      console.error('Error generating content with n8n:', error);
      const errorMessage = error.response?.data?.message || 'Failed to generate content';
      toast.error(errorMessage);
      throw error;
    }
  },

  /**
   * Publish to LinkedIn using n8n
   * POST /api/n8n/publish-to-linkedin
   * 
   * @param request - LinkedIn publish request
   * @returns Promise<N8nPublishResponse> - Publish result
   */
  publishToLinkedIn: async (request: N8nPublishRequest): Promise<N8nPublishResponse> => {
    try {
      const { data } = await axios.post('/api/n8n/publish-to-linkedin', request);
      
      if (data.success) {
        toast.success('Successfully published to LinkedIn');
      } else {
        toast.error(data.error || 'Failed to publish to LinkedIn');
      }
      
      return data;
    } catch (error: any) {
      console.error('Error publishing to LinkedIn:', error);
      const errorMessage = error.response?.data?.message || 'Failed to publish to LinkedIn';
      toast.error(errorMessage);
      throw error;
    }
  },

  // ==================== Convenience Methods ====================

  /**
   * Create LinkedIn publication with content generation and optional auto-publish
   * 
   * @param recruitmentId - Recruitment process UUID
   * @param contentRequest - Content generation parameters
   * @param autoPublish - Whether to publish immediately
   * @returns Promise<{ publication: Publication; publishResult?: N8nPublishResponse }> - Creation and publish results
   */
  createLinkedInPublication: async (
    recruitmentId: string,
    contentRequest: N8nContentGenerationRequest,
    autoPublish: boolean = false
  ): Promise<{ publication: Publication; publishResult?: N8nPublishResponse }> => {
    try {
      // 1. Generate content
      const contentResponse = await publicationsService.generateContent(contentRequest);
      
      // 2. Create publication
      const publicationRequest: CreatePublicationRequest = {
        platform: 'LinkedIn',
        url: `https://www.linkedin.com/jobs/view/temp-${Date.now()}`,
        title: `${contentRequest.position} - ${contentRequest.department}`,
        description: contentResponse.content,
        publishedAt: autoPublish ? new Date().toISOString() : undefined,
        budgetAllocated: 0
      };
      
      const publication = await publicationsService.create(recruitmentId, publicationRequest);
      
      let publishResult: N8nPublishResponse | undefined;
      
      // 3. Auto-publish if requested
      if (autoPublish) {
        const publishRequest: N8nPublishRequest = {
          publicationId: publication.id,
          recruitmentId,
          content: contentResponse.content,
          hashtags: [], // Will be passed from the modal
          targetAudience: contentRequest.targetAudience
        };
        
        publishResult = await publicationsService.publishToLinkedIn(publishRequest);
        
        // 4. Update publication with real LinkedIn URL if successful
        if (publishResult.success && publishResult.linkedinUrl) {
          await publicationsService.update(recruitmentId, publication.id, {
            url: publishResult.linkedinUrl,
            platformJobId: publishResult.linkedinJobId,
            status: 'published',
            publishedAt: new Date().toISOString()
          });
        }
      }
      
      return { publication, publishResult };
      
    } catch (error: any) {
      console.error('Error creating LinkedIn publication:', error);
      throw error;
    }
  },

  /**
  /**
   * Get publications by platform
   * 
   * @param recruitmentId - Recruitment process UUID
   * @param platform - Platform to filter by
   * @returns Promise<Publication[]> - Array of publications for the platform
   */
  getByPlatform: async (
    recruitmentId: string,
    platform: Publication['platform']
  ): Promise<Publication[]> => {
    const response = await publicationsService.list(recruitmentId, { platform });
    return response.data;
  },

  /**
   * Get publications by status
   * 
   * @param recruitmentId - Recruitment process UUID
   * @param status - Status to filter by
   * @returns Promise<Publication[]> - Array of publications with the status
   */
  getByStatus: async (
    recruitmentId: string,
    status: Publication['status']
  ): Promise<Publication[]> => {
    const response = await publicationsService.list(recruitmentId, { status });
    return response.data;
  },

  /**
   * Get active publications
   * 
   * @param recruitmentId - Recruitment process UUID
   * @returns Promise<Publication[]> - Array of active publications
   */
  getActive: async (recruitmentId: string): Promise<Publication[]> => {
    return publicationsService.getByStatus(recruitmentId, 'published');
  },

  /**
   * Get draft publications
   * 
   * @param recruitmentId - Recruitment process UUID
   * @returns Promise<Publication[]> - Array of draft publications
   */
  getDrafts: async (recruitmentId: string): Promise<Publication[]> => {
    return publicationsService.getByStatus(recruitmentId, 'draft');
  },

  /**
   * Publish a draft publication
   * 
   * @param recruitmentId - Recruitment process UUID
   * @param publicationId - Publication UUID
   * @param expiresAt - Optional expiry date
   * @returns Promise<Publication> - Updated publication
   */
  publish: async (
    recruitmentId: string,
    publicationId: string,
    expiresAt?: string
  ): Promise<Publication> => {
    return publicationsService.updateStatus(recruitmentId, publicationId, {
      status: 'published',
      publishedAt: new Date().toISOString(),
      expiresAt
    });
  },

  /**
   * Suspend a publication
   * 
   * @param recruitmentId - Recruitment process UUID
   * @param publicationId - Publication UUID
   * @param reason - Reason for suspension
   * @returns Promise<Publication> - Updated publication
   */
  suspend: async (
    recruitmentId: string,
    publicationId: string,
    reason?: string
  ): Promise<Publication> => {
    return publicationsService.updateStatus(recruitmentId, publicationId, {
      status: 'suspended',
      reason
    });
  },

  /**
   * Archive a publication
   * 
   * @param recruitmentId - Recruitment process UUID
   * @param publicationId - Publication UUID
   * @param reason - Reason for archiving
   * @returns Promise<Publication> - Updated publication
   */
  archive: async (
    recruitmentId: string,
    publicationId: string,
    reason?: string
  ): Promise<Publication> => {
    return publicationsService.updateStatus(recruitmentId, publicationId, {
      status: 'archived',
      reason
    });
  },

  /**
   * Update publication metrics (usually called by external systems)
   * 
   * @param recruitmentId - Recruitment process UUID
   * @param publicationId - Publication UUID
   * @param metrics - Metrics to update
   * @returns Promise<Publication> - Updated publication
   */
  updateMetrics: async (
    recruitmentId: string,
    publicationId: string,
    metrics: {
      views?: number;
      applications?: number;
      likes?: number;
      shares?: number;
      clicks?: number;
      comments?: number;
      costSpent?: number;
    }
  ): Promise<Publication> => {
    return publicationsService.update(recruitmentId, publicationId, metrics);
  },

  /**
   * Create LinkedIn publication with full workflow (generate + create + optionally publish)
   * This is the main method used by the modal
   * 
   * @param recruitmentId - Recruitment process UUID
   * @param modalData - Data from the LinkedIn modal
   * @returns Promise<{ publication: Publication; publishResult?: N8nPublishResponse }> - Creation and publish results
   */
  createLinkedInFromModal: async (
    recruitmentId: string,
    modalData: {
      description: string;
      includeCompanyInfo: boolean;
      includeSalaryRange: boolean;
      includeRemoteOption: boolean;
      hashtags: string[];
      scheduledDate?: string;
      autoPost: boolean;
      position: string;
      department: string;
    }
  ): Promise<{ publication: Publication; publishResult?: N8nPublishResponse }> => {
    try {
      // 1. Create publication in database
      const publicationRequest: CreatePublicationRequest = {
        platform: 'LinkedIn',
        url: `https://www.linkedin.com/jobs/view/temp-${Date.now()}`, // Temporary URL
        title: `${modalData.position} - ${modalData.department}`,
        description: modalData.description,
        publishedAt: modalData.autoPost ? new Date().toISOString() : undefined,
        expiresAt: modalData.scheduledDate || undefined,
        autoRenewal: false,
        budgetAllocated: 0
      };
      
      const publication = await publicationsService.create(recruitmentId, publicationRequest);
      
      let publishResult: N8nPublishResponse | undefined;
      
      // 2. Auto-publish if requested
      if (modalData.autoPost) {
        const publishRequest: N8nPublishRequest = {
          publicationId: publication.id,
          recruitmentId,
          content: modalData.description,
          hashtags: modalData.hashtags,
          targetAudience: modalData.targetAudience,
          scheduledDate: modalData.scheduledDate
        };
        
        publishResult = await publicationsService.publishToLinkedIn(publishRequest);
        
        // 3. Update publication with real LinkedIn URL if successful
        if (publishResult.success && publishResult.linkedinUrl) {
          await publicationsService.update(recruitmentId, publication.id, {
            url: publishResult.linkedinUrl,
            platformJobId: publishResult.linkedinJobId,
            status: 'published',
            publishedAt: new Date().toISOString()
          });
        }
      }
      
      return { publication, publishResult };
      
    } catch (error: any) {
      console.error('Error creating LinkedIn publication from modal:', error);
      throw error;
    }
  },

  // ==================== Helper Methods ====================

  /**
   * Get total applications across all publications
   * 
   * @param recruitmentId - Recruitment process UUID
   * @returns Promise<number> - Total applications
   */
  getTotalApplications: async (recruitmentId: string): Promise<number> => {
    try {
      const response = await publicationsService.list(recruitmentId);
      return response.data.reduce((total, pub) => total + (pub.applications || 0), 0);
    } catch (error) {
      console.error('Error getting total applications:', error);
      return 0;
    }
  },

  /**
   * Get total views across all publications
   * 
   * @param recruitmentId - Recruitment process UUID
   * @returns Promise<number> - Total views
   */
  getTotalViews: async (recruitmentId: string): Promise<number> => {
    try {
      const response = await publicationsService.list(recruitmentId);
      return response.data.reduce((total, pub) => total + (pub.views || 0), 0);
    } catch (error) {
      console.error('Error getting total views:', error);
      return 0;
    }
  },

  /**
   * Get publications summary for dashboard
   * 
   * @param recruitmentId - Recruitment process UUID
   * @returns Promise<object> - Publications summary
   */
  getSummary: async (recruitmentId: string): Promise<{
    total: number;
    published: number;
    draft: number;
    suspended: number;
    totalViews: number;
    totalApplications: number;
    platforms: string[];
  }> => {
    try {
      const response = await publicationsService.list(recruitmentId);
      const publications = response.data;
      
      return {
        total: publications.length,
        published: publications.filter(p => p.status === 'published').length,
        draft: publications.filter(p => p.status === 'draft').length,
        suspended: publications.filter(p => p.status === 'suspended').length,
        totalViews: publications.reduce((sum, p) => sum + (p.views || 0), 0),
        totalApplications: publications.reduce((sum, p) => sum + (p.applications || 0), 0),
        platforms: [...new Set(publications.map(p => p.platform))]
      };
    } catch (error) {
      console.error('Error getting publications summary:', error);
      return {
        total: 0,
        published: 0,
        draft: 0,
        suspended: 0,
        totalViews: 0,
        totalApplications: 0,
        platforms: []
      };
    }
  }
};

export default publicationsService;