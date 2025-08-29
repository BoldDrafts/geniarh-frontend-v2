import { Check, ChevronLeft, ChevronRight, Loader2, Search, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { candidatesService } from '../api/candidatesService';
import { Candidate } from '../types/recruitment';

interface RecruitmentAddCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCandidates: (candidates: Candidate[]) => Promise<void>;
  position?: string;
  department?: string;
  recruitmentId?: string;
  excludeCandidateIds?: string[];
}

// Label mappings for display
const STATUS_LABELS: Record<Candidate['status'], string> = {
  'Applied': 'New',
  'Screening': 'Contacted',
  'Interview': 'Interview',
  'Offer': 'Offer',
  'Hired': 'Hired',
  'Rejected': 'Rejected'
};

const RecruitmentAddCandidateModal: React.FC<RecruitmentAddCandidateModalProps> = ({
  isOpen,
  onClose,
  onSelectCandidates,
  position = "Software Engineer",
  department = "Engineering",
  recruitmentId,
  excludeCandidateIds = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Additional filters
  const [selectedStatus, setSelectedStatus] = useState<Candidate['status'] | undefined>();
  const [selectedStage, setSelectedStage] = useState<Candidate['stage'] | undefined>();
  const [skillsFilter, setSkillsFilter] = useState<string>('');
  const [minMatchScore, setMinMatchScore] = useState<number | undefined>();
  const [departmentFilter, setDepartmentFilter] = useState<string>(department);
  const [positionFilter, setPositionFilter] = useState<string>(position);
  
  const resultsPerPage = 20;

  // Debounced search
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [debouncedSkillsFilter, setDebouncedSkillsFilter] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSkillsFilter(skillsFilter);
    }, 300);

    return () => clearTimeout(timer);
  }, [skillsFilter]);

  // Fetch candidates when modal opens or search/page/filters change
  useEffect(() => {
    if (!isOpen) return;
    
    fetchCandidates();
  }, [isOpen, currentPage, selectedStatus, selectedStage, debouncedSkillsFilter, minMatchScore, departmentFilter, positionFilter]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      setSelectedCandidates(new Set());
      setSearchQuery('');
      setSkillsFilter('');
      setSelectedStatus(undefined);
      setSelectedStage(undefined);
      setMinMatchScore(undefined);
      setDepartmentFilter(department);
      setPositionFilter(position);
      setError(null);
    }
  }, [isOpen, department, position]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build search parameters
      const params: Parameters<typeof candidatesService.list>[0] = {
        page: currentPage,
        limit: resultsPerPage,
        department: departmentFilter || undefined,
        position: positionFilter || undefined,
      };

      // Add filters
      if (selectedStatus) {
        params.status = selectedStatus;
      }

      if (debouncedSkillsFilter) {
        params.skills = debouncedSkillsFilter;
      }

      if (minMatchScore) {
        params.minMatchScore = minMatchScore;
      }

      const response = await candidatesService.list(params);
      
      // Filter out excluded candidates
      let filteredCandidates = response.data;
      if (excludeCandidateIds.length > 0) {
        filteredCandidates = response.data.filter(candidate => 
          candidate.id && !excludeCandidateIds.includes(candidate.id)
        );
      }

      // Apply client-side search filter if needed
      if (debouncedSearchQuery) {
        const query = debouncedSearchQuery.toLowerCase();
        filteredCandidates = filteredCandidates.filter(candidate => {
          return (
            candidate.firstName?.toLowerCase().includes(query) ||
            candidate.lastName?.toLowerCase().includes(query) ||
            candidate.email?.toLowerCase().includes(query) ||
            candidate.skills?.some(skill => 
              skill.toLowerCase().includes(query)
            )
          );
        });
      }
      
      setCandidates(filteredCandidates);
      setTotalResults(response.pagination.total);
      setTotalPages(response.pagination.pages);
    } catch (err: any) {
      console.error('Error fetching candidates:', err);
      setError(err.message || 'Failed to fetch candidates');
      setCandidates([]);
      setTotalResults(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateToggle = (candidateId: string) => {
    const newSelected = new Set(selectedCandidates);
    if (newSelected.has(candidateId)) {
      newSelected.delete(candidateId);
    } else {
      newSelected.add(candidateId);
    }
    setSelectedCandidates(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedCandidates.size === candidates.length) {
      setSelectedCandidates(new Set());
    } else {
      setSelectedCandidates(new Set(candidates.map(c => c.id!).filter(id => id)));
    }
  };

  const handleAddSelected = () => {
    const selected = candidates.filter(c => c.id && selectedCandidates.has(c.id));
    onSelectCandidates(selected);
    onClose();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedCandidates(new Set()); // Clear selections when changing pages
  };

  const handleStatusFilter = (status?: Candidate['status']) => {
    setSelectedStatus(status);
    setCurrentPage(1);
    setSelectedCandidates(new Set());
  };

  const handleClearFilters = () => {
    setSelectedStatus(undefined);
    setSelectedStage(undefined);
    setSearchQuery('');
    setSkillsFilter('');
    setMinMatchScore(undefined);
    setDepartmentFilter(department);
    setPositionFilter(position);
    setCurrentPage(1);
    setSelectedCandidates(new Set());
  };

  const getInitials = (candidate: Candidate) => {
    const firstName = candidate.firstName || '';
    const lastName = candidate.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getMatchColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadgeColor = (status: Candidate['status']) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'contacted':
        return 'bg-indigo-100 text-indigo-800';
      case 'interview':
        return 'bg-yellow-100 text-yellow-800';
      case 'offer':
        return 'bg-pink-100 text-pink-800';
      case 'hired':
        return 'bg-emerald-100 text-emerald-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 10;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      const start = Math.max(2, currentPage - 2);
      const end = Math.min(totalPages - 1, currentPage + 2);
      
      if (start > 2) pages.push('...');
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages - 1) pages.push('...');
      
      if (totalPages > 1) pages.push(totalPages);
    }
    
    return pages;
  };

  const hasActiveFilters = selectedStatus || selectedStage || searchQuery || skillsFilter || minMatchScore || 
    (departmentFilter !== department) || (positionFilter !== position);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-0 border w-full max-w-6xl shadow-lg rounded-lg bg-white min-h-[700px]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Add Candidates to Recruitment</h2>
            <p className="text-sm text-gray-500 mt-1">
              {position} • {department}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          {/* Search Bar */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <input
                type="text"
                placeholder="e.g. Engineering, Sales"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Position Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position
              </label>
              <input
                type="text"
                placeholder="e.g. Software Engineer"
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={selectedStatus || ''}
                onChange={(e) => handleStatusFilter(e.target.value as Candidate['status'] || undefined)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Skills Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skills
              </label>
              <input
                type="text"
                placeholder="e.g. React, Node.js"
                value={skillsFilter}
                onChange={(e) => setSkillsFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Match Score Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Match Score
              </label>
              <input
                type="number"
                placeholder="0-100"
                min="0"
                max="100"
                value={minMatchScore || ''}
                onChange={(e) => setMinMatchScore(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleClearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Results Summary and Select All */}
        {!loading && !error && candidates.length > 0 && (
          <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {totalResults} candidate{totalResults !== 1 ? 's' : ''} found
                {hasActiveFilters && ' matching your criteria'}
              </div>
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {selectedCandidates.size === candidates.length ? 'Deselect All' : 'Select All on Page'}
              </button>
            </div>
          </div>
        )}

        {/* Candidates List */}
        <div className="p-6 min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading candidates...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-red-600 mb-2">Error loading candidates</p>
                <p className="text-gray-500 text-sm mb-4">{error}</p>
                <button
                  onClick={fetchCandidates}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : candidates.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-gray-500 mb-2">No candidates found</p>
                <p className="text-gray-400 text-sm">
                  {hasActiveFilters ? 'Try adjusting your search criteria or filters' : 'No candidates available for this position'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {candidates.map((candidate) => {
                return (
                  <div
                    key={candidate.id}
                    className={`relative p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedCandidates.has(candidate.id!)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleCandidateToggle(candidate.id!)}
                  >
                    {/* Check icon */}
                    {selectedCandidates.has(candidate.id!) && (
                      <div className="absolute top-3 right-3">
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    )}

                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                          {getInitials(candidate)}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-medium text-gray-900">
                            {candidate.firstName} {candidate.lastName}
                          </h3>
                          {candidate.assessment.matchScore !== undefined && (
                            <span className={`text-xs font-medium ${getMatchColor(candidate.assessment.matchScore)}`}>
                              {candidate.assessment.matchScore}% Match
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600">{candidate.email}</p>
                        
                        {/* Position and Department */}
                        {(candidate.position || candidate.department) && (
                          <p className="text-xs text-gray-500 mb-2">
                            {candidate.position && <span>{candidate.position}</span>}
                            {candidate.position && candidate.department && <span className="mx-1">•</span>}
                            {candidate.department && <span>{candidate.department}</span>}
                          </p>
                        )}
                        
                        {/* Status and Stage */}
                        <div className="flex flex-wrap gap-1 mb-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusBadgeColor(candidate.status)}`}>
                            {STATUS_LABELS[candidate.status]}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {STAGE_LABELS[candidate.stage]}
                          </span>
                        </div>
                        
                        {/* Skills */}
                        {candidate.skills && candidate.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {candidate.skills.slice(0, 3).map((skill, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {skill}
                              </span>
                            ))}
                            {candidate.skills.length > 3 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-600">
                                +{candidate.skills.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Location */}
                        {candidate.location && (
                          <p className="text-xs text-gray-500">
                            {candidate.location.city || 'Unknown'}, {candidate.location.country || 'Unknown'}
                            {candidate.location.remote && ' • Remote'}
                          </p>
                        )}

                        {/* Source */}
                        {candidate.source && (
                          <p className="text-xs text-gray-400 mt-1">
                            Source: {candidate.source}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * resultsPerPage) + 1} - {Math.min(currentPage * resultsPerPage, totalResults)} of {totalResults} results
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                {generatePageNumbers().map((page, index) => (
                  <React.Fragment key={index}>
                    {page === '...' ? (
                      <span className="px-2 py-1 text-gray-500">...</span>
                    ) : (
                      <button
                        onClick={() => handlePageChange(page as number)}
                        className={`px-3 py-1 text-sm rounded border ${
                          currentPage === page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )}
                  </React.Fragment>
                ))}
                
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="text-sm text-gray-600">
            {selectedCandidates.size} candidate{selectedCandidates.size !== 1 ? 's' : ''} selected
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSelected}
              disabled={selectedCandidates.size === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add Selected ({selectedCandidates.size})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruitmentAddCandidateModal;