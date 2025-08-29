// hooks/useRecruitment.ts
import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { recruitmentService } from '../api/recruitmentService';
import {
  RecruitmentProcess,
  RecruitmentStatus,
  RecruitmentFiltersType,
  RecruitmentListParams,
  RecruitmentProcess
} from '../types/recruitment';
import { useLoading } from './useLoading';
import { useFullScreenLoading } from './useFullScreenLoading';
import { RECRUITMENT_LOADING_KEYS } from '../utils/loadingKeys';

interface Pagination {
  current: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export const useRecruitment = () => {
  const { withLoading, isLoading } = useLoading();
  const { withFullScreenLoading, isFullScreenLoading, loadingState: fullScreenState } = useFullScreenLoading();
  
  // State
  const [recruitmentProcesses, setRecruitmentProcesses] = useState<RecruitmentProcess[]>([]);
  const [selectedRecruitment, setSelectedRecruitment] = useState<RecruitmentProcess | null>(null);
  const [activeTab, setActiveTab] = useState<RecruitmentStatus>('Active');
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<Pagination>({
    current: 1,
    limit: 20,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrevious: false
  });
  const [filters, setFilters] = useState<RecruitmentFiltersType>({
    department: '',
    priority: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    status: ''
  });

  const isInitialLoading = useRef(false);

  // Load recruitment processes
  const loadRecruitmentProcesses = async (pActiveTab?: RecruitmentStatus) => {
    const loadingKey = RECRUITMENT_LOADING_KEYS.FETCH_RECRUITMENTS;
    
    await withLoading(loadingKey, async () => {
      setSelectedRecruitment(null);

      const params: RecruitmentListParams = {
        status: pActiveTab || activeTab,
        page: pagination.current,
        limit: pagination.limit,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        ...(filters.department && { department: filters.department }),
        ...(filters.priority && { priority: filters.priority })
      };

      const response = await recruitmentService.list(params);
      
      setRecruitmentProcesses(response.data);
      setPagination({
        current: response.pagination.current,
        limit: response.pagination.limit,
        total: response.pagination.total,
        pages: response.pagination.pages,
        hasNext: response.pagination.hasNext || false,
        hasPrevious: response.pagination.hasPrevious || false
      });
    }, {
      onError: (error) => {
        console.error('Error loading recruitment processes:', error);
        toast.error('Failed to load recruitment processes');
      }
    });
  };

  // Load recruitment detail with full screen loading
  const loadRecruitmentDetail = async (process: RecruitmentProcess) => {
    if (!process.id) return;

    await withFullScreenLoading(
      'row-click',
      async () => {
        const detailedProcess = await recruitmentService.get(process.id);
        setSelectedRecruitment(detailedProcess);
        return detailedProcess;
      },
      {
        data: {
          requirementId: process.id,
          requirementTitle: process.requirement.title
        },
        config: {
          minDisplayTime: 800,
          showProgress: true,
          variant: 'blur'
        },
        successMessage: `Details loaded for "${process.requirement.title}"`
      }
    );
  };

  // Handle refresh
  const handleRefresh = async () => {
    await withLoading(RECRUITMENT_LOADING_KEYS.REFRESH_DATA, async () => {
      await loadRecruitmentProcesses(activeTab);
    }, {
      onSuccess: () => {
        toast.success('Data refreshed successfully');
      },
      onError: () => {
        toast.error('Failed to refresh data');
      }
    });
  };

  // Handle tab change
  const handleTabChange = async (tab: RecruitmentStatus) => {
    setActiveTab(tab);
    await withLoading(RECRUITMENT_LOADING_KEYS.REFRESH_DATA, async () => {
      await loadRecruitmentProcesses(tab);
    }, {
      onSuccess: () => {
        toast.success('Data refreshed successfully');
      },
      onError: () => {
        toast.error('Failed to refresh data');
      }
    });
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof RecruitmentFiltersType, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      department: '',
      priority: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
       status: ''
    });
    setSearchQuery('');
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, current: page }));
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Filter processes by search query
  const filteredProcesses = recruitmentProcesses.filter(process =>
    process.requirement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    process.requirement.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Load data on component mount and when dependencies change
  useEffect(() => {
    if (!isInitialLoading.current) {
      isInitialLoading.current = true;
      setTimeout(() => {
        loadRecruitmentProcesses();
      }, 10);
    }
  }, [activeTab, pagination.current, filters]);

  // Loading states
  const isLoadingRecruitments = isLoading(RECRUITMENT_LOADING_KEYS.FETCH_RECRUITMENTS);
  const isRefreshing = isLoading(RECRUITMENT_LOADING_KEYS.REFRESH_DATA);

  return {
    // State
    recruitmentProcesses,
    selectedRecruitment,
    activeTab,
    searchQuery,
    pagination,
    filters,
    filteredProcesses,
    
    // Actions
    loadRecruitmentProcesses,
    loadRecruitmentDetail,
    handleRefresh,
    handleTabChange,
    handleFilterChange,
    resetFilters,
    handlePageChange,
    handleSearch,
    setSelectedRecruitment,
    
    // Loading states
    isLoadingRecruitments,
    isRefreshing,
    isFullScreenLoading,
    fullScreenState,
    isLoading,
    withLoading
  };
};