// pages/Recruitment.tsx - Componente principal refactorizado
import React, { useState } from 'react';

// Components
import { FullScreenLoader } from '../components/FullScreenLoader';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import LinkedInPublicationModal from '../components/LinkedInPublicationModal';
import NewRecruitmentForm from '../components/NewRecruitmentForm';

// Recruitment Components
import RecruitmentDetailPanel from '../components/RecruitmentDetailPanel';
import RecruitmentHeader from '../components/RecruitmentHeader';
import RecruitmentTable from '../components/RecruitmentTable';

// Hooks
import { createLoadingKey, RECRUITMENT_LOADING_KEYS } from '../utils/loadingKeys';
import RecruitmentFilters from '../components/RecruitmentFilters';
import { useRecruitment } from '../hooks/useRecruitment';
import { useRecruitmentActions } from '../hooks/useRecruitmentActions';
import { RecruitmentProcess } from '../types/recruitment';


const Recruitment: React.FC = () => {
  // UI State
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'analytics'>('list');

  // Main recruitment hook
  const {
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
  } = useRecruitment();

  // Actions hook
  const {
    // Modal states
    showNewRecruitmentForm,
    showDeleteModal,
    showLinkedInModal,
    formMode,
    recruitmentToDelete,
    
    // Modal setters
    setShowNewRecruitmentForm,
    setShowDeleteModal,
    setShowLinkedInModal,
    setRecruitmentToDelete,
    
    // Actions
    handleCreateRecruitment,
    handleEditRecruitment,
    handleDeleteConfirmed,
    handleStatusChange,
    handleCreatePublication,
    handlePublicationAction,
    confirmDelete,
    openCreateForm,
    openEditForm
  } = useRecruitmentActions({
    selectedRecruitment,
    onDataChange: loadRecruitmentProcesses
  });

  // Handle filter toggle
  const handleFilterToggle = () => {
    setFilterOpen(!filterOpen);
  };

  // Handle view mode change
  const handleViewModeChange = (mode: 'list' | 'analytics') => {
    setViewMode(mode);
  };

  // Handle edit from detail panel
  const handleEditFromDetail = () => {
    openEditForm(selectedRecruitment || undefined);
  };

  // Handle edit from table row
  const handleEditFromTable = async (process: RecruitmentProcess, e: React.MouseEvent) => {
    e.stopPropagation();
    await loadRecruitmentDetail(process);
    openEditForm(selectedRecruitment!);
  };

  return (
    <div>
      {/* Full Screen Loader */}
      <FullScreenLoader
        show={isFullScreenLoading}
        text={fullScreenState.data ? `Loading ${fullScreenState.data.requirementTitle}` : 'Loading...'}
        subText={fullScreenState.data ? 'Fetching recruitment details...' : 'Please wait...'}
        variant="blur"
        showProgress={true}
        progress={fullScreenState.data?.progress || 0}
      />

      {/* Header */}
      <RecruitmentHeader
        viewMode={viewMode}
        isRefreshing={isRefreshing}
        isCreating={isLoading(RECRUITMENT_LOADING_KEYS.CREATE_RECRUITMENT)}
        isLoadingRecruitments={isLoadingRecruitments}
        onViewModeChange={handleViewModeChange}
        onRefresh={handleRefresh}
        onCreateNew={openCreateForm}
      />

      {/* Filters */}
      <RecruitmentFilters
        activeTab={activeTab}
        searchQuery={searchQuery}
        filters={filters}
        filterOpen={filterOpen}
        isLoadingRecruitments={isLoadingRecruitments}
        onTabChange={handleTabChange}
        onSearchChange={handleSearch}
        onFilterToggle={handleFilterToggle}
        onFilterChange={handleFilterChange}
        onResetFilters={resetFilters}
        onApplyFilters={loadRecruitmentProcesses}
      />

      {/* Table */}
      <RecruitmentTable
        processes={filteredProcesses}
        selectedRecruitment={selectedRecruitment}
        isLoading={isLoadingRecruitments}
        isFullScreenLoading={isFullScreenLoading}
        searchQuery={searchQuery}
        activeTab={activeTab}
        pagination={pagination}
        onRowClick={loadRecruitmentDetail}
        onEdit={handleEditFromTable}
        onDelete={confirmDelete}
        onCreateNew={openCreateForm}
        onPageChange={handlePageChange}
        isLoadingFn={isLoading}
        isCreating={isLoading(RECRUITMENT_LOADING_KEYS.CREATE_RECRUITMENT)}
      />

      {/* Detail Panel */}
      {selectedRecruitment && (
        <RecruitmentDetailPanel
          recruitment={selectedRecruitment}
          onClose={() => setSelectedRecruitment(null)}
          onEdit={handleEditFromDetail}
          onStatusChange={handleStatusChange}
          onCreatePublication={handleCreatePublication}
          onPublicationAction={handlePublicationAction}
          onShowLinkedInModal={() => setShowLinkedInModal(true)}
          isLoading={isLoading}
        />
      )}

      {/* Modals */}

      {showNewRecruitmentForm && (
        <NewRecruitmentForm
          onClose={() => {
            setShowNewRecruitmentForm(false);
            setSelectedRecruitment(null);
          }}
          onSubmit={formMode === 'create' ? handleCreateRecruitment : handleEditRecruitment}
          initialData={selectedRecruitment!}
          mode={formMode}
        />
      )}

      {showDeleteModal && recruitmentToDelete && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setRecruitmentToDelete(null);
          }}
          onConfirm={handleDeleteConfirmed}
          title="Delete Recruitment Process"
          message="This action will permanently delete the recruitment process and all associated data. This cannot be undone."
          itemToDelete={recruitmentToDelete.requirement.title}
          confirmationType="type-to-confirm"
          confirmButtonText="Delete Process"
          isDangerous={true}
        />
      )}

      {showLinkedInModal && selectedRecruitment && (
        <LinkedInPublicationModal
          isOpen={showLinkedInModal}
          onClose={() => setShowLinkedInModal(false)}
          onCreatePublication={handleCreatePublication}
          initialContent={selectedRecruitment}
          loading={isLoading(createLoadingKey(RECRUITMENT_LOADING_KEYS.CREATE_PUBLICATION, selectedRecruitment.id))}
        />
      )}
    </div>
  );
};

export default Recruitment;