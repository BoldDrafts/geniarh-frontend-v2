import { toast } from 'react-hot-toast';
import { httpClient } from '../../../shared/api/httpClient';
import { authService } from '../../../shared/api/authService';
import type {
  Requirement,
  RequirementListParams,
  CreateRequirementRequest,
  RequirementStatus
} from '../types/requirementsTypes';

interface RequirementPaginatedResponse {
  data: Requirement[];
  pagination: {
    total: number;
    pages: number;
    current: number;
    limit: number;
  };
}

/**
 * Servicio de Requirements basado en OpenAPI specification
 * Implementado directamente para coincidir exactamente con la API definida
 * Usa automáticamente el token bearer de Keycloak
 */
class RequirementsService {
  protected baseUrl: string;
  protected resourceName: string;
  protected requireAuth: boolean;
  protected requiredRoles?: string[];
  protected requireAllRoles: boolean;

  constructor() {
    this.baseUrl = import.meta.env.VITE_REQUIREMENTS_API_URL || import.meta.env.VITE_API_URL;
    this.resourceName = 'requirements';
    this.requireAuth = true;
    this.requiredRoles = ['recruiter-supervisor', 'recruiter'];
    this.requireAllRoles = false;
  }

  /**
   * Validar autenticación y permisos antes de realizar operaciones
   */
  protected async validateAuth(): Promise<void> {
    if (!this.requireAuth) return;

    if (!await authService.ensureAuthenticated()) {
      throw new Error('Authentication required');
    }

    if (this.requiredRoles && this.requiredRoles.length > 0) {
      const hasPermission = authService.hasPermission(this.requiredRoles, this.requireAllRoles);
      if (!hasPermission) {
        const roleText = this.requireAllRoles ? 'todos los roles' : 'al menos uno de los roles';
        toast.error(`Acceso denegado: Se requiere ${roleText}: ${this.requiredRoles.join(', ')}`);
        throw new Error('Insufficient permissions');
      }
    }
  }

  /**
   * Manejar errores de API de forma consistente
   */
  protected handleError(error: any, operation: string): void {
    console.error(`Error ${operation}:`, error);
    const errorMessage = error.response?.data?.message || `Failed to ${operation}`;
    toast.error(errorMessage);
    throw error;
  }

