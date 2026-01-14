// components/RecruitmentSidebar.tsx
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  Edit3,
  Search,
  Users
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { LoadingButton } from '../../../shared/components/LoadingButton';
import { createLoadingKey, RECRUITMENT_LOADING_KEYS } from '../../../shared/utils/loadingKeys';
import { RecruitmentProcess } from '../types/recruitment';
import { getCandidateQualityIndicator, getRecruitmentHealthScore } from '../utils/recruitmentUtils';
import { aiService } from '../../../shared/api/aiService';

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
  const [isPromptSectionOpen, setIsPromptSectionOpen] = useState(false);
  const [generatingPrompt, setGeneratingPrompt] = useState(false);
  const [linkedinPrompt, setLinkedinPrompt] = useState<string>('');

  const handleShare = () => {
    toast.success('Share functionality to be implemented');
  };

  // Función para preparar los datos para la API
  const preparePromptData = (recruitment: RecruitmentProcess) => {
    const { requirement } = recruitment;
    
    return {
      title: requirement.title,
      department: requirement.department,
      experienceLevel: requirement.experienceLevel,
      skills: requirement.skills,
      softSkills: requirement.softSkills || [],
      description: requirement.description || '',
      type: 'description' as const,
      // Datos adicionales que podrían ser útiles para el prompt
      workType: requirement.workType
    };
  };

  const generateLinkedInPrompt = async () => {
    try {
      setGeneratingPrompt(true);
      
      // Preparar los datos para enviar a la API
      const promptData = preparePromptData(recruitment);
      
      // Llamar a la API createPrompt del aiService
      const generatedPrompt = await aiService.createPrompt({
        ...promptData,
        // Agregar contexto específico para LinkedIn Recruiter
        description: `Generate a comprehensive LinkedIn Recruiter search prompt for finding candidates for this ${promptData.title} position. Include boolean search strings, skills filters, experience requirements, location preferences, and a sample outreach message template.`
      });
      
      setLinkedinPrompt(generatedPrompt);
      toast.success('LinkedIn Recruiter prompt generated successfully!');
      
    } catch (error) {
      console.error('Error generating LinkedIn prompt:', error);
      toast.error('Failed to generate LinkedIn prompt. Please try again.');
    } finally {
      setGeneratingPrompt(false);
    }
  };

  const copyPromptToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(linkedinPrompt);
      toast.success('Prompt copied to clipboard!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Failed to copy to clipboard');
    }
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

      {/* Job Prompt Recruitment Section - Collapsible */}
      <div className="rounded-lg border border-gray-200 mt-4">
        <button
          onClick={() => setIsPromptSectionOpen(!isPromptSectionOpen)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors rounded-t-lg"
        >
          <h3 className="text-md font-medium text-gray-900">Job Prompt Recruitment</h3>
          {isPromptSectionOpen ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>
        
        {isPromptSectionOpen && (
          <div className="px-4 pb-4 border-t border-gray-100">
            <div className="mt-3 space-y-4">
              <p className="text-sm text-gray-600">
                Generate a comprehensive search prompt for LinkedIn Recruiter to find qualified candidates for this position.
              </p>
              
              <div className="flex flex-col space-y-2">
                <LoadingButton
                  onClick={generateLinkedInPrompt}
                  loading={generatingPrompt}
                  loadingText="Generating..."
                  variant="primary"
                  className="w-full flex items-center justify-center px-4 py-2"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Generate LinkedIn Recruiter Prompt
                </LoadingButton>
                
                {linkedinPrompt && (
                  <button
                    onClick={copyPromptToClipboard}
                    className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy to Clipboard
                  </button>
                )}
              </div>
              
              {linkedinPrompt && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">Generated Prompt</h4>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      Ready to use
                    </span>
                  </div>
                  <div className="bg-white rounded border p-2 max-h-40 overflow-y-auto">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                      {linkedinPrompt}
                    </pre>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    <p>💡 <strong>Tip:</strong> Copy this prompt and paste it into LinkedIn Recruiter's search filters and boolean search to find qualified candidates.</p>
                  </div>
                </div>
              )}
              
              {!linkedinPrompt && !generatingPrompt && (
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-start">
                    <Search className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">LinkedIn Recruiter Search</h4>
                      <p className="text-xs text-blue-700 mt-1">
                        Click the button above to generate a comprehensive search prompt that includes:
                      </p>
                      <ul className="text-xs text-blue-700 mt-1 space-y-1">
                        <li>• Boolean search strings with relevant keywords</li>
                        <li>• Skills and experience level filters</li>
                        <li>• Location and work preferences</li>
                        <li>• Industry and company size filters</li>
                        <li>• Sample outreach message template</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default RecruitmentSidebar;