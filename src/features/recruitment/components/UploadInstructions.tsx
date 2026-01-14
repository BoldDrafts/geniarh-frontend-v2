// components/UploadInstructions.tsx
import React from 'react';
import { FileSpreadsheet, Download } from 'lucide-react';

interface UploadInstructionsProps {
  onDownloadTemplate: () => void;
}

const UploadInstructions: React.FC<UploadInstructionsProps> = ({ onDownloadTemplate }) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <div className="flex items-start">
        <FileSpreadsheet className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-lg font-medium text-blue-900 mb-2">How to use bulk upload</h3>
          <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside mb-4">
            <li>Download the CSV template by clicking the button below</li>
            <li>Fill in the candidate information in the template</li>
            <li>Save the file and upload it using the upload area</li>
            <li>Track progress in the Active Uploads section above</li>
            <li>Review the results when processing is complete</li>
          </ol>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onDownloadTemplate}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </button>
            
            <div className="text-xs text-blue-700 flex items-center">
              <span className="hidden sm:inline">💡</span>
              <span className="sm:ml-1">Template includes examples and detailed instructions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadInstructions;