import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemToDelete?: string;
  confirmationType?: 'simple' | 'type-to-confirm';
  confirmButtonText?: string;
  isDangerous?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemToDelete,
  confirmationType = 'simple',
  confirmButtonText = 'Delete',
  isDangerous = false
}) => {
  const [confirmText, setConfirmText] = React.useState('');
  const [isConfirming, setIsConfirming] = React.useState(false);

  const canConfirm = confirmationType === 'simple' || 
    (confirmationType === 'type-to-confirm' && confirmText === itemToDelete);

  const handleConfirm = async () => {
    if (!canConfirm) return;
    
    setIsConfirming(true);
    try {
      await onConfirm();
    } finally {
      setIsConfirming(false);
      setConfirmText('');
    }
  };

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {isDangerous && (
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            )}
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-gray-600 mb-4">{message}</p>

        {confirmationType === 'type-to-confirm' && itemToDelete && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type "{itemToDelete}" to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={itemToDelete}
            />
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            disabled={isConfirming}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm || isConfirming}
            className={`px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isDangerous
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isConfirming ? 'Processing...' : confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};