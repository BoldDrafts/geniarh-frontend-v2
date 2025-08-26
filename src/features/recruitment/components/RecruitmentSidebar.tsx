// components/RecruitmentSidebar.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BrainCircuit,
  Users,
  Share2,
  Edit3,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { LoadingButton } from '../../../shared/components/LoadingButton';
import { RecruitmentProcess } from '../types/recruitment';
import { getCandidateQualityIndicator, getRecruitmentHealthScore } from '../utils/recruitmentUtils';
import { createLoadingKey, RECRUITMENT_LOADING_KEYS } from '../../../shared/utils/loadingKeys';

interface RecruitmentSidebarProps {
  recruitment: RecruitmentProcess;
  onEdit: () => void;
  onStatusChange: (processId: string, newStatus: any) => void;
  isLoading: (key: string) => boolean;
}

const RecruitmentSidebar: React.FC<RecruitmentSidebarProps> = ({
  recruitment,
  onEdit,
  onStatusChange,
  isLoading
}) => {
  const navigate = useNavigate();
  const qualityIndicator = getCandidateQualityIndicator(recruitment);
  const healthScore = getRecruitmentHealthScore(recruitment);

  const handleShare = () => {
    toast.success('Share functionality to be implemented');
  };

  const getHealthScoreColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div>
      {/* AI Insights */}
      { false && (<div className="bg-blue-50 rounded-lg border border-blue-100 p-4 mb-6">
        <div className="flex items-center mb-3">
          <BrainCircuit className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-md font-medium text-blue-800">AI Insights</h3>
        </div>
        
        <div className="text-sm text-blue-700 space-y-4">
          {/* Health Score */}
          <div>
            <p className="font-medium">Recruitment Health Score:</p>
            <div className="mt-1 flex items-center">
              <div className={`text-lg font-bold ${getHealthScoreColor(healthScore.status)}`}>
                {healthScore.score}/100
              </div>
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                healthScore.status === 'excellent' ? 'bg-green-100 text-green-800' :
                healthScore.status === 'good' ? 'bg-blue-100 text-blue-800' :
                healthScore.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {healthScore.status.charAt(0).toUpperCase() + healthScore.status.slice(1)}
              </span>
            </div>
          </div>
          
          {/* Candidate Quality */}
          <div>
            <p className="font-medium">Candidate Pool Analysis:</p>
            <p className="mt-1">
              {recruitment.metrics.totalCandidates > 0 
                ? `${qualityIndicator.message} (${qualityIndicator.percentage}% qualified). ${
                    qualityIndicator.quality === 'high' 
                      ? 'Consider expanding reach to passive candidates.' 
                      : 'Consider refining job requirements.'
                  }`
                : 'No candidates yet. Consider promoting the job posting on additional platforms.'
              }
            </p>
          </div>
          
          {/* Performance Insights */}
          <div>
            <p className="font-medium">Performance Insights:</p>
            <p className="mt-1">
              {recruitment.metrics.interviewsScheduled > 0 
                ? `${recruitment.metrics.interviewsScheduled} interviews scheduled. ${
                    recruitment.metrics.offersExtended > 0 
                      ? `${recruitment.metrics.offerAcceptanceRate.toFixed(0)}% offer acceptance rate.` 
                      : 'Focus on moving candidates through the pipeline.'
                  }`
                : 'No interviews scheduled yet. Review candidate pipeline.'
              }
            </p>
          </div>
          
          {/* Recommendations */}
          {healthScore.recommendations.length > 0 && (
            <div>
              <p className="font-medium">Recommendations:</p>
              <ul className="mt-1 space-y-1">
                {healthScore.recommendations.slice(0, 2).map((rec, index) => (
                  <li key={index} className="text-xs">• {rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>) }
      
      {/* Quick Actions */}
      <div className="rounded-lg border border-gray-200 p-4">
        <h3 className="text-md font-medium text-gray-900 mb-3">Quick Actions</h3>
        
        <div className="space-y-3">
          <LoadingButton
            onClick={() => navigate(`/recruitment/${recruitment.id}/candidates`)}
            variant="primary"
            className="w-full flex items-center justify-center px-4 py-2"
          >
            <Users className="mr-2 h-4 w-4" />
            View All Candidates
          </LoadingButton>
          
          {/*<button 
            onClick={handleShare}
            className="w-full flex items-center justify-center px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors text-sm"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share Job Posting
          </button>*/}
          
          <LoadingButton
            onClick={onEdit}
            loading={isLoading(createLoadingKey(RECRUITMENT_LOADING_KEYS.UPDATE_RECRUITMENT, recruitment.id))}
            loadingText="Loading..."
            variant="secondary"
            className="w-full flex items-center justify-center px-4 py-2"
          >
            <Edit3 className="mr-2 h-4 w-4" />
            Edit Details
          </LoadingButton>
          
          {/* Status Change Actions */}
          {recruitment.status === 'Active' ? (
            <LoadingButton
              onClick={() => onStatusChange(recruitment.id, 'Paused')}
              loading={isLoading(createLoadingKey(RECRUITMENT_LOADING_KEYS.UPDATE_STATUS, recruitment.id))}
              loadingText="Pausing..."
              variant="secondary"
              className="w-full flex items-center justify-center px-4 py-2 bg-white border border-yellow-600 text-yellow-600 rounded-md hover:bg-yellow-50"
            >
              <Clock className="mr-2 h-4 w-4" />
              Pause Recruitment
            </LoadingButton>
          ) : recruitment.status === 'Paused' ? (
            <LoadingButton
              onClick={() => onStatusChange(recruitment.id, 'Active')}
              loading={isLoading(createLoadingKey(RECRUITMENT_LOADING_KEYS.UPDATE_STATUS, recruitment.id))}
              loadingText="Resuming..."
              variant="secondary"
              className="w-full flex items-center justify-center px-4 py-2 bg-white border border-green-600 text-green-600 rounded-md hover:bg-green-50"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Resume Recruitment
            </LoadingButton>
          ) : null}
          
          {recruitment.status !== 'Completed' && recruitment.status !== 'Cancelled' && (
            <LoadingButton
              onClick={() => onStatusChange(recruitment.id, 'Completed')}
              loading={isLoading(createLoadingKey(RECRUITMENT_LOADING_KEYS.UPDATE_STATUS, recruitment.id))}
              loadingText="Completing..."
              variant="secondary"
              className="w-full flex items-center justify-center px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Complete Recruitment
            </LoadingButton>
          )}
          
          {recruitment.status !== 'Cancelled' && (
            <LoadingButton
              onClick={() => onStatusChange(recruitment.id, 'Cancelled')}
              loading={isLoading(createLoadingKey(RECRUITMENT_LOADING_KEYS.UPDATE_STATUS, recruitment.id))}
              loadingText="Cancelling..."
              variant="danger"
              className="w-full flex items-center justify-center px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50"
            >
              <AlertCircle className="mr-2 h-4 w-4" />
              Cancel Recruitment
            </LoadingButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruitmentSidebar;