import React, { useState } from 'react';
import { 
  Users, 
  Briefcase, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Award,
  UserPlus,
  BrainCircuit,
  Search
} from 'lucide-react';
import StatCard from '../components/StatCard';
import AIAssistantPanel from '../components/AIAssistantPanel';

const Dashboard: React.FC = () => {
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  // Mock data for the visualization
  const recruitmentData = [
    { stage: 'Applied', count: 156 },
    { stage: 'Screening', count: 89 },
    { stage: 'Interview', count: 42 },
    { stage: 'Assessment', count: 21 },
    { stage: 'Offer', count: 13 },
    { stage: 'Hired', count: 8 },
  ];

  // Calculate the maximum count for scaling
  const maxCount = Math.max(...recruitmentData.map(d => d.count));

  // Active recruitment processes
  const activeRecruitments = [
    { 
      id: 'rec-1', 
      title: 'Senior Frontend Developer', 
      department: 'Engineering',
      candidates: 34,
      daysActive: 7,
      status: 'screening'
    },
    { 
      id: 'rec-2', 
      title: 'UX Designer', 
      department: 'Design',
      candidates: 28,
      daysActive: 5,
      status: 'interview'
    },
    { 
      id: 'rec-3', 
      title: 'DevOps Engineer', 
      department: 'Infrastructure',
      candidates: 15,
      daysActive: 12,
      status: 'review'
    },
    { 
      id: 'rec-4', 
      title: 'Product Manager', 
      department: 'Product',
      candidates: 22,
      daysActive: 3,
      status: 'new'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'screening': return 'bg-purple-100 text-purple-800';
      case 'interview': return 'bg-amber-100 text-amber-800';
      case 'review': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your recruitment processes</p>
        </div>
        <button
          onClick={() => setShowAIAssistant(true)}
          className="mt-3 sm:mt-0 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <BrainCircuit className="mr-2 h-4 w-4" />
          AI Assistant
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Active Candidates"
          value={423}
          icon={Users}
          delta={{ value: '12%', isPositive: true }}
        />
        <StatCard
          title="Open Positions"
          value={16}
          icon={Briefcase}
          delta={{ value: '3', isPositive: true }}
        />
        <StatCard
          title="Interviews This Week"
          value={24}
          icon={Calendar}
          delta={{ value: '8%', isPositive: true }}
        />
        <StatCard
          title="Time to Hire (avg)"
          value="18 days"
          icon={Clock}
          delta={{ value: '2 days', isPositive: true }}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recruitment Pipeline Visualization */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">Recruitment Pipeline</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">All positions</span>
              <select className="text-sm border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500">
                <option>All positions</option>
                <option>Engineering</option>
                <option>Design</option>
                <option>Product</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4">
            {recruitmentData.map((item, index) => (
              <div key={index} className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{item.stage}</span>
                  <span className="text-sm text-gray-500">{item.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-semibold text-gray-900">38%</span>
                <p className="text-sm text-gray-500 mt-1">Conversion rate</p>
              </div>
              <div>
                <span className="text-2xl font-semibold text-gray-900">18</span>
                <p className="text-sm text-gray-500 mt-1">Days to fill (avg)</p>
              </div>
              <div>
                <span className="text-2xl font-semibold text-gray-900">85%</span>
                <p className="text-sm text-gray-500 mt-1">AI match accuracy</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* AI Insights */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center mb-6">
            <BrainCircuit className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">AI Insights</h2>
          </div>
          
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <UserPlus className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Candidate recommendations</h3>
                  <p className="text-xs text-blue-700 mt-1">Found 5 potential matches for Senior Frontend Developer from passive candidate pool</p>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Search className="h-5 w-5 text-amber-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">Skill gap identified</h3>
                  <p className="text-xs text-amber-700 mt-1">Current candidates for DevOps lack Kubernetes experience (required in 87% of similar roles)</p>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-teal-50 rounded-lg border border-teal-100">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Award className="h-5 w-5 text-teal-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-teal-800">High-potential candidate</h3>
                  <p className="text-xs text-teal-700 mt-1">Maria Rodriguez (UX Designer) shows 95% match to success patterns from past hires</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <button 
              onClick={() => setShowAIAssistant(true)}
              className="w-full mt-2 px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors text-sm font-medium flex items-center justify-center"
            >
              <BrainCircuit className="mr-2 h-4 w-4" />
              Ask AI Assistant
            </button>
          </div>
        </div>
      </div>

      {/* Active Recruitment Processes */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Active Recruitment Processes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidates
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days Active
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activeRecruitments.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{job.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{job.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{job.candidates}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{job.daysActive}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(job.status)}`}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <a href="#" className="text-blue-600 hover:text-blue-900">View</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Assistant Panel */}
      {showAIAssistant && (
        <AIAssistantPanel 
          context="dashboard" 
          onClose={() => setShowAIAssistant(false)} 
        />
      )}
    </div>
  );
};

export default Dashboard;