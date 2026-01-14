// components/TemplateInformation.tsx
import React from 'react';
import { CheckCircle, AlertCircle, FileSpreadsheet, Download } from 'lucide-react';

interface TemplateInformationProps {
  onDownloadTemplate?: () => void;
}

const TemplateInformation: React.FC<TemplateInformationProps> = ({ onDownloadTemplate }) => {
  const requiredFields = [
    {
      name: 'firstName',
      description: 'First name of the candidate',
      example: 'John'
    },
    {
      name: 'lastName',
      description: 'Last name of the candidate',
      example: 'Doe'
    },
    {
      name: 'email',
      description: 'Valid email address (must be unique)',
      example: 'john.doe@email.com'
    }
  ];

  const optionalFields = [
    {
      name: 'phone',
      description: 'Contact number',
      example: '+1 (555) 123-4567'
    },
    {
      name: 'linkedinUrl',
      description: 'LinkedIn profile URL',
      example: 'https://linkedin.com/in/johndoe'
    },
    {
      name: 'location',
      description: 'City, Country or State',
      example: 'San Francisco, CA'
    },
    {
      name: 'currentPosition',
      description: 'Current job title',
      example: 'Software Engineer'
    },
    {
      name: 'currentCompany',
      description: 'Current employer',
      example: 'Tech Corp Inc.'
    },
    {
      name: 'skills',
      description: 'Comma-separated list of skills',
      example: 'React, Node.js, Python'
    },
    {
      name: 'experience',
      description: 'Years of experience',
      example: '3'
    },
    {
      name: 'notes',
      description: 'Additional notes about the candidate',
      example: 'Strong background in frontend development'
    }
  ];

  const importantNotes = [
    'Email addresses must be valid and unique across the system',
    'LinkedIn URLs should be complete and valid (optional but recommended)',
    'Maximum file size is 10MB',
    'Supported formats: CSV, Excel (.xlsx, .xls)',
    'Processing is done in real-time with progress tracking',
    'You can cancel uploads while they are in progress',
    'Duplicate candidates (by email) will be skipped automatically'
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <FileSpreadsheet className="h-5 w-5 mr-2 text-blue-600" />
          Template Information
        </h3>
        {onDownloadTemplate && (
          <button
            onClick={onDownloadTemplate}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            <Download className="h-4 w-4 mr-1" />
            Download Template
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Required Fields */}
        <div>
          <h4 className="text-sm font-medium text-gray-800 mb-3 flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
            Required Fields
          </h4>
          <div className="space-y-3">
            {requiredFields.map((field, index) => (
              <div key={index} className="bg-green-50 border border-green-200 rounded p-3">
                <div className="flex items-start">
                  <div className="flex-1">
                    <div className="font-mono text-sm font-medium text-green-800">
                      {field.name}
                    </div>
                    <div className="text-xs text-green-700 mt-1">
                      {field.description}
                    </div>
                    <div className="text-xs text-green-600 mt-1 italic">
                      Example: {field.example}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Optional Fields */}
        <div>
          <h4 className="text-sm font-medium text-gray-800 mb-3 flex items-center">
            <AlertCircle className="h-4 w-4 text-blue-500 mr-1" />
            Optional Fields
          </h4>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {optionalFields.map((field, index) => (
              <div key={index} className="bg-blue-50 border border-blue-200 rounded p-2">
                <div className="flex items-start">
                  <div className="flex-1">
                    <div className="font-mono text-xs font-medium text-blue-800">
                      {field.name}
                    </div>
                    <div className="text-xs text-blue-700">
                      {field.description}
                    </div>
                    <div className="text-xs text-blue-600 italic">
                      Example: {field.example}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Format Guidelines */}
      <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="text-sm font-medium text-gray-800 mb-2">CSV Format Guidelines</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
          <div>
            <div className="font-medium mb-1">Header Row:</div>
            <ul className="list-disc list-inside space-y-1">
              <li>First row must contain column headers</li>
              <li>Use exact field names as shown above</li>
              <li>Headers are case-sensitive</li>
            </ul>
          </div>
          <div>
            <div className="font-medium mb-1">Data Formatting:</div>
            <ul className="list-disc list-inside space-y-1">
              <li>Use UTF-8 encoding for special characters</li>
              <li>Wrap text containing commas in quotes</li>
              <li>Use consistent date formats</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800 mb-2">Important Notes</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              {importantNotes.map((note, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Sample Data Preview */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Sample CSV Row</h4>
        <div className="bg-white border border-blue-300 rounded p-2 font-mono text-xs overflow-x-auto">
          <div className="text-blue-600 mb-1">
            firstName,lastName,email,phone,currentPosition,currentCompany,skills
          </div>
          <div className="text-blue-800">
            John,Doe,john.doe@email.com,+1-555-123-4567,Software Engineer,Tech Corp,"React,Node.js,Python"
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateInformation;