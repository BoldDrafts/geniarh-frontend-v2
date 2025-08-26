// LinkedInPublicationModal.tsx
import React from 'react';
import { LinkedInPublicationModalProps } from '../types/linkedInModalTypes';
import { useLinkedInModal } from '../hooks/useLinkedInModal';
import LoadingOverlay from './LoadingOverlay';
import ModalHeader from './ModalHeader';
import ContentEditor from './ContentEditor';
import AINotice from './AINotice';
import ModalActions from './ModalActions';

const LinkedInPublicationModal: React.FC<LinkedInPublicationModalProps> = ({
  isOpen,
  onClose,
  onCreatePublication,
  description,
  loading = false,
  initialContent,
  position = 'Position',
  department = 'Department'
}) => {
  const {
    formData,
    errors,
    isGenerating,
    handleGenerateContent,
    handleInputChange,
    handleSubmit
  } = useLinkedInModal(isOpen, initialContent, onCreatePublication);

  if (!isOpen) return null;

  return (
    <>
      {/* Loader para regeneración */}
      <LoadingOverlay
        isVisible={isGenerating}
        position={position}
        department={department}
      />

      {/* Modal Principal */}
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-10 mx-auto p-0 border w-full max-w-3xl shadow-lg rounded-lg bg-white">
          {/* Header */}
          <ModalHeader
            position={position}
            department={department}
            initialContent={initialContent.requirement.description}
            onClose={onClose}
            loading={loading}
            isGenerating={isGenerating}
          />

          {/* Form */}
          <div className="p-6">
            <div className="space-y-6">
              {/* Description with AI Generation */}
              <ContentEditor
                value={formData.description}
                onChange={(content) => handleInputChange('description', content)}
                onRegenerate={handleGenerateContent}
                isGenerating={isGenerating}
                loading={loading}
                error={errors.description}
              />

              {/* AI Generation Notice */}
              <AINotice hasDescription={!!description} />
            </div>

            {/* Form Actions */}
            <ModalActions
              onCancel={onClose}
              onSubmit={handleSubmit}
              loading={loading}
              isGenerating={isGenerating}
              autoPost={formData.autoPost}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default LinkedInPublicationModal;

// Re-export types for external use
export type { PublicationData } from '../types/linkedInModalTypes';