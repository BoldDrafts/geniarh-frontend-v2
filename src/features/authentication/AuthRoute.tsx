import React from 'react';
import { Navigate } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';

interface AuthRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean; // true = requiere estar autenticado, false = requiere NO estar autenticado
}

/**
 * Componente para manejar rutas que requieren o no requieren autenticación
 * 
 * @param requireAuth - true: requiere estar autenticado, false: requiere NO estar autenticado
 * @param redirectTo - ruta a la que redirigir si no cumple la condición
 */
const AuthRoute: React.FC<AuthRouteProps> = ({ 
  children, 
  redirectTo = '/',
  requireAuth = true 
}) => {
  const { keycloak, initialized } = useKeycloak();

  // Mostrar loading mientras se inicializa
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

  const isAuthenticated = keycloak.authenticated;

  // Si requiere autenticación y NO está autenticado -> redirigir
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si NO requiere autenticación (ej: página de login) y SÍ está autenticado -> redirigir
  if (!requireAuth && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Todo OK, mostrar contenido
  return <>{children}</>;
};

export default AuthRoute;