import { AlertCircle, AlertTriangle, Trash2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

type ConfirmationType = 'simple' | 'type-to-confirm' | 'dangerous';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: string;
  itemToDelete: string;
  confirmationType?: ConfirmationType;
  confirmButtonText?: string;
  isDangerous?: boolean;
  loading?: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemToDelete,
  confirmationType = 'simple',
  confirmButtonText,
  isDangerous = false,
  loading = false,
}) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setConfirmationText('');
      setConfirmed(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Determine if confirm button should be enabled
  const isConfirmEnabled = () => {
    if (loading) return false;
    
    switch (confirmationType) {
      case 'simple':
        return true;
      case 'type-to-confirm':
        return confirmationText === itemToDelete;
      case 'dangerous':
        return confirmed;
      default:
        return true;
    }
  };

  // Get appropriate icon
  const getIcon = () => {
    if (isDangerous) {
      return <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />;
    }
    return <AlertCircle className="h-6 w-6 text-amber-600 mr-2" />;
  };

  // Get button text
  const getButtonText = () => {
    if (loading) return 'Processing...';
    if (confirmButtonText) return confirmButtonText;
    
    if (title.toLowerCase().includes('delete')) return 'Delete';
    if (title.toLowerCase().includes('remove')) return 'Remove';
    if (title.toLowerCase().includes('cancel')) return 'Cancel';
    return 'Confirm';
  };

  // Get button color classes
  const getButtonClasses = () => {
    const baseClasses = 'px-4 py-2 text-sm font-medium rounded-md transition-colors';
    const enabledClasses = isDangerous 
      ? 'bg-red-600 hover:bg-red-700 text-white' 
      : 'bg-amber-600 hover:bg-amber-700 text-white';
    const disabledClasses = isDangerous 
      ? 'bg-red-300 cursor-not-allowed text-white' 
      : 'bg-amber-300 cursor-not-allowed text-white';
    
    return `${baseClasses} ${isConfirmEnabled() ? enabledClasses : disabledClasses}`;
  };

  // Get default message based on confirmation type
  const getDefaultMessage = () => {
    switch (confirmationType) {
      case 'type-to-confirm':
        return `This action cannot be undone. To confirm, please type "${itemToDelete}" below:`;
      case 'dangerous':
        return 'This is a permanent action that cannot be undone. Please confirm that you understand the consequences.';
      case 'simple':
      default:
        return `Are you sure you want to proceed with this action? This may not be reversible.`;
    }
  };

  const displayMessage = message || getDefaultMessage();

  const handleConfirm = () => {
    if (isConfirmEnabled()) {
      onConfirm();
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-6 border w-full max-w-lg shadow-lg rounded-lg bg-white">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            {getIcon()}
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Message */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            {displayMessage}
          </p>
          
          {itemToDelete && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              <p className="text-sm font-medium text-gray-900 break-words">
                {itemToDelete}
              </p>
            </div>
          )}
        </div>

        {/* Confirmation Input */}
        {confirmationType === 'type-to-confirm' && (
          <div className="mb-6">
            <input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={`Type "${itemToDelete}" to confirm`}
              disabled={loading}
              className="block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              autoComplete="off"
            />
            {confirmationText && confirmationText !== itemToDelete && (
              <p className="mt-1 text-xs text-red-600">
                Text doesn't match. Please type exactly: "{itemToDelete}"
              </p>
            )}
          </div>
        )}

        {/* Dangerous Action Checkbox */}
        {confirmationType === 'dangerous' && (
          <div className="mb-6">
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                disabled={loading}
                className="mt-0.5 rounded border-gray-300 text-red-600 focus:ring-red-500 disabled:opacity-50"
              />
              <span className="text-sm text-gray-700">
                I understand that this action is permanent and cannot be undone.
              </span>
            </label>
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="mb-4 flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Processing request...</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isConfirmEnabled()}
            className={getButtonClasses()}
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
            )}
            {getButtonText()}
          </button>
        </div>

        {/* Additional Warning for Dangerous Actions */}
        {isDangerous && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <Trash2 className="h-4 w-4 text-red-600 mr-2" />
              <p className="text-xs text-red-700">
                This action is irreversible and may affect related data.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;