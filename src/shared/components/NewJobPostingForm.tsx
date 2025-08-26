import React from 'react';
import { 
  Save, 
  X, 
  BrainCircuit,
  ChevronDown
} from 'lucide-react';
import { useRecruitmentForm } from '../features/recruitment/hooks/useRecruitmentForm';
import SkillsManager from '../features/recruitment/components/form/SkillsManager';

interface NewJobPostingFormProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

const NewJobPostingForm: React.FC<NewJobPostingFormProps> = ({ 
  onClose, 
  onSubmit,
  initialData 
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
    // Common
    isSubmitting,
    jobDescription,
    setJobDescription,
    handleSubmit
  } = useRecruitmentForm(initialData);

  const SelectInput = ({ id, name, required = false, children, className = '', defaultValue }: {
    id: string;
    name: string;
    required?: boolean;
    children: React.ReactNode;
    className?: string;
    defaultValue?: string;
  }) => (
    <div className="relative">
      <select
        id={id}
        name={name}
        required={required}
        defaultValue={defaultValue}
        className={`appearance-none block w-full px-4 py-2.5 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white ${className}`}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
        <ChevronDown className="h-4 w-4" />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-lg bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Create New Job Posting</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {useAI && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <BrainCircuit className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  AI Assistant is enabled
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>The AI will help optimize your job posting for better candidate matching.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e, onSubmit)} className="space-y-6">
          {/* Basic Information Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Job Title *
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                defaultValue={initialData?.title}
                className="block w-full px-4 py-2.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="e.g., Senior Frontend Developer"
              />
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                Department *
              </label>
              <SelectInput 
                id="department" 
                name="department" 
                required
                defaultValue={initialData?.department}
              >
                <option value="">Select department</option>
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Product">Product</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="HR">HR</option>
              </SelectInput>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <SelectInput 
                id="location" 
                name="location" 
                required
                defaultValue={initialData?.location}
              >
                <option value="">Select location</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </SelectInput>
            </div>

            <div>
              <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700 mb-1">
                Employment Type *
              </label>
              <SelectInput 
                id="employmentType" 
                name="employmentType" 
                required
                defaultValue={initialData?.employmentType}
              >
                <option value="">Select type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </SelectInput>
            </div>

            <div>
              <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 mb-1">
                Experience Level *
              </label>
              <SelectInput 
                id="experienceLevel" 
                name="experienceLevel" 
                required
                defaultValue={initialData?.experienceLevel}
              >
                <option value="">Select level</option>
                <option value="Entry">Entry Level</option>
                <option value="Mid">Mid Level</option>
                <option value="Senior">Senior Level</option>
                <option value="Lead">Lead</option>
                <option value="Executive">Executive</option>
              </SelectInput>
            </div>

            <div>
              <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-1">
                Salary Range *
              </label>
              <div className="mt-1 flex space-x-2">
                <input
                  type="number"
                  name="salaryMin"
                  placeholder="Min"
                  required
                  defaultValue={initialData?.salaryMin}
                  className="block w-full px-4 py-2.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <input
                  type="number"
                  name="salaryMax"
                  placeholder="Max"
                  required
                  defaultValue={initialData?.salaryMax}
                  className="block w-full px-4 py-2.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <SelectInput 
                  id="salaryCurrency" 
                  name="salaryCurrency" 
                  required 
                  className="w-24"
                  defaultValue={initialData?.salaryCurrency || "PEN"}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </SelectInput>
              </div>
            </div>
          </div>

          {/* Skills Sections Container */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Technical Skills Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Technical Skills</h3>
              <SkillsManager
                skills={skills}
                newSkill={newSkill}
                onNewSkillChange={setNewSkill}
                onAddSkill={handleAddSkill}
                onRemoveSkill={handleRemoveSkill}
                placeholder="e.g., React, Node.js, Python..."
                skillType="technical"
                label="Required Technical Skills"
              />
            </div>

            {/* Soft Skills Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Soft Skills</h3>
              <SkillsManager
                skills={softSkills}
                newSkill={newSoftSkill}
                onNewSkillChange={setNewSoftSkill}
                onAddSkill={handleAddSoftSkill}
                onRemoveSkill={handleRemoveSoftSkill}
                placeholder="e.g., Leadership, Communication, Teamwork..."
                skillType="soft"
                label="Required Soft Skills"
              />
            </div>
          </div>

          {/* Job Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Job Description *
            </label>
            <div className="mt-1">
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="block w-full px-4 py-2.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Describe the role, responsibilities, and requirements..."
              />
            </div>
          </div>

          {/* Benefits */}
          <div>
            <label htmlFor="benefits" className="block text-sm font-medium text-gray-700 mb-1">
              Benefits
            </label>
            <div className="mt-1">
              <textarea
                id="benefits"
                name="benefits"
                rows={3}
                defaultValue={initialData?.benefits}
                className="block w-full px-4 py-2.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="List the benefits and perks..."
              />
            </div>
          </div>

          {/* AI Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="useAI"
              checked={useAI}
              onChange={(e) => setUseAI(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="useAI" className="text-sm text-gray-700">
              Use AI to optimize job posting
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-5 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Creating...' : 'Create Job Posting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewJobPostingForm;