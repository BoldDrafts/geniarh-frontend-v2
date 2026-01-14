import Keycloak from 'keycloak-js';

// Configuración de Keycloak
const keycloakConfig = {
  url: 'https://auth.cmaconsulting.org/', // URL del servidor Keycloak
  realm: 'geniahrforhr', // Nombre del realm
  clientId: 'geniahr-oauth2-client', // ID del cliente
};

// Inicialización del cliente Keycloak
const KeycloakLocal = new Keycloak(keycloakConfig);

// Opciones de inicialización - DESHABILITAR PKCE para evitar Web Crypto API
export const keycloakInitOptions = {
  onLoad: 'check-sso' as const,
  checkLoginIframe: false,
  // Configuración de tokens
  enableLogging: false,
};

const LoadingComponent = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-lg text-gray-700">Inicializando autenticación...</p>
      <p className="text-sm text-gray-500 mt-2">
        Conectando con servidor de autenticación
      </p>
    </div>
  </div>
);

const ErrorComponent = ({ error }) => (
  <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center">
    <div className="text-center max-w-md mx-auto p-8">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
        <strong className="font-bold">Error de autenticación:</strong>
        <span className="block sm:inline mt-1">{error}</span>
        {error && error.includes && error.includes('Web Crypto API') && (
          <div className="mt-2 text-sm">
            <p>Posibles soluciones:</p>
            <ul className="list-disc list-inside mt-1">
              <li>Ejecutar la aplicación sobre HTTPS</li>
              <li>Usar localhost en lugar de IP</li>
              <li>Usar un navegador más reciente</li>
            </ul>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <button
          onClick={() => window.location.reload()}
          className="block w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Reintentar
        </button>
        <button
          onClick={() => {
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload();
          }}
          className="block w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Limpiar caché y reintentar
        </button>
      </div>
    </div>
  </div>
);


// Opciones del proveedor
export const keycloakProviderOptions = {
  initOptions: keycloakInitOptions,
  LoadingComponent,
  ErrorComponent
};

export default KeycloakLocal;