// components/CsvValidationResults.tsx
import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Info, ChevronDown, ChevronUp, FileX, TrendingUp } from 'lucide-react';
import { CsvValidationResult } from '../types/bulkCandidate.types';

interface ValidationError {
  row: number;
  field: string;
  message: string;
  value?: string;
  severity: 'error' | 'warning';
}

interface CsvValidationResultsProps {
  validation: CsvValidationResult;
  className?: string;
}

const CsvValidationResults: React.FC<CsvValidationResultsProps> = ({ 
  validation, 
  className = '' 
}) => {
  const [showAllErrors, setShowAllErrors] = useState(false);
  const [showAllWarnings, setShowAllWarnings] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'errors' | 'warnings'>('summary');

  // Calculate statistics
  const totalIssues = validation.errors.length + validation.warnings.length;
  const successRate = validation.totalRows > 0 
    ? (validation.validRows / validation.totalRows) * 100 
    : 0;
  const hasIssues = totalIssues > 0;

  // Get appropriate styling based on validation status
  const getContainerClasses = () => {
    const baseClasses = `border rounded-lg p-6 transition-all duration-200 ${className}`;
    
    if (validation.isValid && validation.warnings.length === 0) {
      return `${baseClasses} bg-green-50 border-green-200`;
    } else if (validation.isValid && validation.warnings.length > 0) {
      return `${baseClasses} bg-yellow-50 border-yellow-200`;
    } else {
      return `${baseClasses} bg-red-50 border-red-200`;
    }
  };

  const getStatusIcon = () => {
    if (validation.isValid && validation.warnings.length === 0) {
      return <CheckCircle className="h-6 w-6 text-green-600" />;
    } else if (validation.isValid && validation.warnings.length > 0) {
      return <Info className="h-6 w-6 text-yellow-600" />;
    } else {
      return <AlertCircle className="h-6 w-6 text-red-600" />;
    }
  };

  const getStatusText = () => {
    if (validation.isValid && validation.warnings.length === 0) {
      return { title: 'Validation Passed', color: 'text-green-900' };
    } else if (validation.isValid && validation.warnings.length > 0) {
      return { title: 'Validation Passed with Warnings', color: 'text-yellow-900' };
    } else {
      return { title: 'Validation Failed', color: 'text-red-900' };
    }
  };

  const statusInfo = getStatusText();

  // Format error/warning display
  const renderIssueItem = (issue: ValidationError, index: number) => (
    <div key={index} className="flex items-start space-x-3 py-2 border-b border-opacity-30 last:border-b-0">
      <span className="inline-flex items-center justify-center w-6 h-6 bg-white bg-opacity-60 rounded text-xs font-mono font-medium flex-shrink-0 mt-0.5">
        {issue.row}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-start space-x-2">
          <span className="font-medium text-sm">{issue.field}:</span>
          <span className="text-sm">{issue.message}</span>
        </div>
        {issue.value && (
          <div className="mt-1 text-xs opacity-75 font-mono bg-white bg-opacity-30 rounded px-2 py-1 inline-block">
            "{issue.value}"
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={getContainerClasses()}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className={`text-lg font-semibold ${statusInfo.color}`}>
              {statusInfo.title}
            </h3>
            <p className="text-sm opacity-75">
              File validation completed - {validation.totalRows} rows processed
            </p>
          </div>
        </div>
        
        {hasIssues && (
          <div className="text-right">
            <div className="text-sm font-medium">
              {totalIssues} issue{totalIssues !== 1 ? 's' : ''} found
            </div>
            <div className="text-xs opacity-75">
              {validation.errors.length} error{validation.errors.length !== 1 ? 's' : ''}, {validation.warnings.length} warning{validation.warnings.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>

      {/* Success Rate Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Success Rate</span>
          <span className="text-sm font-bold">{successRate.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-white bg-opacity-40 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500 ease-out relative overflow-hidden"
            style={{ width: `${successRate}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-30"></div>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white bg-opacity-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold">{validation.totalRows}</div>
          <div className="text-xs opacity-75">Total Rows</div>
        </div>
        <div className="bg-white bg-opacity-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{validation.validRows}</div>
          <div className="text-xs opacity-75">Valid Rows</div>
        </div>
        <div className="bg-white bg-opacity-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-600">{validation.errors.length}</div>
          <div className="text-xs opacity-75">Errors</div>
        </div>
        <div className="bg-white bg-opacity-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-yellow-600">{validation.warnings.length}</div>
          <div className="text-xs opacity-75">Warnings</div>
        </div>
      </div>

      {/* Issues Section */}
      {hasIssues && (
        <div>
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-4 bg-white bg-opacity-30 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'summary'
                  ? 'bg-white shadow-sm'
                  : 'hover:bg-white hover:bg-opacity-50'
              }`}
            >
              Summary
            </button>
            {validation.errors.length > 0 && (
              <button
                onClick={() => setActiveTab('errors')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'errors'
                    ? 'bg-white shadow-sm'
                    : 'hover:bg-white hover:bg-opacity-50'
                }`}
              >
                Errors ({validation.errors.length})
              </button>
            )}
            {validation.warnings.length > 0 && (
              <button
                onClick={() => setActiveTab('warnings')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'warnings'
                    ? 'bg-white shadow-sm'
                    : 'hover:bg-white hover:bg-opacity-50'
                }`}
              >
                Warnings ({validation.warnings.length})
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="bg-white bg-opacity-50 rounded-lg p-4">
            {activeTab === 'summary' && (
              <div className="space-y-4">
                {!validation.isValid && (
                  <div className="flex items-start space-x-3 p-3 bg-red-100 bg-opacity-60 rounded-lg">
                    <FileX className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-red-800">Cannot proceed with upload</div>
                      <div className="text-sm text-red-700 mt-1">
                        Please fix all validation errors before uploading. {validation.errors.length} error{validation.errors.length !== 1 ? 's' : ''} must be resolved.
                      </div>
                    </div>
                  </div>
                )}
                
                {validation.isValid && validation.warnings.length > 0 && (
                  <div className="flex items-start space-x-3 p-3 bg-yellow-100 bg-opacity-60 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-yellow-800">Ready to upload with warnings</div>
                      <div className="text-sm text-yellow-700 mt-1">
                        Your file can be uploaded, but {validation.warnings.length} warning{validation.warnings.length !== 1 ? 's' : ''} were found. Review them to ensure data quality.
                      </div>
                    </div>
                  </div>
                )}

                {validation.isValid && validation.warnings.length === 0 && (
                  <div className="flex items-start space-x-3 p-3 bg-green-100 bg-opacity-60 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-green-800">File is ready for upload</div>
                      <div className="text-sm text-green-700 mt-1">
                        All {validation.validRows} rows passed validation. You can proceed with the upload.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'errors' && validation.errors.length > 0 && (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="font-medium text-red-800">Validation Errors</h4>
                  {validation.errors.length > 5 && (
                    <button
                      onClick={() => setShowAllErrors(!showAllErrors)}
                      className="text-sm text-red-700 hover:text-red-800 flex items-center"
                    >
                      {showAllErrors ? 'Show Less' : `Show All (${validation.errors.length})`}
                      {showAllErrors ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
                    </button>
                  )}
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {(showAllErrors ? validation.errors : validation.errors.slice(0, 5)).map((error, index) => 
                    renderIssueItem({ ...error, severity: 'error' }, index)
                  )}
                </div>
              </div>
            )}

            {activeTab === 'warnings' && validation.warnings.length > 0 && (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="font-medium text-yellow-800">Validation Warnings</h4>
                  {validation.warnings.length > 5 && (
                    <button
                      onClick={() => setShowAllWarnings(!showAllWarnings)}
                      className="text-sm text-yellow-700 hover:text-yellow-800 flex items-center"
                    >
                      {showAllWarnings ? 'Show Less' : `Show All (${validation.warnings.length})`}
                      {showAllWarnings ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
                    </button>
                  )}
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {(showAllWarnings ? validation.warnings : validation.warnings.slice(0, 5)).map((warning, index) => 
                    renderIssueItem({ ...warning, severity: 'warning' }, index)
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CsvValidationResults;