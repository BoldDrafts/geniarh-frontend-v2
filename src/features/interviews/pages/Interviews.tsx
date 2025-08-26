import { BrainCircuit, Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import AIAssistantPanel from '../../../shared/components/AIAssistantPanel';
import InterviewDetail from '../components/InterviewDetail';
import InterviewFilters from '../components/InterviewFilters';
import InterviewsTable from '../components/InterviewsTable';
import { Interview, LegacyInterview } from '../types/interview';

// Interview service/API calls

const Interviews: React.FC = () => {
  // State management
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load interviews on component mount
  useEffect(() => {
    loadInterviews();
  }, []);

  // Load interviews from API
  const loadInterviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Convert legacy data to new format for now
      const legacyInterviews: LegacyInterview[] = [
        {
          id: 'int-1',
          candidateName: 'Michael Rodriguez',
          candidatePhoto: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          position: 'Senior Frontend Developer',
          date: '2024-04-28',
          time: '10:00 AM',
          status: 'scheduled',
          type: 'technical',
          interviewers: ['John Smith', 'Sarah Johnson'],
          candidateMatchScore: 92
        },
        {
          id: 'int-2',
          candidateName: 'Sarah Johnson',
          candidatePhoto: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          position: 'UX Designer',
          date: '2024-04-29',
          time: '2:30 PM',
          status: 'scheduled',
          type: 'cultural',
          interviewers: ['Emily Williams'],
          candidateMatchScore: 88
        },
        {
          id: 'int-3',
          candidateName: 'David Li',
          candidatePhoto: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          position: 'DevOps Engineer',
          date: '2024-04-27',
          time: '11:00 AM',
          status: 'scheduled',
          type: 'ai',
          interviewers: [],
          candidateMatchScore: 78
        },
        {
          id: 'int-4',
          candidateName: 'Emily Wilson',
          candidatePhoto: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          position: 'Product Manager',
          date: '2024-04-25',
          time: '3:00 PM',
          status: 'completed',
          type: 'hr',
          interviewers: ['Robert Chen'],
          candidateMatchScore: 85
        },
        {
          id: 'int-5',
          candidateName: 'Robert Chen',
          candidatePhoto: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          position: 'Full Stack Engineer',
          date: '2024-04-26',
          time: '1:00 PM',
          status: 'completed',
          type: 'technical',
          interviewers: ['John Smith', 'Sarah Johnson'],
          candidateMatchScore: 82
        },
        {
          id: 'int-6',
          candidateName: 'Sofia Martinez',
          candidatePhoto: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          position: 'UI Designer',
          date: '2024-04-30',
          time: '11:30 AM',
          status: 'pending',
          type: 'cultural',
          interviewers: ['Emily Williams'],
          candidateMatchScore: 91
        }
      ];

      // Convert legacy format to new format
      const convertedInterviews: Interview[] = legacyInterviews.map(legacy => ({
        id: legacy.id,
        recruitmentId: `req-${legacy.id}`, // Mock recruitment ID
        type: legacy.type === 'technical' ? 'Technical' : 
              legacy.type === 'hr' ? 'Phone' : 
              legacy.type === 'cultural' ? 'Panel' : 'Video',
        status: legacy.status === 'scheduled' ? 'Scheduled' :
                legacy.status === 'completed' ? 'Completed' :
                legacy.status === 'canceled' ? 'Cancelled' : 'Confirmed',
        scheduledDateTime: `${legacy.date}T${convertTimeToISO(legacy.time)}`,
        duration: 45,
        participants: legacy.interviewers.map((interviewer, index) => ({
          id: `participant-${legacy.id}-${index}`,
          name: interviewer,
          email: `${interviewer.toLowerCase().replace(' ', '.')}@company.com`,
          role: 'Interviewer' as const,
          isRequired: true,
          status: 'Confirmed' as const
        })),
        // Legacy compatibility fields
        candidateName: legacy.candidateName,
        candidatePhoto: legacy.candidatePhoto,
        position: legacy.position,
        date: legacy.date,
        time: legacy.time,
        interviewers: legacy.interviewers,
        candidateMatchScore: legacy.candidateMatchScore
      }));

      setInterviews(convertedInterviews);
    } catch (err) {
      setError('Failed to load interviews. Please try again.');
      console.error('Error loading interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert time string to ISO format
  const convertTimeToISO = (timeStr: string): string => {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':');
    let hour24 = parseInt(hours);
    
    if (period === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hour24 === 12) {
      hour24 = 0;
    }
    
    return `${hour24.toString().padStart(2, '0')}:${minutes}:00Z`;
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
    setSelectedInterview(interview);
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
        // Handle join/start interview
        break;
      case 'feedback':
        // Handle view feedback
        break;
      case 'reschedule':
        // Handle reschedule
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
        onTabChange={handleTabChange}
        onSearchChange={handleSearchChange}
        onFilterToggle={handleFilterToggle}
        onFiltersApply={handleFiltersApply}
        onFiltersReset={handleFiltersReset}
      />

      {/* Interviews Table */}
      <InterviewsTable
        interviews={filteredInterviews}
        onInterviewSelect={handleInterviewSelect}
        onActionClick={handleActionClick}
        loading={loading}
      />

      {/* Interview Detail Panel */}
      {selectedInterview && (
        <InterviewDetail
          interview={selectedInterview}
          onClose={() => setSelectedInterview(null)}
          onAction={handleDetailAction}
          onShowAIAssistant={() => setShowAIAssistant(true)}
        />
      )}

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