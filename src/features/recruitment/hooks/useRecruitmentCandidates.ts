import { useParams } from 'react-router-dom';
import { useRecruitmentCandidatesData } from './useRecruitmentCandidatesData';
import { useRecruitmentCandidatesFilters } from './useRecruitmentCandidatesFilters';
import { useRecruitmentCandidatesActions } from './useRecruitmentCandidatesActions';
import { useRecruitmentCandidatesPagination } from './useRecruitmentCandidatesPagination';

/**
 * Main hook that orchestrates all recruitment candidates functionality
 * This hook combines data fetching, filtering, actions, and pagination
 */
export const useRecruitmentCandidates = () => {
  const { id: recruitmentId } = useParams<{ id: string }>();

  // Data management hook
  const {
    recruitment,
    candidates,
    loading,
    pagination,
    fetchRecruitmentProcess,
    fetchCandidates,
    getCandidateDetails,
    refreshData,
    setUpdatingState,
    updateCandidateOptimistically,
    removeCandidateOptimistically,
    isInitialLoading,
    isCandidatesLoading,
    isUpdating
  } = useRecruitmentCandidatesData({ recruitmentId });

  // Filters management hook
  const {
    selectedStatus,
    selectedStage,
    minMatchScore,
    maxMatchScore,
    hasActiveFilters,
    handleStatusFilter,
    handleStageFilter,
    handleMatchScoreFilter,
    handleClearFilters
  } = useRecruitmentCandidatesFilters({
    onFilterChange: fetchCandidates
  });

  // Actions management hook
  const {
    showAddModal,
    setShowAddModal,
    updateCandidateEmail,
    handleAddCandidate,
    handleUpdateStatus,
    handleDeleteCandidate
  } = useRecruitmentCandidatesActions({
    recruitmentId,
    onDataRefresh: refreshData,
    onCandidateUpdate: updateCandidateOptimistically,
    onCandidateRemove: removeCandidateOptimistically,
    setUpdatingState,
    currentPage: pagination.page,
    selectedStatus,
    selectedStage,
    minMatchScore,
    maxMatchScore,
    candidatesCount: candidates.length
  });

  // Pagination management hook
  const {
    currentPage,
    totalPages,
    totalItems,
    startItem,
    endItem,
    showPagination,
    canGoPrevious,
    canGoNext,
    handlePageChange,
    goToPreviousPage,
    goToNextPage
  } = useRecruitmentCandidatesPagination({
    pagination,
    onPageChange: fetchCandidates,
    selectedStatus,
    selectedStage,
    minMatchScore,
    maxMatchScore
  });

  // Refresh all data
  const handleRefresh = async () => {
    await refreshData(pagination.page, selectedStatus, selectedStage, minMatchScore, maxMatchScore);
  };

  return {
    // Basic data
    recruitmentId,
    recruitment,
    candidates,
    
    // Loading states
    loading,
    isInitialLoading,
    isCandidatesLoading,
    isUpdating,
    
    // Filters
    selectedStatus,
    selectedStage,
    minMatchScore,
    maxMatchScore,
    hasActiveFilters,
    handleStatusFilter,
    handleStageFilter,
    handleMatchScoreFilter,
    handleClearFilters,
    
    // Pagination
    pagination: {
      currentPage,
      totalPages,
      totalItems,
      startItem,
      endItem,
      showPagination,
      canGoPrevious,
      canGoNext,
      handlePageChange,
      goToPreviousPage,
      goToNextPage
    },
    
    // Actions
    showAddModal,
    setShowAddModal,
    getCandidateDetails,
    updateCandidateEmail,
    handleAddCandidate,
    handleUpdateStatus,
    handleDeleteCandidate,
    handleRefresh
  };
};
