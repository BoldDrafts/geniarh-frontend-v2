import React, { useEffect, useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { LogIn, Shield, Users, Lock, Zap, BrainCircuit, UserCheck, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const LoginPage: React.FC = () => {
  const { keycloak, initialized } = useKeycloak();
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is already authenticated
  useEffect(() => {
    if (initialized && keycloak.authenticated) {
      // User is already logged in, redirect to dashboard
      window.location.href = '/';
    }
  }, [initialized, keycloak.authenticated]);

  const handleLogin = async () => {
    if (!initialized) {
      toast.error('Authentication system is not ready');
      return;
    }

    setIsLoading(true);
    
    try {
      await keycloak.login({
        redirectUri: `${window.location.origin}/`,
        prompt: 'login'
      });
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!initialized) {
      toast.error('Authentication system is not ready');
      return;
    }

    setIsLoading(true);
    
    try {
      await keycloak.register({
        redirectUri: `${window.location.origin}/dashboard`
      });
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error('Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  // Show loading state if Keycloak is not initialized yet
  if (!initialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing authentication system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 overflow-y-auto">
      <div className="flex flex-col justify-center items-center min-h-screen px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full p-6 w-20 h-20 mx-auto mb-6 shadow-lg">
            <Shield className="h-8 w-8 text-white mx-auto" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            GeniaHR
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Sistema integral de gestión de recursos humanos con autenticación segura
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12 overflow-hidden">
          <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
              <Users className="h-8 w-8 text-green-600 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Gestión de Candidatos
            </h3>
            <p className="text-gray-600 text-sm">
              Administra candidatos y procesos de reclutamiento de manera eficiente
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-orange-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
              <Lock className="h-8 w-8 text-orange-600 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Seguridad Avanzada
            </h3>
            <p className="text-gray-600 text-sm">
              Autenticación multifactor y control de acceso basado en roles
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
              <BrainCircuit className="h-8 w-8 text-purple-600 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              IA Integrada
            </h3>
            <p className="text-gray-600 text-sm">
              Asistente inteligente para optimizar procesos de selección
            </p>
          </div>
        </div>

        {/* Additional Features Row */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12 overflow-hidden">
          <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
              <UserCheck className="h-8 w-8 text-blue-600 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Entrevistas
            </h3>
            <p className="text-gray-600 text-sm">
              Programa y gestiona entrevistas con calendario integrado
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-indigo-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
              <Clock className="h-8 w-8 text-indigo-600 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Onboarding
            </h3>
            <p className="text-gray-600 text-sm">
              Proceso de incorporación automatizado y personalizado
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-teal-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
              <Zap className="h-8 w-8 text-teal-600 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Reportes Avanzados
            </h3>
            <p className="text-gray-600 text-sm">
              Analytics y métricas detalladas para toma de decisiones
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full transform transition-all duration-300 hover:shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Iniciar Sesión
            </h2>
            <p className="text-gray-600">
              Accede a tu cuenta de GeniaHR
            </p>
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading || !initialized}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-lg hover:shadow-xl disabled:shadow-md flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Iniciando sesión...
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5 mr-3" />
                Iniciar Sesión con Keycloak
              </>
            )}
          </button>

          {/*<div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              ¿No tienes cuenta?{' '}
              <button
                onClick={handleRegister}
                disabled={isLoading || !initialized}
                className="text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Registrarse
              </button>
            </p>
          </div>*/}

          {/* Additional Login Options */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-500 mb-3">
              Funcionalidades disponibles después del login:
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pr-2">
              <div className="flex items-center text-gray-600">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                Dashboard
              </div>
              <div className="flex items-center text-gray-600">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                Requerimientos
              </div>
              <div className="flex items-center text-gray-600">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                Reclutamiento
              </div>
              <div className="flex items-center text-gray-600">
                <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
                Candidatos
              </div>
              <div className="flex items-center text-gray-600">
                <div className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></div>
                Entrevistas
              </div>
              <div className="flex items-center text-gray-600">
                <div className="w-2 h-2 bg-teal-400 rounded-full mr-2"></div>
                Onboarding
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Info */}
        <div className="mt-12 text-center text-sm text-gray-500 max-w-2xl pb-8">
          <p className="mb-2">
            <strong>Información del Sistema:</strong>
          </p>
          <p className="mb-2">
            GeniaHR v2.0 | Keycloak Authentication
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs">
            <span className={`inline-flex items-center px-2 py-1 rounded-full ${
              initialized 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-1 ${
                initialized ? 'bg-green-400' : 'bg-red-400'
              }`}></div>
              Auth: {initialized ? 'Ready' : 'Loading'}
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-1"></div>
              SSO Enabled
            </span>
          </div>
          <p className="mt-3 text-xs text-gray-400">
            Para soporte técnico, contacta al administrador del sistema
          </p>
        </div>
      </div>
    </div>
  );
};