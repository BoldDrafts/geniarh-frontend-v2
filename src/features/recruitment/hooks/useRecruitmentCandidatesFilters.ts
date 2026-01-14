import { useState, useCallback } from 'react';
import { CandidateStatus, CandidateStage } from '../types/recruitment';

interface UseRecruitmentCandidatesFiltersProps {
  onFilterChange: (
    page: number, 
    status?: CandidateStatus, 
    stage?: CandidateStage,
    minMatchScore?: number,
    maxMatchScore?: number
  ) => void;
}

export const useRecruitmentCandidatesFilters = ({ onFilterChange }: UseRecruitmentCandidatesFiltersProps) => {
  const [selectedStatus, setSelectedStatus] = useState<CandidateStatus | undefined>();
  const [selectedStage, setSelectedStage] = useState<CandidateStage | undefined>();
  const [minMatchScore, setMinMatchScore] = useState<number | undefined>();
  const [maxMatchScore, setMaxMatchScore] = useState<number | undefined>();

  // Handle status filter change
  const handleStatusFilter = useCallback((status?: CandidateStatus) => {
    setSelectedStatus(status);
    onFilterChange(1, status, selectedStage, minMatchScore, maxMatchScore);
  }, [onFilterChange, selectedStage, minMatchScore, maxMatchScore]);

  // Handle stage filter change
  const handleStageFilter = useCallback((stage?: CandidateStage) => {
    setSelectedStage(stage);
    onFilterChange(1, selectedStatus, stage, minMatchScore, maxMatchScore);
  }, [onFilterChange, selectedStatus, minMatchScore, maxMatchScore]);

  // Handle match score range filter change
  const handleMatchScoreFilter = useCallback((min?: number, max?: number) => {
    setMinMatchScore(min);
    setMaxMatchScore(max);
    onFilterChange(1, selectedStatus, selectedStage, min, max);
  }, [onFilterChange, selectedStatus, selectedStage]);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setSelectedStatus(undefined);
    setSelectedStage(undefined);
    setMinMatchScore(undefined);
    setMaxMatchScore(undefined);
    onFilterChange(1);
  }, [onFilterChange]);

  // Check if any filters are active
  const hasActiveFilters = selectedStatus || selectedStage || minMatchScore !== undefined || maxMatchScore !== undefined;

  return {
    // State
    selectedStatus,
    selectedStage,
    minMatchScore,
    maxMatchScore,
    hasActiveFilters,
    
    // Actions
    handleStatusFilter,
    handleStageFilter,
    handleMatchScoreFilter,
    handleClearFilters,
    setSelectedStatus,
    setSelectedStage,
    setMinMatchScore,
    setMaxMatchScore
  };
};
