import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

interface DeleteCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  candidateName: string;
}

const DeleteCandidateModal: React.FC<DeleteCandidateModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  candidateName,
}) => {
  const [confirmationText, setConfirmationText] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-lg bg-white">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-red-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Delete Confirmation</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-500">
            This action cannot be undone. To confirm deletion, please type <span className="font-medium text-gray-900">{candidateName}</span> below:
          </p>
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            placeholder={`Type "${candidateName}" to confirm`}
            className="block w-full px-4 py-2.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmationText !== candidateName}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
              confirmationText === candidateName
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-red-300 cursor-not-allowed'
            }`}
          >
            Delete Candidate
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCandidateModal;