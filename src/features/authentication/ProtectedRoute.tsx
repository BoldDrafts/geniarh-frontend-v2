import React, { ReactNode } from 'react';
import { useKeycloak } from '@react-keycloak/web';

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: string[];
  requireAllRoles?: boolean; // Si true, requiere TODOS los roles; si false, solo UNO
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  roles = [], 
  requireAllRoles = false 
}) => {
  const { keycloak, initialized } = useKeycloak();

  // Mostrar loading mientras Keycloak se inicializa
  if (!initialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Verificar si el usuario está autenticado
  if (!keycloak.authenticated) {
    console.log('User not authenticated, redirecting to login...');
    keycloak.login({
      redirectUri: window.location.href,
    });
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Redirigiendo al login...</p>
        </div>
      </div>
    );
  }

  // Verificar roles si se especifican
  if (roles.length > 0) {
    const userRoles = getUserRoles(keycloak);
    const hasRequiredRoles = checkUserRoles(userRoles, roles, requireAllRoles);

    console.log('User roles:', userRoles);
    console.log('Required roles:', roles);
    console.log('Has required roles:', hasRequiredRoles);

    if (!hasRequiredRoles) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
          <div className="text-center max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-red-600 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0h-2M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-2">Acceso denegado</h2>
              <p className="text-gray-600 mb-4">
                No tienes los permisos necesarios para acceder a esta página.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm">
                <p className="font-medium text-gray-800 mb-2">Información de roles:</p>
                <div className="space-y-1">
                  <div>
                    <span className="font-medium">Tus roles:</span>{' '}
                    <span className="text-blue-600">
                      {userRoles.length > 0 ? userRoles.join(', ') : 'Ninguno'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Roles requeridos:</span>{' '}
                    <span className="text-red-600">{roles.join(', ')}</span>
                  </div>
                  <div>
                    <span className="font-medium">Usuario:</span>{' '}
                    <span className="text-gray-600">
                      {keycloak.tokenParsed?.preferred_username || 'Desconocido'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => window.history.back()}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Regresar
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Ir al inicio
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // Usuario autenticado y con permisos, mostrar contenido
  return <>{children}</>;
};

// Función para obtener todos los roles del usuario
const getUserRoles = (keycloak: any): string[] => {
  const roles: string[] = [];
  
  // Roles del realm
  if (keycloak.realmAccess?.roles) {
    roles.push(...keycloak.realmAccess.roles);
  }
  
  // Roles de recursos/clientes
  if (keycloak.resourceAccess) {
    Object.keys(keycloak.resourceAccess).forEach(clientId => {
      const clientRoles = keycloak.resourceAccess[clientId]?.roles || [];
      // Solo agregar roles sin prefijo para simplicidad
      roles.push(...clientRoles);
    });
  }
  
  // Remover duplicados
  return [...new Set(roles)];
};

// Función para verificar si el usuario tiene los roles requeridos
const checkUserRoles = (
  userRoles: string[], 
  requiredRoles: string[], 
  requireAllRoles: boolean
): boolean => {
  if (requireAllRoles) {
    // El usuario debe tener TODOS los roles requeridos
    return requiredRoles.every(role => userRoles.includes(role));
  } else {
    // El usuario debe tener AL MENOS UNO de los roles requeridos
    return requiredRoles.some(role => userRoles.includes(role));
  }
};

export default ProtectedRoute;