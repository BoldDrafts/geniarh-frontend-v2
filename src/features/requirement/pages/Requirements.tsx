import {
  BrainCircuit,
  CheckCircle2,
  Edit3,
  FileText,
  Mail,
  Plus,
  Search,
  Trash2
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

// Components
import AIAssistantPanel from '../../../shared/components/AIAssistantPanel';
import DeleteConfirmationModal from '../../../shared/components/DeleteConfirmationModal';
import { LoadingButton } from '../../../shared/components/LoadingButton';
import { LoadingOverlay } from '../../../shared/components/LoadingOverlay';
import { LoadingSpinner } from '../../../shared/components/LoadingSpinner';
import NewRequirementForm from '../components/NewRequirementForm';
import ToRecruitmentModal from '../components/ToRecruitmentModal';

// Hooks
import { useLoading } from '../../../shared/hooks/useLoading';

// Services and Types
import { requirementsService } from '../api/requirementsService';
import { recruitmentService } from '../../recruitment/api/recruitmentService';

// Constants
import { FullScreenLoader } from '../../../shared/components/FullScreenLoader';
import { REQUIREMENTS_LOADING_KEYS, createLoadingKey } from '../../../shared/utils/loadingKeys';
import { Requirement } from '../types/requirementsTypes';

const Requirements: React.FC = () => {
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'draft' | 'closed' | 'email'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewRequirementForm, setShowNewRequirementForm] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [detailRequirement, setDetailRequirement] = useState<Requirement | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loadingDeleteModal, setLoadingDeleteModal] = useState(false);
  const [showConfirmRecruitment, setShowConfirmRecruitment] = useState(false);
  const [requirementToDelete, setRequirementToDelete] = useState<Requirement | null>(null);
  const [requirementToRecruitment, setRequirementToRecruitment] = useState<Requirement | null>(null);
  
  // Estado específico para el loader de pantalla completa
  const [isLoadingRowDetails, setIsLoadingRowDetails] = useState(false);
  const [loadingRowData, setLoadingRowData] = useState<{
    requirementTitle: string;
    startTime: number;
    progress: number;
  } | null>(null);

  // Función para simular progreso de carga
  const simulateProgress = (startTime: number, duration: number = 2000): number => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min((elapsed / duration) * 100, 95); // Máximo 95% hasta que termine
    return progress;
  };

  const { withLoading, isLoading } = useLoading();

  const fetchRequirements = async () => {
    await withLoading(REQUIREMENTS_LOADING_KEYS.FETCH_REQUIREMENTS, async () => {
      setRequirements([]);
      const status = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
      const response = await requirementsService.list({ 
        status: status as 'Active' | 'Draft' | 'Closed' 
      });
      setRequirements(response.data);
    }, {
      onError: (error) => {
        console.error('Error fetching requirements:', error);
        toast.error('Failed to fetch requirements');
      }
    });
  };

  const fetchRequirementDetail = async (requirementId: string) => {
    const loadingKey = createLoadingKey(REQUIREMENTS_LOADING_KEYS.FETCH_REQUIREMENT_DETAIL, requirementId);
    
    const result = await withLoading(loadingKey, async () => {
      const requirementDetail = await requirementsService.get(requirementId);
      setDetailRequirement(requirementDetail);
      return requirementDetail;
    }, {
      onError: (error) => {
        console.error('Error fetching requirement detail:', error);
        toast.error('Failed to load requirement details');
        setDetailRequirement(null);
      }
    });
    return result;
  };

  useEffect(() => {
    setDetailRequirement(null);
    fetchRequirements();
  }, [activeTab]);

  const handleCreateRequirement = async (data: Omit<Requirement, 'id'>) => {
    await withLoading(REQUIREMENTS_LOADING_KEYS.CREATE_REQUIREMENT, async () => {
      await requirementsService.create(data);
      toast.success('Requirement created successfully');
      await fetchRequirements();
      setShowNewRequirementForm(false);
      setSelectedRequirement(null);
      setDetailRequirement(null);
    }, {
      onError: (error) => {
        console.error('Error creating requirement:', error);
        toast.error('Failed to create requirement');
      }
    });
  };

  const handleUpdateRequirement = async (data: Requirement) => {
    if (!data.id) return;
    
    const loadingKey = createLoadingKey(REQUIREMENTS_LOADING_KEYS.UPDATE_REQUIREMENT, data.id);
    
    await withLoading(loadingKey, async () => {
      await requirementsService.update(data.id!, data);
      toast.success('Requirement updated successfully');
      await fetchRequirements();
      setShowNewRequirementForm(false);
      setSelectedRequirement(null);
      // Refresh detail if it's the same requirement
      if (detailRequirement?.id === data.id) {
        await fetchRequirementDetail(data.id);
      }
    }, {
      onError: (error) => {
        console.error('Error updating requirement:', error);
        toast.error('Failed to update requirement');
      }
    });
  };

  const handleDeleteRequirement = async () => {
    if (!requirementToDelete?.id) return;

    const loadingKey = createLoadingKey(REQUIREMENTS_LOADING_KEYS.DELETE_REQUIREMENT, requirementToDelete.id);
    
    withLoading(loadingKey, async () => {
      setLoadingDeleteModal(true);
      await requirementsService.delete(requirementToDelete.id!);
      // Clear detail if it's the deleted requirement
      if (detailRequirement?.id === requirementToDelete.id) {
        setDetailRequirement(null);
      }
      setShowDeleteModal(false);
      setRequirementToDelete(null);
      setLoadingDeleteModal(false);
      toast.success('Requirement deleted successfully');
      await fetchRequirements();
    }, {
      onError: (error) => {
        console.error('Error deleting requirement:', error);
        toast.error('Failed to delete requirement');
        setLoadingDeleteModal(false);
      }
    });
  };

  const handleRegisterRecruitment = async () => {
    if (!requirementToRecruitment?.id) return;

    const loadingKey = createLoadingKey(REQUIREMENTS_LOADING_KEYS.REGISTER_RECRUITMENT, requirementToRecruitment.id);
    
    await withLoading(loadingKey, async () => {
      await recruitmentService.create({requirementId: requirementToRecruitment.id!});
      toast.success('Recruitment registered successfully');
      await fetchRequirements();
      setShowConfirmRecruitment(false);
      setRequirementToRecruitment(null);
      // Refresh detail if it's the same requirement
      if (detailRequirement?.id === requirementToRecruitment.id) {
        await fetchRequirementDetail(requirementToRecruitment.id);
      }
    }, {
      onError: (error) => {
        console.error('Error registering recruitment:', error);
        toast.error('Failed to register recruitment');
      }
    });
  };

  const handleEditRequirement = async (requirement: Requirement, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    const loadingKey = createLoadingKey(REQUIREMENTS_LOADING_KEYS.EDIT_REQUIREMENT, requirement.id);
    
    await withLoading(loadingKey, async () => {
      console.log("Cargando editar.", selectedRequirement?.id, requirement.id);
      
      if (!selectedRequirement || selectedRequirement?.id !== requirement.id) {
        console.log("Buscando detalle.");
        const requirementDetail = await requirementsService.get(requirement.id!);
        setSelectedRequirement(requirementDetail);
      }
      
      setFormMode('edit');
      setShowNewRequirementForm(true);
    }, {
      onError: (error) => {
        console.error('Error loading requirement for edit:', error);
        toast.error('Failed to load requirement details for editing');
      }
    });
  };

  // Función auxiliar para detectar si el row click está cargando
  const isRowClickLoading = (): boolean => {
    return isLoadingRowDetails;
  };

  const handleRowClick = async (requirement: Requirement) => {
    console.log("handleRowClick - Loading requirement details:", requirement.id);
  
    if (!requirement.id) {
      console.warn("Requirement ID is missing");
      return;
    }

    // Verificar si ya está cargando para evitar clicks múltiples
    if (isLoadingRowDetails) {
      console.log("Already loading requirement details");
      return;
    }

    // Configurar el estado del loader de pantalla completa
    const startTime = Date.now();
    setIsLoadingRowDetails(true);
    setLoadingRowData({
      requirementTitle: requirement.title,
      startTime,
      progress: 0
    });

    // Simulador de progreso (opcional)
    const progressInterval = setInterval(() => {
      if (loadingRowData) {
        const newProgress = simulateProgress(startTime);
        setLoadingRowData(prev => prev ? { ...prev, progress: newProgress } : null);
      }
    }, 100);

    try {
      console.log("🔄 Fetching requirement details for:", requirement.title);
      
      // Simular un mínimo de tiempo para mostrar el loader (opcional)
      const minLoadingTime = 800; // 800ms mínimo
      const startRequest = Date.now();
      
      // Ejecutar la petición
      const requirementDetail = await requirementsService.get(requirement.id);
      
      // Asegurar tiempo mínimo de loading para UX
      const elapsedTime = Date.now() - startRequest;
      if (elapsedTime < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
      }
      
      // Actualizar progreso a 100% justo antes de completar
      setLoadingRowData(prev => prev ? { ...prev, progress: 100 } : null);
      
      // Pequeña pausa para mostrar 100% completado
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Actualizar el estado con los detalles obtenidos
      setDetailRequirement(requirementDetail);
      
      console.log("✅ Requirement details loaded successfully:", requirementDetail.title);
      
      // Toast de éxito
      toast.success(`Details loaded for "${requirementDetail.title}"`);
      
      // Scroll automático al panel de detalles después de un breve delay
      setTimeout(() => {
        const detailElement = document.getElementById('requirement-detail');
        if (detailElement) {
          detailElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest',
            inline: 'nearest'
          });
        }
      }, 300);
      
    } catch (error) {
      console.error("❌ Error loading requirement details:", error);
      
      // Limpiar el detalle si hay error
      setDetailRequirement(null);
      
      // Toast de error personalizado
      toast.error(`Failed to load details for "${requirement.title}"`);
      
      // Opcional: Mostrar detalles básicos desde la fila como fallback
      const fallbackRequirement: Requirement = {
        ...requirement,
        description: `<p class="text-red-600">⚠️ Could not load complete details for this requirement.</p>
                    <p class="mt-2 text-gray-600">Basic information from the list is shown below. Please try clicking again to load full details.</p>`,
        skills: [],
        softSkills: [],
        qualifications: '<p class="text-gray-500 italic">Details could not be loaded</p>'
      };
      setDetailRequirement(fallbackRequirement);
      
    } finally {
      // Limpiar el loader y estados
      clearInterval(progressInterval);
      setIsLoadingRowDetails(false);
      setLoadingRowData(null);
      
      console.log("🏁 handleRowClick completed");
    }
  };

  const confirmDelete = (requirement: Requirement, e: React.MouseEvent) => {
    e.stopPropagation();
    setRequirementToDelete(requirement);
    setShowDeleteModal(true);
  };

  const confirmRecruitment = (requirement: Requirement, e: React.MouseEvent) => {
    e.stopPropagation();
    setRequirementToRecruitment(requirement);
    setShowConfirmRecruitment(true);
  };

  const handleStatusChange = async (requirement: Requirement, newStatus: 'Active' | 'Draft' | 'Closed') => {
    const loadingKey = createLoadingKey(REQUIREMENTS_LOADING_KEYS.UPDATE_STATUS, requirement.id);
    
    await withLoading(loadingKey, async () => {
      await requirementsService.updateStatus(requirement.id!, newStatus);
      toast.success(`Requirement status updated to ${newStatus}`);
      await fetchRequirements();
      // Refresh detail if it's the same requirement
      if (detailRequirement?.id === requirement.id) {
        await fetchRequirementDetail(requirement.id!);
      }
    }, {
      onError: (error) => {
        console.error('Error updating requirement status:', error);
        toast.error('Failed to update requirement status');
      }
    });
  };

  const filteredRequirements = requirements?.filter(req => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        req.title.toLowerCase().includes(query) ||
        req.department.toLowerCase().includes(query) ||
        req.location.toLowerCase().includes(query)
      );
    }
    return true;
  }) || [];

  const isLoadingRequirements = isLoading(REQUIREMENTS_LOADING_KEYS.FETCH_REQUIREMENTS);
  const isLoadingDetail = (id: string) => isLoading(createLoadingKey(REQUIREMENTS_LOADING_KEYS.FETCH_REQUIREMENT_DETAIL, id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Loader de pantalla completa para handleRowClick */}
      <FullScreenLoader
        show={isLoadingRowDetails}
        text={`Loading Details`}
        subText={loadingRowData ? `Fetching information for "${loadingRowData.requirementTitle}"` : 'Please wait...'}
        variant="blur" // Opciones: 'default', 'blur', 'dark'
        showProgress={true}
        progress={loadingRowData?.progress || 0}
      />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Requirements</h1>
          <p className="text-gray-500 mt-1">Manage job requirements and specifications</p>
        </div>
        <div className="flex mt-3 sm:mt-0 space-x-3">
          <button 
            onClick={() => {
              setFormMode('create');
              setSelectedRequirement(null);
              setShowNewRequirementForm(true);
            }}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Requirement
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-wrap gap-2">
            {(['draft', 'active', 'closed', 'email'] as const).map((tab) => (
              <LoadingButton
                key={tab}
                onClick={() => setActiveTab(tab)}
                variant={activeTab === tab ? 'primary' : 'secondary'}
                size="sm"
                loading={isLoadingRequirements && activeTab !== tab}
                className={`px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab === 'email' ? (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    Email
                  </div>
                ) : (
                  tab.charAt(0).toUpperCase() + tab.slice(1)
                )}
              </LoadingButton>
            ))}
          </div>
          
          <div className="relative w-full lg:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search requirements..."
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Requirements List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 relative">
        <LoadingOverlay show={isLoadingRequirements} text="Loading requirements..." />
        
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '280px', maxWidth: '320px' }}>
                    <div className="truncate">Job Title</div>
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell" style={{ minWidth: '120px', maxWidth: '150px' }}>
                    <div className="truncate">Department</div>
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell" style={{ minWidth: '120px', maxWidth: '150px' }}>
                    <div className="truncate">Location</div>
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell" style={{ minWidth: '100px', maxWidth: '120px' }}>
                    <div className="truncate">Created</div>
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '100px', maxWidth: '120px' }}>
                    <div className="truncate">Status</div>
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '120px', maxWidth: '140px' }}>
                    <div className="truncate">Actions</div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoadingRequirements ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <LoadingSpinner size="lg" text="Loading requirements..." />
                    </td>
                  </tr>
                ) : filteredRequirements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No requirements found
                    </td>
                  </tr>
                ) : (
                  filteredRequirements.map((req) => (
                    <tr 
                      key={req.id} 
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                        detailRequirement?.id === req.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleRowClick(req)}
                    >
                      <td className="px-4 py-4" style={{ minWidth: '280px', maxWidth: '320px' }}>
                        <div className="flex items-center min-w-0">
                          <FileText className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div 
                              className="text-sm font-medium text-gray-900 break-words leading-tight" 
                              title={req.title}
                              style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                lineHeight: '1.3'
                              }}
                            >
                              {req.title}
                            </div>
                            <div className="md:hidden text-xs text-gray-500 truncate mt-1" title={req.department}>
                              {req.department}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 hidden md:table-cell" style={{ minWidth: '120px', maxWidth: '150px' }}>
                        <div className="truncate" title={req.department}>
                          {req.department}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 hidden lg:table-cell" style={{ minWidth: '120px', maxWidth: '150px' }}>
                        <div className="truncate" title={req.location}>
                          {req.location}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 hidden xl:table-cell" style={{ minWidth: '100px', maxWidth: '120px' }}>
                        <div className="truncate">
                          {new Date(req.createdAt || '').toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-4" style={{ minWidth: '100px', maxWidth: '120px' }}>
                        <div className="relative inline-block text-left">
                          <select 
                            disabled={(req.status === 'Active') && activeTab !== 'email' || isLoading(createLoadingKey(REQUIREMENTS_LOADING_KEYS.UPDATE_STATUS, req.id!))}
                            value={req.status}
                            onChange={(e) => handleStatusChange(req, e.target.value as 'Active' | 'Draft' | 'Closed')}
                            onClick={(e) => e.stopPropagation()}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              req.status === 'Active' ? 'bg-green-100 text-green-800' :
                              req.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            } border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-full disabled:opacity-50`}
                          >
                            {activeTab === 'email' && (<option value="Email">Email</option>)}
                            <option value="Draft">Draft</option>
                            <option value="Active">Active</option>
                            <option value="Closed">Closed</option>
                          </select>
                          {isLoading(createLoadingKey(REQUIREMENTS_LOADING_KEYS.UPDATE_STATUS, req.id!)) && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <LoadingSpinner size="sm" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium" style={{ minWidth: '120px', maxWidth: '140px' }}>
                        <div className="flex space-x-2 justify-center">
                          <button
                            onClick={(e) => handleEditRequirement(req, e)}
                            disabled={isLoading(createLoadingKey(REQUIREMENTS_LOADING_KEYS.EDIT_REQUIREMENT, req.id!))}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 disabled:opacity-50 relative"
                            title="Edit"
                          >
                            {isLoading(createLoadingKey(REQUIREMENTS_LOADING_KEYS.EDIT_REQUIREMENT, req.id!)) ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <Edit3 className="h-4 w-4" />
                            )}
                          </button>
                          {activeTab === 'closed' && (
                            <button 
                              onClick={(e) => confirmDelete(req, e)}
                              disabled={isLoading(createLoadingKey(REQUIREMENTS_LOADING_KEYS.DELETE_REQUIREMENT, req.id!))}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 disabled:opacity-50"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                          {req.status === 'Active' && (
                            <button 
                              onClick={(e) => confirmRecruitment(req, e)}
                              disabled={isLoading(createLoadingKey(REQUIREMENTS_LOADING_KEYS.REGISTER_RECRUITMENT, req.id!))}
                              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 disabled:opacity-50"
                              title="Start Recruitment"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Requirement Detail Preview */}
      {detailRequirement && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative">
          <LoadingOverlay 
            show={detailRequirement.id ? isLoadingDetail(detailRequirement.id) : false} 
            text="Loading requirement details..." 
          />
          
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Requirement Detail: {detailRequirement.title}
            </h2>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                detailRequirement.status === 'Active' ? 'bg-green-100 text-green-800' :
                detailRequirement.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                detailRequirement.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {detailRequirement.status}
              </span>
              <LoadingButton
                onClick={(e) => handleEditRequirement(detailRequirement, e)}
                variant="secondary"
                size="sm"
                loading={isLoading(createLoadingKey(REQUIREMENTS_LOADING_KEYS.EDIT_REQUIREMENT, detailRequirement.id!))}
                loadingText="Loading..."
                className="text-blue-600 hover:text-blue-800"
              >
                <Edit3 className="h-4 w-4 mr-1" />
                Edit
              </LoadingButton>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Department</h3>
                <p className="text-sm text-gray-900">{detailRequirement.department}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Location</h3>
                <p className="text-sm text-gray-900">{detailRequirement.location}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Employment Type</h3>
                <p className="text-sm text-gray-900">{detailRequirement.employmentType}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Experience Level</h3>
                <p className="text-sm text-gray-900">{detailRequirement.experienceLevel}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Priority</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  detailRequirement.priority === 'High' ? 'bg-red-100 text-red-800' :
                  detailRequirement.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {detailRequirement.priority}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Timeframe</h3>
                <p className="text-sm text-gray-900">{detailRequirement.timeframe}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Salary Range</h3>
                <p className="text-sm text-gray-900">
                  {detailRequirement.salaryCurrency} {detailRequirement.salaryMin.toLocaleString()} - {detailRequirement.salaryMax.toLocaleString()}
                </p>
              </div>
              {detailRequirement.createdAt && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Created</h3>
                  <p className="text-sm text-gray-900">
                    {new Date(detailRequirement.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Job Description</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <div 
                className="prose prose-sm max-w-none text-gray-600"
                dangerouslySetInnerHTML={{ __html: detailRequirement.description }}
              />
              
              {detailRequirement.qualifications && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Qualifications:</h4>
                  <div 
                    className="prose prose-sm max-w-none text-gray-600"
                    dangerouslySetInnerHTML={{ __html: detailRequirement.qualifications }}
                  />
                </div>
              )}
              
              {detailRequirement.skills && detailRequirement.skills.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Technical Skills:</h4>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {detailRequirement.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {detailRequirement.softSkills && detailRequirement.softSkills.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Required Soft Skills:</h4>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {detailRequirement.softSkills.map((skill, index) => (
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
              
              {detailRequirement.publications && detailRequirement.publications.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Publications:</h4>
                  <div className="space-y-2">
                    {detailRequirement.publications.map((publication, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-medium text-gray-900">{publication.platform}</span>
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                            publication.status === 'Published' ? 'bg-green-100 text-green-800' :
                            publication.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {publication.status}
                          </span>
                        </div>
                        {publication.url && (
                          <a 
                            href={publication.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            View
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Panel */}
      {showAIAssistant && (
        <AIAssistantPanel 
          context="requirements" 
          onClose={() => setShowAIAssistant(false)} 
        />
      )}

      {/* New/Edit Requirement Form */}
      {showNewRequirementForm && (
        <NewRequirementForm
          onClose={() => {
            setShowNewRequirementForm(false);
            setSelectedRequirement(null);
          }}
          onSubmit={formMode === 'create' ? handleCreateRequirement : handleUpdateRequirement}
          initialData={selectedRequirement || undefined}
          mode={formMode}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && requirementToDelete && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setRequirementToDelete(null);
          }}
          onConfirm={handleDeleteRequirement}
          title="Delete Requirement"
          itemToDelete={requirementToDelete.title}
          loading={loadingDeleteModal}
        />
      )}

      {/* To Recruitment Confirmation Modal */}
      {showConfirmRecruitment && requirementToRecruitment && (
        <ToRecruitmentModal
          isOpen={showConfirmRecruitment}
          onClose={() => {
            setShowConfirmRecruitment(false);
            setRequirementToRecruitment(null);
          }}
          onConfirm={handleRegisterRecruitment}
          title="New Recruitment"
          itemToRegister={requirementToRecruitment.title}
        />
      )}
      
    </div>
  );
};

export default Requirements;