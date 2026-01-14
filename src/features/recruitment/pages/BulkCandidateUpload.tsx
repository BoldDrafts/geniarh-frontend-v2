// pages/BulkCandidateUpload.tsx (Complete Rewrite)
import React, { useState } from 'react';
import { ArrowLeft, Upload, Clock, Plus, FileSpreadsheet, ChevronRight } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

// Components
import ActiveUploadsSection from '../components/ActiveUploadsSection';
import UploadInstructions from '../components/UploadInstructions';
import CsvValidationResults from '../components/CsvValidationResults';
import FileUploadArea from '../components/FileUploadArea';
import TemplateInformation from '../components/TemplateInformation';
import ErrorDisplay from '../components/ErrorDisplay';
import UploadDetailsModal from '../components/UploadDetailsModal';

// Hooks
import { useBulkUpload, ActiveUpload } from '../hooks/useBulkUpload';

// Types
type ViewMode = 'upload' | 'monitor';

const BulkCandidateUpload: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // State management
  const [viewMode, setViewMode] = useState<ViewMode>('upload');
  const [selectedUpload, setSelectedUpload] = useState<ActiveUpload | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Custom hook
  const {
    uploadState,
    activeUploads,
    loadingUploads,
    handleFileSelect,
    handleUpload,
    resetUpload,
    downloadTemplate,
    cancelUpload,
    removeActiveUpload,
    clearCompletedUploads,
    fetchBulkUploads,
    refreshUploads,
    fetchUploadResults
  } = useBulkUpload(id || '');

  // Event handlers
  const handleRetryUpload = () => {
    if (uploadState.file) {
      handleUpload();
    }
  };

  const dismissError = () => {
    resetUpload();
  };

  const handleUploadWithRedirect = async () => {
    try {
      await handleUpload();
      // Switch to monitor view after upload starts
      setViewMode('monitor');
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleUploadClick = (upload: ActiveUpload) => {
    setSelectedUpload(upload);
    setShowUploadModal(true);
  };

  const handleCloseModal = () => {
    setShowUploadModal(false);
    setSelectedUpload(null);
  };

  const handleViewResults = () => {
    if (selectedUpload) {
      navigate(`/recruitment/${id}/candidates`);
      handleCloseModal();
    }
  };

  const handleDownloadReport = () => {
    console.log('Download report for upload:', selectedUpload?.uploadId);
    // Implement download functionality
  };

  // Calculate statistics
  const processingCount = activeUploads.filter(upload => upload.status.status === 'processing').length;
  const totalActiveCount = activeUploads.length;

  // Early return for invalid ID
  if (!id) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-10">
          <p className="text-gray-500">Invalid recruitment process ID</p>
          <button
            onClick={() => navigate('/recruitment')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Back to Recruitment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(`/recruitment/${id}/candidates`)}
          className="mr-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Bulk Candidate Upload</h1>
          <p className="text-gray-500 mt-1">
            Upload multiple candidates at once using our CSV template
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setViewMode('upload')}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                viewMode === 'upload'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                New Upload
              </div>
            </button>
            
            <button
              onClick={() => setViewMode('monitor')}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                viewMode === 'monitor'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Active Uploads
                {totalActiveCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                    {totalActiveCount}
                  </span>
                )}
                {processingCount > 0 && (
                  <span className="ml-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                )}
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Descriptions */}
        <div className="mt-2 text-sm text-gray-600">
          {viewMode === 'upload' && (
            <p>Upload new candidate files and track validation results</p>
          )}
          {viewMode === 'monitor' && (
            <p>
              Monitor ongoing uploads and view completed results
              {processingCount > 0 && (
                <span className="ml-2 text-blue-600 font-medium">
                  ({processingCount} currently processing)
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Tab Content */}
      {viewMode === 'upload' && (
        <div className="space-y-6">
          {/* Quick Access Banner */}
          {totalActiveCount > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-600 mr-2" />
                  <div>
                    <div className="font-medium text-blue-900">
                      {totalActiveCount} upload{totalActiveCount !== 1 ? 's' : ''} in progress
                    </div>
                    <div className="text-sm text-blue-700">
                      {processingCount > 0 && `${processingCount} currently processing`}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setViewMode('monitor')}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View Details →
                </button>
              </div>
            </div>
          )}

          {/* Simplified Upload Flow */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Upload Candidates</h2>
              <p className="text-gray-600">Follow these simple steps to upload your candidate list</p>
            </div>

            {/* Step-by-step process */}
            <div className="space-y-6">
              {/* Step 1: Download Template */}
              <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">Download the template</h3>
                  <p className="text-sm text-gray-600 mb-3">Start with our pre-formatted CSV template</p>
                  <button
                    onClick={downloadTemplate}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Download Template
                  </button>
                </div>
              </div>

              {/* Step 2: Fill Data */}
              <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">Fill in candidate data</h3>
                  <p className="text-sm text-gray-600">Add your candidates' information to the template</p>
                  <div className="mt-2 text-xs text-gray-500">
                    Required: firstName, lastName, email | Optional: phone, linkedinUrl, skills, etc.
                  </div>
                </div>
              </div>

              {/* Step 3: Upload File */}
              <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-3">Upload your file</h3>
                  
                  {/* File Upload Area */}
                  <FileUploadArea
                    file={uploadState.file}
                    uploading={uploadState.uploading}
                    csvValidation={uploadState.csvValidation}
                    onFileSelect={handleFileSelect}
                    onUpload={handleUploadWithRedirect}
                    onReset={resetUpload}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {uploadState.error && (
            <ErrorDisplay
              error={uploadState.error}
              onRetry={uploadState.file ? handleRetryUpload : undefined}
              onDismiss={dismissError}
              variant="error"
            />
          )}

          {/* Collapsible Help Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <details className="group">
              <summary className="cursor-pointer p-4 flex items-center justify-between hover:bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FileSpreadsheet className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="font-medium text-gray-900">Need help with the template?</span>
                </div>
                <div className="transform group-open:rotate-180 transition-transform">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </summary>
              
              <div className="px-4 pb-4 border-t border-gray-100">
                <div className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-800 mb-2">Required Fields</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• firstName - Candidate's first name</li>
                        <li>• lastName - Candidate's last name</li>
                        <li>• email - Valid email address (must be unique)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-800 mb-2">Optional Fields</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• phone - Contact number</li>
                        <li>• linkedinUrl - LinkedIn profile</li>
                        <li>• currentPosition - Job title</li>
                        <li>• skills - Comma-separated skills</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="text-sm text-yellow-800">
                      <strong>Tips:</strong> Make sure email addresses are unique and valid. 
                      Files can be CSV or Excel format, maximum 10MB.
                    </div>
                  </div>
                </div>
              </div>
            </details>
          </div>
        </div>
      )}

      {viewMode === 'monitor' && (
        <div className="space-y-6">
          {/* Loading State */}
          {loadingUploads && activeUploads.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading uploads...</h3>
              <p className="text-gray-500">Please wait while we fetch your upload history.</p>
            </div>
          )}

          {/* Empty State for Monitor Tab */}
          {!loadingUploads && activeUploads.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No uploads found</h3>
              <p className="text-gray-500 mb-4">
                You don't have any uploads in your history at the moment.
              </p>
              <button
                onClick={() => setViewMode('upload')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Start New Upload
              </button>
            </div>
          )}

          {/* Active Uploads Section */}
          {activeUploads.length > 0 && (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Upload className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-500">Total Uploads</div>
                      <div className="text-2xl font-bold text-gray-900">{totalActiveCount}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-500">Processing</div>
                      <div className="text-2xl font-bold text-gray-900">{processingCount}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Clock className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-500">Completed</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {activeUploads.filter(u => u.status.status === 'completed').length}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Clock className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-500">Failed</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {activeUploads.filter(u => u.status.status === 'failed').length}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Uploads List */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Upload History</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => refreshUploads()}
                      disabled={loadingUploads}
                      className="text-sm text-gray-600 hover:text-gray-800 font-medium px-3 py-1 rounded border border-gray-300 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingUploads ? 'Refreshing...' : 'Refresh'}
                    </button>
                    <button
                      onClick={() => setViewMode('upload')}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      + New Upload
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {activeUploads.map((upload) => (
                    <div 
                      key={upload.id} 
                      onClick={() => handleUploadClick(upload)}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1 min-w-0">
                          <FileSpreadsheet className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                  {upload.fileName}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center space-x-3">
                                  <span>Started: {upload.createdAt.toLocaleTimeString()}</span>
                                  {upload.status.progress && (
                                    <>
                                      <span>•</span>
                                      <span>{upload.status.progress.totalRows} rows</span>
                                    </>
                                  )}
                                  {upload.results?.summary.processingTimeSeconds && (
                                    <>
                                      <span>•</span>
                                      <span>{upload.results.summary.processingTimeSeconds.toFixed(1)}s duration</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-3 ml-4">
                                <div className="text-right">
                                  <div className={`text-sm font-medium flex items-center ${
                                    upload.status.status === 'completed' ? 'text-green-600' :
                                    upload.status.status === 'completed_with_errors' ? 'text-yellow-600' :
                                    upload.status.status === 'failed' ? 'text-red-600' :
                                    upload.status.status === 'processing' ? 'text-blue-600' :
                                    'text-gray-600'
                                  }`}>
                                    {upload.status.status === 'processing' && (
                                      <Clock className="h-4 w-4 mr-1 animate-spin" />
                                    )}
                                    {upload.status.status.charAt(0).toUpperCase() + upload.status.status.slice(1)}
                                  </div>
                                  {upload.status.status === 'processing' && upload.status.progress && (
                                    <div className="text-xs text-gray-500">
                                      {upload.status.progress.percentageComplete.toFixed(1)}% complete
                                    </div>
                                  )}
                                  {(upload.status.status === 'completed' || upload.status.status === 'completed_with_errors') && upload.results && (
                                    <div className="text-xs text-gray-500">
                                      {upload.results.summary.successfullyProcessed}/{upload.results.summary.totalRows} successful
                                    </div>
                                  )}
                                </div>
                                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress bar for processing uploads */}
                      {upload.status.status === 'processing' && upload.status.progress && (
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${upload.status.progress.percentageComplete}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Upload Details Modal */}
      {selectedUpload && id && (
        <UploadDetailsModal
          isOpen={showUploadModal}
          onClose={handleCloseModal}
          upload={selectedUpload}
          recruitmentId={id}
          onViewResults={handleViewResults}
          onDownloadReport={handleDownloadReport}
          onFetchResults={fetchUploadResults}
        />
      )}
    </div>
  );
};

export default BulkCandidateUpload;