import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Save, 
  AlertCircle, 
  User, 
  Users, 
  Lock, 
  PieChart,
  Settings as SettingsIcon,
  PenTool,
  Archive,
  Database,
  Bell
} from 'lucide-react';
import AIAssistantPanel from '../components/AIAssistantPanel';

const Settings: React.FC = () => {
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [activeTab, setActiveTab] = useState('account');

  // Handle saving settings
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Save settings logic here
    alert('Settings saved successfully!');
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Configure your RAGFlow recruitment platform</p>
        </div>
        <button
          onClick={() => setShowAIAssistant(true)}
          className="mt-3 sm:mt-0 flex items-center justify-center px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
        >
          <BrainCircuit className="mr-2 h-4 w-4" />
          AI Setup Assistant
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row">
          {/* Settings Navigation */}
          <div className="md:w-64 md:border-r border-gray-200">
            <nav className="p-4 space-y-1">
              <button
                onClick={() => setActiveTab('account')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'account'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                } transition-all duration-150`}
              >
                <User className={`mr-3 h-5 w-5 ${
                  activeTab === 'account' ? 'text-blue-700' : 'text-gray-500'
                }`} />
                Account Settings
              </button>
              <button
                onClick={() => setActiveTab('team')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'team'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                } transition-all duration-150`}
              >
                <Users className={`mr-3 h-5 w-5 ${
                  activeTab === 'team' ? 'text-blue-700' : 'text-gray-500'
                }`} />
                Team Management
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'security'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                } transition-all duration-150`}
              >
                <Lock className={`mr-3 h-5 w-5 ${
                  activeTab === 'security' ? 'text-blue-700' : 'text-gray-500'
                }`} />
                Security & Privacy
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'ai'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                } transition-all duration-150`}
              >
                <BrainCircuit className={`mr-3 h-5 w-5 ${
                  activeTab === 'ai' ? 'text-blue-700' : 'text-gray-500'
                }`} />
                AI Configuration
              </button>
              <button
                onClick={() => setActiveTab('integrations')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'integrations'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                } transition-all duration-150`}
              >
                <Database className={`mr-3 h-5 w-5 ${
                  activeTab === 'integrations' ? 'text-blue-700' : 'text-gray-500'
                }`} />
                Integrations
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'analytics'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                } transition-all duration-150`}
              >
                <PieChart className={`mr-3 h-5 w-5 ${
                  activeTab === 'analytics' ? 'text-blue-700' : 'text-gray-500'
                }`} />
                Analytics & Reporting
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'notifications'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                } transition-all duration-150`}
              >
                <Bell className={`mr-3 h-5 w-5 ${
                  activeTab === 'notifications' ? 'text-blue-700' : 'text-gray-500'
                }`} />
                Notifications
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'templates'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                } transition-all duration-150`}
              >
                <PenTool className={`mr-3 h-5 w-5 ${
                  activeTab === 'templates' ? 'text-blue-700' : 'text-gray-500'
                }`} />
                Email Templates
              </button>
              <button
                onClick={() => setActiveTab('data')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'data'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                } transition-all duration-150`}
              >
                <Archive className={`mr-3 h-5 w-5 ${
                  activeTab === 'data' ? 'text-blue-700' : 'text-gray-500'
                }`} />
                Data Management
              </button>
              <button
                onClick={() => setActiveTab('general')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'general'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                } transition-all duration-150`}
              >
                <SettingsIcon className={`mr-3 h-5 w-5 ${
                  activeTab === 'general' ? 'text-blue-700' : 'text-gray-500'
                }`} />
                General Settings
              </button>
            </nav>
          </div>

          {/* Settings Content */}
          <div className="flex-1 p-6">
            {activeTab === 'account' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h2>
                <form onSubmit={handleSave}>
                  <div className="space-y-6">
                    <div className="flex items-center">
                      <div className="mr-4">
                        <img
                          className="h-16 w-16 rounded-full object-cover"
                          src="https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                          alt="Profile"
                        />
                      </div>
                      <div>
                        <button
                          type="button"
                          className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Change Avatar
                        </button>
                        <p className="mt-1 text-xs text-gray-500">JPG, GIF or PNG. 1MB max.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          id="firstName"
                          defaultValue="Jane"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          id="lastName"
                          defaultValue="Doe"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          defaultValue="jane.doe@example.com"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                          Role
                        </label>
                        <select
                          id="role"
                          name="role"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          <option>HR Manager</option>
                          <option>Recruiter</option>
                          <option>Hiring Manager</option>
                          <option>Administrator</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          defaultValue="+1 (555) 123-4567"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                          Language
                        </label>
                        <select
                          id="language"
                          name="language"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          <option>English (US)</option>
                          <option>Spanish</option>
                          <option>French</option>
                          <option>German</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-5 border-t border-gray-200">
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'ai' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">AI Configuration</h2>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        AI features require configuration
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          To fully utilize RAGFlow's AI capabilities, you need to configure your AI model preferences and data sources.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handleSave}>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-md font-medium text-gray-800 mb-3">AI Model Settings</h3>
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                          <label htmlFor="modelProvider" className="block text-sm font-medium text-gray-700 mb-1">
                            AI Provider
                          </label>
                          <select
                            id="modelProvider"
                            name="modelProvider"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          >
                            <option>OpenAI</option>
                            <option>Azure OpenAI</option>
                            <option>Anthropic</option>
                            <option>Custom API</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="modelName" className="block text-sm font-medium text-gray-700 mb-1">
                            Model Name
                          </label>
                          <select
                            id="modelName"
                            name="modelName"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          >
                            <option>gpt-4o</option>
                            <option>gpt-4-turbo</option>
                            <option>gpt-3.5-turbo</option>
                            <option>claude-3-opus</option>
                            <option>claude-3-sonnet</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                            API Key
                          </label>
                          <input
                            type="password"
                            name="apiKey"
                            id="apiKey"
                            placeholder="Enter your API key"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                          <p className="mt-1 text-xs text-gray-500">Your API key is encrypted and securely stored.</p>
                        </div>
                        <div>
                          <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-1">
                            Temperature (Creativity)
                          </label>
                          <div className="flex items-center">
                            <span className="text-xs text-gray-500 mr-2">0.0</span>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              defaultValue="0.7"
                              className="w-full"
                            />
                            <span className="text-xs text-gray-500 ml-2">1.0</span>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">Higher values increase creativity but may reduce accuracy.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-md font-medium text-gray-800 mb-3">RAG Configuration</h3>
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                          <label htmlFor="vectorDatabase" className="block text-sm font-medium text-gray-700 mb-1">
                            Vector Database
                          </label>
                          <select
                            id="vectorDatabase"
                            name="vectorDatabase"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          >
                            <option>Pinecone</option>
                            <option>Weaviate</option>
                            <option>Milvus</option>
                            <option>Chroma</option>
                            <option>Elasticsearch</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="embeddingModel" className="block text-sm font-medium text-gray-700 mb-1">
                            Embedding Model
                          </label>
                          <select
                            id="embeddingModel"
                            name="embeddingModel"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          >
                            <option>text-embedding-3-large</option>
                            <option>text-embedding-3-small</option>
                            <option>text-embedding-ada-002</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="vectorDbUrl" className="block text-sm font-medium text-gray-700 mb-1">
                            Vector Database URL
                          </label>
                          <input
                            type="text"
                            name="vectorDbUrl"
                            id="vectorDbUrl"
                            placeholder="https://your-vector-db-instance.com"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="vectorDbKey" className="block text-sm font-medium text-gray-700 mb-1">
                            Vector Database API Key
                          </label>
                          <input
                            type="password"
                            name="vectorDbKey"
                            id="vectorDbKey"
                            placeholder="Enter API key"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-md font-medium text-gray-800 mb-3">Data Sources & Knowledge Base</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <input
                            id="previousHires"
                            name="previousHires"
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor="previousHires" className="ml-3 text-sm text-gray-700">
                            Previous successful hires data
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="jobDescriptions"
                            name="jobDescriptions"
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor="jobDescriptions" className="ml-3 text-sm text-gray-700">
                            Historical job descriptions and requirements
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="industryTrends"
                            name="industryTrends"
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor="industryTrends" className="ml-3 text-sm text-gray-700">
                            Industry trends and salary data
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="companyPolicies"
                            name="companyPolicies"
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor="companyPolicies" className="ml-3 text-sm text-gray-700">
                            Company policies and culture documents
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="interviewFeedback"
                            name="interviewFeedback"
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor="interviewFeedback" className="ml-3 text-sm text-gray-700">
                            Historical interview feedback and assessments
                          </label>
                        </div>
                        
                        <div className="mt-2">
                          <button
                            type="button"
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            + Add custom data source
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-2 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
                        >
                          Re-Index Knowledge Base
                        </button>
                        <p className="mt-1 text-xs text-gray-500">Last indexed: 2 days ago</p>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-md font-medium text-gray-800 mb-3">Ethical AI Settings</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <input
                            id="biasDetection"
                            name="biasDetection"
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor="biasDetection" className="ml-3 text-sm text-gray-700">
                            Enable bias detection in AI recommendations
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="diversityPromoting"
                            name="diversityPromoting"
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor="diversityPromoting" className="ml-3 text-sm text-gray-700">
                            Promote diversity in candidate recommendations
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="humanReview"
                            name="humanReview"
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor="humanReview" className="ml-3 text-sm text-gray-700">
                            Require human review for critical AI decisions
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="explainableAI"
                            name="explainableAI"
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor="explainableAI" className="ml-3 text-sm text-gray-700">
                            Enable explainable AI (reason codes for recommendations)
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="pt-5 border-t border-gray-200">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="mr-3 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Test Connection
                        </button>
                        <button
                          type="submit"
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Save Configuration
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            )}
            
            {activeTab === 'team' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Team Management</h2>
                <p className="text-gray-500 mb-6">Manage team members and their access permissions.</p>
                
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
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
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img 
                                className="h-10 w-10 rounded-full" 
                                src="https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                                alt="" 
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">Jane Doe</div>
                              <div className="text-sm text-gray-500">HR Manager</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">jane.doe@example.com</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            Administrator
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <a href="#" className="text-blue-600 hover:text-blue-900 mr-3">Edit</a>
                          <a href="#" className="text-red-600 hover:text-red-900">Delete</a>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img 
                                className="h-10 w-10 rounded-full" 
                                src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                                alt="" 
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">John Smith</div>
                              <div className="text-sm text-gray-500">Technical Recruiter</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">john.smith@example.com</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                            Recruiter
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <a href="#" className="text-blue-600 hover:text-blue-900 mr-3">Edit</a>
                          <a href="#" className="text-red-600 hover:text-red-900">Delete</a>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img 
                                className="h-10 w-10 rounded-full" 
                                src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                                alt="" 
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">Emily Williams</div>
                              <div className="text-sm text-gray-500">Hiring Manager</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">emily@example.com</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-teal-100 text-teal-800">
                            Manager
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <a href="#" className="text-blue-600 hover:text-blue-900 mr-3">Edit</a>
                          <a href="#" className="text-red-600 hover:text-red-900">Delete</a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6">
                  <button
                    type="button"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Invite Team Member
                  </button>
                </div>
              </div>
            )}
            
            {activeTab !== 'account' && activeTab !== 'ai' && activeTab !== 'team' && (
              <div className="text-center py-10">
                <BrainCircuit className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
                <p className="text-gray-500">
                  We're working on this feature. It will be available in the next release.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Assistant Panel */}
      {showAIAssistant && (
        <AIAssistantPanel 
          context="settings" 
          onClose={() => setShowAIAssistant(false)} 
        />
      )}
    </div>
  );
};

export default Settings;