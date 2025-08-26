import { EmailAudit, ApiResponse } from './types';
import { mockAudits } from './mockData';

export const auditService = {
  getAudits: async (status?: string): Promise<ApiResponse<EmailAudit[]>> => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      let filteredAudits = [...mockAudits];
      
      if (status && status !== 'all') {
        filteredAudits = mockAudits.filter(
          audit => audit.processing_status.toLowerCase() === status.toLowerCase()
        );
      }

      return {
        data: filteredAudits,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: 'Failed to fetch audit data'
      };
    }
  }
};