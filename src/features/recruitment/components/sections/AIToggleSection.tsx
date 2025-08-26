// components/sections/AIToggleSection.tsx
import React from 'react';

interface AIToggleSectionProps {
  useAI: boolean;
  onToggle: (value: boolean) => void;
}

const AIToggleSection: React.FC<AIToggleSectionProps> = ({ useAI, onToggle }) => {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        id="useAI"
        checked={useAI}
        onChange={(e) => onToggle(e.target.checked)}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      <label htmlFor="useAI" className="text-sm text-gray-700">
        Use AI to optimize recruitment process
      </label>
    </div>
  );
};

export default AIToggleSection;