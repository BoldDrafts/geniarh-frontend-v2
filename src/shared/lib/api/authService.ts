import { toast } from 'react-hot-toast';
import KeycloakLocal from '../../../features/authentication/Keycloak';

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  roles: string[];
  clientRoles: Record<string, any>;
}

/**
 * Servicio de autenticación que encapsula todas las funcionalidades de Keycloak
 * Proporciona métodos para validación, gestión de tokens y información de usuario
 */
export class AuthService {
  /**
   * Validar que el usuario esté autenticado y refrescar token si es necesario
   * @param refreshToken - Si debe intentar refrescar el token automáticamente
   * @returns Promise<boolean> - true si está autenticado, false en caso contrario
   */
  async ensureAuthenticated(refreshToken = true): Promise<boolean> {
    if (!KeycloakLocal.authenticated) {
      toast.error('Usuario no autenticado');
      KeycloakLocal.login();
      return false;
    }

    if (refreshToken && KeycloakLocal.isTokenExpired(30)) {
      try {
        const refreshed = await KeycloakLocal.updateToken(30);
        if (!refreshed) {
          toast.error('Sesión expirada. Redirigiendo al login...');
          KeycloakLocal.login();
          return false;
        }
      } catch (error) {
        console.error('Error updating token:', error);
        toast.error('Error actualizando token. Redirigiendo al login...');
        KeycloakLocal.login();
        return false;
      }
    }

    return true;
  }

  /**
   * Obtener información del usuario actual desde el token de Keycloak
   * @returns UserInfo | null - Información del usuario o null si no está autenticado
   */
  getCurrentUser(): UserInfo | null {
    if (!KeycloakLocal.authenticated || !KeycloakLocal.tokenParsed) {
      return null;
    }
    
    return {
      id: KeycloakLocal.tokenParsed.sub,
      username: KeycloakLocal.tokenParsed.preferred_username,
      email: KeycloakLocal.tokenParsed.email,
      name: KeycloakLocal.tokenParsed.name,
      firstName: KeycloakLocal.tokenParsed.given_name,
      lastName: KeycloakLocal.tokenParsed.family_name,
      roles: KeycloakLocal.tokenParsed.realm_access?.roles || [],
      clientRoles: KeycloakLocal.tokenParsed.resource_access || {}
    };
  }

  /**
   * Verificar si el usuario actual tiene un rol específico
   * @param role - Nombre del rol a verificar
   * @returns boolean - true si el usuario tiene el rol
   */
  hasRole(role: string): boolean {
    return KeycloakLocal.authenticated && KeycloakLocal.hasRealmRole(role);
  }

  /**
   * Verificar si el usuario tiene un rol específico en un cliente
   * @param clientId - ID del cliente
   * @param role - Nombre del rol
   * @returns boolean - true si el usuario tiene el rol del cliente
   */
  hasClientRole(clientId: string, role: string): boolean {
    return KeycloakLocal.authenticated && KeycloakLocal.hasResourceRole(role, clientId);
  }

  /**
   * Verificar si el usuario tiene alguno de los roles especificados
   * @param roles - Array de roles a verificar
   * @returns boolean - true si el usuario tiene al menos uno de los roles
   */
  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  /**
   * Verificar si el usuario tiene todos los roles especificados
   * @param roles - Array de roles a verificar
   * @returns boolean - true si el usuario tiene todos los roles
   */
  hasAllRoles(roles: string[]): boolean {
    return roles.every(role => this.hasRole(role));
  }

  /**
   * Obtener el token de autenticación actual
   * @returns string | null - Token bearer o null si no está autenticado
   */
  getToken(): string | null {
    return KeycloakLocal.authenticated ? KeycloakLocal.token : null;
  }

  /**
   * Obtener el token parseado con la información del usuario
   * @returns any - Token parseado o null
   */
  getParsedToken(): any {
    return KeycloakLocal.authenticated ? KeycloakLocal.tokenParsed : null;
  }

  /**
   * Refrescar manualmente el token de autenticación
   * @param minValidity - Tiempo mínimo de validez en segundos
   * @returns Promise<boolean> - true si el token fue refrescado
   */
  async refreshToken(minValidity: number = 30): Promise<boolean> {
    if (!KeycloakLocal.authenticated) {
      return false;
    }

    try {
      return await KeycloakLocal.updateToken(minValidity);
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }

  /**
   * Verificar si el token está expirado
   * @param minValidity - Tiempo mínimo de validez en segundos
   * @returns boolean - true si el token está expirado
   */
  isTokenExpired(minValidity: number = 0): boolean {
    return KeycloakLocal.isTokenExpired(minValidity);
  }

  /**
   * Cerrar sesión en Keycloak
   * @param redirectUri - URI de redirección opcional después del logout
   */
  logout(redirectUri?: string): void {
    KeycloakLocal.logout({ redirectUri });
  }

  /**
   * Iniciar sesión en Keycloak
   * @param redirectUri - URI de redirección opcional después del login
   */
  login(redirectUri?: string): void {
    KeycloakLocal.login({ redirectUri });
  }

  /**
   * Verificar si el usuario está autenticado
   * @returns boolean - true si está autenticado
   */
  isAuthenticated(): boolean {
    return KeycloakLocal.authenticated;
  }

  /**
   * Obtener los roles del realm del usuario actual
   * @returns string[] - Array de roles del realm
   */
  getRealmRoles(): string[] {
    const user = this.getCurrentUser();
    return user?.roles || [];
  }

  /**
   * Obtener los roles de cliente del usuario actual
   * @param clientId - ID del cliente (opcional)
   * @returns Record<string, any> | string[] - Roles de cliente
   */
  getClientRoles(clientId?: string): Record<string, any> | string[] {
    const user = this.getCurrentUser();
    if (!user?.clientRoles) return {};
    
    if (clientId) {
      return user.clientRoles[clientId]?.roles || [];
    }
    
    return user.clientRoles;
  }

  /**
   * Verificar permisos basados en roles para una acción específica
   * @param requiredRoles - Roles requeridos para la acción
   * @param requireAll - Si se requieren todos los roles (true) o al menos uno (false)
   * @returns boolean - true si tiene permisos
   */
  hasPermission(requiredRoles: string[], requireAll: boolean = false): boolean {
    if (!this.isAuthenticated()) return false;
    
    return requireAll 
      ? this.hasAllRoles(requiredRoles)
      : this.hasAnyRole(requiredRoles);
  }

  /**
   * Crear un guard de autenticación para proteger funciones
   * @param requiredRoles - Roles requeridos (opcional)
   * @param requireAll - Si se requieren todos los roles
   * @returns function - Función que valida la autenticación
   */
  createAuthGuard(requiredRoles?: string[], requireAll: boolean = false) {
    return async (): Promise<boolean> => {
      if (!await this.ensureAuthenticated()) {
        return false;
      }

      if (requiredRoles && requiredRoles.length > 0) {
        return this.hasPermission(requiredRoles, requireAll);
      }

      return true;
    };
  }

  /**
   * Decorador para métodos que requieren autenticación
   * @param requiredRoles - Roles requeridos (opcional)
   * @param requireAll - Si se requieren todos los roles
   */
  requireAuth(requiredRoles?: string[], requireAll: boolean = false) {
    return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
      const method = descriptor.value;

      descriptor.value = async function (...args: any[]) {
        const guard = authService.createAuthGuard(requiredRoles, requireAll);
        
        if (!await guard()) {
          throw new Error('Acceso denegado: permisos insuficientes');
        }

        return method.apply(this, args);
      };
    };
  }
}

// Instancia singleton del servicio de autenticación
export const authService = new AuthService();