import { BrainCircuit, Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AIAssistantPanel from '../../../shared/components/AIAssistantPanel';
import { interviewService } from '../api/interviewService';
import InterviewDetail from '../components/InterviewDetail';
import InterviewEditModal from '../components/InterviewEditModal';
import InterviewFilters from '../components/InterviewFilters';
import InterviewViewContainer from '../components/InterviewViewContainer';
import { Interview } from '../types/interview';

const Interviews: React.FC = () => {
  const navigate = useNavigate();
  
  // State management
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');

  // Load interviews on component mount
  useEffect(() => {
    loadInterviews();
  }, []);

  // Load interviews from API
  const loadInterviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load interviews from service
      const interviewsData = await interviewService.getInterviews();
      setInterviews(interviewsData);
    } catch (err) {
      setError('Failed to load interviews. Please try again.');
      console.error('Error loading interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter interviews based on active tab and search query
  const filteredInterviews = interviews.filter(interview => {
    // Filter by active tab - using legacy status for now
    const legacyStatus = interview.status === 'Scheduled' || interview.status === 'Confirmed' ? 'scheduled' :
                        interview.status === 'Completed' ? 'completed' :
                        interview.status === 'Cancelled' ? 'canceled' : 'pending';
    
    if (activeTab === 'upcoming' && (legacyStatus !== 'scheduled' && legacyStatus !== 'pending')) return false;
    if (activeTab === 'completed' && legacyStatus !== 'completed') return false;
    if (activeTab === 'canceled' && legacyStatus !== 'canceled') return false;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        interview.candidateName?.toLowerCase().includes(query) ||
        interview.position?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Handle interview selection
  const handleInterviewSelect = (interview: Interview) => {
    // Navigate to interview detail page
    navigate(`/interviews/${interview.id}`);
  };

  // Handle filter changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterToggle = () => {
    setFilterOpen(!filterOpen);
  };

  const handleFiltersApply = (filters: any) => {
    console.log('Applying filters:', filters);
    // TODO: Implement filter application
    setFilterOpen(false);
  };

  const handleFiltersReset = () => {
    console.log('Resetting filters');
    // TODO: Implement filter reset
  };

  // Handle table actions
  const handleActionClick = (action: string, interview: Interview, event: React.MouseEvent) => {
    event.stopPropagation();
    console.log(`Action: ${action}`, interview);
    
    switch (action) {
      case 'join':
        toast.success('Joining interview...');
        break;
      case 'feedback':
        toast.info('Opening feedback...');
        break;
      case 'reschedule':
        toast.info('Reschedule functionality coming soon');
        break;
      default:
        break;
    }
  };

  // Handle detail panel actions
  const handleDetailAction = (action: string, interview: Interview) => {
    console.log(`Detail action: ${action}`, interview);
    
    switch (action) {
      case 'join':
        // Handle join interview
        break;
      case 'reschedule':
        // Handle reschedule interview
        break;
      case 'approve':
        // Handle approve candidate
        break;
      case 'reject':
        // Handle reject candidate
        break;
      case 'sendReminder':
        // Handle send reminder
        break;
      case 'scheduleNext':
        // Handle schedule next round
        break;
      case 'cancel':
        // Handle cancel interview
        break;
      default:
        break;
    }
  };

  // Handle create new interview
  const handleCreateInterview = () => {
    console.log('Creating new interview');
    // TODO: Implement create interview modal/flow
  };

  // Handle edit interview
  const handleEditInterview = () => {
    if (selectedInterview) {
      setShowEditModal(true);
    }
  };

  // Handle save interview changes
  const handleSaveInterview = async (updatedData: Partial<Interview>) => {
    if (!selectedInterview) return;

    try {
      setEditLoading(true);
      
      // Update interview via service
      const updatedInterview = await interviewService.updateInterview(
        selectedInterview.id, 
        updatedData
      );

      if (updatedInterview) {
        // Update local state
        setInterviews(prev => 
          prev.map(interview => 
            interview.id === selectedInterview.id ? updatedInterview : interview
          )
        );
        
        // Update selected interview
        setSelectedInterview(updatedInterview);
        
        // Close modal and show success message
        setShowEditModal(false);
        toast.success('Interview updated successfully');
      }
    } catch (error) {
      console.error('Error updating interview:', error);
      toast.error('Failed to update interview. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  // Handle view mode change
  const handleViewModeChange = (mode: 'table' | 'calendar') => {
    setViewMode(mode);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-4">
          <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading interviews</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button 
          onClick={loadInterviews}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interviews</h1>
          <p className="text-gray-500 mt-1">Schedule and manage candidate interviews</p>
        </div>
        <div className="flex mt-3 sm:mt-0 space-x-3">
          <button
            onClick={() => setShowAIAssistant(true)}
            className="flex items-center justify-center px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
          >
            <BrainCircuit className="mr-2 h-4 w-4" />
            AI Assistant
          </button>
          <button 
            onClick={handleCreateInterview}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="mr-2 h-4 w-4" />
            Schedule Interview
          </button>
        </div>
      </div>

      {/* Filters */}
      <InterviewFilters
        activeTab={activeTab}
        searchQuery={searchQuery}
        filterOpen={filterOpen}
        viewMode={viewMode}
        onTabChange={handleTabChange}
        onSearchChange={handleSearchChange}
        onFilterToggle={handleFilterToggle}
        onViewModeChange={handleViewModeChange}
        onFiltersApply={handleFiltersApply}
        onFiltersReset={handleFiltersReset}
      />

      {/* Interviews View Container */}
      <InterviewViewContainer
        interviews={filteredInterviews}
        onInterviewSelect={handleInterviewSelect}
        onActionClick={handleActionClick}
        loading={loading}
        viewMode={viewMode}
      />

      {/* AI Assistant Panel */}
      {showAIAssistant && (
        <AIAssistantPanel 
          context="interviews" 
          onClose={() => setShowAIAssistant(false)} 
        />
      )}
    </div>
  );
};

export default Interviews;