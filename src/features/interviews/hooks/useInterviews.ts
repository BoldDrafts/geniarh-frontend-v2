import { useState, useEffect, useCallback } from 'react';
import { 
  Interview, 
  InterviewStatus, 
  CreateInterviewRequest,
  RescheduleRequest,
  StatusUpdateRequest,
  InterviewFilters 
} from '../types/interview';
import { interviewService } from '../api/interviewService';

export interface UseInterviewsReturn {
  // Data
  interviews: Interview[];
  selectedInterview: Interview | null;
  
  // Loading states
  loading: boolean;
  creating: boolean;
  updating: boolean;
  
  // Error state
  error: string | null;
  
  // Actions
  loadInterviews: (filters?: InterviewFilters) => Promise<void>;
  getInterviewById: (id: string) => Promise<Interview | null>;
  createInterview: (request: CreateInterviewRequest) => Promise<Interview | null>;
  rescheduleInterview: (id: string, request: RescheduleRequest) => Promise<Interview | null>;
  updateInterviewStatus: (id: string, request: StatusUpdateRequest) => Promise<Interview | null>;
  cancelInterview: (id: string, reason?: string) => Promise<Interview | null>;
  completeInterview: (id: string, feedback?: string) => Promise<Interview | null>;
  sendReminder: (id: string) => Promise<boolean>;
  selectInterview: (interview: Interview | null) => void;
  clearError: () => void;
  refreshInterviews: () => Promise<void>;
}

export const useInterviews = (initialFilters?: InterviewFilters): UseInterviewsReturn => {
  // State
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<InterviewFilters | undefined>(initialFilters);

  // Error handling helper
  const handleError = useCallback((error: unknown, defaultMessage: string) => {
    const message = error instanceof Error ? error.message : defaultMessage;
    setError(message);
    console.error(defaultMessage, error);
  }, []);

  // Load interviews
  const loadInterviews = useCallback(async (filters?: InterviewFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedFilters = filters || currentFilters;
      setCurrentFilters(updatedFilters);
      
      const data = await interviewService.getInterviews({
        status: updatedFilters?.status,
        requirementId: updatedFilters?.requirementId,
      });
      
      setInterviews(data);
    } catch (err) {
      handleError(err, 'Failed to load interviews');
    } finally {
      setLoading(false);
    }
  }, [currentFilters, handleError]);

  // Get single interview by ID
  const getInterviewById = useCallback(async (id: string): Promise<Interview | null> => {
    try {
      setError(null);
      const interview = await interviewService.getInterviewById(id);
      
      // Update the interview in the local state if it exists
      setInterviews(prev => prev.map(item => item.id === id ? interview : item));
      
      return interview;
    } catch (err) {
      handleError(err, 'Failed to get interview details');
      return null;
    }
  }, [handleError]);

  // Create new interview
  const createInterview = useCallback(async (request: CreateInterviewRequest): Promise<Interview | null> => {
    try {
      setCreating(true);
      setError(null);
      
      const newInterview = await interviewService.createInterview(request);
      
      // Add to local state
      setInterviews(prev => [newInterview, ...prev]);
      
      return newInterview;
    } catch (err) {
      handleError(err, 'Failed to create interview');
      return null;
    } finally {
      setCreating(false);
    }
  }, [handleError]);

  // Reschedule interview
  const rescheduleInterview = useCallback(async (
    id: string, 
    request: RescheduleRequest
  ): Promise<Interview | null> => {
    try {
      setUpdating(true);
      setError(null);
      
      const updatedInterview = await interviewService.rescheduleInterview(id, request);
      
      // Update local state
      setInterviews(prev => prev.map(item => item.id === id ? updatedInterview : item));
      
      // Update selected interview if it's the one being updated
      if (selectedInterview?.id === id) {
        setSelectedInterview(updatedInterview);
      }
      
      return updatedInterview;
    } catch (err) {
      handleError(err, 'Failed to reschedule interview');
      return null;
    } finally {
      setUpdating(false);
    }
  }, [selectedInterview?.id, handleError]);

  // Update interview status
  const updateInterviewStatus = useCallback(async (
    id: string, 
    request: StatusUpdateRequest
  ): Promise<Interview | null> => {
    try {
      setUpdating(true);
      setError(null);
      
      const updatedInterview = await interviewService.updateInterviewStatus(id, request);
      
      // Update local state
      setInterviews(prev => prev.map(item => item.id === id ? updatedInterview : item));
      
      // Update selected interview if it's the one being updated
      if (selectedInterview?.id === id) {
        setSelectedInterview(updatedInterview);
      }
      
      return updatedInterview;
    } catch (err) {
      handleError(err, 'Failed to update interview status');
      return null;
    } finally {
      setUpdating(false);
    }
  }, [selectedInterview?.id, handleError]);

  // Cancel interview
  const cancelInterview = useCallback(async (
    id: string, 
    reason?: string
  ): Promise<Interview | null> => {
    return updateInterviewStatus(id, {
      status: 'Cancelled',
      reason,
    });
  }, [updateInterviewStatus]);

  // Complete interview
  const completeInterview = useCallback(async (
    id: string, 
    feedback?: string
  ): Promise<Interview | null> => {
    return updateInterviewStatus(id, {
      status: 'Completed',
      reason: feedback,
    });
  }, [updateInterviewStatus]);

  // Send reminder
  const sendReminder = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      await interviewService.sendInterviewReminder(id);
      
      // Update the reminderSent flag in local state
      setInterviews(prev => prev.map(item => 
        item.id === id ? { ...item, reminderSent: true } : item
      ));
      
      if (selectedInterview?.id === id) {
        setSelectedInterview(prev => prev ? { ...prev, reminderSent: true } : null);
      }
      
      return true;
    } catch (err) {
      handleError(err, 'Failed to send reminder');
      return false;
    }
  }, [selectedInterview?.id, handleError]);

  // Select interview
  const selectInterview = useCallback((interview: Interview | null) => {
    setSelectedInterview(interview);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refresh interviews (reload with current filters)
  const refreshInterviews = useCallback(async () => {
    await loadInterviews(currentFilters);
  }, [loadInterviews, currentFilters]);

  // Load interviews on mount
  useEffect(() => {
    loadInterviews();
  }, [loadInterviews]);

  return {
    // Data
    interviews,
    selectedInterview,
    
    // Loading states
    loading,
    creating,
    updating,
    
    // Error state
    error,
    
    // Actions
    loadInterviews,
    getInterviewById,
    createInterview,
    rescheduleInterview,
    updateInterviewStatus,
    cancelInterview,
    completeInterview,
    sendReminder,
    selectInterview,
    clearError,
    refreshInterviews,
  };
};