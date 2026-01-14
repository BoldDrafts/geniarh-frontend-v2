import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { recruitmentService } from '../api/recruitmentService';
import {
  Candidate,
  CandidateListResponse,
  CandidateStatus,
  CandidateStage,
  RecruitmentProcess
} from '../types/recruitment';

interface LoadingState {
  recruitment: boolean;
  candidates: boolean;
  updating: boolean;
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface UseRecruitmentCandidatesDataProps {
  recruitmentId?: string;
}

export const useRecruitmentCandidatesData = ({ recruitmentId }: UseRecruitmentCandidatesDataProps) => {
  const navigate = useNavigate();

  // State management
  const [recruitment, setRecruitment] = useState<RecruitmentProcess | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState<LoadingState>({
    recruitment: true,
    candidates: true,
    updating: false
  });
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 20,
    total: 0,
    hasNext: false,
    hasPrevious: false
  });

  // Fetch recruitment process data
  const fetchRecruitmentProcess = useCallback(async () => {
    if (!recruitmentId) return;
    
    try {
      setLoading(prev => ({ ...prev, recruitment: true }));
      const process = await recruitmentService.get(recruitmentId);
      setRecruitment(process);
    } catch (error) {
      console.error('Error fetching recruitment process:', error);
      toast.error('Failed to load recruitment process');
      navigate('/recruitment');
    } finally {
      setLoading(prev => ({ ...prev, recruitment: false }));
    }
  }, [recruitmentId, navigate]);

  // Fetch candidates with pagination and filtering
  const fetchCandidates = useCallback(async (
    page = 1, 
    status?: CandidateStatus,
    stage?: CandidateStage,
    minMatchScore?: number,
    maxMatchScore?: number
  ) => {
    if (!recruitmentId) return;
    
    try {
      setLoading(prev => ({ ...prev, candidates: true }));
      
      const response: CandidateListResponse = await recruitmentService.getCandidates(recruitmentId, {
        page,
        limit: pagination.limit,
        status,
        stage,
        minMatchScore,
        maxMatchScore
      });

      setCandidates(response.data);
      setPagination({
        page: response.pagination.current,
        limit: response.pagination.limit,
        total: response.pagination.total,
        hasNext: response.pagination.hasNext || false,
        hasPrevious: response.pagination.hasPrevious || false
      });
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast.error('Failed to load candidates');
    } finally {
      setLoading(prev => ({ ...prev, candidates: false }));
    }
  }, [recruitmentId, pagination.limit]);

  // Get detailed candidate information
  const getCandidateDetails = useCallback(async (recruitmentId: string, candidateId: string): Promise<Candidate> => {
    if (!recruitmentId) throw new Error('Recruitment ID is required');
    
    try {
      const candidateDetails = await recruitmentService.getCandidate(recruitmentId, candidateId);
      return candidateDetails;
    } catch (error) {
      console.error('Error fetching candidate details:', error);
      throw new Error('Failed to fetch candidate details');
    }
  }, [recruitmentId]);

  // Refresh all data
  const refreshData = useCallback(async (
    currentPage?: number,
    status?: CandidateStatus,
    stage?: CandidateStage,
    minMatchScore?: number,
    maxMatchScore?: number
  ) => {
    await Promise.all([
      fetchRecruitmentProcess(),
      fetchCandidates(currentPage || pagination.page, status, stage, minMatchScore, maxMatchScore)
    ]);
  }, [fetchRecruitmentProcess, fetchCandidates, pagination.page]);

  // Initial data load
  useEffect(() => {
    if (recruitmentId) {
      fetchRecruitmentProcess();
      fetchCandidates();
    }
  }, [recruitmentId, fetchRecruitmentProcess, fetchCandidates]);

  // Update loading state helpers
  const setUpdatingState = useCallback((updating: boolean) => {
    setLoading(prev => ({ ...prev, updating }));
  }, []);

  // Update candidates optimistically
  const updateCandidateOptimistically = useCallback((
    candidateId: string,
    updates: Partial<Candidate>
  ) => {
    setCandidates(prev => 
      prev.map(candidate => 
        candidate.id === candidateId 
          ? { ...candidate, ...updates }
          : candidate
      )
    );
  }, []);

  // Remove candidate optimistically
  const removeCandidateOptimistically = useCallback((candidateId: string) => {
    setCandidates(prev => prev.filter(c => c.id !== candidateId));
  }, []);

  return {
    // State
    recruitment,
    candidates,
    loading,
    pagination,
    
    // Actions
    fetchRecruitmentProcess,
    fetchCandidates,
    getCandidateDetails,
    refreshData,
    setUpdatingState,
    updateCandidateOptimistically,
    removeCandidateOptimistically,
    setPagination,
    
    // Computed
    isInitialLoading: loading.recruitment,
    isCandidatesLoading: loading.candidates,
    isUpdating: loading.updating
  };
};
