// components/RecruitmentFilters.tsx
import { Filter, Search } from 'lucide-react';
import React from 'react';
import { LoadingButton } from '../../../shared/components/LoadingButton';
import { RecruitmentFiltersType, RecruitmentStatus } from '../types/recruitment';

interface RecruitmentFiltersProps {
  activeTab: RecruitmentStatus;
  searchQuery: string;
  filters: RecruitmentFiltersType;
  filterOpen: boolean;
  isLoadingRecruitments: boolean;
  onTabChange: (tab: RecruitmentStatus) => void;
  onSearchChange: (query: string) => void;
  onFilterToggle: () => void;
  onFilterChange: (key: keyof RecruitmentFiltersType, value: any) => void;
  onResetFilters: () => void;
  onApplyFilters: (status: RecruitmentStatus) => Promise<void>;
}

const RecruitmentFilters: React.FC<RecruitmentFiltersProps> = ({
  activeTab,
  searchQuery,
  filters,
  filterOpen,
  isLoadingRecruitments,
  onTabChange,
  onSearchChange,
  onFilterToggle,
  onFilterChange,
  onResetFilters,
  onApplyFilters
}) => {
  const tabs: RecruitmentStatus[] = ['Active', 'Paused', 'Completed', 'Cancelled'];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between">
        {/* Tabs */}
        <div className="flex space-x-4 overflow-x-auto">
          {tabs.map((tab) => (
            <LoadingButton
              key={tab}
              onClick={() => onTabChange(tab)}
              loading={isLoadingRecruitments && activeTab !== tab}
              variant={activeTab === tab ? 'primary' : 'secondary'}
              size="sm"
              className={`px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab}
            </LoadingButton>
          ))}
        </div>
        
        {/* Search and Filter */}
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search recruitment..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          
          <button 
            onClick={onFilterToggle}
            className={`p-2 border rounded-md transition-colors ${
              filterOpen 
                ? 'bg-blue-50 border-blue-300 text-blue-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            title="Toggle Filters"
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Advanced Filters */}
      {filterOpen && (
        <div className="p-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select 
                value={filters.department}
                onChange={(e) => onFilterChange('department', e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Any</option>
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Product">Product</option>
                <option value="Marketing">Marketing</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Sales">Sales</option>
                <option value="HR">Human Resources</option>
                <option value="Finance">Finance</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select 
                value={filters.priority}
                onChange={(e) => onFilterChange('priority', e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Any</option>
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select 
                value={filters.sortBy}
                onChange={(e) => onFilterChange('sortBy', e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="createdAt">Created Date</option>
                <option value="updatedAt">Updated Date</option>
                <option value="title">Title</option>
                <option value="department">Department</option>
                <option value="priority">Priority</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order
              </label>
              <select 
                value={filters.sortOrder}
                onChange={(e) => onFilterChange('sortOrder', e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
          
          {/* Filter Actions */}
          <div className="mt-4 flex justify-end space-x-3">
            <button 
              onClick={onResetFilters}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Reset Filters
            </button>
            
            <LoadingButton
              onClick={onApplyFilters}
              loading={isLoadingRecruitments}
              loadingText="Applying..."
              variant="primary"
              size="sm"
              className="px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Apply Filters
            </LoadingButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruitmentFilters;