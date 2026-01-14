import { useCallback } from 'react';
import { CandidateStatus, CandidateStage } from '../types/recruitment';

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface UseRecruitmentCandidatesPaginationProps {
  pagination: PaginationState;
  onPageChange: (
    page: number, 
    status?: CandidateStatus, 
    stage?: CandidateStage,
    minMatchScore?: number,
    maxMatchScore?: number
  ) => void;
  selectedStatus?: CandidateStatus;
  selectedStage?: CandidateStage;
  minMatchScore?: number;
  maxMatchScore?: number;
}

export const useRecruitmentCandidatesPagination = ({
  pagination,
  onPageChange,
  selectedStatus,
  selectedStage,
  minMatchScore,
  maxMatchScore
}: UseRecruitmentCandidatesPaginationProps) => {

  // Handle pagination
  const handlePageChange = useCallback((newPage: number) => {
    onPageChange(newPage, selectedStatus, selectedStage, minMatchScore, maxMatchScore);
  }, [onPageChange, selectedStatus, selectedStage, minMatchScore, maxMatchScore]);

  // Go to previous page
  const goToPreviousPage = useCallback(() => {
    if (pagination.hasPrevious) {
      handlePageChange(pagination.page - 1);
    }
  }, [pagination.hasPrevious, pagination.page, handlePageChange]);

  // Go to next page
  const goToNextPage = useCallback(() => {
    if (pagination.hasNext) {
      handlePageChange(pagination.page + 1);
    }
  }, [pagination.hasNext, pagination.page, handlePageChange]);

  // Calculate pagination info
  const startItem = ((pagination.page - 1) * pagination.limit) + 1;
  const endItem = Math.min(pagination.page * pagination.limit, pagination.total);
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const showPagination = pagination.total > pagination.limit;

  return {
    // Pagination state
    currentPage: pagination.page,
    totalPages,
    totalItems: pagination.total,
    startItem,
    endItem,
    showPagination,
    canGoPrevious: pagination.hasPrevious,
    canGoNext: pagination.hasNext,
    
    // Actions
    handlePageChange,
    goToPreviousPage,
    goToNextPage
  };
};
