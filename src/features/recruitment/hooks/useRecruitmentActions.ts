// hooks/useRecruitmentActions.ts
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useLoading } from '../../../shared/hooks/useLoading';
import { createLoadingKey, RECRUITMENT_LOADING_KEYS } from '../../../shared/utils/loadingKeys';
import { n8nRecruitmentService } from '../api/n8nRecruitmentService';
import { publicationsService } from '../api/publicationsService';
import { recruitmentService } from '../api/recruitmentService';
import {
    RecruitmentProcess,
    RecruitmentStatus,
    UpdateRecruitmentRequest
} from '../types/recruitment';
import { PublicationData } from '../types/linkedInModalTypes';

interface UseRecruitmentActionsProps {
  selectedRecruitment: RecruitmentProcess | null;
  onDataChange: (pActiveTab?: RecruitmentStatus) => Promise<void>;
}

export const useRecruitmentActions = ({ 
  selectedRecruitment, 
  onDataChange 
}: UseRecruitmentActionsProps) => {
  const { withLoading, isLoading } = useLoading();
  
  // Modal states
  const [showNewRecruitmentForm, setShowNewRecruitmentForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [recruitmentToDelete, setRecruitmentToDelete] = useState<RecruitmentProcess | null>(null);

  // Create recruitment
  const handleCreateRecruitment = async (data: any) => {
    await withLoading(RECRUITMENT_LOADING_KEYS.CREATE_RECRUITMENT, async () => {
      var requirement = await recruitmentService.createFromRequirement(data.requirementId);
      toast.success('Recruitment process created successfully');
      setShowNewRecruitmentForm(false);
      await onDataChange(requirement.status);
    }, {
      onError: (error) => {
        console.error('Error creating recruitment process:', error);
        toast.error('Failed to create recruitment process');
      }
    });
  };

  // Update recruitment
  const handleEditRecruitment = async (data: any) => {
    if (!selectedRecruitment?.id) return;

    const loadingKey = createLoadingKey(RECRUITMENT_LOADING_KEYS.UPDATE_RECRUITMENT, selectedRecruitment.id);
    
    await withLoading(loadingKey, async () => {
      // Mapear los datos del formulario al formato esperado por la API
      const updateRequest : UpdateRecruitmentRequest = {
        title: data.title,
        department: data.department,
        workType: data.workType,
        employmentType: data.employmentType,
        priority: data.priority,
        expectedStartDate: data.expectedStartDate,
        positionsCount: parseInt(data.positionsCount) || undefined,
        experienceLevel: data.experienceLevel,
        budgetMin: parseFloat(data.salaryMin) || undefined,
        budgetMax: parseFloat(data.salaryMax) || undefined,
        currency: data.salaryCurrency,
        urgency: data.urgency,
        technicalSkills: data.skills || [], // mapear desde el formulario
        softSkills: data.softSkills || [],
        recruiterId: data.recruiterId || undefined,
        description: data.description,
        // No incluir status aquí ya que se maneja por separado
      };

      // Filtrar valores undefined para enviar solo los campos que cambiaron
      const filteredRequest = Object.fromEntries(
        Object.entries(updateRequest).filter(([_, value]) => value !== undefined)
      );

      await recruitmentService.updateRecruitmentProcess(selectedRecruitment.id, filteredRequest);
      toast.success('Recruitment process updated successfully');
      setShowNewRecruitmentForm(false);
      await onDataChange(selectedRecruitment.status);
    }, {
      onError: (error) => {
        console.error('Error updating recruitment process:', error);
        toast.error('Failed to update recruitment process');
      }
    });
  };

  // Delete recruitment
  const handleDeleteConfirmed = async () => {
    if (!recruitmentToDelete?.id) return;
    
    const loadingKey = createLoadingKey(RECRUITMENT_LOADING_KEYS.DELETE_RECRUITMENT, recruitmentToDelete.id);
    
    await withLoading(loadingKey, async () => {
      await recruitmentService.delete(recruitmentToDelete.id);
      toast.success('Recruitment process deleted successfully');
      setShowDeleteModal(false);
      setRecruitmentToDelete(null);
      await onDataChange(selectedRecruitment?.status);
    }, {
      onError: (error) => {
        console.error('Error deleting recruitment process:', error);
        toast.error('Failed to delete recruitment process');
      }
    });
  };

  // Status change
  const handleStatusChange = async (processId: string, newStatus: RecruitmentStatus) => {
    const loadingKey = createLoadingKey(RECRUITMENT_LOADING_KEYS.UPDATE_STATUS, processId);
    
    await withLoading(loadingKey, async () => {
      await recruitmentService.setStatus(processId, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      await onDataChange();
    }, {
      onError: (error) => {
        console.error('Error updating status:', error);
        toast.error('Failed to update status');
      }
    });
  };

  // Create publication
  const handleCreatePublication = async (publicationData: PublicationData) => {
    if (!selectedRecruitment?.id) return;

    const loadingKey = createLoadingKey(RECRUITMENT_LOADING_KEYS.CREATE_PUBLICATION, selectedRecruitment.id);
    
    await withLoading(loadingKey, async () => {
      const linkedInResult = await n8nRecruitmentService.publishToLinkedIn(
        selectedRecruitment.id, 
        publicationData.description,
        selectedRecruitment.requirement.title
      );

      console.log(linkedInResult);
      setShowLinkedInModal(false);
      await onDataChange();
      
      return linkedInResult;
    }, {
      onSuccess: () => {
        toast.success('LinkedIn publication created successfully');
      },
      onError: (error) => {
        console.error('Error creating LinkedIn publication:', error);
        toast.error('Failed to create LinkedIn publication');
      }
    });
  };

  // Publication actions (publish/suspend)
  const handlePublicationAction = async (action: 'publish' | 'suspend', publicationId: string) => {
    if (!selectedRecruitment?.id) return;

    const loadingKey = createLoadingKey(RECRUITMENT_LOADING_KEYS.UPDATE_PUBLICATION, publicationId);
    
    await withLoading(loadingKey, async () => {
      if (action === 'publish') {
        await publicationsService.publish(selectedRecruitment.id, publicationId);
      } else {
        await publicationsService.suspend(selectedRecruitment.id, publicationId);
      }
      
      await onDataChange();
    }, {
      onSuccess: () => {
        toast.success(`Publication ${action}ed successfully`);
      },
      onError: (error) => {
        console.error(`Error ${action}ing publication:`, error);
        toast.error(`Failed to ${action} publication`);
      }
    });
  };

  // Confirm delete
  const confirmDelete = (process: RecruitmentProcess, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecruitmentToDelete(process);
    setShowDeleteModal(true);
  };

  // Open create form
  const openCreateForm = () => {
    setFormMode('create');
    setShowNewRecruitmentForm(true);
  };

  // Open edit form
  const openEditForm = (process?: RecruitmentProcess) => {
    setFormMode('edit');
    setShowNewRecruitmentForm(true);
  };

  return {
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
    openEditForm,
    
    // Loading states
    isLoading
  };
};