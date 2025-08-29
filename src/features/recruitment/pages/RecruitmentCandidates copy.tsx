import { ArrowLeft, RefreshCw, UserPlus } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import RecruitmentAddCandidateModal from '../components/RecruitmentAddCandidateModal';
import RecruitmentCandidatesList from '../components/RecruitmentCandidatesList';
import { useRecruitmentCandidates } from '../hooks/useRecruitmentCandidates';
import { CANDIDATE_STATUS_OPTIONS, STATUS_LABELS } from '../utils/RecruitmentConstants';

const RecruitmentCandidates: React.FC = () => {
  const navigate = useNavigate();
  
  // Use the main hook that orchestrates all functionality
  const {
    recruitmentId,
    recruitment,
    candidates,
    isInitialLoading,
    isCandidatesLoading,
    isUpdating,
    selectedStatus,
    selectedStage,
    minMatchScore,
    maxMatchScore,
    hasActiveFilters,
    handleStatusFilter,
    handleMatchScoreFilter,
    handleClearFilters,
    pagination,
    showAddModal,
    setShowAddModal,
    getCandidateDetails,
    updateCandidateEmail,
    handleAddCandidate,
    handleUpdateStatus,
    handleDeleteCandidate,
    handleRefresh
  } = useRecruitmentCandidates();

  // Loading state
  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Error state
  if (!recruitment) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Recruitment process not found</p>
        <button
          onClick={() => navigate('/recruitment')}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Back to Recruitment
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/recruitment')}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{recruitment.requirement.title}</h1>
            <p className="text-gray-500 mt-1">
              {recruitment.requirement.department} · {recruitment.requirement.workType}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={isCandidatesLoading || isUpdating}
            className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isCandidatesLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            disabled={isUpdating}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Candidate
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Total Candidates</div>
            <div className="text-2xl font-semibold text-blue-900 mt-1">
              {recruitment.metrics.totalCandidates}
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Qualified</div>
            <div className="text-2xl font-semibold text-green-900 mt-1">
              {recruitment.metrics.qualifiedCandidates}
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-purple-600 font-medium">Interviews</div>
            <div className="text-2xl font-semibold text-purple-900 mt-1">
              {recruitment.metrics.interviewsScheduled}
            </div>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg">
            <div className="text-sm text-amber-600 font-medium">Offers</div>
            <div className="text-2xl font-semibold text-amber-900 mt-1">
              {recruitment.metrics.offersExtended}
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-wrap items-center gap-4">
            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Status:
              </label>
              <select
                value={selectedStatus || ''}
                onChange={(e) => handleStatusFilter(e.target.value as any || undefined)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[160px]"
              >
                <option value="">All Status</option>
                {CANDIDATE_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>

            {/* Match Score Range Filter */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Match Score:
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  max="100"
                  value={minMatchScore || ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value) : undefined;
                    handleMatchScoreFilter(value, maxMatchScore);
                  }}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-20"
                />
                <span className="text-gray-500 text-sm">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  min="0"
                  max="100"
                  value={maxMatchScore || ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value) : undefined;
                    handleMatchScoreFilter(minMatchScore, value);
                  }}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-20"
                />
                <span className="text-gray-500 text-xs">%</span>
              </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium underline"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedStatus && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Status: {STATUS_LABELS[selectedStatus]}
                  <button
                    onClick={() => handleStatusFilter(undefined)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {(minMatchScore !== undefined || maxMatchScore !== undefined) && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Match: {minMatchScore || 0}% - {maxMatchScore || 100}%
                  <button
                    onClick={() => handleMatchScoreFilter(undefined, undefined)}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results Summary */}
        {hasActiveFilters && (
          <div className="mb-4 text-sm text-gray-600">
            Showing {pagination.totalItems} candidate{pagination.totalItems !== 1 ? 's' : ''} matching your filters
          </div>
        )}

        {/* Candidates List */}
        {isCandidatesLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <RecruitmentCandidatesList 
              candidates={candidates}
              recruitmentId={recruitmentId!}
              onAddCandidate={() => setShowAddModal(true)}
              onUpdateStatus={handleUpdateStatus}
              onDeleteCandidate={handleDeleteCandidate}
              onGetCandidateDetails={getCandidateDetails}
              onUpdateCandidateEmail={updateCandidateEmail}
              loading={isUpdating}
            />

            {/* Pagination */}
            {pagination.showPagination && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing {pagination.startItem} to {pagination.endItem} of {pagination.totalItems} candidates
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={pagination.goToPreviousPage}
                    disabled={!pagination.canGoPrevious || isCandidatesLoading}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={pagination.goToNextPage}
                    disabled={!pagination.canGoNext || isCandidatesLoading}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Candidate Modal */}
      {showAddModal && (
        <RecruitmentAddCandidateModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSelectCandidates={handleAddCandidate}
          position={recruitment.requirement.title}
          department={recruitment.requirement.department}
          recruitmentId={recruitmentId}
          excludeCandidateIds={candidates.map(c => c.id!).filter(id => id)}
        />
      )}
    </div>
  );
};

export default RecruitmentCandidates;