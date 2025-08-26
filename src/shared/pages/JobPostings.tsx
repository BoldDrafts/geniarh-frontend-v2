import React, { useState } from 'react';
import { 
  Plus, 
  FileText, 
  Share2, 
  BarChart3, 
  BrainCircuit,
  Edit3,
  Trash2,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Copy,
  ArrowUpRight,
  RefreshCw,
  Zap,
  UserPlus
} from 'lucide-react';
import AIAssistantPanel from '../components/AIAssistantPanel';
import StageProgress from '../../features/recruitment/components/StageProgress';
import NewJobPostingForm from '../components/NewJobPostingForm';

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  status: 'draft' | 'pending' | 'active' | 'closed';
  aiGenerated: boolean;
  channels: {
    linkedin: boolean;
    bumeran: boolean;
    social: boolean;
  };
  views: number;
  applications: number;
  createdDate: string;
  expireDate: string;
  matchScore?: number;
}

const JobPostings: React.FC = () => {
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedPosting, setSelectedPosting] = useState<JobPosting | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'analytics'>('list');
  const [showNewPostingForm, setShowNewPostingForm] = useState(false);

  // Mock data for job postings
  const jobPostings: JobPosting[] = [
    {
      id: 'job-1',
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      location: 'Remote',
      status: 'active',
      aiGenerated: true,
      channels: {
        linkedin: true,
        bumeran: true,
        social: true
      },
      views: 328,
      applications: 17,
      createdDate: '2024-04-12',
      expireDate: '2024-05-12',
      matchScore: 92
    },
    {
      id: 'job-2',
      title: 'UX Designer',
      department: 'Design',
      location: 'New York',
      status: 'active',
      aiGenerated: true,
      channels: {
        linkedin: true,
        bumeran: false,
        social: true
      },
      views: 245,
      applications: 13,
      createdDate: '2024-04-10',
      expireDate: '2024-05-10',
      matchScore: 85
    },
    {
      id: 'job-3',
      title: 'DevOps Engineer',
      department: 'Infrastructure',
      location: 'Remote',
      status: 'draft',
      aiGenerated: false,
      channels: {
        linkedin: false,
        bumeran: false,
        social: false
      },
      views: 0,
      applications: 0,
      createdDate: '2024-04-08',
      expireDate: ''
    },
    {
      id: 'job-4',
      title: 'Product Manager',
      department: 'Product',
      location: 'London',
      status: 'pending',
      aiGenerated: true,
      channels: {
        linkedin: true,
        bumeran: false,
        social: false
      },
      views: 0,
      applications: 0,
      createdDate: '2024-04-05',
      expireDate: '2024-05-05'
    },
    {
      id: 'job-5',
      title: 'Full Stack Engineer',
      department: 'Engineering',
      location: 'Remote',
      status: 'closed',
      aiGenerated: true,
      channels: {
        linkedin: true,
        bumeran: true,
        social: true
      },
      views: 402,
      applications: 24,
      createdDate: '2024-04-01',
      expireDate: '2024-05-01'
    }
  ];

  // Mock recruitment stages for the funnel visualization
  const stages = [
    { name: 'Draft', status: 'complete' },
    { name: 'Review', status: 'complete' },
    { name: 'Published', status: 'current' },
    { name: 'Promoted', status: 'upcoming' },
    { name: 'Closed', status: 'upcoming' }
  ];

  // Toggle AI assistant panel
  const toggleAIAssistant = () => setShowAIAssistant(!showAIAssistant);

  // Filter job postings based on active tab and search query
  const filteredPostings = jobPostings.filter(job => {
    // Filter by active tab
    if (activeTab === 'active' && job.status !== 'active') return false;
    if (activeTab === 'draft' && job.status !== 'draft') return false;
    if (activeTab === 'pending' && job.status !== 'pending') return false;
    if (activeTab === 'closed' && job.status !== 'closed') return false;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        job.title.toLowerCase().includes(query) ||
        job.department.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Select a job posting to view details
  const handleSelectPosting = (posting: JobPosting) => {
    setSelectedPosting(posting);
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit3 className="h-4 w-4 mr-1" />;
      case 'pending': return <Clock className="h-4 w-4 mr-1" />;
      case 'active': return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'closed': return <AlertCircle className="h-4 w-4 mr-1" />;
      default: return <Edit3 className="h-4 w-4 mr-1" />;
    }
  };

  const handleCreateJobPosting = (data: any) => {
    console.log('New job posting data:', data);
    // Here you would typically make an API call to create the job posting
    setShowNewPostingForm(false);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Postings</h1>
          <p className="text-gray-500 mt-1">Create and manage your job postings</p>
        </div>
        <div className="flex mt-3 sm:mt-0 space-x-3">
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center justify-center p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FileText className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`flex items-center justify-center p-2 rounded-md transition-colors ${
                viewMode === 'analytics' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="h-5 w-5" />
            </button>
          </div>
          <button
            onClick={() => setShowAIAssistant(true)}
            className="flex items-center justify-center px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
          >
            <BrainCircuit className="mr-2 h-4 w-4" />
            AI Assistant
          </button>
          <button 
            onClick={() => setShowNewPostingForm(true)}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Job Posting
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <>
          {/* Filter and Search */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex space-x-4 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('active')}
                  className={`px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                    activeTab === 'active'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setActiveTab('draft')}
                  className={`px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                    activeTab === 'draft'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Drafts
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
                  onClick={() => setActiveTab('closed')}
                  className={`px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                    activeTab === 'closed'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Closed
                </button>
              </div>
              
              <div className="mt-4 md:mt-0 flex items-center space-x-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search job postings..."
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
                      <option>Marketing</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <select className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                      <option>Any</option>
                      <option>Remote</option>
                      <option>New York</option>
                      <option>London</option>
                      <option>San Francisco</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Created Date</label>
                    <select className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                      <option>Any</option>
                      <option>Last 7 days</option>
                      <option>Last 30 days</option>
                      <option>Last 90 days</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Distribution</label>
                    <select className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                      <option>Any</option>
                      <option>LinkedIn</option>
                      <option>Bumeran</option>
                      <option>Social Media</option>
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

          {/* Job Postings List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Distribution
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views / Applications
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPostings.map((job) => (
                    <tr 
                      key={job.id} 
                      className="hover:bg-gray-50 cursor-pointer" 
                      onClick={() => handleSelectPosting(job)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <FileText className="h-5 w-5 text-blue-500" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 flex items-center">
                              {job.title}
                              {job.aiGenerated && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                  <BrainCircuit className="h-3 w-3 mr-1" />
                                  AI
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                          {getStatusIcon(job.status)}
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-1">
                          {job.channels.linkedin && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              LinkedIn
                            </span>
                          )}
                          {job.channels.bumeran && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              Bumeran
                            </span>
                          )}
                          {job.channels.social && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Social
                            </span>
                          )}
                          {!job.channels.linkedin && !job.channels.bumeran && !job.channels.social && (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.status === 'active' || job.status === 'closed' ? (
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1 text-gray-400" />
                            <span>{job.views}</span>
                            <span className="mx-1 text-gray-300">/</span>
                            <UserPlus className="h-4 w-4 mr-1 text-green-500" />
                            <span className="text-green-600">{job.applications}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.createdDate}
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
                          {job.status === 'active' && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle share
                              }}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Share2 className="h-4 w-4" />
                            </button>
                          )}
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
            
            {filteredPostings.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-gray-500">No job postings found matching your criteria.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        // Analytics View
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900">Job Posting Analytics</h2>
            <div className="mt-3 md:mt-0 flex items-center space-x-2">
              <label className="text-sm text-gray-700 mr-2">Time Period:</label>
              <select className="border border-gray-300 rounded-md text-sm py-1 px-3 focus:ring-blue-500 focus:border-blue-500">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>Year to date</option>
              </select>
            </div>
          </div>
          
          {/* Analytics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-blue-800">Total Views</p>
                  <p className="text-2xl font-semibold text-blue-900 mt-1">1,245</p>
                </div>
                <Eye className="h-8 w-8 text-blue-300" />
              </div>
              <div className="mt-4 text-xs text-blue-700">
                <span className="inline-flex items-center text-green-600">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                  </svg>
                  32% from last month
                </span>
              </div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-green-800">Applications</p>
                  <p className="text-2xl font-semibold text-green-900 mt-1">78</p>
                </div>
                <UserPlus className="h-8 w-8 text-green-300" />
              </div>
              <div className="mt-4 text-xs text-green-700">
                <span className="inline-flex items-center text-green-600">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                  </svg>
                  18% from last month
                </span>
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-purple-800">Conversion Rate</p>
                  <p className="text-2xl font-semibold text-purple-900 mt-1">6.3%</p>
                </div>
                <Zap className="h-8 w-8 text-purple-300" />
              </div>
              <div className="mt-4 text-xs text-purple-700">
                <span className="inline-flex items-center text-red-600">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                  </svg>
                  2.1% from last month
                </span>
              </div>
            </div>
          </div>
          
          {/* Performance by Posting */}
          <div className="mt-8">
            <h3 className="text-md font-medium text-gray-900 mb-4">Performance by Job Posting</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applications
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conversion
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Match Quality
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobPostings
                    .filter(job => job.status === 'active' || job.status === 'closed')
                    .sort((a, b) => b.views - a.views)
                    .map((job) => (
                      <tr key={job.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">{job.title}</div>
                            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {job.views}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {job.applications}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {((job.applications / job.views) * 100).toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {job.matchScore ? (
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                                <div 
                                  className={`h-2.5 rounded-full ${
                                    job.matchScore >= 85 ? 'bg-green-600' :
                                    job.matchScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${job.matchScore}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{job.matchScore}%</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900">
                            <ArrowUpRight className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Channel Performance */}
          <div className="mt-8">
            <h3 className="text-md font-medium text-gray-900 mb-4">Distribution Channel Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-800">LinkedIn</h4>
                  <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                    Primary
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Views</span>
                    <span className="font-medium">732</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Applications</span>
                    <span className="font-medium">43</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Conversion</span>
                    <span className="font-medium text-green-600">5.9%</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-800">Bumeran Perú</h4>
                  <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                    Secondary
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Views</span>
                    <span className="font-medium">412</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Applications</span>
                    <span className="font-medium">28</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Conversion</span>
                    <span className="font-medium text-green-600">6.8%</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-800">Social Media</h4>
                  <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                    Supplementary
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Views</span>
                    <span className="font-medium">101</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Applications</span>
                    <span className="font-medium">7</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Conversion</span>
                    <span className="font-medium text-yellow-600">6.9%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Selected Job Posting Detail */}
      {selectedPosting && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <h2 className="text-lg font-medium text-gray-900">{selectedPosting.title}</h2>
                <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedPosting.status)}`}>
                  {selectedPosting.status.charAt(0).toUpperCase() + selectedPosting.status.slice(1)}
                </span>
              </div>
              <button 
                onClick={() => setSelectedPosting(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    <h3 className="text-md font-medium text-gray-900">Job Posting Progress</h3>
                    <button className="ml-auto text-sm text-blue-600 hover:text-blue-800 flex items-center">
                      <Edit3 className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                  </div>
                  
                  <StageProgress stages={stages} />
                </div>
                
                <div className="mb-6">
                  <h3 className="text-md font-medium text-gray-900 mb-3">Job Description</h3>
                  <div className="rounded-md bg-gray-50 p-4">
                    <div className="text-sm text-gray-800">
                      <p className="mb-4">
                        We are looking for an experienced {selectedPosting.title} to join our team. The ideal candidate will have strong knowledge in their field and the ability to work in a fast-paced environment.
                      </p>
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Responsibilities:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Design and implement new features and functionality</li>
                          <li>Work with cross-functional teams to define, design, and ship new features</li>
                          <li>Identify and fix performance bottlenecks</li>
                          <li>Help maintain code quality, organization, and automatization</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Requirements:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>5+ years of experience in a similar role</li>
                          <li>Strong problem-solving skills and detail-oriented</li>
                          <li>Excellent communication and teamwork skills</li>
                          <li>Bachelor's degree in Computer Science or related field</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3">Distribution Channels</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className={`p-4 rounded-md border ${selectedPosting.channels.linkedin ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-medium ${selectedPosting.channels.linkedin ? 'text-blue-800' : 'text-gray-500'}`}>LinkedIn</h4>
                        {selectedPosting.channels.linkedin && <CheckCircle className="h-4 w-4 text-blue-600" />}
                      </div>
                      {selectedPosting.channels.linkedin ? (
                        <div className="text-xs text-blue-700">
                          <p>Published: {selectedPosting.createdDate}</p>
                          <p className="mt-1">Expires: {selectedPosting.expireDate}</p>
                        </div>
                      ) : (
                        <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                          Publish to LinkedIn
                        </button>
                      )}
                    </div>
                    
                    <div className={`p-4 rounded-md border ${selectedPosting.channels.bumeran ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-medium ${selectedPosting.channels.bumeran ? 'text-red-800' : 'text-gray-500'}`}>Bumeran</h4>
                        {selectedPosting.channels.bumeran && <CheckCircle className="h-4 w-4 text-red-600" />}
                      </div>
                      {selectedPosting.channels.bumeran ? (
                        <div className="text-xs text-red-700">
                          <p>Published: {selectedPosting.createdDate}</p>
                          <p className="mt-1">Expires: {selectedPosting.expireDate}</p>
                        </div>
                      ) : (
                        <button className="text-xs text-red-600 hover:text-red-800 font-medium">
                          Publish to Bumeran
                        </button>
                      )}
                    </div>
                    
                    <div className={`p-4 rounded-md border ${selectedPosting.channels.social ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-medium ${selectedPosting.channels.social ? 'text-green-800' : 'text-gray-500'}`}>Social Media</h4>
                        {selectedPosting.channels.social && <CheckCircle className="h-4 w-4 text-green-600" />}
                      </div>
                      {selectedPosting.channels.social ? (
                        <div className="text-xs text-green-700">
                          <p>Published: {selectedPosting.createdDate}</p>
                          <p className="mt-1">Groups: 5</p>
                        </div>
                      ) : (
                        <button className="text-xs text-green-600 hover:text-green-800 font-medium">
                          Share on Social Media
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="bg-blue-50 rounded-lg border border-blue-100 p-4 mb-6">
                  <div className="flex items-center mb-3">
                    <BrainCircuit className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="text-md font-medium text-blue-800">AI Insights</h3>
                  </div>
                  
                  <div className="text-sm text-blue-700 space-y-4">
                    <div>
                      <p className="font-medium">Optimization Suggestions:</p>
                      <ul className="mt-1 space-y-1 pl-5 list-disc">
                        <li>Add "competitive salary" to increase applications by ~15%</li>
                        <li>Consider removing "5+ years experience" to widen candidate pool</li>
                        <li>Mention remote work flexibility more prominently</li>
                      </ul>
                    </div>
                    
                    <div>
                      <p className="font-medium">Performance Analytics:</p>
                      <p className="mt-1">This posting is performing 23% better than similar positions in your industry.</p>
                    </div>
                    
                    <div className="pt-3 border-t border-blue-200">
                      <button
                        onClick={toggleAIAssistant}
                        className="w-full text-xs font-medium text-blue-700 hover:text-blue-900 bg-blue-100 py-1.5 px-3 rounded-md"
                      >
                        Suggest Improvements
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg border border-gray-200 p-4">
                  <h3 className="text-md font-medium text-gray-900 mb-3">Quick Actions</h3>
                  
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                      <Eye className="mr-2 h-4 w-4" />
                      Preview Posting
                    </button>
                    
                    {selectedPosting.status === 'active' && (
                      <button className="w-full flex items-center justify-center px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors text-sm">
                        <Share2 className="mr-2 h-4 w-4" />
                        Share Link
                      </button>
                    )}
                    
                    <button className="w-full flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm">
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </button>
                    
                    {selectedPosting.status === 'active' && (
                      <button className="w-full flex items-center justify-center px-4 py-2 bg-white border border-amber-600 text-amber-600 rounded-md hover:bg-amber-50 transition-colors text-sm">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh Posting
                      </button>
                    )}
                    
                    {selectedPosting.status === 'active' && (
                      <button className="w-full flex items-center justify-center px-4 py-2 bg-white border border-red-600 text-red-600 rounded-md hover:bg-red-50 transition-colors text-sm">
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Close Posting
                      </button>
                    )}
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
          context="job-postings" 
          onClose={() => setShowAIAssistant(false)} 
        />
      )}

      {/* New Job Posting Form */}
      {showNewPostingForm && (
        <NewJobPostingForm
          onClose={() => setShowNewPostingForm(false)}
          onSubmit={handleCreateJobPosting}
        />
      )}
    </div>
  );
};

export default JobPostings;