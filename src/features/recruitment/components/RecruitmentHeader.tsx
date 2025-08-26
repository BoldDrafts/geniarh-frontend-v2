// components/RecruitmentHeader.tsx
import React from 'react';
import {
  BarChart3,
  BrainCircuit,
  FileText,
  Plus,
  RefreshCw
} from 'lucide-react';
import { LoadingButton } from '../../../shared/components/LoadingButton';

interface RecruitmentHeaderProps {
  viewMode: 'list' | 'analytics';
  isRefreshing: boolean;
  isCreating: boolean;
  isLoadingRecruitments: boolean;
  onViewModeChange: (mode: 'list' | 'analytics') => void;
  onRefresh: () => void;
  onShowAIAssistant: () => void;
  onCreateNew: () => void;
}

const RecruitmentHeader: React.FC<RecruitmentHeaderProps> = ({
  viewMode,
  isRefreshing,
  isCreating,
  isLoadingRecruitments,
  onViewModeChange,
  onRefresh,
  onShowAIAssistant,
  onCreateNew
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Recruitment</h1>
        <p className="text-gray-500 mt-1">
          Manage your recruitment processes
          {isLoadingRecruitments && (
            <span className="ml-2 text-blue-600 font-medium">• Loading...</span>
          )}
        </p>
      </div>
      
      <div className="flex mt-3 sm:mt-0 space-x-3">        
        {/* Refresh Button */}
        <LoadingButton
          onClick={onRefresh}
          loading={isRefreshing}
          loadingText="Refreshing..."
          variant="secondary"
          className="flex items-center justify-center p-2 bg-white border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50"
          title="Refresh Data"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </LoadingButton>
      </div>
    </div>
  );
};

export default RecruitmentHeader;