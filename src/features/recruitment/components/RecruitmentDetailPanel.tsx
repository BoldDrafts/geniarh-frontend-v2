// components/RecruitmentDetailPanel.tsx
import { ArrowUpRight, X } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import CandidatesList from '../../../features/candidate/components/CandidatesList';
import { LoadingButton } from '../../../shared/components/LoadingButton';
import { createLoadingKey, RECRUITMENT_LOADING_KEYS } from '../../../shared/utils/loadingKeys';
import { PublicationData, RecruitmentProcess } from '../types/recruitment';
import {
    formatDate,
    getPlatformColor,
    getPublicationStatusColor,
    getRecruitmentStages,
    getStatusColor
} from '../utils/recruitmentUtils';
import StageProgress from './StageProgress';
import RecruitmentSidebar from './RecruitmentSidebar';

interface RecruitmentDetailPanelProps {
  recruitment: RecruitmentProcess;
  onClose: () => void;
  onEdit: () => void;
  onStatusChange: (processId: string, newStatus: any) => void;
  onCreatePublication: (data: PublicationData) => void;
  onPublicationAction: (action: 'publish' | 'suspend', publicationId: string) => void;
  onShowLinkedInModal: () => void;
  isLoading: (key: string) => boolean;
}

const RecruitmentDetailPanel: React.FC<RecruitmentDetailPanelProps> = ({
  recruitment,
  onClose,
  onEdit,
  onStatusChange,
  onCreatePublication,
  onPublicationAction,
  onShowLinkedInModal,
  isLoading
}) => {
  const navigate = useNavigate();

  return (
    <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <h2 className="text-lg font-medium text-gray-900">Recruitment Details</h2>
            <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(recruitment.status)}`}>
              {recruitment.status}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {/* Position Details */}
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-900 mb-3">Position Details</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Experience Level</div>
                    <div className="text-sm font-medium text-gray-900">
                      {recruitment.requirement.experienceLevel}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Employment Type</div>
                    <div className="text-sm font-medium text-gray-900">
                      {recruitment.requirement.employmentType}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Salary Range</div>
                    <div className="text-sm font-medium text-gray-900">
                      {recruitment.requirement.salaryCurrency} {recruitment.requirement.salaryMin?.toLocaleString()} - {recruitment.requirement.salaryMax?.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Timeframe</div>
                    <div className="text-sm font-medium text-gray-900">
                      {recruitment.requirement.timeframe}
                    </div>
                  </div>
                </div>
                
                {recruitment.requirement.skills.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-xs font-medium text-gray-700 mb-2">Technical Skills</div>
                    <div className="flex flex-wrap gap-1">
                      {recruitment.requirement.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              
                {recruitment.requirement.softSkills && recruitment.requirement.softSkills.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-xs font-medium text-gray-700 mb-2">Soft Skills</h4>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {recruitment.requirement.softSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <h3 className="text-md font-medium text-gray-900">Recruitment Progress</h3>
                <div className="ml-auto flex items-center">
                  <span className="text-sm font-medium text-gray-700 mr-2">
                    {recruitment.metrics.qualifiedCandidates} / {recruitment.metrics.totalCandidates} Candidates
                  </span>
                </div>
              </div>
              
              <StageProgress stages={getRecruitmentStages(recruitment)} />
            </div>
            
            {/* Publications */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-md font-medium text-gray-900">Publications</h3>
                <div className="flex space-x-2">
                  {(!recruitment.publications || recruitment.publications.length === 0) && (
                    <LoadingButton
                      onClick={onShowLinkedInModal}
                      loading={isLoading(createLoadingKey(RECRUITMENT_LOADING_KEYS.CREATE_PUBLICATION, recruitment.id))}
                      loadingText="Creating..."
                      variant="primary"
                      size="sm"
                      className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      LinkedIn
                    </LoadingButton>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                  <div className={"grid" + (recruitment.publications && recruitment.publications.length > 1) ? 'grid-cols-2 gap-4' : '' }>
                  {recruitment.publications && recruitment.publications.length > 0 ? (
                    recruitment.publications.map((pub) => (
                      <div key={pub.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPlatformColor(pub.platform)}`}>
                              {pub.platform}
                            </span>
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${getPublicationStatusColor(pub.status)}`}>
                              {pub.status}
                            </span>
                            <span className="ml-2 text-sm text-gray-500">
                              {pub.publishedAt ? formatDate(pub.publishedAt) : 'Draft'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {pub.url && (
                              <a 
                                href={pub.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                <ArrowUpRight className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <div className="text-sm text-gray-500">Views</div>
                            <div className="text-lg font-medium text-gray-900">{pub.views || 0}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Applications</div>
                            <div className="text-lg font-medium text-gray-900">{pub.applications || 0}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Engagement</div>
                            <div className="text-sm text-gray-900">
                              {(pub.engagement?.likes || 0) + (pub.engagement?.shares || 0) + (pub.engagement?.comments || 0)} interactions
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                      <p className="text-gray-500 mb-2">No publications yet</p>
                      <LoadingButton
                        onClick={onShowLinkedInModal}
                        loading={isLoading(createLoadingKey(RECRUITMENT_LOADING_KEYS.CREATE_PUBLICATION, recruitment.id))}
                        loadingText="Creating..."
                        variant="secondary"
                        size="sm"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Create your first publication
                      </LoadingButton>
                    </div>
                  )}
                  </div>
              </div>
            </div>

            {/* Candidates */}
            <CandidatesList 
              candidates={recruitment.candidates || []} 
              onAddCandidate={() => {
                navigate(`/recruitment/${recruitment.id}/candidates`);
              }}
            />
          </div>
          
          {/* Sidebar */}
          <RecruitmentSidebar
            recruitment={recruitment}
            onEdit={onEdit}
            onStatusChange={onStatusChange}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default RecruitmentDetailPanel;