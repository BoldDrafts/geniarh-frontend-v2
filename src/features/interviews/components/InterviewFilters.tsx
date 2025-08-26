import React from 'react';
import { Search, Filter } from 'lucide-react';

interface InterviewFiltersProps {
  activeTab: string;
  searchQuery: string;
  filterOpen: boolean;
  onTabChange: (tab: string) => void;
  onSearchChange: (query: string) => void;
  onFilterToggle: () => void;
  onFiltersApply?: (filters: any) => void;
  onFiltersReset?: () => void;
}

const InterviewFilters: React.FC<InterviewFiltersProps> = ({
  activeTab,
  searchQuery,
  filterOpen,
  onTabChange,
  onSearchChange,
  onFilterToggle,
  onFiltersApply,
  onFiltersReset
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex space-x-4 overflow-x-auto">
          <button
            onClick={() => onTabChange('upcoming')}
            className={`px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
              activeTab === 'upcoming'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => onTabChange('completed')}
            className={`px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
              activeTab === 'completed'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => onTabChange('canceled')}
            className={`px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
              activeTab === 'canceled'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Canceled
          </button>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search interviews..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <button 
            onClick={onFilterToggle}
            className={`p-2 border rounded-md ${
              filterOpen 
                ? 'bg-blue-50 border-blue-300 text-blue-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Expanded Filter Panel */}
      {filterOpen && (
        <div className="p-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interview Type</label>
              <select className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <option>Any</option>
                <option>Technical</option>
                <option>HR</option>
                <option>Cultural</option>
                <option>AI</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <select className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <option>Any</option>
                <option>Senior Frontend Developer</option>
                <option>UX Designer</option>
                <option>DevOps Engineer</option>
                <option>Product Manager</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <option>Any</option>
                <option>Today</option>
                <option>This week</option>
                <option>Next week</option>
                <option>This month</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interviewer</label>
              <select className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <option>Any</option>
                <option>John Smith</option>
                <option>Sarah Johnson</option>
                <option>Emily Williams</option>
                <option>Robert Chen</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-3">
            <button 
              onClick={onFiltersReset}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Reset Filters
            </button>
            <button 
              onClick={onFiltersApply}
              className="px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewFilters;