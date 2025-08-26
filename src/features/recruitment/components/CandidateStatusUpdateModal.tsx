import { AlertCircle, X } from 'lucide-react';
import React, { useState } from 'react';
import { CandidateStatus, CandidateStage } from '../model/recruitment';
import { STATUS_LABELS, STATUS_REASONS } from '../utils/RecruitmentConstants';

interface CandidateStatusUpdateModalProps {
  isOpen: boolean;
  candidateName: string;
  currentStatus: CandidateStatus;
  currentStage?: CandidateStage;
  newStatus: CandidateStatus;
  onClose: () => void;
  onConfirm: (reason?: string, notes?: string) => void;
  loading?: boolean;
}

// Función para obtener el color del badge del estado
const getStatusColor = (status: CandidateStatus) => {
  switch (status) {
    case 'new':
      return 'bg-blue-100 text-blue-800';
    case 'contacted':
      return 'bg-indigo-100 text-indigo-800';
    case 'interview':
      return 'bg-yellow-100 text-yellow-800';
    case 'offer':
      return 'bg-pink-100 text-pink-800';
    case 'hired':
      return 'bg-emerald-100 text-emerald-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Función para determinar si el cambio requiere confirmación especial
const requiresConfirmation = (newStatus: CandidateStatus): boolean => {
  return ['rejected'].includes(newStatus);
};

const CandidateStatusUpdateModal: React.FC<CandidateStatusUpdateModalProps> = ({
  isOpen,
  candidateName,
  currentStatus,
  currentStage,
  newStatus,
  onClose,
  onConfirm,
  loading = false
}) => {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [useCustomReason, setUseCustomReason] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalReason = useCustomReason ? reason : reason;
    onConfirm(finalReason || undefined, notes || undefined);
  };

  const handleReasonChange = (selectedReason: string) => {
    if (selectedReason === 'custom') {
      setUseCustomReason(true);
      setReason('');
    } else {
      setUseCustomReason(false);
      setReason(selectedReason);
    }
  };

  const isNegativeStatus = requiresConfirmation(newStatus);
  const availableReasons = STATUS_REASONS[newStatus] || [];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-0 border w-full max-w-md shadow-lg rounded-lg bg-white">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Update Candidate Status
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Candidate Info */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              {candidateName}
            </h3>
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">From:</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(currentStatus)}`}>
                  {STATUS_LABELS[currentStatus]}
                </span>
              </div>
              <span className="text-gray-400">→</span>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">To:</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(newStatus)}`}>
                  {STATUS_LABELS[newStatus]}
                </span>
              </div>
            </div>
          </div>

          {/* Warning for negative statuses */}
          {isNegativeStatus && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <p className="text-sm text-yellow-800">
                    This will reject the candidate from the recruitment process.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Reason Selection */}
          <div className="mb-4">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Status Change
              {(isNegativeStatus || newStatus === 'hired') && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            
            {availableReasons.length > 0 && (
              <div className="mb-3">
                <select
                  value={useCustomReason ? 'custom' : reason}
                  onChange={(e) => handleReasonChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                >
                  <option value="">Select a reason...</option>
                  {availableReasons.map((reasonOption, index) => (
                    <option key={index} value={reasonOption}>
                      {reasonOption}
                    </option>
                  ))}
                  <option value="custom">Other (specify below)</option>
                </select>
              </div>
            )}

            {(useCustomReason || availableReasons.length === 0) && (
              <input
                type="text"
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for status change..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
                required={isNegativeStatus || newStatus === 'hired'}
              />
            )}
          </div>

          {/* Additional Notes */}
          <div className="mb-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
              <span className="text-gray-500 font-normal ml-1">(optional)</span>
            </label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional context or notes about this status change..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
          </div>

          {/* Form Actions */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (isNegativeStatus && !reason) || (newStatus === 'hired' && !reason)}
              className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                isNegativeStatus
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  : newStatus === 'hired'
                  ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="ml-2">Updating...</span>
                </div>
              ) : (
                `Update to ${STATUS_LABELS[newStatus]}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CandidateStatusUpdateModal;