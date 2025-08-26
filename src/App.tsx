import { ReactKeycloakProvider } from '@react-keycloak/web';
import { Toaster } from 'react-hot-toast';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import AuthRoute from './features/authentication/AuthRoute';
import { LoginPage } from './features/authentication/LoginPage';
import ProtectedRoute from './features/authentication/ProtectedRoute';
import Candidates from './features/candidate/pages/Candidates';
import Layout from './shared/components/Layout';
import Dashboard from './shared/pages/Dashboard';
import Interviews from './features/interviews/pages/Interviews';
import Requirements from './features/requirement/pages/Requirements';
import Settings from './shared/pages/Settings';
import Recruitment from './features/recruitment/pages/Recruitment';
import RecruitmentCandidates from './features/recruitment/pages/RecruitmentCandidates';
import KeycloakLocal, { keycloakProviderOptions } from './features/authentication/Keycloak';
import Audit from './shared/pages/Audit';
import Onboarding from './shared/pages/Onboarding';

// Componente de loading
const KeycloakLoading = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-lg text-gray-700">Inicializando autenticación...</p>
      <p className="text-sm text-gray-500 mt-2">Conectando con servidor de autenticación</p>
    </div>
  </div>
);

function AppContent() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Layout>
        <Routes>
          {/* Ruta pública - login */}
          <Route 
            path="/login" 
            element={
              <AuthRoute requireAuth={false}>
                <LoginPage />
              </AuthRoute>
            } 
          />

          {/* Rutas protegidas */}
          <Route 
            path="/" 
            element={
              <AuthRoute>
                <Dashboard />
              </AuthRoute>
            } 
          />
          
          <Route 
            path="/requirements" 
            element={
              <AuthRoute>
                <ProtectedRoute>
                  <Requirements />
                </ProtectedRoute>
              </AuthRoute>
            } 
          />
          
          <Route 
            path="/recruitment" 
            element={
              <AuthRoute>
                <ProtectedRoute roles={['recruiter-supervisor', 'recruiter']}>
                  <Recruitment />
                </ProtectedRoute>
              </AuthRoute>
            } 
          />
          
          <Route 
            path="/recruitment/:id/candidates" 
            element={
              <AuthRoute>
                <ProtectedRoute roles={['recruiter-supervisor', 'recruiter']}>
                  <RecruitmentCandidates />
                </ProtectedRoute>
              </AuthRoute>
            } 
          />
          
          <Route 
            path="/candidates" 
            element={
              <AuthRoute>
                <ProtectedRoute>
                  <Candidates />
                </ProtectedRoute>
              </AuthRoute>
            } 
          />
          
          <Route 
            path="/interviews" 
            element={
              <AuthRoute>
                <ProtectedRoute>
                  <Interviews />
                </ProtectedRoute>
              </AuthRoute>
            } 
          />
          
          <Route 
            path="/onboarding" 
            element={
              <AuthRoute>
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              </AuthRoute>
            } 
          />
          
          <Route 
            path="/settings" 
            element={
              <AuthRoute>
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              </AuthRoute>
            } 
          />
          
          <Route 
            path="/audit" 
            element={
              <AuthRoute>
                <ProtectedRoute>
                  <Audit />
                </ProtectedRoute>
              </AuthRoute>
            } 
          />
        </Routes>
      </Layout>
    </Router>
  );
}

function App() {
  return (
    <ReactKeycloakProvider
      authClient={KeycloakLocal}
      initOptions={keycloakProviderOptions.initOptions}
      LoadingComponent={<KeycloakLoading />}
      onEvent={(event, error) => {
        console.log('🔐 Keycloak Event:', event);
        if (error) {
          console.error('🚨 Keycloak Error:', error);
        }
        
        // Logging para debugging
        switch (event) {
          case 'onReady':
            console.log('✅ Keycloak ready, authenticated:', KeycloakLocal.authenticated);
            break;
          case 'onInitError':
            console.error('❌ Keycloak initialization failed:', error);
            break;
          case 'onAuthSuccess':
            console.log('🎉 Authentication successful');
            break;
          case 'onAuthError':
            console.error('🔒 Authentication failed:', error);
            break;
          case 'onAuthLogout':
            console.log('👋 User logged out');
            break;
          case 'onTokenExpired':
            console.log('⏰ Token expired, refreshing...');
            break;
        }
      }}
    >
      <AppContent />
    </ReactKeycloakProvider>
  );
}

export default App;