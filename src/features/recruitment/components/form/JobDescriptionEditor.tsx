// components/form/JobDescriptionEditor.tsx
import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface JobDescriptionEditorProps {
  defaultValue?: string;
  onChange?: (content: string) => void;
}

const JobDescriptionEditor: React.FC<JobDescriptionEditorProps> = ({
  defaultValue,
  onChange
}) => {
  const editorConfig = {
    height: 300,
    menubar: false,
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'charmap', 'preview',
      'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'table', 'help', 'wordcount'
    ],
    toolbar: 'undo redo | formatselect | ' +
      'bold italic underline | bullist numlist outdent indent | ' +
      'link | removeformat | help',
    content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px; line-height: 1.6; }',
    formats: {
      h1: { block: 'h1', classes: 'text-2xl font-bold mb-4' },
      h2: { block: 'h2', classes: 'text-xl font-bold mb-3' },
      h3: { block: 'h3', classes: 'text-lg font-bold mb-2' }
    },
    setup: (editor: any) => {
      editor.on('init', () => {
        editor.getContainer().style.transition = 'border-color 0.15s ease-in-out';
      });
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Job Description <span className="text-red-500">*</span>
      </label>
      <div className="mt-1">
        {typeof window !== 'undefined' && (
          <Editor
            apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
            initialValue={defaultValue}
            onEditorChange={onChange}
            init={editorConfig}
          />
        )}
        {/* Fallback textarea for SSR or when TinyMCE is not available */}
        <textarea
          name="description"
          rows={6}
          required
          defaultValue={defaultValue}
          className="block w-full px-4 py-2.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Describe the role, responsibilities, and requirements..."
          style={{ display: typeof window !== 'undefined' ? 'none' : 'block' }}
        />
      </div>
    </div>
  );
};

export default JobDescriptionEditor;