import React, { useState } from 'react';
import { 
  Plus, 
  UserPlus, 
  BrainCircuit,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Edit3,
  Trash2,
  CheckSquare,
  Mail,
  Calendar,
  Settings,
  ArrowUpRight,
  ChevronDown
} from 'lucide-react';
import AIAssistantPanel from '../components/AIAssistantPanel';
import StageProgress from '../../features/recruitment/components/StageProgress';

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  startDate: string;
  photo: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  progress: number;
  manager: string;
  documents: {
    total: number;
    completed: number;
  };
}

const Onboarding: React.FC = () => {
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [activeTab, setActiveTab] = useState('in_progress');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Mock data for employees in onboarding
  const employees: Employee[] = [
    {
      id: 'emp-1',
      name: 'Michael Rodriguez',
      position: 'Senior Frontend Developer',
      department: 'Engineering',
      startDate: '2024-05-15',
      photo: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      status: 'in_progress',
      progress: 65,
      manager: 'John Smith',
      documents: {
        total: 12,
        completed: 8
      }
    },
    {
      id: 'emp-2',
      name: 'Sarah Johnson',
      position: 'UX Designer',
      department: 'Design',
      startDate: '2024-05-22',
      photo: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      status: 'pending',
      progress: 0,
      manager: 'Emily Williams',
      documents: {
        total: 12,
        completed: 0
      }
    },
    {
      id: 'emp-3',
      name: 'David Li',
      position: 'DevOps Engineer',
      department: 'Infrastructure',
      startDate: '2024-05-08',
      photo: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      status: 'in_progress',
      progress: 35,
      manager: 'Robert Chen',
      documents: {
        total: 12,
        completed: 4
      }
    },
    {
      id: 'emp-4',
      name: 'Emily Wilson',
      position: 'Product Manager',
      department: 'Product',
      startDate: '2024-04-15',
      photo: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      status: 'completed',
      progress: 100,
      manager: 'Jane Foster',
      documents: {
        total: 12,
        completed: 12
      }
    },
    {
      id: 'emp-5',
      name: 'Robert Chen',
      position: 'Full Stack Engineer',
      department: 'Engineering',
      startDate: '2024-04-22',
      photo: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      status: 'in_progress',
      progress: 90,
      manager: 'John Smith',
      documents: {
        total: 12,
        completed: 11
      }
    },
    {
      id: 'emp-6',
      name: 'Sofia Martinez',
      position: 'UI Designer',
      department: 'Design',
      startDate: '2024-05-01',
      photo: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      status: 'delayed',
      progress: 25,
      manager: 'Emily Williams',
      documents: {
        total: 12,
        completed: 3
      }
    }
  ];

  // Filter employees based on active tab and search query
  const filteredEmployees = employees.filter(emp => {
    // Filter by active tab
    if (activeTab === 'in_progress' && emp.status !== 'in_progress') return false;
    if (activeTab === 'pending' && emp.status !== 'pending') return false;
    if (activeTab === 'completed' && emp.status !== 'completed') return false;
    if (activeTab === 'delayed' && emp.status !== 'delayed') return false;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        emp.name.toLowerCase().includes(query) ||
        emp.position.toLowerCase().includes(query) ||
        emp.department.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 mr-1" />;
      case 'in_progress': return <CheckSquare className="h-4 w-4 mr-1" />;
      case 'completed': return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'delayed': return <AlertCircle className="h-4 w-4 mr-1" />;
      default: return <Clock className="h-4 w-4 mr-1" />;
    }
  };

  // Mock onboarding stages for the progress visualization
  const stages = [
    { name: 'Pre-boarding', status: 'complete' },
    { name: 'Documentation', status: 'complete' },
    { name: 'Orientation', status: 'current' },
    { name: 'Training', status: 'upcoming' },
    { name: 'Integration', status: 'upcoming' },
    { name: 'Review', status: 'upcoming' },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Onboarding</h1>
          <p className="text-gray-500 mt-1">Manage employee onboarding processes</p>
        </div>
        <div className="flex mt-3 sm:mt-0 space-x-3">
          <button
            onClick={() => setShowAIAssistant(true)}
            className="flex items-center justify-center px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
          >
            <BrainCircuit className="mr-2 h-4 w-4" />
            AI Assistant
          </button>
          <button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            <Plus className="mr-2 h-4 w-4" />
            New Onboarding
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex space-x-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('in_progress')}
              className={`px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                activeTab === 'in_progress'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                activeTab === 'pending'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                activeTab === 'completed'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setActiveTab('delayed')}
              className={`px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                activeTab === 'delayed'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Delayed
            </button>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search onboarding..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setFilterOpen(!filterOpen)}
              className={`p-2 border rounded-md ${
                filterOpen 
                  ? 'bg-blue-50 border-blue-300 text-blue-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Expanded Filter Panel */}
        {filterOpen && (
          <div className="p-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  <option>Any</option>
                  <option>Engineering</option>
                  <option>Design</option>
                  <option>Product</option>
                  <option>Infrastructure</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <select className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  <option>Any</option>
                  <option>This Week</option>
                  <option>Next Week</option>
                  <option>This Month</option>
                  <option>Next Month</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Progress</label>
                <select className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  <option>Any</option>
                  <option>0-25%</option>
                  <option>26-50%</option>
                  <option>51-75%</option>
                  <option>76-100%</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
                <select className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  <option>Any</option>
                  <option>John Smith</option>
                  <option>Emily Williams</option>
                  <option>Robert Chen</option>
                  <option>Jane Foster</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                Reset Filters
              </button>
              <button className="px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Onboarding List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documents
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <tr 
                  key={employee.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedEmployee(employee)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img 
                          className="h-10 w-10 rounded-full object-cover" 
                          src={employee.photo} 
                          alt={employee.name} 
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-500">Manager: {employee.manager}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(employee.startDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric'
                      })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {employee.status === 'pending' 
                        ? 'Not started' 
                        : employee.status === 'completed'
                        ? 'Completed'
                        : `${Math.ceil((new Date(employee.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days to go`
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                      {getStatusIcon(employee.status)}
                      {employee.status === 'in_progress' 
                        ? 'In Progress' 
                        : employee.status.charAt(0).toUpperCase() + employee.status.slice(1)
                      }
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[100px]">
                        <div 
                          className={`h-2.5 rounded-full ${
                            employee.progress >= 75 ? 'bg-green-600' :
                            employee.progress >= 50 ? 'bg-blue-600' :
                            employee.progress >= 25 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${employee.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-700">{employee.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-1 text-gray-400" />
                      <span>{employee.documents.completed}/{employee.documents.total}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle edit
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle email
                        }}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Mail className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle delete
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredEmployees.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-gray-500">No employees found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Selected Employee Detail */}
      {selectedEmployee && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <h2 className="text-lg font-medium text-gray-900">Onboarding Details</h2>
                <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedEmployee.status)}`}>
                  {selectedEmployee.status === 'in_progress' 
                    ? 'In Progress' 
                    : selectedEmployee.status.charAt(0).toUpperCase() + selectedEmployee.status.slice(1)
                  }
                </span>
              </div>
              <button 
                onClick={() => setSelectedEmployee(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="flex items-start mb-6">
                  <img 
                    src={selectedEmployee.photo} 
                    alt={selectedEmployee.name}
                    className="h-16 w-16 rounded-full object-cover mr-4" 
                  />
                  <div>
                    <h3 className="text-xl font-medium text-gray-900">{selectedEmployee.name}</h3>
                    <p className="text-gray-600">{selectedEmployee.position}</p>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      Starting on {new Date(selectedEmployee.startDate).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    <h3 className="text-md font-medium text-gray-900">Onboarding Progress</h3>
                    <div className="ml-auto flex items-center">
                      <span className="text-sm font-medium text-gray-700 mr-2">{selectedEmployee.progress}% Complete</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            selectedEmployee.progress >= 75 ? 'bg-green-600' :
                            selectedEmployee.progress >= 50 ? 'bg-blue-600' :
                            selectedEmployee.progress >= 25 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${selectedEmployee.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <StageProgress stages={stages} />
                </div>
                
                <div className="mb-6">
                  <h3 className="text-md font-medium text-gray-900 mb-3">Onboarding Tasks</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="mr-3 h-5 w-5 text-green-500">
                            <CheckCircle className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Complete personal information form</p>
                            <p className="text-xs text-gray-500">Completed on Apr 27, 2024</p>
                          </div>
                        </div>
                        <button className="text-sm text-blue-600 hover:text-blue-800">
                          View
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="mr-3 h-5 w-5 text-green-500">
                            <CheckCircle className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Sign employment contract</p>
                            <p className="text-xs text-gray-500">Completed on Apr 28, 2024</p>
                          </div>
                        </div>
                        <button className="text-sm text-blue-600 hover:text-blue-800">
                          View
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="mr-3 h-5 w-5 text-green-500">
                            <CheckCircle className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Submit tax documents</p>
                            <p className="text-xs text-gray-500">Completed on Apr 30, 2024</p>
                          </div>
                        </div>
                        <button className="text-sm text-blue-600 hover:text-blue-800">
                          View
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-white rounded-md border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="mr-3 h-5 w-5 text-blue-500">
                            <Clock className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Complete security training</p>
                            <p className="text-xs text-gray-500">Due by May 10, 2024</p>
                          </div>
                        </div>
                        <button className="text-sm text-blue-600 hover:text-blue-800">
                          Start
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-white rounded-md border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="mr-3 h-5 w-5 text-gray-300">
                            <CheckSquare className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Set up development environment</p>
                            <p className="text-xs text-gray-500">Not started</p>
                          </div>
                        </div>
                        <button className="text-sm text-gray-600 hover:text-gray-800">
                          View
                        </button>
                      </div>
                    </div>
                    
                    <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Show more tasks (7)
                    </button>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="bg-blue-50 rounded-lg border border-blue-100 p-4 mb-6">
                  <div className="flex items-center mb-3">
                    <BrainCircuit className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="text-md font-medium text-blue-800">AI Recommendations</h3>
                  </div>
                  
                  <div className="text-sm text-blue-700 space-y-4">
                    <div>
                      <p className="font-medium">Personalized Welcome:</p>
                      <p className="mt-1">Send a welcome video from the team to increase engagement.</p>
                    </div>
                    
                    <div>
                      <p className="font-medium">Technical Setup:</p>
                      <p className="mt-1">Based on role requirements, schedule development environment setup with IT on May 8.</p>
                    </div>
                    
                    <div>
                      <p className="font-medium">Documentation Priority:</p>
                      <p className="mt-1">Remind about medical benefits form - critical for coverage start date.</p>
                    </div>
                    
                    <div className="pt-3 border-t border-blue-200">
                      <button
                        onClick={() => setShowAIAssistant(true)}
                        className="w-full text-xs font-medium text-blue-700 hover:text-blue-900 bg-blue-100 py-1.5 px-3 rounded-md"
                      >
                        Generate Personalized Plan
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg border border-gray-200 p-4">
                  <h3 className="text-md font-medium text-gray-900 mb-3">Quick Actions</h3>
                  
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                      <Mail className="mr-2 h-4 w-4" />
                      Send Welcome Email
                    </button>
                    
                    <button className="w-full flex items-center justify-center px-4 py-2 bg-white border border-green-600 text-green-600 rounded-md hover:bg-green-50 transition-colors text-sm">
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Orientation
                    </button>
                    
                    <button className="w-full flex items-center justify-center px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors text-sm">
                      <FileText className="mr-2 h-4 w-4" />
                      Manage Documents
                    </button>
                    
                    <button className="w-full flex items-center justify-center px-4 py-2 bg-white border border-purple-600 text-purple-600 rounded-md hover:bg-purple-50 transition-colors text-sm">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Assign Buddy
                    </button>
                    
                    <button className="w-full flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 transition-colors text-sm">
                      <Settings className="mr-2 h-4 w-4" />
                      Edit Onboarding Plan
                    </button>
                  </div>
                </div>
                
                <div className="mt-6 bg-gray-50 rounded-lg border border-gray-200 p-4">
                  <h3 className="text-md font-medium text-gray-900 mb-3">HR Contact</h3>
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center mr-3 text-gray-700 font-medium">
                      JD
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Jane Doe</p>
                      <p className="text-xs text-gray-500">HR Specialist</p>
                      <a href="#" className="text-xs text-blue-600 hover:text-blue-800 flex items-center mt-1">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        Contact
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Panel */}
      {showAIAssistant && (
        <AIAssistantPanel 
          context="onboarding" 
          onClose={() => setShowAIAssistant(false)} 
        />
      )}
    </div>
  );
};

export default Onboarding;