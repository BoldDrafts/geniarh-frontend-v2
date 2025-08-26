import { AxiosResponse } from 'axios';
import { toast } from 'react-hot-toast';
import { httpClient } from './httpClient';
import { authService } from './authService';
import { Pagination } from '../../../features/recruitment/types/shared';

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface ServiceOptions {
  baseUrl: string;
  resourceName: string;
  requireAuth?: boolean;
  requiredRoles?: string[];
  requireAllRoles?: boolean;
}

/**
 * Servicio base que proporciona operaciones CRUD estándar con autenticación automática
 * Puede ser extendido por otros servicios para funcionalidad específica
 */
export abstract class BaseService<T = any, CreateT = Partial<T>, UpdateT = Partial<T>> {
  protected baseUrl: string;
  protected resourceName: string;
  protected requireAuth: boolean;
  protected requiredRoles?: string[];
  protected requireAllRoles: boolean;

  constructor(options: ServiceOptions) {
    this.baseUrl = options.baseUrl;
    this.resourceName = options.resourceName;
    this.requireAuth = options.requireAuth ?? true;
    this.requiredRoles = options.requiredRoles;
    this.requireAllRoles = options.requireAllRoles ?? false;
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
  protected handleError(error: any, operation: string): never {
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
   * Listar recursos con paginación y filtros opcionales
   */
  async list<P extends PaginationParams = PaginationParams>(
    params?: P
  ): Promise<PaginatedResponse<T>> {
    await this.validateAuth();

    try {
      const queryParams = {
        ...params,
        page: params?.page || 1,
        limit: params?.limit || 20,
        sortBy: params?.sortBy || 'createdAt',
        sortOrder: params?.sortOrder || 'desc'
      };

      const response: AxiosResponse<PaginatedResponse<T>> = await httpClient.get(
        this.buildUrl(),
        { params: queryParams }
      );

      return response.data;
    } catch (error: any) {
      this.handleError(error, `fetch ${this.resourceName}`);
    }
  }

  /**
   * Obtener un recurso por ID
   */
  async get(id: string): Promise<T> {
    await this.validateAuth();

    try {
      const response: AxiosResponse<T> = await httpClient.get(this.buildUrl(id));
      return response.data;
    } catch (error: any) {
      this.handleError(error, `fetch ${this.resourceName}`);
    }
  }

  /**
   * Crear un nuevo recurso
   */
  async create(data: CreateT): Promise<T> {
    await this.validateAuth();

    try {
      const response: AxiosResponse<T> = await httpClient.post(this.buildUrl(), data);
      toast.success(`${this.resourceName} created successfully`);
      return response.data;
    } catch (error: any) {
      this.handleError(error, `create ${this.resourceName}`);
    }
  }

  /**
   * Actualizar un recurso existente
   */
  async update(id: string, data: UpdateT): Promise<T> {
    await this.validateAuth();

    try {
      const response: AxiosResponse<T> = await httpClient.put(this.buildUrl(id), data);
      toast.success(`${this.resourceName} updated successfully`);
      return response.data;
    } catch (error: any) {
      this.handleError(error, `update ${this.resourceName}`);
    }
  }

  /**
   * Actualización parcial de un recurso
   */
  async patch(id: string, data: Partial<UpdateT>): Promise<T> {
    await this.validateAuth();

    try {
      const response: AxiosResponse<T> = await httpClient.patch(this.buildUrl(id), data);
      toast.success(`${this.resourceName} updated successfully`);
      return response.data;
    } catch (error: any) {
      this.handleError(error, `patch ${this.resourceName}`);
    }
  }

  /**
   * Eliminar un recurso
   */
  async delete(id: string): Promise<void> {
    await this.validateAuth();

    try {
      await httpClient.delete(this.buildUrl(id));
      toast.success(`${this.resourceName} deleted successfully`);
    } catch (error: any) {
      this.handleError(error, `delete ${this.resourceName}`);
    }
  }

  /**
   * Operación personalizada en un recurso específico
   */
  async customOperation<R = any>(
    id: string,
    operation: string,
    data?: any,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST'
  ): Promise<R> {
    await this.validateAuth();

    try {
      let response: AxiosResponse<R>;
      const url = this.buildUrl(`${id}/${operation}`);

      switch (method) {
        case 'GET':
          response = await httpClient.get(url);
          break;
        case 'POST':
          response = await httpClient.post(url, data);
          break;
        case 'PUT':
          response = await httpClient.put(url, data);
          break;
        case 'PATCH':
          response = await httpClient.patch(url, data);
          break;
        case 'DELETE':
          response = await httpClient.delete(url);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      return response.data;
    } catch (error: any) {
      this.handleError(error, `${operation} on ${this.resourceName}`);
    }
  }

  /**
   * Operación en lote (bulk operation)
   */
  async bulkOperation<R = any>(
    operation: string,
    data: any,
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST'
  ): Promise<R> {
    await this.validateAuth();

    try {
      let response: AxiosResponse<R>;
      const url = this.buildUrl(`bulk/${operation}`);

      switch (method) {
        case 'POST':
          response = await httpClient.post(url, data);
          break;
        case 'PUT':
          response = await httpClient.put(url, data);
          break;
        case 'PATCH':
          response = await httpClient.patch(url, data);
          break;
        case 'DELETE':
          response = await httpClient.delete(url, { data });
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      return response.data;
    } catch (error: any) {
      this.handleError(error, `bulk ${operation} on ${this.resourceName}`);
    }
  }

  /**
   * Buscar recursos con criterios específicos
   */
  async search<P = any>(criteria: P): Promise<PaginatedResponse<T>> {
    await this.validateAuth();

    try {
      const response: AxiosResponse<PaginatedResponse<T>> = await httpClient.post(
        this.buildUrl('search'),
        criteria
      );

      return response.data;
    } catch (error: any) {
      this.handleError(error, `search ${this.resourceName}`);
    }
  }

  /**
   * Obtener estadísticas o métricas del recurso
   */
  async getStats<S = any>(params?: any): Promise<S> {
    await this.validateAuth();

    try {
      const response: AxiosResponse<S> = await httpClient.get(
        this.buildUrl('stats'),
        { params }
      );

      return response.data;
    } catch (error: any) {
      this.handleError(error, `fetch ${this.resourceName} stats`);
    }
  }

  /**
   * Exportar datos en diferentes formatos
   */
  async export(format: 'csv' | 'excel' | 'pdf' = 'csv', params?: any): Promise<Blob> {
    await this.validateAuth();

    try {
      const response: AxiosResponse<Blob> = await httpClient.get(
        this.buildUrl(`export/${format}`),
        {
          params,
          responseType: 'blob'
        }
      );

      return response.data;
    } catch (error: any) {
      this.handleError(error, `export ${this.resourceName}`);
    }
  }

  // ==================== Métodos de utilidad ====================

  /**
   * Obtener información del usuario actual
   */
  protected getCurrentUser() {
    return authService.getCurrentUser();
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  protected hasRole(role: string): boolean {
    return authService.hasRole(role);
  }

  /**
   * Verificar permisos
   */
  protected hasPermission(roles: string[], requireAll: boolean = false): boolean {
    return authService.hasPermission(roles, requireAll);
  }
}