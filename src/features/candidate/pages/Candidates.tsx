import {
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  UserPlus,
  Users,
  X,
  Plus
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import AIAssistantPanel from '../../../shared/components/AIAssistantPanel';
import CandidateCard from '../components/CandidateCard';
import DeleteCandidateModal from '../components/DeleteCandidateModal';
import NewCandidateForm from '../components/NewCandidateForm';
import { Candidate, candidatesService } from '../api/candidatesService';

interface FilterState {
  department: string;
  experience: string;
  matchScore: string;
  location: string;
  skills: string[];
}

const Candidates: React.FC = () => {
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [activeTab, setActiveTab] = useState<Candidate['status']>('new');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    current: 1,
    limit: 12
  });
  const [showNewCandidateForm, setShowNewCandidateForm] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState<Candidate | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState<FilterState>({
    department: '',
    experience: '',
    matchScore: '',
    location: '',
    skills: []
  });
  const [newSkillFilter, setNewSkillFilter] = useState('');
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  const stages = [
    { name: 'Applied', status: 'complete' },
    { name: 'Screening', status: 'current' },
    { name: 'Interview', status: 'upcoming' },
    { name: 'Assessment', status: 'upcoming' },
    { name: 'Offer', status: 'upcoming' },
    { name: 'Hired', status: 'upcoming' },
  ];

  useEffect(() => {
    fetchCandidates();
  }, [activeTab, pagination.current, pagination.limit, hasActiveFilters]);

  useEffect(() => {
    // Check if any filters are active
    const isActive = !!(
      filters.department || 
      filters.experience || 
      filters.matchScore || 
      filters.location || 
      filters.skills.length > 0 ||
      searchQuery
    );
    setHasActiveFilters(isActive);
  }, [filters, searchQuery]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const queryParams: any = {
        status: activeTab,
        page: pagination.current,
        limit: pagination.limit
      };

      // Add search query
      if (searchQuery) {
        queryParams.search = searchQuery;
      }

      // Add filters
      if (filters.department) {
        queryParams.department = filters.department;
      }
      if (filters.experience) {
        queryParams.experience = filters.experience;
      }
      if (filters.matchScore) {
        queryParams.matchScore = filters.matchScore;
      }
      if (filters.location) {
        queryParams.location = filters.location;
      }
      if (filters.skills.length > 0) {
        queryParams.skills = filters.skills.join(',');
      }

      const response = await candidatesService.list(queryParams);
      setCandidates(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
        pages: response.pagination.pages
      }));
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast.error('Failed to fetch candidates');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.pages) {
      setPagination(prev => ({ ...prev, current: page }));
    }
  };

  const handleLimitChange = (newLimit: number) => {
    setPagination(prev => ({ 
      ...prev, 
      limit: newLimit, 
      current: 1 
    }));
  };

  const handleCreateCandidate = async (data: Omit<Candidate, 'id'>) => {
    try {
      await candidatesService.create(data);
      toast.success('Candidate created successfully');
      fetchCandidates();
      setShowNewCandidateForm(false);
    } catch (error) {
      console.error('Error creating candidate:', error);
    }
  };

  const handleUpdateCandidate = async (data: Candidate) => {
    if (!data.id) return;
    
    try {
      await candidatesService.update(data.id, data);
      toast.success('Candidate updated successfully');
      fetchCandidates();
      setShowNewCandidateForm(false);
      setSelectedCandidate(null);
    } catch (error) {
      console.error('Error updating candidate:', error);
    }
  };

  const handleDeleteCandidate = async (id: string) => {
    try {
      await candidatesService.delete(id);
      toast.success('Candidate deleted successfully');
      fetchCandidates();
    } catch (error) {
      console.error('Error deleting candidate:', error);
    }
  };

  const handleViewProfile = async (id: string) => {
    try {
      setLoadingProfile(true);
      const candidate = await candidatesService.get(id);
      setSelectedCandidate(candidate);
      setFormMode('edit');
      setShowNewCandidateForm(true);
    } catch (error) {
      console.error('Error fetching candidate:', error);
      toast.error('Failed to fetch candidate details');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleUpdateStatus = async (candidateId: string, newStatus: Candidate['status'], newStage: Candidate['stage']) => {
    try {
      await candidatesService.updateStatus(candidateId, newStatus, newStage);
      toast.success('Candidate status updated successfully');
      fetchCandidates();
    } catch (error) {
      console.error('Error updating candidate status:', error);
    }
  };

  const confirmDelete = (candidate: Candidate, e: React.MouseEvent) => {
    e.stopPropagation();
    setCandidateToDelete(candidate);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!candidateToDelete?.id) return;
    
    try {
      await handleDeleteCandidate(candidateToDelete.id);
      setShowDeleteModal(false);
      setCandidateToDelete(null);
    } catch (error) {
      console.error('Error deleting candidate:', error);
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchCandidates();
  };

  const handleTabChange = (tab: Candidate['status']) => {
    setActiveTab(tab);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // Filter handlers
  const handleFilterChange = (filterKey: keyof Omit<FilterState, 'skills'>, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  const handleAddSkillFilter = () => {
    if (newSkillFilter.trim() && !filters.skills.includes(newSkillFilter.trim())) {
      setFilters(prev => ({
        ...prev,
        skills: [...prev.skills, newSkillFilter.trim()]
      }));
      setNewSkillFilter('');
    }
  };

  const handleRemoveSkillFilter = (skillToRemove: string) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleApplyFilters = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchCandidates();
    toast.success('Filters applied successfully');
  };

  const handleResetFilters = () => {
    setFilters({
      department: '',
      experience: '',
      matchScore: '',
      location: '',
      skills: []
    });
    setSearchQuery('');
    setNewSkillFilter('');
    setPagination(prev => ({ ...prev, current: 1 }));
    // Fetch candidates after resetting
    setTimeout(() => fetchCandidates(), 100);
    toast.success('Filters reset');
  };

  const filteredCandidates = candidates.filter(cand => {
    // Client-side filtering for immediate feedback (server-side filtering is primary)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = (
        cand.firstName.toLowerCase().includes(query) ||
        cand.lastName.toLowerCase().includes(query) ||
        cand.position.toLowerCase().includes(query) ||
        cand.skills.some(skill => skill.toLowerCase().includes(query))
      );
      if (!matchesSearch) return false;
    }
    return true;
  });

  // Generar números de página para mostrar
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, pagination.current - delta);
      i <= Math.min(pagination.pages - 1, pagination.current + delta);
      i++
    ) {
      range.push(i);
    }

    if (pagination.current - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (pagination.current + delta < pagination.pages - 1) {
      rangeWithDots.push('...', pagination.pages);
    } else if (pagination.pages > 1) {
      rangeWithDots.push(pagination.pages);
    }

    return rangeWithDots;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
          <p className="text-gray-500 mt-1">Manage and track potential candidates</p>
        </div>
        <div className="flex mt-3 sm:mt-0 space-x-3">
          <button
            onClick={() => setShowAIAssistant(true)}
            className="flex items-center justify-center px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
          >
            <BrainCircuit className="mr-2 h-4 w-4" />
            AI Matching
          </button>
          <button 
            onClick={() => {
              setFormMode('create');
              setSelectedCandidate(null);
              setShowNewCandidateForm(true);
            }}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Candidate
          </button>
        </div>
      </div>

      {/* Active filters indicator */}
      {hasActiveFilters && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Active Filters:</span>
              <div className="flex items-center space-x-2">
                {searchQuery && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Search: "{searchQuery}"
                  </span>
                )}
                {filters.department && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Dept: {filters.department}
                  </span>
                )}
                {filters.experience && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Exp: {filters.experience}
                  </span>
                )}
                {filters.matchScore && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Score: {filters.matchScore}
                  </span>
                )}
                {filters.location && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Location: {filters.location}
                  </span>
                )}
                {filters.skills.map((skill, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex space-x-4 overflow-x-auto">
            <button
              onClick={() => handleTabChange('new')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap ${
                activeTab === 'new'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              New
            </button>
            <button
              onClick={() => handleTabChange('contacted')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap ${
                activeTab === 'contacted'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Contacted
            </button>
            <button
              onClick={() => handleTabChange('interview')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap ${
                activeTab === 'interview'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Interview
            </button>
            <button
              onClick={() => handleTabChange('offer')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap ${
                activeTab === 'offer'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Offer
            </button>
            <button
              onClick={() => handleTabChange('hired')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap ${
                activeTab === 'hired'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Hired
            </button>
            <button
              onClick={() => handleTabChange('rejected')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap ${
                activeTab === 'rejected'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Rejected
            </button>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search candidates..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button 
              onClick={handleSearch}
              className="p-2 border border-blue-300 text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100"
            >
              <Search className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setFilterOpen(!filterOpen)}
              className={`p-2 border rounded-md ${
                filterOpen 
                  ? 'bg-blue-50 border-blue-300 text-blue-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Expanded Filter Panel */}
        {filterOpen && (
          <div className="p-4 border-t border-gray-200">
            {/* Skills Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Skills
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {filters.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkillFilter(skill)}
                      className="ml-1.5 text-green-600 hover:text-green-800"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newSkillFilter}
                  onChange={(e) => setNewSkillFilter(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkillFilter())}
                  placeholder="Add skill to filter (e.g., React, Python, etc.)"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddSkillFilter}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Other Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select 
                  value={filters.department}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Any</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Product">Product</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="HR">HR</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                <select 
                  value={filters.experience}
                  onChange={(e) => handleFilterChange('experience', e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Any</option>
                  <option value="0-2">0-2 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5-7">5-7 years</option>
                  <option value="8+">8+ years</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Match Score</label>
                <select 
                  value={filters.matchScore}
                  onChange={(e) => handleFilterChange('matchScore', e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Any</option>
                  <option value="90+">90%+</option>
                  <option value="80+">80%+</option>
                  <option value="70+">70%+</option>
                  <option value="60+">60%+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <select 
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Any</option>
                  <option value="Remote">Remote</option>
                  <option value="New York">New York</option>
                  <option value="London">London</option>
                  <option value="San Francisco">San Francisco</option>
                  <option value="Berlin">Berlin</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {(filters.skills.length > 0 || filters.department || filters.experience || filters.matchScore || filters.location) && (
                  <span>
                    {[
                      filters.department && 'Department',
                      filters.experience && 'Experience', 
                      filters.matchScore && 'Match Score',
                      filters.location && 'Location',
                      filters.skills.length > 0 && `${filters.skills.length} Skill${filters.skills.length !== 1 ? 's' : ''}`
                    ].filter(Boolean).join(', ')} selected
                  </span>
                )}
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={handleResetFilters}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Reset Filters
                </button>
                <button 
                  onClick={handleApplyFilters}
                  className="px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary and Items per Page */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-700">
            Showing {((pagination.current - 1) * pagination.limit) + 1} to {Math.min(pagination.current * pagination.limit, pagination.total)} of {pagination.total} candidates
            {hasActiveFilters && <span className="text-blue-600 font-medium"> (filtered)</span>}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Show:</span>
            <select 
              value={pagination.limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
            <span className="text-sm text-gray-700">per page</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <button className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            <Upload className="h-4 w-4" />
            <span>Upload CVs</span>
          </button>
          <button className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            <Users className="h-4 w-4" />
            <span>Bulk Actions</span>
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {loadingProfile && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-3">
            <RefreshCw className="h-6 w-6 text-blue-600 animate-spin" />
            <span className="text-gray-700">Loading profile...</span>
          </div>
        </div>
      )}

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-8">
            <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="col-span-full py-8 text-center bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col items-center">
              <Search className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No candidates found</h3>
              <p className="text-gray-500">
                {hasActiveFilters ? 'Try adjusting your filters or search criteria' : 'Try adjusting your search or filters'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        ) : (
          filteredCandidates.map((candidate) => (
            <div key={candidate.id} className="relative group">
              <div onClick={() => handleViewProfile(candidate.id!)}>
                <CandidateCard 
                  id={candidate.id!}
                  name={`${candidate.firstName} ${candidate.lastName}`}
                  position={candidate.position}
                  skills={candidate.skills}
                  imageSrc={`https://api.dicebear.com/7.x/avataaars/svg?seed=${candidate.id}`}
                  status={candidate.status}
                  createdAt={candidate.createdAt}
                  onViewProfile={() => handleViewProfile(candidate.id!)}
                />
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex space-x-1 bg-white rounded-md shadow-sm border border-gray-200">
                  <button
                    onClick={(e) => confirmDelete(candidate, e)}
                    className="p-1 text-gray-600 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {pagination.pages > 1 && (
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center justify-between sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(pagination.current - 1)}
              disabled={pagination.current === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                pagination.current === 1
                  ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                  : 'text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.current + 1)}
              disabled={pagination.current === pagination.pages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                pagination.current === pagination.pages
                  ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                  : 'text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
          
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing page <span className="font-medium">{pagination.current}</span> of{' '}
                <span className="font-medium">{pagination.pages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(pagination.current - 1)}
                  disabled={pagination.current === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                    pagination.current === 1
                      ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                      : 'text-gray-500 bg-white hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                {getPageNumbers().map((page, index) => (
                  <React.Fragment key={index}>
                    {page === '...' ? (
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        ...
                      </span>
                    ) : (
                      <button
                        onClick={() => handlePageChange(page as number)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pagination.current === page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )}
                  </React.Fragment>
                ))}
                
                <button
                  onClick={() => handlePageChange(pagination.current + 1)}
                  disabled={pagination.current === pagination.pages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                    pagination.current === pagination.pages
                      ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                      : 'text-gray-500 bg-white hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Panel */}
      {showAIAssistant && (
        <AIAssistantPanel 
          context="candidates" 
          onClose={() => setShowAIAssistant(false)} 
        />
      )}

      {/* New/Edit Candidate Form */}
      {showNewCandidateForm && (
        <NewCandidateForm
          onClose={() => {
            setShowNewCandidateForm(false);
            setSelectedCandidate(null);
          }}
          onSubmit={formMode === 'create' ? handleCreateCandidate : handleUpdateCandidate}
          initialData={selectedCandidate || undefined}
          mode={formMode}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && candidateToDelete && (
        <DeleteCandidateModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setCandidateToDelete(null);
          }}
          onConfirm={handleDeleteConfirmed}
          candidateName={`${candidateToDelete.firstName} ${candidateToDelete.lastName}`}
        />
      )}
    </div>
  );
};

export default Candidates;