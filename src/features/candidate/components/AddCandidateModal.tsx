import { Check, ChevronLeft, ChevronRight, Loader2, Search, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Candidate, candidatesService } from '../candidate/api/candidatesService';

interface AvailableCandidatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCandidates: (candidates: Candidate[]) => void;
  onAdd?: () => void;
  position?: string;
  department?: string;
}

const AvailableCandidatesModal: React.FC<AvailableCandidatesModalProps> = ({
  isOpen,
  onClose,
  onSelectCandidates,
  onAdd,
  position = "Software Engineer",
  department = "Engineering"
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultsPerPage = 10;

  // Debounced search
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch candidates when modal opens or search/page changes
  useEffect(() => {
    if (!isOpen) return;
    
    fetchCandidates();
  }, [isOpen, currentPage, debouncedSearchQuery, position, department]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      setSelectedCandidates(new Set());
      setSearchQuery('');
      setError(null);
    }
  }, [isOpen]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build search parameters
      const params: any = {
        page: currentPage,
        limit: resultsPerPage,
        position: position,
        department: department,
      };

      // Add skills filter if search query looks like skills
      if (debouncedSearchQuery) {
        // For now, we'll treat search as skills filter
        // In a more sophisticated implementation, you might parse this differently
        params.skills = [debouncedSearchQuery];
      }

      const response = await candidatesService.list(params);
      
      setCandidates(response.data);
      setTotalResults(response.pagination.total);
      setTotalPages(response.pagination.pages);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch candidates');
      setCandidates([]);
      setTotalResults(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = candidates.filter(candidate => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      candidate.firstName.toLowerCase().includes(query) ||
      candidate.lastName.toLowerCase().includes(query) ||
      candidate.email.toLowerCase().includes(query) ||
      candidate.skills?.some(skill => skill.toLowerCase().includes(query)) ||
      candidate.position?.toLowerCase().includes(query)
    );
  });

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
    if (selectedCandidates.size === filteredCandidates.length) {
      setSelectedCandidates(new Set());
    } else {
      setSelectedCandidates(new Set(filteredCandidates.map(c => c.id!)));
    }
  };

  const handleAddSelected = () => {
    const selected = candidates.filter(c => selectedCandidates.has(c.id!));
    onSelectCandidates(selected);
    onClose();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedCandidates(new Set()); // Clear selections when changing pages
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getMatchColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadgeColor = (status?: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'interview':
        return 'bg-purple-100 text-purple-800';
      case 'offer':
        return 'bg-green-100 text-green-800';
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
      // Always show first page
      pages.push(1);
      
      // Calculate range around current page
      const start = Math.max(2, currentPage - 2);
      const end = Math.min(totalPages - 1, currentPage + 2);
      
      if (start > 2) pages.push('...');
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages - 1) pages.push('...');
      
      // Always show last page
      if (totalPages > 1) pages.push(totalPages);
    }
    
    return pages;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-0 border w-full max-w-5xl shadow-lg rounded-lg bg-white min-h-[600px]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Available Candidates</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search candidates..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

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
          ) : filteredCandidates.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-gray-500 mb-2">No candidates found</p>
                <p className="text-gray-400 text-sm">
                  {searchQuery ? 'Try adjusting your search criteria' : 'No candidates available for this position'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className={`relative p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedCandidates.has(candidate.id!)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleCandidateToggle(candidate.id!)}
                >
                  {/* Check icon en la esquina superior derecha */}
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
                        {getInitials(candidate.firstName, candidate.lastName)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          {candidate.firstName} {candidate.lastName}
                        </h3>
                        <span className={`text-xs ${getMatchColor(candidate.matchScore)}`}>
                          {candidate.matchScore ? `${candidate.matchScore}% Match` : '0% Match'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{candidate.email}</p>
                      
                      {candidate.skills && candidate.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {candidate.skills.slice(0, 4).map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {skill}
                            </span>
                          ))}
                          {candidate.skills.length > 4 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-600">
                              +{candidate.skills.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-500">
                        {candidate.location?.city || 'Unknown'}, {candidate.location?.country || 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
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
            {selectedCandidates.size} candidates selected
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSelected}
              disabled={selectedCandidates.size === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Selected ({selectedCandidates.size})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailableCandidatesModal;