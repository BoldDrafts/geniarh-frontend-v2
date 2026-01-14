// components/RecruitmentTable.tsx
import React from 'react';
import { FileText, Plus } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { LoadingButton } from './LoadingButton';
import LoadingOverlay from './LoadingOverlay';
import RecruitmentTableRow from './RecruitmentTableRow';
import { RecruitmentProcess } from '../types/recruitment';

interface RecruitmentPagination {
  current: number;
  limit: number;
  total: number;
  pages: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

interface RecruitmentTableProps {
  processes: RecruitmentProcess[];
  selectedRecruitment: RecruitmentProcess | null;
  isLoading: boolean;
  isFullScreenLoading: boolean;
  searchQuery: string;
  activeTab: string;
  pagination: RecruitmentPagination;
  onRowClick: (process: RecruitmentProcess) => void;
  onEdit: (process: RecruitmentProcess, e: React.MouseEvent) => void;
  onDelete: (process: RecruitmentProcess, e: React.MouseEvent) => void;
  onCreateNew: () => void;
  onPageChange: (page: number) => void;
  isLoadingFn: (key: string) => boolean;
  isCreating: boolean;
}

const RecruitmentTable: React.FC<RecruitmentTableProps> = ({
  processes,
  selectedRecruitment,
  isLoading,
  isFullScreenLoading,
  searchQuery,
  activeTab,
  pagination,
  onRowClick,
  onEdit,
  onDelete,
  onCreateNew,
  onPageChange,
  isLoadingFn,
  isCreating
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" text="Loading recruitment processes..." />
        </div>
      </div>
    );
  }

  if (processes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No recruitment processes found
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery 
              ? `No results found for "${searchQuery}"`
              : `No ${activeTab.toLowerCase()} recruitment processes found`
            }
          </p>
          <LoadingButton
            onClick={onCreateNew}
            loading={isCreating}
            loadingText="Creating..."
            variant="primary"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Recruitment
          </LoadingButton>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">
      <LoadingOverlay show={isLoading} text="Loading recruitment processes..." />
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Publications
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Metrics
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {processes.map((process) => (
              <RecruitmentTableRow
                key={process.id}
                process={process}
                isSelected={selectedRecruitment?.id === process.id}
                isFullScreenLoading={isFullScreenLoading}
                onRowClick={onRowClick}
                onEdit={onEdit}
                onDelete={onDelete}
                isLoading={isLoadingFn}
              />
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <LoadingButton
              onClick={() => onPageChange(pagination.current - 1)}
              disabled={!pagination.hasPrevious}
              loading={isLoading}
              variant="secondary"
              size="sm"
            >
              Previous
            </LoadingButton>
            <LoadingButton
              onClick={() => onPageChange(pagination.current + 1)}
              disabled={!pagination.hasNext}
              loading={isLoading}
              variant="secondary"
              size="sm"
            >
              Next
            </LoadingButton>
          </div>
          
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{((pagination.current - 1) * pagination.limit) + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(pagination.current * pagination.limit, pagination.total)}
                </span>{' '}
                of <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <LoadingButton
                  onClick={() => onPageChange(pagination.current - 1)}
                  disabled={!pagination.hasPrevious}
                  loading={isLoading}
                  variant="secondary"
                  size="sm"
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Previous
                </LoadingButton>
                
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const page = Math.max(1, pagination.current - 2) + i;
                  if (page > pagination.pages) return null;
                  return (
                    <button
                      key={page}
                      onClick={() => onPageChange(page)}
                      disabled={isLoading}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors disabled:opacity-50 ${
                        page === pagination.current
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                <LoadingButton
                  onClick={() => onPageChange(pagination.current + 1)}
                  disabled={!pagination.hasNext}
                  loading={isLoading}
                  variant="secondary"
                  size="sm"
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Next
                </LoadingButton>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruitmentTable;