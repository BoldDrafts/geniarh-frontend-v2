import { useMemo } from 'react';

export interface UserInfo {
  id?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  roles?: string[];
}

/**
 * Dummy Auth Hook
 * Simulates authentication for development
 */
export const useAuth = () => {
  const userInfo: UserInfo = useMemo(() => ({
    id: 'user-1',
    username: 'demo-user',
    email: 'demo@ejemplo.com',
    firstName: 'Usuario',
    lastName: 'Demo',
    fullName: 'Usuario Demo',
    roles: ['recruiter', 'hr-manager']
  }), []);

  const hasRole = (role: string): boolean => {
    return userInfo.roles?.includes(role) || false;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => hasRole(role));
  };

  const hasAllRoles = (roles: string[]): boolean => {
    return roles.every(role => hasRole(role));
  };

  const login = () => {
    console.log('Login called');
  };

  const logout = () => {
    console.log('Logout called');
  };

  const debugRoles = () => {
    console.log('=== DEBUG: User Roles Information ===');
    console.log('User Info:', userInfo);
    console.log('All Roles:', userInfo.roles);
    console.log('=====================================');
  };

  return {
    // Estado
    isAuthenticated: true,
    isInitialized: true,
    userInfo,
    
    // Métodos de autenticación
    login,
    logout,
    
    // Métodos de autorización
    hasRole,
    hasAnyRole,
    hasAllRoles,
    
    // Debug
    debugRoles
  };
};