// components/RecruitmentTableRow.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FileText,
  Users,
  Calendar,
  Edit3,
  Share2,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { LoadingSpinner } from '../../../shared/components/LoadingSpinner';
import { RecruitmentProcess } from '../types/recruitment';
import { 
  formatDate, 
  getStatusColor, 
  getPlatformColor 
} from '../utils/recruitmentUtils';
import { createLoadingKey, RECRUITMENT_LOADING_KEYS } from '../../../shared/utils/loadingKeys';

interface RecruitmentTableRowProps {
  process: RecruitmentProcess;
  isSelected: boolean;
  isFullScreenLoading: boolean;
  onRowClick: (process: RecruitmentProcess) => void;
  onEdit: (process: RecruitmentProcess, e: React.MouseEvent) => void;
  onDelete: (process: RecruitmentProcess, e: React.MouseEvent) => void;
  isLoading: (key: string) => boolean;
}

const RecruitmentTableRow: React.FC<RecruitmentTableRowProps> = ({
  process,
  isSelected,
  isFullScreenLoading,
  onRowClick,
  onEdit,
  onDelete,
  isLoading
}) => {
  const navigate = useNavigate();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'Paused': return <Clock className="h-4 w-4 mr-1" />;
      case 'Completed': return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'Cancelled': return <AlertCircle className="h-4 w-4 mr-1" />;
      default: return <Clock className="h-4 w-4 mr-1" />;
    }
  };

  const handleNavigateToCandidates = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/recruitment/${process.id}/candidates`);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success('Share functionality to be implemented');
  };

  return (
    <tr 
      className={`hover:bg-gray-50 cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50' : ''
      } ${isFullScreenLoading ? 'opacity-50 pointer-events-none' : ''}`}
      onClick={() => !isFullScreenLoading && onRowClick(process)}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <FileText className="h-5 w-5 text-blue-500 mr-3" />
          <div>
            <div className="text-sm font-medium text-gray-900">
              {process.requirement.title}
            </div>
            <div className="text-xs text-gray-500">
              Created {formatDate(process.timeline.created)}
            </div>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div>
          <div className="font-medium text-gray-900">
            {process.requirement.department}
          </div>
          <div className="text-xs text-gray-500">
            {process.requirement.priority} Priority · {process.requirement.workType}
          </div>
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col space-y-1">
          {process.publications?.length > 0 ? (
            process.publications.slice(0, 2).map((pub) => (
              <div key={pub.id} className="flex items-center text-sm">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPlatformColor(pub.platform)}`}>
                  {pub.platform}
                </span>
                <span className="ml-2 text-gray-500 text-xs">
                  {pub.views || 0}v / {pub.applications || 0}a
                </span>
              </div>
            ))
          ) : (
            <span className="text-sm text-gray-400">No publications</span>
          )}
          {process.publications?.length > 2 && (
            <span className="text-xs text-gray-400">
              +{process.publications.length - 2} more
            </span>
          )}
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center text-sm">
            <Users className="h-4 w-4 text-gray-400 mr-1" />
            <span className="text-gray-900 font-medium">
              {process.metrics.totalCandidates}
            </span>
            <span className="mx-1 text-gray-500">/</span>
            <span className="text-green-600">
              {process.metrics.qualifiedCandidates}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 text-gray-400 mr-1" />
            <span className="text-gray-900">
              {process.metrics.interviewsScheduled}
            </span>
            <span className="ml-1 text-gray-500 text-xs">interviews</span>
          </div>
          {process.metrics.offersExtended > 0 && (
            <div className="text-xs text-purple-600">
              {process.metrics.offersExtended} offers ({process.metrics.offerAcceptanceRate.toFixed(0)}% acceptance)
            </div>
          )}
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {isLoading(createLoadingKey(RECRUITMENT_LOADING_KEYS.UPDATE_STATUS, process.id)) && (
            <LoadingSpinner size="sm" className="mr-2" />
          )}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(process.status)}`}>
            {getStatusIcon(process.status)}
            {process.status}
          </span>
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex space-x-3">
          <button 
            onClick={handleNavigateToCandidates}
            className="text-blue-600 hover:text-blue-900 transition-colors"
            title="View candidates"
          >
            <Users className="h-4 w-4" />
          </button>

          <button 
            onClick={(e) => onEdit(process, e)}
            disabled={isLoading(createLoadingKey(RECRUITMENT_LOADING_KEYS.UPDATE_RECRUITMENT, process.id))}
            className="text-green-600 hover:text-green-900 transition-colors disabled:opacity-50"
            title="Edit recruitment"
          >
            {isLoading(createLoadingKey(RECRUITMENT_LOADING_KEYS.UPDATE_RECRUITMENT, process.id)) ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Edit3 className="h-4 w-4" />
            )}
          </button>

          <button 
            onClick={handleShare}
            className="text-purple-600 hover:text-purple-900 transition-colors"
            title="Share recruitment"
          >
            <Share2 className="h-4 w-4" />
          </button>

          {process.status == 'Cancelled' && (<button 
            onClick={(e) => onDelete(process, e)}
            disabled={isLoading(createLoadingKey(RECRUITMENT_LOADING_KEYS.DELETE_RECRUITMENT, process.id))}
            className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
            title="Delete recruitment"
          >
            {isLoading(createLoadingKey(RECRUITMENT_LOADING_KEYS.DELETE_RECRUITMENT, process.id)) ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>)}
        </div>
      </td>
    </tr>
  );
};

export default RecruitmentTableRow;