// NewRecruitmentForm.tsx
import React from 'react';
import { useRecruitmentForm } from '../hooks/useRecruitmentForm';

// Components
import AIAssistantBanner from './AIAssistantBanner';
import JobDescriptionEditor from './form/JobDescriptionEditor';
import SkillsManager from './form/SkillsManager';
import FormActions from './FormActions';
import FormHeader from './FormHeader';
import AIToggleSection from './sections/AIToggleSection';
import BasicInfoSection from './sections/BasicInfoSection';
import SalarySection from './sections/SalarySection';
import { NewRecruitmentFormProps } from '../types/recruitmentFormTypes';

const NewRecruitmentForm: React.FC<NewRecruitmentFormProps> = ({
  onClose,
  onSubmit,
  initialData,
  mode = 'create'
}) => {
  const {
    useAI,
    setUseAI,
    // Technical Skills
    skills,
    newSkill,
    setNewSkill,
    handleAddSkill,
    handleRemoveSkill,
    // Soft Skills
    softSkills,
    newSoftSkill,
    setNewSoftSkill,
    handleAddSoftSkill,
    handleRemoveSoftSkill,
    // Recruiters
    recruiters,
    loadingRecruiters,
    recruitersError,
    retryLoadRecruiters,
    // Common
    isSubmitting,
    jobDescription,
    setJobDescription,
    handleSubmit
  } = useRecruitmentForm(initialData);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-lg bg-white">
        <FormHeader mode={mode} onClose={onClose} />
        
        <AIAssistantBanner isVisible={useAI} />

        <form onSubmit={(e) => handleSubmit(e, onSubmit)} className="space-y-6">
          {/* Basic Information Section */}
          <BasicInfoSection 
            initialData={initialData} 
            recruiters={recruiters}
            loadingRecruiters={loadingRecruiters}
            recruitersError={recruitersError}
            onRetryLoadRecruiters={retryLoadRecruiters}
          />

          {/* Skills Sections Container */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            {/* Technical Skills Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Habilidades Técnicas</h3>
              <SkillsManager
                skills={skills}
                newSkill={newSkill}
                onNewSkillChange={setNewSkill}
                onAddSkill={handleAddSkill}
                onRemoveSkill={handleRemoveSkill}
                placeholder="Ej: React, Node.js, Python..."
                skillType="technical"
              />
            </div>

            {/* Soft Skills Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Habilidades Blandas</h3>
              <SkillsManager
                skills={softSkills}
                newSkill={newSoftSkill}
                onNewSkillChange={setNewSoftSkill}
                onAddSkill={handleAddSoftSkill}
                onRemoveSkill={handleRemoveSoftSkill}
                placeholder="Ej: Liderazgo, Comunicación, Trabajo en equipo..."
                skillType="soft"
              />
            </div>
          </div>

          {/* Job Description Section */}
          <JobDescriptionEditor
            defaultValue={initialData?.requirement.description}
            onChange={setJobDescription}
          />

          {/* AI Toggle Section */}
          <AIToggleSection useAI={useAI} onToggle={setUseAI} />

          {/* Form Actions */}
          <FormActions
            mode={mode}
            onCancel={onClose}
            isSubmitting={isSubmitting}
          />
        </form>
      </div>
    </div>
  );
};

export default NewRecruitmentForm;