  /**
   * Construir URL del recurso
   */
  protected buildUrl(path: string = ''): string {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${this.baseUrl}/${this.resourceName}${cleanPath ? `/${cleanPath}` : ''}`;
  }

  /**
   * Operación personalizada para endpoints específicos
   */
  protected async customOperation<T>(id: string, operation: string, data?: any, method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET'): Promise<T> {
    await this.validateAuth();
    
    try {
      const url = `${this.buildUrl(id)}/${operation}`;
      
      let response;
      switch (method) {
        case 'GET':
          response = await httpClient.get<T>(url);
          break;
        case 'POST':
          response = await httpClient.post<T>(url, data);
          break;
        case 'PUT':
          response = await httpClient.put<T>(url, data);
          break;
        case 'PATCH':
          response = await httpClient.patch<T>(url, data);
          break;
        case 'DELETE':
          response = await httpClient.delete<T>(url);
          break;
      }
      
      return response!.data;
    } catch (error: any) {
      this.handleError(error, `custom operation ${operation}`);
      throw error;
    }
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  protected hasRole(role: string): boolean {
    return authService.hasRole(role);
  }

  // ==================== MÉTODOS OPENAPI COMPLIANT ====================

  /**
   * Listar todos los requirements (OpenAPI: GET /requirements)
   */
  async list(params?: RequirementListParams): Promise<RequirementPaginatedResponse> {
    await this.validateAuth();
    try {
      const queryParams = {
        ...params,
        page: params?.page || 1,
        limit: params?.limit || 20
      };

      const response = await httpClient.get<RequirementPaginatedResponse>(`${this.baseUrl}/${this.resourceName}`, {
        params: queryParams
      });

      return response.data;
    } catch (error: any) {
      this.handleError(error, 'list requirements');
      throw error;
    }
  }

  /**
   * Crear un nuevo requirement (OpenAPI: POST /requirements)
   */
  async create(requirement: CreateRequirementRequest): Promise<Requirement> {
    await this.validateAuth();
    try {
      const requirementData = { ...requirement, status: requirement.status || 'DRAFT' };
      const response = await httpClient.post<Requirement>(`${this.baseUrl}/${this.resourceName}`, requirementData);
      toast.success('Requirement created successfully');
      return response.data;
    } catch (error: any) {
      this.handleError(error, 'create requirement');
      throw error;
    }
  }

  /**
   * Obtener un requirement por ID (OpenAPI: GET /requirements/{id})
   */
  async get(id: string): Promise<Requirement> {
    await this.validateAuth();
    try {
      const response = await httpClient.get<Requirement>(`${this.buildUrl(id)}`);
      return response.data;
    } catch (error: any) {
      this.handleError(error, 'get requirement');
      throw error;
    }
  }

  /**
   * Actualizar un requirement (OpenAPI: PUT /requirements/{id})
   */
  async update(id: string, requirement: Partial<Requirement>): Promise<Requirement> {
    await this.validateAuth();
    try {
      const response = await httpClient.put<Requirement>(`${this.buildUrl(id)}`, requirement);
      toast.success('Requirement updated successfully');
      return response.data;
    } catch (error: any) {
      this.handleError(error, 'update requirement');
      throw error;
    }
  }

  /**
   * Eliminar un requirement (OpenAPI: DELETE /requirements/{id})
   */
  async delete(id: string): Promise<void> {
    await this.validateAuth();
    try {
      await httpClient.delete(`${this.buildUrl(id)}`);
      toast.success('Requirement deleted successfully');
    } catch (error: any) {
      this.handleError(error, 'delete requirement');
      throw error;
    }
  }

  /**
   * Actualizar estado de un requirement (OpenAPI: PATCH /requirements/{id}/status)
   */
  async updateStatus(id: string, status: RequirementStatus): Promise<Requirement> {
    await this.validateAuth();
    try {
      const response = await httpClient.patch<Requirement>(`${this.buildUrl(id)}/status`, { status });
      toast.success(`Requirement status updated to ${status}`);
      return response.data;
    } catch (error: any) {
      this.handleError(error, 'update requirement status');
      throw error;
    }
  }

  // ==================== MÉTODOS EXTENDIDOS PARA COMPATIBILIDAD ====================

  /**
   * Aprobar requirement (extensión para compatibilidad con código existente)
   */
  async approve(id: string): Promise<Requirement> {
    if (!this.hasRole('hr-manager')) {
      toast.error('Solo los managers pueden aprobar requirements');
      throw new Error('Insufficient permissions to approve requirement');
    }
    return this.updateStatus(id, 'APPROVED');
  }

  /**
   * Cerrar requirement (extensión para compatibilidad con código existente)
   */
  async close(id: string): Promise<Requirement> {
    if (!this.hasRole('hr-manager')) {
      toast.error('Solo los managers pueden cerrar requirements');
      throw new Error('Insufficient permissions to close requirement');
    }
    return this.updateStatus(id, 'CLOSED');
  }

  /**
   * Activar requirement (extensión para compatibilidad con código existente)
   */
  async activate(id: string): Promise<Requirement> {
    return this.updateStatus(id, 'ACTIVE');
  }

  // ==================== FILTROS CONVENIENTES ====================

  /**
   * Obtener requirements por departamento
   */
  async getByDepartment(department: string): Promise<Requirement[]> {
    const response = await this.list({ department });
    return response.data;
  }

  /**
   * Obtener requirements por prioridad
   */
  async getByPriority(priority: Requirement['priority']): Promise<Requirement[]> {
    const response = await this.list({ priority });
    return response.data;
  }

  /**
   * Obtener requirements activos
   */
  async getActive(): Promise<Requirement[]> {
    const response = await this.list({ status: 'ACTIVE' });
    return response.data;
  }

  /**
   * Obtener requirements en borrador
   */
  async getDrafts(): Promise<Requirement[]> {
    const response = await this.list({ status: 'DRAFT' });
    return response.data;
  }

  // ==================== VALIDACIONES ====================

  /**
   * Validar requirement para publicación
   */
  validateForPublication(requirement: Requirement): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!requirement.title?.trim()) errors.push('Title is required');
    if (!requirement.description?.trim()) errors.push('Description is required');
    if (!requirement.department?.trim()) errors.push('Department is required');
    if (requirement.salaryMin <= 0) errors.push('Minimum salary must be greater than 0');
    if (requirement.salaryMax <= requirement.salaryMin) errors.push('Maximum salary must be greater than minimum salary');
    if (!requirement.skills || requirement.skills.length === 0) errors.push('At least one skill is required');
    if (!requirement.location?.trim()) errors.push('Location is required');
    return { valid: errors.length === 0, errors };
  }

  /**
   * Verificar si se puede eliminar un requirement
   */
  async canDelete(id: string): Promise<{ canDelete: boolean; reason?: string }> {
    try {
      const requirement = await this.get(id);
      if (requirement.status === 'ACTIVE') {
        return { canDelete: false, reason: 'Cannot delete active requirements. Please close it first.' };
      }
      return { canDelete: true };
    } catch (error) {
      return { canDelete: false, reason: 'Error checking requirement status' };
    }
  }

  /**
   * Eliminación segura de requirement
   */
  async safeDelete(id: string): Promise<void> {
    const { canDelete, reason } = await this.canDelete(id);
    if (!canDelete) {
      toast.error(reason || 'Cannot delete requirement');
      throw new Error(reason);
    }
    return this.delete(id);
  }

  /**
   * Duplicar requirement
   */
  async duplicate(id: string, overrides?: Partial<CreateRequirementRequest>): Promise<Requirement> {
    await this.validateAuth();
    try {
      const original = await this.get(id);
      const { id: _, createdAt, updatedAt, ...duplicateData } = original;
      const newRequirement: CreateRequirementRequest = {
        ...duplicateData,
        ...overrides,
        title: `${duplicateData.title} (Copy)`,
        status: 'DRAFT'
      };
      const result = await this.create(newRequirement);
      toast.success('Requirement duplicated successfully');
      return result;
    } catch (error: any) {
      this.handleError(error, 'duplicate requirement');
      throw error;
    }
  }

  /**
   * Archivar requirement (cambiar a closed)
   */
  async archive(id: string): Promise<Requirement> {
    return this.updateStatus(id, 'CLOSED');
  }
}

// Instancia singleton del servicio
export const requirementsService = new RequirementsService();
export default requirementsService;