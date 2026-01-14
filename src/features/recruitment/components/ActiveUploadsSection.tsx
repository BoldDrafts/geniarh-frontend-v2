// components/ActiveUploadsSection.tsx
import React, { useState } from 'react';
import { Clock, Loader2, CheckCircle, AlertCircle, Eye, X, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ActiveUpload } from '../hooks/useBulkUpload';

interface ActiveUploadsSectionProps {
  activeUploads: ActiveUpload[];
  recruitmentId: string;
  onCancelUpload: (uploadId: string) => void;
  onRemoveUpload: (uploadId: string) => void;
  onClearCompleted: () => void;
}

const ActiveUploadsSection: React.FC<ActiveUploadsSectionProps> = ({
  activeUploads,
  recruitmentId,
  onCancelUpload,
  onRemoveUpload,
  onClearCompleted
}) => {
  const navigate = useNavigate();
  const [showActiveUploads, setShowActiveUploads] = useState(true);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'cancelled':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'processing':
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 mr-2" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 mr-2" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 animate-spin mr-2" />;
      default:
        return <Clock className="h-5 w-5 mr-2" />;
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString();
  };

  if (activeUploads.length === 0) return null;

  const hasCompletedUploads = activeUploads.some(u => 
    u.status.status === 'completed' || u.status.status === 'failed'
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Clock className="h-5 w-5 mr-2 text-blue-600" />
          Active Uploads ({activeUploads.length})
        </h3>
        <button
          onClick={() => setShowActiveUploads(!showActiveUploads)}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          {showActiveUploads ? 'Hide' : 'Show'}
        </button>
      </div>

      {showActiveUploads && (
        <div className="space-y-4">
          {activeUploads.map((upload) => (
            <div
              key={upload.id}
              className={`border rounded-lg p-4 transition-colors ${getStatusColor(upload.status.status)}`}
            >
              {/* Upload Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  {getStatusIcon(upload.status.status)}
                  <div>
                    <h4 className="font-medium text-sm">{upload.fileName}</h4>
                    <p className="text-xs opacity-75">
                      Started: {formatTime(upload.createdAt)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {upload.status.status === 'completed' && upload.results && (
                    <button
                      onClick={() => navigate(`/recruitment/${recruitmentId}/candidates`)}
                      className="text-xs px-3 py-1 bg-white border border-current rounded-md hover:bg-opacity-10 transition-colors"
                    >
                      <Eye className="h-3 w-3 mr-1 inline" />
                      View Results
                    </button>
                  )}
                  
                  {upload.status.status === 'processing' && (
                    <button
                      onClick={() => onCancelUpload(upload.uploadId)}
                      className="text-xs px-3 py-1 bg-white border border-current rounded-md hover:bg-opacity-10 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  
                  <button
                    onClick={() => onRemoveUpload(upload.uploadId)}
                    className="text-xs p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                    title="Remove from list"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Progress Section for Processing Uploads */}
              {upload.status.status === 'processing' && upload.status.progress && (
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs opacity-75">
                      {upload.status.currentOperation || 'Processing...'}
                    </span>
                    <span className="text-xs font-medium">
                      {upload.status.progress.percentageComplete.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-white bg-opacity-30 rounded-full h-2 mb-3">
                    <div 
                      className="bg-white h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${upload.status.progress.percentageComplete}%` }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs opacity-75">
                    <div>
                      <span className="font-medium">Total:</span> {upload.status.progress.totalRows}
                    </div>
                    <div>
                      <span className="font-medium">Processed:</span> {upload.status.progress.processedRows}
                    </div>
                    <div>
                      <span className="font-medium">Success:</span> {upload.status.progress.successfullyProcessed}
                    </div>
                    <div>
                      <span className="font-medium">Failed:</span> {upload.status.progress.failedToProcess}
                    </div>
                  </div>
                  
                  {upload.status.estimatedTimeRemaining && (
                    <div className="text-xs opacity-75 mt-2 text-center">
                      <Clock className="h-3 w-3 inline mr-1" />
                      ETA: {upload.status.estimatedTimeRemaining}s remaining
                    </div>
                  )}
                </div>
              )}

              {/* Results Summary for Completed Uploads */}
              {upload.results && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className="bg-white bg-opacity-30 rounded p-2">
                    <div className="font-medium">Total</div>
                    <div className="text-lg font-bold">{upload.results.summary.totalRows}</div>
                  </div>
                  <div className="bg-white bg-opacity-30 rounded p-2">
                    <div className="font-medium">Success</div>
                    <div className="text-lg font-bold">{upload.results.summary.successfullyProcessed}</div>
                  </div>
                  <div className="bg-white bg-opacity-30 rounded p-2">
                    <div className="font-medium">Failed</div>
                    <div className="text-lg font-bold">{upload.results.summary.failedToProcess}</div>
                  </div>
                  <div className="bg-white bg-opacity-30 rounded p-2">
                    <div className="font-medium">Time</div>
                    <div className="text-lg font-bold">
                      {upload.results.summary.processingTimeSeconds?.toFixed(1) || 0}s
                    </div>
                  </div>
                </div>
              )}

              {/* Status Message */}
              {upload.status.status === 'failed' && (
                <div className="mt-3 text-xs opacity-75">
                  Upload failed. Please check your file and try again.
                </div>
              )}
              
              {upload.status.status === 'cancelled' && (
                <div className="mt-3 text-xs opacity-75">
                  Upload was cancelled.
                </div>
              )}
            </div>
          ))}

          {/* Clear Completed Button */}
          {hasCompletedUploads && (
            <div className="pt-3 border-t border-gray-200">
              <button
                onClick={onClearCompleted}
                className="text-sm text-gray-600 hover:text-gray-800 flex items-center transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear completed uploads
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActiveUploadsSection;