import { toast } from 'react-hot-toast';
import { BaseService, PaginatedResponse } from '../../../shared/lib/api/baseService';
import {
  Requirement,
  Publication,
  RequirementListParams,
  CreateRequirementRequest,
  PublicationPlatform
} from '../types/requirementsTypes';

/**
 * Servicio de Requirements que extiende BaseService
 * Mantiene compatibilidad 100% con la API original
 * Usa automáticamente el token bearer de Keycloak
 */
class RequirementsService extends BaseService<
  Requirement,
  CreateRequirementRequest,
  Partial<Requirement>
> {
  constructor() {
    super({
      baseUrl: import.meta.env.VITE_REQUIREMENTS_API_URL || import.meta.env.VITE_API_URL,
      resourceName: 'requirements',
      requireAuth: true,
      requiredRoles: ['recruiter-supervisor', 'recruiter'],
      requireAllRoles: false
    });
  }

  // ==================== MÉTODOS ORIGINALES (100% compatibles) ====================

  // Usa el método list del BaseService que ya incluye autenticación automática
  async list(params?: RequirementListParams): Promise<PaginatedResponse<Requirement>> {
    return super.list(params);
  }

  // Usa el método create del BaseService que ya incluye autenticación automática
  async create(requirement: CreateRequirementRequest): Promise<Requirement> {
    const requirementData = { ...requirement, status: requirement.status || 'Draft' };
    return super.create(requirementData);
  }

  // Usa el método update del BaseService que ya incluye autenticación automática
  async update(id: string, requirement: Partial<Requirement>): Promise<Requirement> {
    return super.update(id, requirement);
  }

  async updateStatus(id: string, status: Requirement['status']): Promise<Requirement> {
    try {
      const data = await this.customOperation<Requirement>(id, 'status', { status }, 'PATCH');
      toast.success(`Requirement status updated to ${status}`);
      return data;
    } catch (error: any) {
      this.handleError(error, 'update requirement status');
    }
  }

  // ==================== PUBLICACIONES (métodos originales) ====================

  async createPublication(requirementId: string, publication: Omit<Publication, 'id'>): Promise<Publication> {
    await this.validateAuth();
    try {
      const data = await this.customOperation<Publication>(
        requirementId, 
        'publications', 
        publication, 
        'POST'
      );
      toast.success('Publication created successfully');
      return data;
    } catch (error: any) {
      this.handleError(error, 'create publication');
    }
  }

  async updatePublication(requirementId: string, publicationId: string, publication: Publication): Promise<Publication> {
    await this.validateAuth();
    try {
      // Para operaciones anidadas, construimos la URL manualmente pero usando customOperation
      const url = `${requirementId}/publications/${publicationId}`;
      const data = await this.customOperation<Publication>('', url, publication, 'PUT');
      toast.success('Publication updated successfully');
      return data;
    } catch (error: any) {
      this.handleError(error, 'update publication');
    }
  }

  async deletePublication(requirementId: string, publicationId: string): Promise<void> {
    await this.validateAuth();
    try {
      const url = `${requirementId}/publications/${publicationId}`;
      await this.customOperation('', url, undefined, 'DELETE');
      toast.success('Publication deleted successfully');
    } catch (error: any) {
      this.handleError(error, 'delete publication');
    }
  }

  // ==================== CANDIDATOS (métodos originales) ====================

  async assignCandidate(requirementId: string, candidateId: string): Promise<void> {
    await this.validateAuth();
    try {
      const url = `${requirementId}/candidates/${candidateId}`;
      await this.customOperation('', url, undefined, 'POST');
      toast.success('Candidate assigned successfully');
    } catch (error: any) {
      this.handleError(error, 'assign candidate');
    }
  }

  async unassignCandidate(requirementId: string, candidateId: string): Promise<void> {
    await this.validateAuth();
    try {
      const url = `${requirementId}/candidates/${candidateId}`;
      await this.customOperation('', url, undefined, 'DELETE');
      toast.success('Candidate unassigned successfully');
    } catch (error: any) {
      this.handleError(error, 'unassign candidate');
    }
  }

  async listCandidates(requirementId: string): Promise<string[]> {
    await this.validateAuth();
    try {
      const data = await this.customOperation<string[]>(requirementId, 'candidates', undefined, 'GET');
      return data;
    } catch (error: any) {
      this.handleError(error, 'fetch requirement candidates');
    }
  }

  // ==================== MÉTODOS EXTENDIDOS ====================

  async approve(id: string): Promise<Requirement> {
    if (!this.hasRole('hr-manager')) {
      toast.error('Solo los managers pueden aprobar requirements');
      throw new Error('Insufficient permissions to approve requirement');
    }
    return this.updateStatus(id, 'Approved');
  }

  async close(id: string): Promise<Requirement> {
    if (!this.hasRole('hr-manager')) {
      toast.error('Solo los managers pueden cerrar requirements');
      throw new Error('Insufficient permissions to close requirement');
    }
    return this.updateStatus(id, 'Closed');
  }

  async activate(id: string): Promise<Requirement> {
    return this.updateStatus(id, 'Active');
  }

  async getPublications(requirementId: string): Promise<Publication[]> {
    await this.validateAuth();
    try {
      const data = await this.customOperation<Publication[]>(requirementId, 'publications', undefined, 'GET');
      return data;
    } catch (error: any) {
      this.handleError(error, 'fetch publications');
    }
  }

  async publishToPlattform(requirementId: string, platform: PublicationPlatform, options?: { url?: string; expiresAt?: string }): Promise<Publication> {
    const publicationData: Omit<Publication, 'id'> = {
      platform,
      url: options?.url || '',
      status: 'Published',
      publishedAt: new Date().toISOString(),
      expiresAt: options?.expiresAt,
      views: 0,
      applications: 0,
      engagement: { likes: 0, shares: 0, clicks: 0 }
    };
    return this.createPublication(requirementId, publicationData);
  }

  async updatePublicationMetrics(requirementId: string, publicationId: string, metrics: { views?: number; applications?: number; engagement?: Publication['engagement'] }): Promise<Publication> {
    return this.updatePublication(requirementId, publicationId, metrics as Publication);
  }

  async assignMultipleCandidates(requirementId: string, candidateIds: string[]): Promise<{ success: string[]; failed: string[] }> {
    const results = await Promise.allSettled(
      candidateIds.map(candidateId => this.assignCandidate(requirementId, candidateId))
    );

    const success: string[] = [];
    const failed: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        success.push(candidateIds[index]);
      } else {
        failed.push(candidateIds[index]);
      }
    });

    if (success.length > 0) toast.success(`${success.length} candidates assigned successfully`);
    if (failed.length > 0) toast.error(`Failed to assign ${failed.length} candidates`);

    return { success, failed };
  }

  // ==================== BÚSQUEDAS Y FILTROS ====================

  async getByDepartment(department: string): Promise<Requirement[]> {
    const response = await this.list({ department });
    return response.data;
  }

  async getByPriority(priority: Requirement['priority']): Promise<Requirement[]> {
    const response = await this.list({ priority });
    return response.data;
  }

  async getActive(): Promise<Requirement[]> {
    const response = await this.list({ status: 'Active' });
    return response.data;
  }

  async getDrafts(): Promise<Requirement[]> {
    const response = await this.list({ status: 'Draft' });
    return response.data;
  }

  async getBySkills(skills: string[]): Promise<Requirement[]> {
    await this.validateAuth();
    try {
      const data = await this.search({ skills });
      return data.data;
    } catch (error: any) {
      this.handleError(error, 'search by skills');
    }
  }

  async getBySalaryRange(minSalary: number, maxSalary: number, currency: Requirement['salaryCurrency'] = 'USD'): Promise<Requirement[]> {
    await this.validateAuth();
    try {
      const searchCriteria = {
        salaryMin: minSalary,
        salaryMax: maxSalary,
        salaryCurrency: currency
      };
      const data = await this.search(searchCriteria);
      return data.data;
    } catch (error: any) {
      this.handleError(error, 'search by salary range');
    }
  }

  // ==================== UTILIDADES ====================

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

  async canDelete(id: string): Promise<{ canDelete: boolean; reason?: string }> {
    try {
      const requirement = await this.get(id);
      if (requirement.status === 'Active') {
        return { canDelete: false, reason: 'Cannot delete active requirements. Please close it first.' };
      }
      if (requirement.candidates && requirement.candidates.length > 0) {
        return { canDelete: false, reason: 'Cannot delete requirements with assigned candidates.' };
      }
      return { canDelete: true };
    } catch (error) {
      return { canDelete: false, reason: 'Error checking requirement status' };
    }
  }

  async safeDelete(id: string): Promise<void> {
    const { canDelete, reason } = await this.canDelete(id);
    if (!canDelete) {
      toast.error(reason || 'Cannot delete requirement');
      throw new Error(reason);
    }
    return this.delete(id);
  }

  async duplicate(id: string, overrides?: Partial<CreateRequirementRequest>): Promise<Requirement> {
    await this.validateAuth();
    try {
      const original = await this.get(id);
      const { id: _, createdAt, updatedAt, candidates, publications, ...duplicateData } = original;
      const newRequirement: CreateRequirementRequest = {
        ...duplicateData,
        ...overrides,
        title: `${duplicateData.title} (Copy)`,
        status: 'Draft'
      };
      const result = await this.create(newRequirement);
      toast.success('Requirement duplicated successfully');
      return result;
    } catch (error: any) {
      this.handleError(error, 'duplicate requirement');
    }
  }

  async archive(id: string): Promise<Requirement> {
    return this.updateStatus(id, 'Closed');
  }
}

// Instancia singleton del servicio
export const requirementsService = new RequirementsService();
export default requirementsService;