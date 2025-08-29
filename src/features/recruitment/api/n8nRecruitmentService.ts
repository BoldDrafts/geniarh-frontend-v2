import { toast } from 'react-hot-toast';
import { RecruitmentProcess } from '../types/recruitmentProcess';

// ==================== Types and Interfaces ====================

export interface N8nLinkedInResponse {
  success: boolean;
  output?: string;
  error?: string;
}

export interface N8nLinkedInPublishRequest {
  content: string;
  recruitmentId: string;
  title: string;
}

export interface N8nLinkedInPublishResponse {
  success: boolean;
  text?: string;
  error?: string;
}

/**
 * Dummy N8n Service Class
 * Simulates n8n workflow integration for development
 */
class N8nRecruitmentService {
  // Simulate API delay
  private delay(ms: number = 1000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Transform message using mock n8n workflow
   */
  async transformMessage(recruitment: RecruitmentProcess): Promise<string> {
    await this.delay(2000); // Simulate longer processing time
    
    try {
      // Generate mock LinkedIn content based on recruitment data
      const content = this.generateLinkedInContent(recruitment);
      
      toast.success('Message transformed successfully');
      console.log('Message transformed successfully');

      return content;
    } catch (error: any) {
      console.error('Error transforming message:', error);
      toast.error('Failed to transform message');
      throw error;
    }
  }

  /**
   * Publish content to LinkedIn (mock)
   */
  async publishToLinkedIn(
    recruitmentId: string, 
    htmlContent: string, 
    title: string
  ): Promise<N8nLinkedInPublishResponse> {
    await this.delay(1500);
    
    try {
      // Simulate successful publication
      const response: N8nLinkedInPublishResponse = {
        success: true,
        text: 'Successfully published to LinkedIn'
      };

      toast.success('Published to LinkedIn successfully!');
      return response;
    } catch (error: any) {
      console.error('Error publishing to LinkedIn:', error);
      toast.error('Failed to publish to LinkedIn');
      throw error;
    }
  }

  /**
   * Generate mock LinkedIn content
   */
  private generateLinkedInContent(recruitment: RecruitmentProcess): string {
    const { requirement } = recruitment;
    
    const content = `
🚀 ¡Estamos contratando! ${requirement.title}

📍 Modalidad: ${requirement.workType}
💼 Departamento: ${requirement.department}
⏰ Tipo: ${requirement.employmentType}
💰 Rango salarial: ${requirement.salaryCurrency} ${requirement.salaryMin?.toLocaleString()} - ${requirement.salaryMax?.toLocaleString()}

🎯 **Lo que buscamos:**
${requirement.skills.map(skill => `• ${skill}`).join('\n')}

🌟 **Habilidades blandas:**
${requirement.softSkills?.map(skill => `• ${skill}`).join('\n') || '• Trabajo en equipo\n• Comunicación efectiva'}

📝 **Descripción:**
${requirement.description}

¿Te interesa? ¡Postúlate ahora!

#Hiring #Jobs #${requirement.department} #${requirement.experienceLevel}Level #${requirement.workType}
    `.trim();
    
    return content;
  }

  /**
   * Health check (mock)
   */
  async healthCheck(): Promise<boolean> {
    await this.delay(100);
    return true;
  }

  /**
   * Get service configuration (mock)
   */
  getConfig() {
    return {
      baseUrl: 'http://localhost:3000/mock-n8n',
      endpoints: {
        transform: '/linkedinpost/create',
        publish: '/linkedinpost/publish'
      }
    };
  }

  /**
   * Transform and publish in one step (mock)
   */
  async transformAndPublish(recruitment: RecruitmentProcess): Promise<N8nLinkedInPublishResponse> {
    try {
      const transformedContent = await this.transformMessage(recruitment);
      return await this.publishToLinkedIn(recruitment.id, transformedContent, recruitment.requirement.title);
    } catch (error: any) {
      console.error('Error in transform and publish:', error);
      toast.error('Failed to transform and publish content');
      throw error;
    }
  }
}

// Singleton instance
export const n8nRecruitmentService = new N8nRecruitmentService();
export default n8nRecruitmentService;