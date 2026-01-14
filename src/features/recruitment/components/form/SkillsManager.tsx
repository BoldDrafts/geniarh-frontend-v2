// components/form/SkillsManager.tsx
import React from 'react';
import { Plus, X } from 'lucide-react';

interface SkillsManagerProps {
  skills: string[];
  newSkill: string;
  onNewSkillChange: (value: string) => void;
  onAddSkill: () => void;
  onRemoveSkill: (skill: string) => void;
  placeholder?: string;
  skillType?: 'technical' | 'soft';
  label?: string;
  required?: boolean;
}

const SkillsManager: React.FC<SkillsManagerProps> = ({
  skills,
  newSkill,
  onNewSkillChange,
  onAddSkill,
  onRemoveSkill,
  placeholder = "Add a skill",
  skillType = 'technical',
  label,
  required = true
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAddSkill();
    }
  };

  // Dynamic styling based on skill type
  const getSkillStyles = () => {
    switch (skillType) {
      case 'soft':
        return {
          tag: 'bg-green-100 text-green-800',
          button: 'text-green-600 hover:text-green-800'
        };
      case 'technical':
      default:
        return {
          tag: 'bg-blue-100 text-blue-800',
          button: 'text-blue-600 hover:text-blue-800'
        };
    }
  };

  const styles = getSkillStyles();

  // Default labels based on skill type
  const getDefaultLabel = () => {
    switch (skillType) {
      case 'soft':
        return 'Soft Skills';
      case 'technical':
      default:
        return 'Technical Skills';
    }
  };

  const displayLabel = label || getDefaultLabel();

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {displayLabel} {required && <span className="text-red-500">*</span>}
      </label>
      
      {/* Skills Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        {skills?.map((skill, index) => (
          <span
            key={index}
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles.tag}`}
          >
            {skill}
            <button
              type="button"
              onClick={() => onRemoveSkill(skill)}
              className={`ml-1.5 ${styles.button} transition-colors`}
              aria-label={`Remove ${skill}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
      </div>
      
      {/* Empty state message */}
      {skills.length === 0 && (
        <div className="text-sm text-gray-500 mb-3 italic">
          No {skillType === 'soft' ? 'soft skills' : 'technical skills'} added yet
        </div>
      )}
      
      {/* Add New Skill */}
      <div className="flex space-x-2">
        <input
          type="text"
          value={newSkill}
          onChange={(e) => onNewSkillChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="block w-full px-4 py-2.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          aria-label={`Add new ${skillType === 'soft' ? 'soft skill' : 'technical skill'}`}
        />
        <button
          type="button"
          onClick={onAddSkill}
          disabled={!newSkill.trim()}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Add skill"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Skills counter */}
      {skills.length > 0 && (
        <div className="mt-2 text-xs text-gray-500">
          {skills.length} skill{skills.length !== 1 ? 's' : ''} added
        </div>
      )}
    </div>
  );
};

export default SkillsManager;