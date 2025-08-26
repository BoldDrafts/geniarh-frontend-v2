import { Editor } from '@tinymce/tinymce-react';
import {
  BrainCircuit,
  ChevronDown,
  Edit3,
  FileText,
  Plus,
  RefreshCw,
  X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { aiService } from '../../../shared/lib/api/aiService';
import { Requirement } from '../api/requirementsService';

interface NewRequirementFormProps {
  onClose: () => void;
  onSubmit: (data: Requirement | Omit<Requirement, 'id'>) => void;
  initialData?: Requirement;
  mode?: 'create' | 'edit';
}

const NewRequirementForm: React.FC<NewRequirementFormProps> = ({ 
  onClose, 
  onSubmit, 
  initialData,
  mode = 'create'
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    department: initialData?.department || '',
    priority: initialData?.priority || 'Medium',
    timeframe: initialData?.timeframe || '1-2 months',
    experienceLevel: initialData?.experienceLevel || 'Mid',
    location: initialData?.location || '',
    employmentType: initialData?.employmentType || 'Full-time',
    salaryMin: initialData?.salaryMin || 0,
    salaryMax: initialData?.salaryMax || 0,
    salaryCurrency: initialData?.salaryCurrency || 'PEN',
  });

  const [skills, setSkills] = useState<string[]>(initialData?.skills || []);
  const [softSkills, setSoftSkills] = useState<string[]>(initialData?.softSkills || []);
  const [newSkill, setNewSkill] = useState('');
  const [newSoftSkill, setNewSoftSkill] = useState('');
  const [useAI, setUseAI] = useState(false);
  const [description, setDescription] = useState(initialData?.description || '');
  const [isGenerating, setIsGenerating] = useState(false);

  // Lista predefinida de soft skills comunes
  const commonSoftSkills = [
    'Communication',
    'Leadership',
    'Problem Solving',
    'Teamwork',
    'Adaptability',
    'Time Management',
    'Critical Thinking',
    'Creativity',
    'Emotional Intelligence',
    'Decision Making',
    'Conflict Resolution',
    'Active Listening',
    'Collaboration',
    'Initiative',
    'Attention to Detail',
    'Customer Focus',
    'Mentoring',
    'Strategic Thinking',
    'Resilience',
    'Cultural Awareness'
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        department: initialData.department,
        priority: initialData.priority,
        timeframe: initialData.timeframe,
        experienceLevel: initialData.experienceLevel,
        location: initialData.location,
        employmentType: initialData.employmentType,
        salaryMin: initialData.salaryMin,
        salaryMax: initialData.salaryMax,
        salaryCurrency: initialData.salaryCurrency,
      });
      setSkills(initialData.skills);
      setSoftSkills(initialData.softSkills || []);
      setDescription(initialData.description);
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      skills,
      softSkills,
      description,
      status: mode === 'create' ? 'Draft' : initialData?.status || 'Draft',
      ...(initialData?.id ? { id: initialData.id } : {})
    };

    onSubmit(data as any);
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills(prev => [...prev, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleAddSoftSkill = (skill?: string) => {
    const skillToAdd = skill || newSoftSkill.trim();
    if (skillToAdd && !softSkills.includes(skillToAdd)) {
      setSoftSkills(prev => [...prev, skillToAdd]);
      if (!skill) setNewSoftSkill('');
    }
  };

  const handleRemoveSoftSkill = (skillToRemove: string) => {
    setSoftSkills(softSkills.filter(skill => skill !== skillToRemove));
  };

  const handleGenerateContent = async (type: 'description' | 'qualifications') => {
    if (!formData.title || !formData.department || !formData.experienceLevel || skills.length === 0) {
      toast.error('Please fill in the basic job details first');
      return;
    }

    try {
      setIsGenerating(true);
      const content = await aiService.generateContent({
        title: formData.title,
        department: formData.department,
        experienceLevel: formData.experienceLevel,
        skills,
        softSkills,
        description,
        type
      });

      //const htmlContent = convertToHtml(content);

      setDescription(content);
      
      toast.success(`${type === 'description' ? 'Job description' : 'Qualifications'} generated successfully`);
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const editorConfig = {
    height: 300,
    menubar: false,
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'charmap', 'preview',
      'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'table', 'code', 'help', 'wordcount'
    ],
    toolbar: 'undo redo | formatselect | ' +
      'bold italic | bullist numlist outdent indent | ' +
      'removeformat | help',
    content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px; }',
    formats: {
      h1: { block: 'h1', classes: 'text-2xl font-bold' },
      h2: { block: 'h2', classes: 'text-xl font-bold' },
      h3: { block: 'h3', classes: 'text-lg font-bold' }
    },
    setup: (editor: any) => {
      editor.on('init', () => {
        editor.getContainer().style.transition = 'border-color 0.15s ease-in-out';
      });
    }
  };

  const SelectInput = ({ id, name, value, onChange, required = false, children, className = '' }: {
    id: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    required?: boolean;
    children: React.ReactNode;
    className?: string;
  }) => (
    <div className="relative">
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
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
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Create New Requirement' : 'Edit Requirement'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <FileText className="h-6 w-6" />
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
                  <p>The AI will help optimize your requirements based on market trends and successful past hires.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Position Title *
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                value={formData.title}
                onChange={handleInputChange}
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
                value={formData.department}
                onChange={handleInputChange}
                required
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
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                Priority Level *
              </label>
              <SelectInput 
                id="priority" 
                name="priority" 
                value={formData.priority}
                onChange={handleInputChange}
                required
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </SelectInput>
            </div>

            <div>
              <label htmlFor="timeframe" className="block text-sm font-medium text-gray-700 mb-1">
                Hiring Timeframe *
              </label>
              <SelectInput 
                id="timeframe" 
                name="timeframe" 
                value={formData.timeframe}
                onChange={handleInputChange}
                required
              >
                <option value="Immediate">Immediate</option>
                <option value="1-2 months">1-2 months</option>
                <option value="3-6 months">3-6 months</option>
                <option value="6+ months">6+ months</option>
              </SelectInput>
            </div>

            <div>
              <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 mb-1">
                Experience Level *
              </label>
              <SelectInput 
                id="experienceLevel" 
                name="experienceLevel" 
                value={formData.experienceLevel}
                onChange={handleInputChange}
                required
              >
                <option value="Entry">Entry Level</option>
                <option value="Mid">Mid Level</option>
                <option value="Senior">Senior Level</option>
                <option value="Lead">Lead</option>
                <option value="Executive">Executive</option>
              </SelectInput>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <SelectInput 
                id="location" 
                name="location" 
                value={formData.location}
                onChange={handleInputChange}
                required
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
                value={formData.employmentType}
                onChange={handleInputChange}
                required
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </SelectInput>
            </div>

            <div>
              <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-1">
                Budget Range *
              </label>
              <div className="mt-1 flex space-x-2">
                <input
                  type="number"
                  name="salaryMin"
                  placeholder="Min"
                  required
                  value={formData.salaryMin || ''}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <input
                  type="number"
                  name="salaryMax"
                  placeholder="Max"
                  required
                  value={formData.salaryMax || ''}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <SelectInput 
                  id="salaryCurrency" 
                  name="salaryCurrency" 
                  value={formData.salaryCurrency}
                  onChange={handleInputChange}
                  required 
                  className="w-24"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </SelectInput>
              </div>
            </div>
          </div>

          {/* Technical Skills Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Technical Skills *
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {skills?.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-1.5 text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                placeholder="Add a technical skill"
                className="block w-full px-4 py-2.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Soft Skills Section */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              Soft Skills
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {softSkills?.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSoftSkill(skill)}
                    className="ml-1.5 text-pink-600 hover:text-pink-800"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
            
            {/* Common soft skills suggestions */}
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-2">Quick add:</p>
              <div className="flex flex-wrap gap-1">
                {commonSoftSkills
                  .filter(skill => !softSkills.includes(skill))
                  .slice(0, 8)
                  .map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleAddSoftSkill(skill)}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      + {skill}
                    </button>
                  ))}
              </div>
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={newSoftSkill}
                onChange={(e) => setNewSoftSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSoftSkill())}
                placeholder="Add a soft skill"
                className="block w-full px-4 py-2.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={() => handleAddSoftSkill()}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Job Description *
              </label>
              <button
                type="button"
                onClick={() => handleGenerateContent('description')}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <BrainCircuit className="h-4 w-4 mr-1" />
                    Generate with AI
                  </>
                )}
              </button>
            </div>
            <div className="mt-1">
              <Editor
                apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                value={description}
                onEditorChange={(content) => setDescription(content)}
                init={editorConfig}
              />
            </div>
          </div>

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
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              {mode === 'create' ? 'Create Requirement' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewRequirementForm;