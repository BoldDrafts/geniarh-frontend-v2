import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  FileText, 
  AlertCircle, 
  Search, 
  Filter,
  Calendar,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { auditService } from '../lib/api/auditService';
import { EmailAudit } from '../lib/api/types';

const Audit: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [audits, setAudits] = useState<EmailAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAudits();
  }, [activeTab]);

  const fetchAudits = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await auditService.getAudits(activeTab !== 'all' ? activeTab : undefined);
      
      if (response.error) throw new Error(response.error);
      setAudits(response.data || []);
    } catch (err) {
      setError('Failed to load audit data');
      console.error('Error fetching audits:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'ignored': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processed': return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'pending': return <Clock className="h-4 w-4 mr-1" />;
      case 'failed': return <XCircle className="h-4 w-4 mr-1" />;
      case 'ignored': return <AlertCircle className="h-4 w-4 mr-1" />;
      default: return <Clock className="h-4 w-4 mr-1" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
          <p className="text-gray-500 mt-1">Track and monitor email processing activities</p>
        </div>
        <button
          onClick={fetchAudits}
          className="mt-3 sm:mt-0 flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex space-x-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'all'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('processed')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'processed'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Processed
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'pending'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveTab('failed')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'failed'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Failed
            </button>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search emails..."
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
        
        {filterOpen && (
          <div className="p-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  <option>Last 24 hours</option>
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Custom range</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sender</label>
                <select className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  <option>All senders</option>
                  <option>Internal</option>
                  <option>External</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Has Attachments</label>
                <select className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  <option>Any</option>
                  <option>Yes</option>
                  <option>No</option>
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

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email Details
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sender
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Received
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attachments
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    <RefreshCw className="h-5 w-5 animate-spin inline-block mr-2" />
                    Loading audit data...
                  </td>
                </tr>
              ) : audits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No audit records found
                  </td>
                </tr>
              ) : (
                audits.map((audit) => (
                  <tr key={audit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{audit.subject}</div>
                          <div className="text-sm text-gray-500">ID: {audit.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{audit.sender_name}</div>
                      <div className="text-sm text-gray-500">{audit.sender_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(audit.received_date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(audit.received_date).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(audit.processing_status)}`}>
                        {getStatusIcon(audit.processing_status)}
                        {audit.processing_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {audit.attachments && audit.attachments.length > 0 ? (
                        <div className="space-y-1">
                          {audit.attachments.map((attachment) => (
                            <div key={attachment.id} className="flex items-center text-sm">
                              <FileText className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="text-gray-900">{attachment.file_name}</span>
                              <span className="text-gray-500 ml-1">({formatFileSize(attachment.file_size)})</span>
                              {attachment.is_processed && (
                                <CheckCircle className="h-4 w-4 text-green-500 ml-1" />
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No attachments</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        {audit.web_link && (
                          <a
                            href={audit.web_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <ArrowUpRight className="h-4 w-4" />
                          </a>
                        )}
                        {audit.attachments && audit.attachments.length > 0 && (
                          <button className="text-green-600 hover:text-green-900">
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                        <button className="text-gray-600 hover:text-gray-900">
                          <Calendar className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Audit;