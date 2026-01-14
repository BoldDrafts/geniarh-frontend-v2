// components/UploadDetailsModal.tsx
import React, { useState, useEffect } from 'react';
import { X, FileSpreadsheet, Clock, CheckCircle, AlertCircle, Download, Eye, Loader2 } from 'lucide-react';
import { ActiveUpload } from '../hooks/useBulkUpload';
import { BulkUploadResults } from '../types/bulkCandidate.types';
import CsvValidationResults from './CsvValidationResults';

interface UploadDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  upload: ActiveUpload;
  recruitmentId: string;
  onViewResults?: () => void;
  onDownloadReport?: () => void;
  onFetchResults: (uploadId: string) => Promise<BulkUploadResults | null>;
}

const UploadDetailsModal: React.FC<UploadDetailsModalProps> = ({
  isOpen,
  onClose,
  upload,
  recruitmentId,
  onViewResults,
  onDownloadReport,
  onFetchResults
}) => {
  const [loadingResults, setLoadingResults] = useState(false);
  const [currentResults, setCurrentResults] = useState<BulkUploadResults | undefined>(upload.results);

  // Fetch results when modal opens for completed uploads
  useEffect(() => {
    const fetchResults = async () => {
      if (isOpen && (upload.status.status === 'completed' || upload.status.status === 'failed' || upload.status.status === 'completed_with_errors')) {
        setLoadingResults(true);
        try {
          const results = await onFetchResults(upload.uploadId);
          if (results) {
            setCurrentResults(results);
          }
        } catch (error) {
          console.error('Error fetching results in modal:', error);
        } finally {
          setLoadingResults(false);
        }
      }
    };

    fetchResults();
  }, [isOpen, upload.uploadId, upload.status.status, onFetchResults]);

  // Reset results when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentResults(upload.results);
      setLoadingResults(false);
    }
  }, [isOpen, upload.results]);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'completed_with_errors':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      case 'cancelled':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5" />;
      case 'completed_with_errors':
        return <AlertCircle className="h-5 w-5" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5" />;
      case 'processing':
        return <Clock className="h-5 w-5 animate-spin" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
  };

  // Validation data from results
  const validationResults = {
    isValid: upload.status.status === 'completed',
    totalRows: currentResults?.summary.totalRows || upload.status.progress?.totalRows || 0,
    validRows: currentResults?.summary.successfullyProcessed || upload.status.progress?.successfullyProcessed || 0,
    errors: currentResults?.errors || [],
    warnings: []
  };

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-start justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel - Dynamic height */}
        <div className="inline-block align-top bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileSpreadsheet className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Upload Details
                  </h3>
                  <p className="text-sm text-gray-500">{upload.fileName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content - No max height, grows dynamically */}
          <div className="bg-white px-6 py-4">
            {/* Upload Status */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-900">Upload Status</h4>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(upload.status.status)}`}>
                  {getStatusIcon(upload.status.status)}
                  <span className="ml-2 capitalize">{upload.status.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-gray-500">Started</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {upload.createdAt.toLocaleString()}
                  </div>
                </div>
                
                {currentResults?.summary.processingTimeSeconds && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Duration</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {formatDuration(currentResults.summary.processingTimeSeconds)}
                    </div>
                  </div>
                )}
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-gray-500">Current Operation</div>
                  <div className="text-sm text-gray-900">
                    {upload.status.currentOperation || 'Completed'}
                  </div>
                </div>
              </div>

              {/* Progress for active uploads */}
              {upload.status.status === 'processing' && upload.status.progress && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm font-medium text-gray-900">
                      {upload.status.progress.percentageComplete.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${upload.status.progress.percentageComplete}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                    <div>
                      <span className="text-gray-500">Total:</span> {upload.status.progress.totalRows}
                    </div>
                    <div>
                      <span className="text-gray-500">Processed:</span> {upload.status.progress.processedRows}
                    </div>
                    <div>
                      <span className="text-gray-500">Success:</span> {upload.status.progress.successfullyProcessed}
                    </div>
                    <div>
                      <span className="text-gray-500">Failed:</span> {upload.status.progress.failedToProcess}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Loading indicator */}
            {loadingResults && (
              <div className="mb-6 flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin mr-3" />
                <span className="text-gray-600">Loading results...</span>
              </div>
            )}

            {/* Validation Results */}
            {!loadingResults && (upload.status.status === 'completed' || upload.status.status === 'failed' || upload.status.status === 'completed_with_errors') && validationResults.totalRows > 0 && (
              <div className="mb-6">
                <CsvValidationResults validation={validationResults} />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Upload ID: {upload.uploadId}
            </div>
            <div className="flex space-x-3">
              {(upload.status.status === 'completed' || upload.status.status === 'completed_with_errors') && onViewResults && (
                <button
                  onClick={onViewResults}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Candidates
                </button>
              )}
              
              {onDownloadReport && (
                <button
                  onClick={onDownloadReport}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </button>
              )}
              
              <button
                onClick={onClose}
                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadDetailsModal;