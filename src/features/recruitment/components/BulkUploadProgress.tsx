import React from 'react';
import { CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';

interface BulkUploadProgressProps {
  isVisible: boolean;
  progress: number;
  processed: number;
  total: number;
  failed: number;
  onCancel?: () => void;
  canCancel?: boolean;
}

const BulkUploadProgress: React.FC<BulkUploadProgressProps> = ({
  isVisible,
  progress,
  processed,
  total,
  failed,
  onCancel,
  canCancel = true
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-1/2 mx-auto p-0 w-full max-w-md transform -translate-y-1/2">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">
                  Processing Candidates
                </h3>
              </div>
              {canCancel && onCancel && (
                <button
                  onClick={onCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{total}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{processed}</div>
                <div className="text-xs text-gray-500">Processed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{failed}</div>
                <div className="text-xs text-gray-500">Failed</div>
              </div>
            </div>

            {/* Status Message */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Processing candidate data and validating LinkedIn profiles...
              </p>
              <p className="text-xs text-gray-500 mt-2">
                This process may take a few minutes depending on the number of candidates.
              </p>
            </div>

            {/* Cancel Button */}
            {canCancel && onCancel && (
              <div className="mt-6 text-center">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel Upload
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadProgress;