import { 
  Interview, 
  CreateInterviewRequest, 
  RescheduleRequest, 
  StatusUpdateRequest,
  InterviewStatus 
} from '../types/interview';

const API_BASE_URL = import.meta.env.VITE_INTERVIEW_API_URL || 'https://geniahrapi.synopsis.cloud/interviewapi/v1';

class InterviewService {
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Get auth token from storage or context
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || 
        `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Retrieve all interviews with optional filtering
   */
  async getInterviews(filters?: {
    status?: InterviewStatus;
    requirementId?: string;
  }): Promise<Interview[]> {
    const queryParams = new URLSearchParams();
    
    if (filters?.status) {
      queryParams.append('status', filters.status);
    }
    
    if (filters?.requirementId) {
      queryParams.append('requirementId', filters.requirementId);
    }

    const endpoint = queryParams.toString() ? `/interviews?${queryParams}` : '/interviews';
    return this.makeRequest<Interview[]>(endpoint);
  }

  /**
   * Retrieve a single interview by ID
   */
  async getInterviewById(id: string): Promise<Interview> {
    return this.makeRequest<Interview>(`/interviews/${id}`);
  }

  /**
   * Create a new interview
   */
  async createInterview(request: CreateInterviewRequest): Promise<Interview> {
    return this.makeRequest<Interview>('/interviews', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Reschedule an existing interview
   */
  async rescheduleInterview(
    interviewId: string, 
    request: RescheduleRequest
  ): Promise<Interview> {
    return this.makeRequest<Interview>(`/interviews/${interviewId}/reschedule`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Update interview status
   */
  async updateInterviewStatus(
    interviewId: string, 
    request: StatusUpdateRequest
  ): Promise<Interview> {
    return this.makeRequest<Interview>(`/interviews/${interviewId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(request),
    });
  }

  /**
   * Cancel an interview
   */
  async cancelInterview(
    interviewId: string, 
    reason?: string
  ): Promise<Interview> {
    return this.updateInterviewStatus(interviewId, {
      status: 'Cancelled',
      reason,
    });
  }

  /**
   * Mark interview as completed
   */
  async completeInterview(
    interviewId: string, 
    feedback?: string
  ): Promise<Interview> {
    return this.updateInterviewStatus(interviewId, {
      status: 'Completed',
      reason: feedback,
    });
  }

  /**
   * Send interview reminder
   */
  async sendInterviewReminder(interviewId: string): Promise<void> {
    await this.makeRequest(`/interviews/${interviewId}/reminder`, {
      method: 'POST',
    });
  }

  /**
   * Get interview feedback and evaluation
   */
  async getInterviewFeedback(interviewId: string): Promise<{
    overallScore?: number;
    feedback?: string;
    evaluationScores?: Array<{
      criteriaId: string;
      score: number;
      comment?: string;
    }>;
  }> {
    return this.makeRequest(`/interviews/${interviewId}/feedback`);
  }

  /**
   * Submit interview feedback and evaluation
   */
  async submitInterviewFeedback(
    interviewId: string, 
    feedback: {
      overallScore: number;
      feedback: string;
      evaluationScores: Array<{
        criteriaId: string;
        score: number;
        comment?: string;
      }>;
    }
  ): Promise<void> {
    await this.makeRequest(`/interviews/${interviewId}/feedback`, {
      method: 'POST',
      body: JSON.stringify(feedback),
    });
  }

  /**
   * Get available time slots for rescheduling
   */
  async getAvailableTimeSlots(
    interviewId: string,
    startDate: string,
    endDate: string
  ): Promise<Array<{
    dateTime: string;
    available: boolean;
    participants: string[];
  }>> {
    const queryParams = new URLSearchParams({
      startDate,
      endDate,
    });
    
    return this.makeRequest(`/interviews/${interviewId}/available-slots?${queryParams}`);
  }
}

// Export singleton instance
export const interviewService = new InterviewService();

// Export the class for testing or custom instantiation
export default InterviewService;