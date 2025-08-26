import { useKeycloak } from '@react-keycloak/web';
import { useMemo } from 'react';

export interface UserInfo {
  id?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  roles?: string[];
  realmRoles?: string[];
  clientRoles?: Record<string, string[]>;
}

export const useAuth = () => {
  const { keycloak, initialized } = useKeycloak();

  const userInfo: UserInfo | null = useMemo(() => {
    if (!keycloak.authenticated || !keycloak.tokenParsed) {
      return null;
    }

    const token = keycloak.tokenParsed;
    const realmRoles = keycloak.realmAccess?.roles || [];
    
    // Obtener roles de clientes organizados
    const clientRoles: Record<string, string[]> = {};
    const allResourceRoles: string[] = [];
    
    if (keycloak.resourceAccess) {
      Object.keys(keycloak.resourceAccess).forEach(clientId => {
        const roles = keycloak.resourceAccess[clientId]?.roles || [];
        clientRoles[clientId] = roles;
        allResourceRoles.push(...roles);
      });
    }

    // Combinar todos los roles
    const allRoles = [...realmRoles, ...allResourceRoles];

    return {
      id: token.sub,
      username: token.preferred_username,
      email: token.email,
      firstName: token.given_name,
      lastName: token.family_name,
      fullName: token.name,
      roles: allRoles,
      realmRoles,
      clientRoles,
    };
  }, [keycloak.authenticated, keycloak.tokenParsed, keycloak.realmAccess, keycloak.resourceAccess]);

  const hasRole = (role: string): boolean => {
    return keycloak.hasRealmRole(role) || keycloak.hasResourceRole(role);
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => hasRole(role));
  };

  const hasAllRoles = (roles: string[]): boolean => {
    return roles.every(role => hasRole(role));
  };

  const hasRealmRole = (role: string): boolean => {
    return keycloak.hasRealmRole(role);
  };

  const hasClientRole = (clientId: string, role: string): boolean => {
    return keycloak.hasResourceRole(role, clientId);
  };

  const getClientRoles = (clientId: string): string[] => {
    return keycloak.resourceAccess?.[clientId]?.roles || [];
  };

  const getAllRoles = (): string[] => {
    const roles: string[] = [];
    
    // Agregar roles del realm
    if (keycloak.realmAccess?.roles) {
      roles.push(...keycloak.realmAccess.roles);
    }
    
    // Agregar roles de recursos
    if (keycloak.resourceAccess) {
      Object.keys(keycloak.resourceAccess).forEach(clientId => {
        const clientRoles = keycloak.resourceAccess[clientId]?.roles || [];
        roles.push(...clientRoles);
      });
    }
    
    return [...new Set(roles)]; // Remover duplicados
  };

  const login = () => {
    keycloak.login({
      redirectUri: window.location.href,
    });
  };

  const logout = () => {
    keycloak.logout({
      redirectUri: window.location.origin,
    });
  };

  const updateToken = (minValidity?: number) => {
    return keycloak.updateToken(minValidity || 30);
  };

  const getToken = (): string | undefined => {
    return keycloak.token;
  };

  const isTokenExpired = (): boolean => {
    return keycloak.isTokenExpired();
  };

  // Función de debug para mostrar información de roles
  const debugRoles = () => {
    console.log('=== DEBUG: User Roles Information ===');
    console.log('User Info:', userInfo);
    console.log('All Roles:', getAllRoles());
    console.log('Realm Roles:', keycloak.realmAccess?.roles || []);
    console.log('Resource Access:', keycloak.resourceAccess || {});
    console.log('Token Parsed:', keycloak.tokenParsed);
    console.log('=====================================');
  };

  return {
    // Estado
    isAuthenticated: keycloak.authenticated || false,
    isInitialized: initialized,
    userInfo,
    
    // Métodos de autenticación
    login,
    logout,
    
    // Métodos de autorización
    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasRealmRole,
    hasClientRole,
    getClientRoles,
    getAllRoles,
    
    // Métodos de token
    getToken,
    updateToken,
    isTokenExpired,
    
    // Debug
    debugRoles,
    
    // Instancia de Keycloak (para casos avanzados)
    keycloak,
  };
};