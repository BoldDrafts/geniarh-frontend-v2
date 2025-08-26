// components/ContentEditor.tsx
import React from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { BrainCircuit, RefreshCw } from 'lucide-react';
import { editorConfig } from '../config/tinymceConfig';

interface ContentEditorProps {
  value: string;
  onChange: (content: string) => void;
  onRegenerate: () => void;
  isGenerating: boolean;
  loading: boolean;
  error?: string;
}

const ContentEditor: React.FC<ContentEditorProps> = ({
  value,
  onChange,
  onRegenerate,
  isGenerating,
  loading,
  error
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Publication Content <span className="text-red-500">*</span>
        </label>
        <button
          type="button"
          onClick={onRegenerate}
          disabled={isGenerating || loading}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <BrainCircuit className="h-4 w-4 mr-1" />
              Regenerate with AI
            </>
          )}
        </button>
      </div>
      <div className={`mt-1 ${isGenerating ? 'opacity-50 pointer-events-none' : ''}`}>
        <Editor
          apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
          value={value}
          onEditorChange={onChange}
          init={editorConfig}
          disabled={isGenerating}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
};

export default ContentEditor;