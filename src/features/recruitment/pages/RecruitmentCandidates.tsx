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
  const [minMatchScore, setMinMatchScore] = useState<number | undefined>();
  const [maxMatchScore, setMaxMatchScore] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState<'name' | 'matchScore' | 'status' | 'createdAt'>('matchScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
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
    stage?: CandidateStage,
    minMatch?: number,
    maxMatch?: number
  ) => {
    if (!id) return;
    
    try {
      setLoading(prev => ({ ...prev, candidates: true }));
      
      const response: CandidateListResponse = await recruitmentService.getCandidates(id, {
        page,
        limit: pagination.limit,
        status,
        stage,
        minMatchScore: minMatch,
        maxMatchScore: maxMatch,
        sortBy,
        sortOrder
      });

      // Apply client-side sorting if needed
      let sortedCandidates = [...response.data];
      
      switch (sortBy) {
        case 'matchScore':
          sortedCandidates.sort((a, b) => {
            const scoreA = a.assessment?.matchScore || 0;
            const scoreB = b.assessment?.matchScore || 0;
            return sortOrder === 'desc' ? scoreB - scoreA : scoreA - scoreB;
          });
          break;
        case 'name':
          sortedCandidates.sort((a, b) => {
            const nameA = `${a.personalInfo.firstName} ${a.personalInfo.lastName}`;
            const nameB = `${b.personalInfo.firstName} ${b.personalInfo.lastName}`;
            return sortOrder === 'desc' ? nameB.localeCompare(nameA) : nameA.localeCompare(nameB);
          });
          break;
        case 'status':
          sortedCandidates.sort((a, b) => {
            return sortOrder === 'desc' ? b.status.localeCompare(a.status) : a.status.localeCompare(b.status);
          });
          break;
        case 'createdAt':
          sortedCandidates.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
          });
          break;
      }
      
      setCandidates(sortedCandidates);
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
      await fetchCandidates(pagination.page, selectedStatus, selectedStage, minMatchScore, maxMatchScore);
      
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, updating: false }));
    }
  };

  // Initial data load
  useEffect(() => {
    if (id) {
      fetchRecruitmentProcess();
      fetchCandidates(1, selectedStatus, selectedStage, minMatchScore, maxMatchScore);
    }
  }, [id, sortBy, sortOrder]);

  // Handle status filter change
  const handleStatusFilter = (status?: CandidateStatus) => {
    setSelectedStatus(status);
    fetchCandidates(1, status, selectedStage, minMatchScore, maxMatchScore);
  };

  // Handle stage filter change
  const handleStageFilter = (stage?: CandidateStage) => {
    setSelectedStage(stage);
    fetchCandidates(1, selectedStatus, stage, minMatchScore, maxMatchScore);
  };

  // Handle match score filter change
  const handleMatchScoreFilter = (min?: number, max?: number) => {
    setMinMatchScore(min);
    setMaxMatchScore(max);
    fetchCandidates(1, selectedStatus, selectedStage, min, max);
  };

  // Handle sorting change
  const handleSortChange = (newSortBy: typeof sortBy, newSortOrder?: typeof sortOrder) => {
    setSortBy(newSortBy);
    if (newSortOrder) {
      setSortOrder(newSortOrder);
    } else {
      // Toggle sort order if same field
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedStatus(undefined);
    setSelectedStage(undefined);
    setMinMatchScore(undefined);
    setMaxMatchScore(undefined);
    setSortBy('matchScore');
    setSortOrder('desc');
    fetchCandidates(1);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    fetchCandidates(newPage, selectedStatus, selectedStage, minMatchScore, maxMatchScore);
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
          fetchCandidates(pagination.page, selectedStatus, selectedStage, minMatchScore, maxMatchScore),
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
      await fetchCandidates(pagination.page, selectedStatus, selectedStage, minMatchScore, maxMatchScore);
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
        await fetchCandidates(pagination.page, selectedStatus, selectedStage, minMatchScore, maxMatchScore);
      }
    } catch (error) {
      console.error('Error removing candidate:', error);
      toast.error('Failed to remove candidate');
    } finally {
      setLoading(prev => ({ ...prev, updating: false }));
    }
  };

  // Handle pagination change
  const handlePaginationChange = (newPage: number) => {
    fetchCandidates(newPage, selectedStatus, selectedStage, minMatchScore, maxMatchScore);
  };

  // Refresh all data
  const handleRefresh = async () => {
    await Promise.all([
      fetchRecruitmentProcess(),
      fetchCandidates(pagination.page, selectedStatus, selectedStage, minMatchScore, maxMatchScore)
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
  const hasActiveFilters = selectedStatus || selectedStage || minMatchScore !== undefined || maxMatchScore !== undefined;

  // Get match score color for display
  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status:
              </label>
              <select
                value={selectedStatus || ''}
                onChange={(e) => handleStatusFilter(e.target.value as CandidateStatus || undefined)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                {CANDIDATE_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>

            {/* Match Score Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Match Score Range:
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
                  className="w-20 border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-gray-500">-</span>
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
                  className="w-20 border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-gray-500 text-xs">%</span>
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By:
              </label>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as typeof sortBy)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="matchScore">Match Score</option>
                <option value="name">Name</option>
                <option value="status">Status</option>
                <option value="createdAt">Date Added</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order:
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="desc">Highest First</option>
                <option value="asc">Lowest First</option>
              </select>
            </div>
          </div>

          {/* Quick Match Score Filters */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm font-medium text-gray-700">Quick filters:</span>
            <button
              onClick={() => handleMatchScoreFilter(90, undefined)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                minMatchScore === 90 && maxMatchScore === undefined
                  ? 'bg-green-600 text-white'
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              }`}
            >
              Excellent (90%+)
            </button>
            <button
              onClick={() => handleMatchScoreFilter(80, 89)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                minMatchScore === 80 && maxMatchScore === 89
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              }`}
            >
              Good (80-89%)
            </button>
            <button
              onClick={() => handleMatchScoreFilter(70, 79)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                minMatchScore === 70 && maxMatchScore === 79
                  ? 'bg-yellow-600 text-white'
                  : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              }`}
            >
              Fair (70-79%)
            </button>
            <button
              onClick={() => handleMatchScoreFilter(undefined, 69)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                minMatchScore === undefined && maxMatchScore === 69
                  ? 'bg-red-600 text-white'
                  : 'bg-red-100 text-red-800 hover:bg-red-200'
              }`}
            >
              {'Low (<70%)'}
            </button>
          </div>

          {/* Clear Filters and Results Summary */}
          <div className="flex items-center justify-between">
            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium underline"
              >
                Clear all filters
              </button>
            )}
            
            {/* Match Statistics */}
            {candidates.length > 0 && (
              <div className="text-sm text-gray-600">
                Average match: {Math.round(candidates.reduce((sum, c) => sum + (c.assessment?.matchScore || 0), 0) / candidates.length)}%
              </div>
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
              {(minMatchScore !== undefined || maxMatchScore !== undefined) && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Match: {minMatchScore || 0}% - {maxMatchScore || 100}%
                  <button
                    onClick={() => handleMatchScoreFilter(undefined, undefined)}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Enhanced Results Summary */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {hasActiveFilters ? (
              <>Showing {pagination.total} candidate{pagination.total !== 1 ? 's' : ''} matching your filters</>
            ) : (
              <>Total: {pagination.total} candidate{pagination.total !== 1 ? 's' : ''}</>
            )}
          </div>
          
          {/* Match Score Distribution */}
          {candidates.length > 0 && (
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                <span>{candidates.filter(c => (c.assessment?.matchScore || 0) >= 90).length} Excellent</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                <span>{candidates.filter(c => {
                  const score = c.assessment?.matchScore || 0;
                  return score >= 80 && score < 90;
                }).length} Good</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
                <span>{candidates.filter(c => {
                  const score = c.assessment?.matchScore || 0;
                  return score >= 70 && score < 80;
                }).length} Fair</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                <span>{candidates.filter(c => (c.assessment?.matchScore || 0) < 70).length} Low</span>
              </div>
            </div>
          )}
        </div>

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
              <div className="mt-6 pt-6 border-t border-gray-200">
                {/* Results Summary */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-700">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} candidates
                  </div>
                  <div className="text-sm text-gray-500">
                    Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
                  </div>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-center space-x-2">
                  {/* First Page */}
                  <button
                    onClick={() => handlePaginationChange(1)}
                    disabled={pagination.page === 1 || loading.candidates}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    First
                  </button>

                  {/* Previous Page */}
                  <button
                    onClick={() => handlePaginationChange(pagination.page - 1)}
                    disabled={!pagination.hasPrevious || loading.candidates}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  {(() => {
                    const totalPages = Math.ceil(pagination.total / pagination.limit);
                    const currentPage = pagination.page;
                    const pages = [];
                    
                    // Calculate page range to show
                    let startPage = Math.max(1, currentPage - 2);
                    let endPage = Math.min(totalPages, currentPage + 2);
                    
                    // Adjust range if we're near the beginning or end
                    if (endPage - startPage < 4) {
                      if (startPage === 1) {
                        endPage = Math.min(totalPages, startPage + 4);
                      } else if (endPage === totalPages) {
                        startPage = Math.max(1, endPage - 4);
                      }
                    }

                    // Add ellipsis at the beginning if needed
                    if (startPage > 1) {
                      pages.push(
                        <button
                          key={1}
                          onClick={() => handlePaginationChange(1)}
                          disabled={loading.candidates}
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          1
                        </button>
                      );
                      
                      if (startPage > 2) {
                        pages.push(
                          <span key="ellipsis-start" className="px-2 py-2 text-sm text-gray-500">
                            ...
                          </span>
                        );
                      }
                    }

                    // Add page numbers in range
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => handlePaginationChange(i)}
                          disabled={loading.candidates}
                          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            i === currentPage
                              ? 'bg-blue-600 text-white border border-blue-600'
                              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {i}
                        </button>
                      );
                    }

                    // Add ellipsis at the end if needed
                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        pages.push(
                          <span key="ellipsis-end" className="px-2 py-2 text-sm text-gray-500">
                            ...
                          </span>
                        );
                      }
                      
                      pages.push(
                        <button
                          key={totalPages}
                          onClick={() => handlePaginationChange(totalPages)}
                          disabled={loading.candidates}
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {totalPages}
                        </button>
                      );
                    }

                    return pages;
                  })()}

                  {/* Next Page */}
                  <button
                    onClick={() => handlePaginationChange(pagination.page + 1)}
                    disabled={!pagination.hasNext || loading.candidates}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>

                  {/* Last Page */}
                  <button
                    onClick={() => handlePaginationChange(Math.ceil(pagination.total / pagination.limit))}
                    disabled={pagination.page === Math.ceil(pagination.total / pagination.limit) || loading.candidates}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Last
                  </button>
                </div>

                {/* Items per page selector */}
                <div className="text-sm text-gray-700">
                  <div className="flex items-center justify-center mt-4">
                    <label className="text-sm text-gray-600 mr-2">Items per page:</label>
                    <select
                      value={pagination.limit}
                      onChange={(e) => {
                        const newLimit = parseInt(e.target.value);
                        setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
                        fetchCandidates(1, selectedStatus, selectedStage, minMatchScore, maxMatchScore);
                      }}
                      disabled={loading.candidates}
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                    >
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                  </div>
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