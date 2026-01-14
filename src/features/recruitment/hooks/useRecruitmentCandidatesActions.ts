import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { recruitmentService } from '../api/recruitmentService';
import {
  Candidate,
  CandidateStatus,
  CandidateStage
} from '../types/recruitment';

interface UseRecruitmentCandidatesActionsProps {
  recruitmentId?: string;
  onDataRefresh: (
    page?: number, 
    status?: CandidateStatus, 
    stage?: CandidateStage,
    minMatchScore?: number,
    maxMatchScore?: number
  ) => Promise<void>;
  onCandidateUpdate: (candidateId: string, updates: Partial<Candidate>) => void;
  onCandidateRemove: (candidateId: string) => void;
  setUpdatingState: (updating: boolean) => void;
  currentPage: number;
  selectedStatus?: CandidateStatus;
  selectedStage?: CandidateStage;
  minMatchScore?: number;
  maxMatchScore?: number;
  candidatesCount: number;
}

export const useRecruitmentCandidatesActions = ({
  recruitmentId,
  onDataRefresh,
  onCandidateUpdate,
  onCandidateRemove,
  setUpdatingState,
  currentPage,
  selectedStatus,
  selectedStage,
  minMatchScore,
  maxMatchScore,
  candidatesCount
}: UseRecruitmentCandidatesActionsProps) => {
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);

  // Update candidate email - matches the expected interface from RecruitmentCandidatesList
  const updateCandidateEmail = useCallback(async (
    recruitmentIdParam: string, 
    candidateId: string, 
    newEmail: string
  ): Promise<void> => {
    const targetRecruitmentId = recruitmentIdParam || recruitmentId;
    if (!targetRecruitmentId) return;

    try {
      setUpdatingState(true);
      
      // Call the recruitment service to update candidate email
      const result = await recruitmentService.updateCandidateEmail(
        targetRecruitmentId,
        candidateId,
        { email: newEmail }
      );

      // Update local state optimistically
      onCandidateUpdate(candidateId, { 
        contact: { email: newEmail } as any
      });
      
      // Show success message
      if (result.previousEmail) {
        console.log(`Email updated from ${result.previousEmail} to ${result.email}`);
      } else {
        toast.success(`Email updated successfully to ${result.email}`);
      }
    } catch (error) {
      console.error('Error updating candidate email:', error);
      
      // Specific error handling based on the API response
      if (error instanceof Error) {
        if (error.message.includes('EMAIL_ALREADY_EXISTS')) {
          toast.error('A candidate with this email already exists in the system');
        } else if (error.message.includes('NOT_FOUND')) {
          toast.error('Candidate not found in this recruitment process');
        } else if (error.message.includes('VALIDATION_ERROR')) {
          toast.error('Invalid email format provided');
        } else {
          toast.error('Failed to update candidate email');
        }
      } else {
        toast.error('An unexpected error occurred');
      }
      
      // Refresh candidates list to revert optimistic update on error
      await onDataRefresh(currentPage, selectedStatus, selectedStage, minMatchScore, maxMatchScore);
      
      throw error;
    } finally {
      setUpdatingState(false);
    }
  }, [recruitmentId, setUpdatingState, onCandidateUpdate, onDataRefresh, currentPage, selectedStatus, selectedStage, minMatchScore, maxMatchScore]);

  // Add candidates to recruitment process
  const handleAddCandidate = useCallback(async (candidates: Candidate[]) => {
    if (!recruitmentId) return;
    
    try {
      setUpdatingState(true);
      
      if (!candidates || candidates.length === 0) {
        toast.error('No candidates selected to add');
        throw new Error('No candidates selected');
      }

      // For each candidate, create an association request
      const results = await Promise.allSettled(
        candidates.map(candidate => 
          recruitmentService.associateCandidates(recruitmentId, {
            profileLink: candidate.contact?.linkedin || '',
            profileName: `${candidate.personalInfo.firstName} ${candidate.personalInfo.lastName}`,
            profileDescription: candidate.profile?.summary || '',
            profileEmail: candidate.contact.email,
            profileSummary: candidate.profile?.summary || '',
            profileLocation: candidate.personalInfo.location?.city || ''
          })
        )
      );

      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      if (successful > 0) {
        toast.success(`Successfully added ${successful} candidate(s)`);
        
        // Refresh candidates list and metrics
        await onDataRefresh(currentPage, selectedStatus, selectedStage, minMatchScore, maxMatchScore);
      }

      if (failed > 0) {
        toast.error(`Failed to add ${failed} candidate(s)`);
        console.warn('Failed associations:', results.filter(r => r.status === 'rejected'));
      }

      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding candidates:', error);
      toast.error('Failed to add candidates');
    } finally {
      setUpdatingState(false);
    }
  }, [recruitmentId, setUpdatingState, onDataRefresh, currentPage, selectedStatus, selectedStage, minMatchScore, maxMatchScore]);

  // Update candidate status
  const handleUpdateStatus = useCallback(async (
    candidateId: string, 
    newStatus: CandidateStatus,
    newStage?: CandidateStage,
    reason?: string,
    notes?: string
  ) => {
    if (!recruitmentId) return;
    
    try {
      setUpdatingState(true);
      
      await recruitmentService.updateCandidateStatus(recruitmentId, candidateId, {
        status: newStatus,
        stage: newStage,
        reason,
        notes
      });

      // Update local state optimistically
      onCandidateUpdate(candidateId, { 
        status: newStatus, 
        stage: newStage 
      });

      toast.success('Candidate status updated successfully');
      
      // Refresh metrics
      await onDataRefresh(currentPage, selectedStatus, selectedStage, minMatchScore, maxMatchScore);
    } catch (error) {
      console.error('Error updating candidate status:', error);
      toast.error('Failed to update candidate status');
      
      // Refresh candidates to revert optimistic update
      await onDataRefresh(currentPage, selectedStatus, selectedStage, minMatchScore, maxMatchScore);
    } finally {
      setUpdatingState(false);
    }
  }, [recruitmentId, setUpdatingState, onCandidateUpdate, onDataRefresh, currentPage, selectedStatus, selectedStage, minMatchScore, maxMatchScore]);

  // Remove candidate from recruitment process
  const handleDeleteCandidate = useCallback(async (candidateId: string) => {
    if (!recruitmentId) return;
    
    try {
      setUpdatingState(true);
      
      await recruitmentService.removeCandidate(recruitmentId, candidateId);
      
      // Update local state
      onCandidateRemove(candidateId);
      
      toast.success('Candidate removed successfully');
      
      // If current page is empty and not first page, go to previous page
      if (candidatesCount === 1 && currentPage > 1) {
        await onDataRefresh(currentPage - 1, selectedStatus, selectedStage, minMatchScore, maxMatchScore);
      } else {
        await onDataRefresh(currentPage, selectedStatus, selectedStage, minMatchScore, maxMatchScore);
      }
    } catch (error) {
      console.error('Error removing candidate:', error);
      toast.error('Failed to remove candidate');
    } finally {
      setUpdatingState(false);
    }
  }, [recruitmentId, setUpdatingState, onCandidateRemove, onDataRefresh, candidatesCount, currentPage, selectedStatus, selectedStage, minMatchScore, maxMatchScore]);

  return {
    // Modal states
    showAddModal,
    setShowAddModal,
    
    // Actions
    updateCandidateEmail,
    handleAddCandidate,
    handleUpdateStatus,
    handleDeleteCandidate
  };
};
