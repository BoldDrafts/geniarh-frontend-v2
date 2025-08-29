import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Menu, 
  X,
  BrainCircuit,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const location = useLocation();
  const { isAuthenticated, userInfo, logout, debugRoles } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Recruitment', href: '/recruitment', icon: Briefcase },
  ];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleUserMenu = () => setUserMenuOpen(!userMenuOpen);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden" 
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200">
          <Link to="/" className="flex items-center space-x-2">
            <BrainCircuit className="h-8 w-8 text-blue-700" />
            <span className="text-xl font-semibold text-blue-900">GeniaHR</span>
          </Link>
          <button 
            className="lg:hidden text-gray-500 hover:text-gray-700"
            onClick={toggleSidebar}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                } transition-all duration-150`}
              >
                <item.icon className={`mr-3 h-5 w-5 ${
                  isActive ? 'text-blue-700' : 'text-gray-500'
                }`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <div className="h-14 sticky top-0 z-10 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button
            className="lg:hidden text-gray-500 hover:text-gray-700"
            onClick={toggleSidebar}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div></div>
          
          {/* User menu */}
          <div className="relative flex items-center">
            {/* Debug button (solo en desarrollo) */}
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={debugRoles}
                className="mr-3 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-200 transition-colors"
                title="Debug roles in console"
              >
                Debug
              </button>
            )}
            
            {/* User info and dropdown */}
            <div className="relative">
              <button
                onClick={toggleUserMenu}
                className="flex items-center space-x-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-2 hover:bg-gray-50 transition-colors"
              >
                <span className="relative inline-block">
                  <img
                    className="h-8 w-8 rounded-full object-cover"
                    src="https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                    alt="User profile"
                  />
                  <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-400 ring-2 ring-white"></span>
                </span>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {userInfo?.fullName || userInfo?.username || 'Usuario'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {userInfo?.email || 'usuario@ejemplo.com'}
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown menu */}
              {userMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setUserMenuOpen(false)}
                  ></div>
                  
                  <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleLogout();
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors focus:outline-none focus:bg-red-50"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;