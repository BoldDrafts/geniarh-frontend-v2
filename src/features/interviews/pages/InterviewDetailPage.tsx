import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { interviewService } from '../api/interviewService';
import InterviewDetail from '../components/InterviewDetail';
import InterviewEditModal from '../components/InterviewEditModal';
import AIAssistantPanel from '../../../shared/components/AIAssistantPanel';
import { Interview } from '../types/interview';

const InterviewDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // Load interview on component mount
  useEffect(() => {
    if (id) {
      loadInterview(id);
    } else {
      setError('Interview ID is required');
      setLoading(false);
    }
  }, [id]);

  // Load interview from API
  const loadInterview = async (interviewId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const interviewData = await interviewService.getInterviewById(interviewId);
      
      if (interviewData) {
        setInterview(interviewData);
      } else {
        setError('Interview not found');
      }
    } catch (err) {
      setError('Failed to load interview. Please try again.');
      console.error('Error loading interview:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate('/interviews');
  };

  // Handle detail panel actions
  const handleDetailAction = (action: string, interview: Interview) => {
    console.log(`Detail action: ${action}`, interview);
    
    switch (action) {
      case 'join':
        toast.success('Joining interview...');
        break;
      case 'reschedule':
        toast.info('Reschedule functionality coming soon');
        break;
      case 'approve':
        toast.success('Candidate approved');
        break;
      case 'reject':
        toast.error('Candidate rejected');
        break;
      case 'sendReminder':
        toast.success('Reminder sent');
        break;
      case 'scheduleNext':
        toast.info('Scheduling next round...');
        break;
      case 'cancel':
        toast.warning('Interview cancelled');
        break;
      default:
        break;
    }
  };

  // Handle edit interview
  const handleEditInterview = () => {
    if (interview) {
      setShowEditModal(true);
    }
  };

  // Handle save interview changes
  const handleSaveInterview = async (updatedData: Partial<Interview>) => {
    if (!interview) return;

    try {
      setEditLoading(true);
      
      // Update interview via service
      const updatedInterview = await interviewService.updateInterview(
        interview.id, 
        updatedData
      );

      if (updatedInterview) {
        // Update local state
        setInterview(updatedInterview);
        
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

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading interview details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-4">
          <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading interview</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <div className="space-x-3">
          <button 
            onClick={() => id && loadInterview(id)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
          <button 
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Interviews
          </button>
        </div>
      </div>
    );
  }

  // No interview found
  if (!interview) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Interview not found</h3>
        <p className="text-gray-500 mb-4">The interview you're looking for doesn't exist or has been removed.</p>
        <button 
          onClick={handleBack}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Interviews
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Interviews
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interview Details</h1>
          <p className="text-gray-500 mt-1">
            {interview.title}
          </p>
        </div>
      </div>

      {/* Interview Detail Component */}
      <InterviewDetail
        interview={interview}
        onClose={handleBack}
        onAction={handleDetailAction}
        onShowAIAssistant={() => setShowAIAssistant(true)}
        onEdit={handleEditInterview}
      />

      {/* Interview Edit Modal */}
      {showEditModal && (
        <InterviewEditModal
          isOpen={showEditModal}
          interview={interview}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveInterview}
          loading={editLoading}
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

export default InterviewDetailPage;