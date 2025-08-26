import { ArrowLeft, RefreshCw, UserPlus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import RecruitmentAddCandidateModal from '../components/RecruitmentAddCandidateModal';
import { recruitmentService } from '../api/recruitmentService';
import {
  Candidate,
  CandidateListResponse,
  CandidateStage,
  CandidateStatus,
  RecruitmentProcess
} from '../model/recruitment';
import RecruitmentCandidatesList from '../components/RecruitmentCandidatesList';
import { CANDIDATE_STAGE_OPTIONS, CANDIDATE_STATUS_OPTIONS, STAGE_LABELS, STATUS_LABELS } from '../utils/RecruitmentConstants';

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

const RecruitmentCandidates: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // State management
  const [recruitment, setRecruitment] = useState<RecruitmentProcess | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState<LoadingState>({
    recruitment: true,
    candidates: true,
    updating: false
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<CandidateStatus | undefined>();
  const [selectedStage, setSelectedStage] = useState<CandidateStage | undefined>();
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 20,
    total: 0,
    hasNext: false,
    hasPrevious: false
  });

  // Fetch recruitment process data
  const fetchRecruitmentProcess = async () => {
    if (!id) return;
    
    try {
      setLoading(prev => ({ ...prev, recruitment: true }));
      const process = await recruitmentService.get(id);
      setRecruitment(process);
    } catch (error) {
      console.error('Error fetching recruitment process:', error);
      toast.error('Failed to load recruitment process');
      navigate('/recruitment');
    } finally {
      setLoading(prev => ({ ...prev, recruitment: false }));
    }
  };

  // Fetch candidates with pagination and filtering
  const fetchCandidates = async (
    page = 1, 
    status?: CandidateStatus,
    stage?: CandidateStage
  ) => {
    if (!id) return;
    
    try {
      setLoading(prev => ({ ...prev, candidates: true }));
      
      const response: CandidateListResponse = await recruitmentService.getCandidates(id, {
        page,
        limit: pagination.limit,
        status,
        stage
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
  };

  // Get detailed candidate information
  const handleGetCandidateDetails = async (recruitmentId: string, candidateId: string): Promise<Candidate> => {
    try {
      const candidateDetails = await recruitmentService.getCandidate(recruitmentId, candidateId);
      return candidateDetails;
    } catch (error) {
      console.error('Error fetching candidate details:', error);
      throw new Error('Failed to fetch candidate details');
    }
  };

  // Update email for candidate
  const updateCandidateEmail = async (recruitmentId: string, candidateId: string, newEmail: string) => {
    try {
      setLoading(prev => ({ ...prev, updating: true }));
      
      // Call the recruitment service to update candidate email
      const result = await recruitmentService.updateCandidateEmail(
        recruitmentId,
        candidateId,
        {
          email: newEmail
        }
      );

      // Update local state optimistically
      setCandidates(prev => 
        prev.map(candidate => 
          candidate.id === candidateId 
            ? { ...candidate, contact: { ...candidate.contact, email: newEmail } }
            : candidate
        )
      );
      
      // Optionally show previous email in toast if it existed
      if (result.previousEmail) {
        console.log(`Email updated from ${result.previousEmail} to ${result.email}`);
      } else {
        toast.success(`Email updated successfully to ${result.email}`);
      }

      return result;
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
      await fetchCandidates(pagination.page, selectedStatus, selectedStage);
      
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, updating: false }));
    }
  };

  // Initial data load
  useEffect(() => {
    if (id) {
      fetchRecruitmentProcess();
      fetchCandidates();
    }
  }, [id]);

  // Handle status filter change
  const handleStatusFilter = (status?: CandidateStatus) => {
    setSelectedStatus(status);
    fetchCandidates(1, status, selectedStage);
  };

  // Handle stage filter change
  const handleStageFilter = (stage?: CandidateStage) => {
    setSelectedStage(stage);
    fetchCandidates(1, selectedStatus, stage);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedStatus(undefined);
    setSelectedStage(undefined);
    fetchCandidates(1);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    fetchCandidates(newPage, selectedStatus, selectedStage);
  };

  // Add candidates to recruitment process
  const handleAddCandidate = async (candidates: Candidate[]) => {
    if (!id) return;
    
    try {
      setLoading(prev => ({ ...prev, updating: true }));
      
      if (!candidates || candidates.length === 0) {
        toast.error('No candidates selected to add');
        throw new Error('No candidates selected');
      }

      // Extract candidate IDs from the candidate objects
      const candidateIds = candidates.map(candidate => candidate.id).filter(id => id !== undefined) as string[];

      const result = await recruitmentService.associateCandidates(id, {
        candidateIds
      });

      if (result.totalAssociated > 0) {
        toast.success(`Successfully added ${result.totalAssociated} candidate(s)`);
        
        // Refresh candidates list and metrics
        await Promise.all([
          fetchCandidates(pagination.page, selectedStatus, selectedStage),
          fetchRecruitmentProcess()
        ]);
      }

      if (result.totalFailed > 0) {
        toast.dismiss(`Failed to add ${result.totalFailed} candidate(s)`);
        console.warn('Failed associations:', result.failed);
      }

      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding candidates:', error);
      toast.error('Failed to add candidates');
    } finally {
      setLoading(prev => ({ ...prev, updating: false }));
    }
  };

  // Update candidate status
  const handleUpdateStatus = async (
    candidateId: string, 
    newStatus: CandidateStatus,
    newStage?: CandidateStage,
    reason?: string,
    notes?: string
  ) => {
    if (!id) return;
    
    try {
      setLoading(prev => ({ ...prev, updating: true }));
      
      await recruitmentService.updateCandidateStatus(id, candidateId, {
        status: newStatus,
        stage: newStage,
        reason,
        notes
      });

      // Update local state optimistically
      setCandidates(prev => 
        prev.map(candidate => 
          candidate.id === candidateId 
            ? { ...candidate, status: newStatus, stage: newStage }
            : candidate
        )
      );

      toast.success('Candidate status updated successfully');
      
      // Refresh metrics
      await fetchRecruitmentProcess();
    } catch (error) {
      console.error('Error updating candidate status:', error);
      toast.error('Failed to update candidate status');
      
      // Refresh candidates to revert optimistic update
      await fetchCandidates(pagination.page, selectedStatus, selectedStage);
    } finally {
      setLoading(prev => ({ ...prev, updating: false }));
    }
  };

  // Remove candidate from recruitment process
  const handleDeleteCandidate = async (candidateId: string) => {
    if (!id) return;
    
    try {
      setLoading(prev => ({ ...prev, updating: true }));
      
      await recruitmentService.removeCandidate(id, candidateId);
      
      // Update local state
      setCandidates(prev => prev.filter(c => c.id !== candidateId));
      
      toast.success('Candidate removed successfully');
      
      // Refresh metrics and pagination if needed
      await fetchRecruitmentProcess();
      
      // If current page is empty and not first page, go to previous page
      if (candidates.length === 1 && pagination.page > 1) {
        handlePageChange(pagination.page - 1);
      } else {
        await fetchCandidates(pagination.page, selectedStatus, selectedStage);
      }
    } catch (error) {
      console.error('Error removing candidate:', error);
      toast.error('Failed to remove candidate');
    } finally {
      setLoading(prev => ({ ...prev, updating: false }));
    }
  };

  // Refresh all data
  const handleRefresh = async () => {
    await Promise.all([
      fetchRecruitmentProcess(),
      fetchCandidates(pagination.page, selectedStatus, selectedStage)
    ]);
  };

  // Loading state
  if (loading.recruitment) {
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

  // Check if any filters are active
  const hasActiveFilters = selectedStatus || selectedStage;

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
            disabled={loading.candidates || loading.updating}
            className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading.candidates ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            disabled={loading.updating}
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
                onChange={(e) => handleStatusFilter(e.target.value as CandidateStatus || undefined)}
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
              {selectedStage && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Stage: {STAGE_LABELS[selectedStage]}
                  <button
                    onClick={() => handleStageFilter(undefined)}
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
            Showing {pagination.total} candidate{pagination.total !== 1 ? 's' : ''} matching your filters
          </div>
        )}

        {/* Candidates List */}
        {loading.candidates ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <RecruitmentCandidatesList 
              candidates={candidates}
              recruitmentId={id!}
              onAddCandidate={() => setShowAddModal(true)}
              onUpdateStatus={handleUpdateStatus}
              onDeleteCandidate={handleDeleteCandidate}
              onGetCandidateDetails={handleGetCandidateDetails}
              onUpdateCandidateEmail={updateCandidateEmail}
              loading={loading.updating}
            />

            {/* Pagination */}
            {pagination.total > pagination.limit && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} candidates
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrevious || loading.candidates}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNext || loading.candidates}
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
          recruitmentId={id}
          excludeCandidateIds={candidates.map(c => c.id!).filter(id => id)}
        />
      )}
    </div>
  );
};

export default RecruitmentCandidates;