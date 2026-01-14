// components/FileUploadArea.tsx
import React, { useState } from 'react';
import { FileSpreadsheet, Upload, X } from 'lucide-react';
import { CsvValidationResult } from '../types/bulkCandidate.types';

interface FileUploadAreaProps {
  file: File | null;
  uploading: boolean;
  csvValidation: CsvValidationResult | null;
  onFileSelect: (file: File) => void;
  onUpload: () => void;
  onReset: () => void;
}

const FileUploadArea: React.FC<FileUploadAreaProps> = ({
  file,
  uploading,
  csvValidation,
  onFileSelect,
  onUpload,
  onReset
}) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileTypeIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'csv') {
      return <FileSpreadsheet className="h-8 w-8 text-green-600 mr-3" />;
    } else if (extension === 'xlsx' || extension === 'xls') {
      return <FileSpreadsheet className="h-8 w-8 text-blue-600 mr-3" />;
    }
    return <FileSpreadsheet className="h-8 w-8 text-gray-600 mr-3" />;
  };

  const isUploadDisabled = () => {
    return uploading || (csvValidation && !csvValidation.isValid);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Upload New File</h3>
      
      {!file ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
            dragActive 
              ? 'border-blue-400 bg-blue-50 scale-[1.02]' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            {dragActive ? 'Drop your file here' : 'Drop your file here, or click to browse'}
          </h4>
          <p className="text-gray-500 mb-4">
            Supports CSV and Excel files up to 10MB
          </p>
          
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => e.target.files && onFileSelect(e.target.files[0])}
            className="hidden"
            id="file-upload"
          />
          
          <label
            htmlFor="file-upload"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Upload className="mr-2 h-4 w-4" />
            Choose File
          </label>
          
          <div className="mt-4 text-xs text-gray-500">
            <div className="flex items-center justify-center space-x-4">
              <span>✓ CSV files</span>
              <span>✓ Excel (.xlsx, .xls)</span>
              <span>✓ Max 10MB</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1 min-w-0">
              {getFileTypeIcon(file.name)}
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-medium text-gray-900 truncate">{file.name}</h4>
                <div className="flex items-center space-x-3 text-sm text-gray-500">
                  <span>{formatFileSize(file.size)}</span>
                  <span>•</span>
                  <span>
                    {file.type || file.name.split('.').pop()?.toUpperCase() || 'Unknown'}
                  </span>
                  {csvValidation && (
                    <>
                      <span>•</span>
                      <span className={csvValidation.isValid ? 'text-green-600' : 'text-red-600'}>
                        {csvValidation.isValid ? 'Validated' : 'Has errors'}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              {!uploading && (
                <button
                  onClick={onUpload}
                  disabled={isUploadDisabled()}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Start Upload
                </button>
              )}
              
              <button
                onClick={onReset}
                disabled={uploading}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50 p-1 rounded transition-colors"
                title="Remove file"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Upload Disabled Message */}
          {isUploadDisabled() && csvValidation && !csvValidation.isValid && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              Please fix validation errors before uploading
            </div>
          )}
          
          {/* File Preview Info */}
          {csvValidation && csvValidation.isValid && (
            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
              Ready to upload • {csvValidation.validRows} valid rows found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploadArea;