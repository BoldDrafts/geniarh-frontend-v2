import { toast } from 'react-hot-toast';
import { BaseService } from '../../../shared/api/baseService';
import { httpClient } from '../../../shared/api/httpClient';
import {
  BulkUploadApiError,
  BulkUploadHistoryItem,
  BulkUploadListResponse,
  BulkUploadOptions,
  BulkUploadResponse,
  BulkUploadResults,
  BulkUploadResultsSummary,
  BulkUploadStatistics,
  BulkUploadStatus,
  BulkUploadStatusEnum,
  BulkUploadSummary,
  CandidateTemplateData,
  CsvValidationResult,
  FileValidationResult,
  SupportedFileFormat,
  TemplateDownloadResponse,
  TemplateGenerationOptions,
  UploadProgressEvent
} from '../types/bulkCandidate.types';

/**
 * Bulk Candidate Service
 * Handles bulk upload operations for candidates following the same patterns as RecruitmentService
 */
class BulkCandidateService extends BaseService<any, any, any> {
  private activeUploads: Map<string, AbortController> = new Map();
  private progressCallbacks: Map<string, (event: UploadProgressEvent) => void> = new Map();

  constructor() {
    super({
      baseUrl: import.meta.env.VITE_RECRUITMENT_API_URL || import.meta.env.VITE_API_URL,
      resourceName: 'recruitments',
      requireAuth: true,
      requiredRoles: ['recruiter-supervisor', 'recruiter'],
      requireAllRoles: false
    });
  }

  // ==================== Core Upload Operations ====================

  /**
   * Upload candidates from CSV file
   */
  async uploadCandidates(
    recruitmentId: string,
    file: File,
    options?: BulkUploadOptions
  ): Promise<BulkUploadResponse> {
    await this.validateAuth();

    try {
      // Validate file before upload
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Add options if provided
      if (options) {
        Object.entries(options).forEach(([key, value]) => {
          if (value !== undefined) {
            formData.append(key, String(value));
          }
        });
      }

      // Create abort controller for cancellation
      const abortController = new AbortController();
      
      const response = await httpClient.post(
        `${this.buildUrl(recruitmentId)}/candidates/bulk-upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          signal: abortController.signal,
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              this.emitProgressEvent(recruitmentId, {
                uploadId: '',
                stage: 'uploading',
                progress: percentCompleted,
                message: 'Uploading file...'
              });
            }
          }
        }
      );

      const uploadData: BulkUploadResponse = response.data;
      
      // Store abort controller for potential cancellation
      this.activeUploads.set(uploadData.uploadId, abortController);

      toast.success(`File uploaded successfully. Processing ${uploadData.totalRows} candidates...`);
      
      return uploadData;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        toast.custom('Upload cancelled');
        throw new Error('Upload cancelled by user');
      }
      
      this.handleError(error, 'upload candidates file');
    }
    throw Error("Unsupported operation!");
  }

  /**
   * Get upload status
   */
  async getUploadStatus(
    recruitmentId: string,
    uploadId: string
  ): Promise<BulkUploadStatus> {
    await this.validateAuth();

    try {
      const response = await httpClient.get(
        `${this.buildUrl(recruitmentId)}/candidates/bulk-upload/${uploadId}/status`
      );

      return response.data;
    } catch (error: any) {
      this.handleError(error, 'fetch upload status');
    }
    throw Error("Unsupported operation!");
  }

  /**
   * Get upload results
   */
  async getUploadResults(
    recruitmentId: string,
    uploadId: string
  ): Promise<BulkUploadResults> {
    await this.validateAuth();

    try {
      const response = await httpClient.get(
        `${this.buildUrl(recruitmentId)}/candidates/bulk-upload/${uploadId}/results`
      );

      return response.data;
    } catch (error: any) {
      this.handleError(error, 'fetch upload results');
    }
    throw Error("Unsupported operation!");
  }

  /**
   * List all bulk uploads for a recruitment process
   */
  async listBulkUploads(
    recruitmentId: string,
    options?: {
      status?: BulkUploadStatusEnum;
      page?: number;
      limit?: number;
      sortBy?: 'createdAt' | 'updatedAt' | 'fileName' | 'status';
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<BulkUploadListResponse> {
    await this.validateAuth();

    try {
      const params = new URLSearchParams();

      if (options?.status) params.append('status', options.status);
      if (options?.page) params.append('page', String(options.page));
      if (options?.limit) params.append('limit', String(options.limit));
      if (options?.sortBy) params.append('sortBy', options.sortBy);
      if (options?.sortOrder) params.append('sortOrder', options.sortOrder);

      const queryString = params.toString();
      const url = `${this.buildUrl(recruitmentId)}/candidates/bulk-upload${queryString ? `?${queryString}` : ''}`;

      const response = await httpClient.get(url);

      return response.data;
    } catch (error: any) {
      this.handleError(error, 'fetch bulk uploads list');
    }
    throw Error("Unsupported operation!");
  }

  /**
   * Cancel ongoing upload
   */
  async cancelUpload(uploadId: string): Promise<void> {
    try {
      const abortController = this.activeUploads.get(uploadId);
      if (abortController) {
        abortController.abort();
        this.activeUploads.delete(uploadId);
        toast.success('Upload cancelled successfully');
      } else {
        toast.custom('Upload not found or already completed');
      }
    } catch (error: any) {
      this.handleError(error, 'cancel upload');
    }
  }

  // ==================== Progress Tracking ====================

  /**
   * Subscribe to upload progress events
   */
  onProgress(uploadId: string, callback: (event: UploadProgressEvent) => void): void {
    this.progressCallbacks.set(uploadId, callback);
  }

  /**
   * Unsubscribe from upload progress events
   */
  offProgress(uploadId: string): void {
    this.progressCallbacks.delete(uploadId);
  }

  /**
   * Emit progress event
   */
  private emitProgressEvent(uploadId: string, event: UploadProgressEvent): void {
    const callback = this.progressCallbacks.get(uploadId);
    if (callback) {
      callback(event);
    }
  }

  /**
   * Poll upload status until completion
   */
  async pollUploadStatus(
    recruitmentId: string,
    uploadId: string,
    onProgress?: (status: BulkUploadStatus) => void,
    pollInterval: number = 2000
  ): Promise<BulkUploadResults> {
    let status: BulkUploadStatus;
    
    do {
      status = await this.getUploadStatus(recruitmentId, uploadId);
      
      if (onProgress) {
        onProgress(status);
      }

      this.emitProgressEvent(uploadId, {
        uploadId,
        stage: status.status === 'processing' ? 'processing' : 'completed',
        progress: status.progress.percentageComplete,
        message: status.currentOperation,
        currentRow: status.progress.processedRows,
        totalRows: status.progress.totalRows
      });

      if (status.status === 'processing' || status.status === 'pending') {
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    } while (status.status === 'processing' || status.status === 'pending');

    // Clean up
    this.activeUploads.delete(uploadId);
    this.progressCallbacks.delete(uploadId);

    if (status.status === 'completed') {
      const results = await this.getUploadResults(recruitmentId, uploadId);
      toast.success(
        `Upload completed! ${results.summary.successfullyProcessed} candidates processed successfully.`
      );
      return results;
    } else {
      toast.error('Upload failed. Please check the results for details.');
      throw new Error(`Upload failed with status: ${status.status}`);
    }
  }

  // ==================== File Validation ====================

  /**
   * Validate uploaded file
   */
  validateFile(file: File): FileValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check file type
    const supportedFormats = this.getSupportedFormats();
    const isValidType = supportedFormats.some(format => 
      file.type === format.mimeType || 
      file.name.toLowerCase().endsWith(format.extension)
    );

    if (!isValidType) {
      errors.push(
        `Invalid file type. Supported formats: ${supportedFormats.map(f => f.extension).join(', ')}`
      );
    }

    // Check file size (10MB limit as per API spec)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      errors.push(`File size exceeds maximum limit of ${maxSize / (1024 * 1024)}MB`);
    }

    // Check if file is empty
    if (file.size === 0) {
      errors.push('File is empty. Please select a valid file.');
    }

    // Check file name
    if (file.name.length > 255) {
      warnings.push('File name is very long and may cause issues.');
    }

    // Check for special characters in filename
    if (!/^[\w\-. ]+$/.test(file.name)) {
      warnings.push('File name contains special characters that may cause issues.');
    }

    return {
      isValid: errors.length === 0,
      error: errors.length > 0 ? errors.join('; ') : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      }
    };
  }

  /**
   * Get supported file formats
   */
  getSupportedFormats(): SupportedFileFormat[] {
    return [
      {
        extension: '.csv',
        mimeType: 'text/csv',
        description: 'Comma Separated Values',
        maxSize: 10 * 1024 * 1024 // 10MB
      },
      {
        extension: '.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        description: 'Excel Workbook',
        maxSize: 10 * 1024 * 1024 // 10MB
      },
      {
        extension: '.xls',
        mimeType: 'application/vnd.ms-excel',
        description: 'Excel 97-2003 Workbook',
        maxSize: 10 * 1024 * 1024 // 10MB
      }
    ];
  }

  // ==================== Template Operations ====================

  /**
   * Generate and download CSV template
   */
  async downloadTemplate(options?: TemplateGenerationOptions): Promise<void> {
    try {
      const template = this.generateCsvTemplate(options);
      
      const blob = new Blob([template.content], { type: template.mimeType });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = template.fileName;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      toast.success('Template downloaded successfully');
    } catch (error: any) {
      console.error('Error downloading template:', error);
      toast.error('Failed to download template');
    }
  }

  /**
   * Generate CSV template content
   */
  private generateCsvTemplate(options?: TemplateGenerationOptions): TemplateDownloadResponse {
    const headers = [
      'FirstName',
      'LastName',
      'LinkedinUrl', 
      'Email',
      'Phone',
      'Location',
      'CurrentPosition',
      'CurrentCompany',
      'Experience',
      'Skills',
      'Education',
      'Summary'
    ];

    const sampleData: CandidateTemplateData[] = options?.includeExamples ? [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        phone: '+51 999 888 777',
        linkedinUrl: 'https://linkedin.com/in/johndoe',
        location: 'Lima, Peru',
        currentPosition: 'Software Engineer',
        currentCompany: 'Tech Corp',
        experience: '5 years',
        skills: 'React, Node.js, TypeScript, JavaScript',
        education: 'Computer Science Degree',
        summary: 'Experienced developer with 5+ years in React and Node.js'
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@email.com',
        phone: '+51 888 777 666',
        linkedinUrl: 'https://linkedin.com/in/janesmith',
        location: 'Arequipa, Peru',
        currentPosition: 'UX Designer',
        currentCompany: 'Design Studio',
        experience: '3 years',
        skills: 'Figma, Adobe XD, Prototyping, User Research',
        education: 'Design Degree',
        summary: 'Creative designer with strong portfolio and user-centered approach'
      }
    ] : [];

    // Add custom fields if provided
    let allHeaders = [...headers];
    if (options?.customFields) {
      allHeaders = [...headers, ...options.customFields.map((f: any) => f.name)];
    }

    // Create CSV content
    const csvLines = [
      allHeaders.join(',')
    ];

    // Add sample data
    if (sampleData.length > 0) {
      sampleData.forEach((row: CandidateTemplateData) => {
        const values = allHeaders.map(header => {
          const value = (((header: string) => {
            switch(header) {
              case 'FirstName':
                return row.firstName;
              case 'LastName':
                return row.lastName;
              case 'LinkedinUrl':
                return row.linkedinUrl;
              case 'Email':
                return row.email;
              case 'Phone':
                return row.phone;
              case 'Location':
                return row.location;
              case 'CurrentPosition':
                return row.currentPosition;
              case 'CurrentCompany':
                return row.currentCompany;
              case 'Experience':
                return row.experience;
              case 'Skills':
                return row.skills;
              case 'Education':
                return row.education;
              case 'Summary':
                return row.summary;
              default:
                return '';
            }
          })(header))!;
          // Escape quotes and wrap in quotes if contains comma or quote
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        });
        csvLines.push(values.join(','));
      });
    }

    // Add instructions as comments if requested
    if (options?.includeInstructions) {
      const instructions = [
        '# Instructions:',
        '# - FirstName and lastName are required',
        '# - Email is required and must be valid',
        '# - LinkedinUrl should be a valid LinkedIn profile URL',
        '# - Phone should include country code',
        '# - Skills should be comma-separated within quotes',
        '# - Remove these instruction lines before uploading',
        ''
      ];
      csvLines.unshift(...instructions);
    }

    const csvContent = csvLines.join('\n');

    return {
      fileName: `candidate_upload_template_${new Date().toISOString().split('T')[0]}.csv`,
      content: new Blob([csvContent], { type: 'text/csv;charset=utf-8' }),
      mimeType: 'text/csv'
    };
  }

  /**
   * Get template download URL for server-generated templates
   */
  getTemplateDownloadUrl(): string {
    return `${this.baseUrl}/candidates/bulk-upload/template`;
  }

  // ==================== CSV Validation ====================

  /**
   * Validate CSV content before upload
   */
  async validateCsvContent(file: File): Promise<CsvValidationResult> {
    try {
      const content = await this.readFileContent(file);
      const lines = content.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        return {
          isValid: false,
          errors: [{
            row: 0,
            field: 'file',
            message: 'File must contain at least a header row and one data row'
          }],
          warnings: [],
          totalRows: 0,
          validRows: 0
        };
      }

      // Parse header
      const headerLine = lines[0];
      const headers = this.parseCsvLine(headerLine);
      
      const requiredHeaders = ['FirstName', 'LastName', 'Email'];
      const missingHeaders = requiredHeaders.filter(req => 
        !headers.some(h => h.toLowerCase().trim() === req.toLowerCase())
      );

      const errors: CsvValidationResult['errors'] = [];
      const warnings: CsvValidationResult['warnings'] = [];

      if (missingHeaders.length > 0) {
        errors.push({
          row: 1,
          field: 'headers',
          message: `Missing required headers: ${missingHeaders.join(', ')}`
        });
      }

      // Validate data rows
      let validRows = 0;
      for (let i = 1; i < lines.length; i++) {
        const rowNumber = i + 1;
        const line = lines[i];
        
        if (!line.trim()) continue;

        const values = this.parseCsvLine(line);
        let isRowValid = true;

        // Check required fields
        headers.forEach((header, index) => {
          const value = values[index]?.trim() || '';
          const headerLower = header.toLowerCase().trim();

          if (requiredHeaders.includes(headerLower) && !value) {
            errors.push({
              row: rowNumber,
              field: header,
              message: `${header} is required`,
              value
            });
            isRowValid = false;
          }

          // Validate email format
          if (headerLower === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              errors.push({
                row: rowNumber,
                field: header,
                message: 'Invalid email format',
                value
              });
              isRowValid = false;
            }
          }

          // Validate LinkedIn URL
          if (headerLower === 'linkedinurl' && value && !value.includes('linkedin.com')) {
            warnings.push({
              row: rowNumber,
              field: header,
              message: 'LinkedIn URL should contain linkedin.com',
              value
            });
          }
        });

        if (isRowValid) {
          validRows++;
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        totalRows: lines.length - 1, // Exclude header
        validRows
      };
    } catch (error: any) {
      return {
        isValid: false,
        errors: [{
          row: 0,
          field: 'file',
          message: `Failed to parse CSV: ${error.message}`
        }],
        warnings: [],
        totalRows: 0,
        validRows: 0
      };
    }
  }

  /**
   * Read file content as text
   */
  private readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file, 'utf-8');
    });
  }

  /**
   * Parse CSV line handling quotes and commas
   */
  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  // ==================== History and Statistics ====================

  /**
   * Get upload history for a recruitment process
   */
  async getUploadHistory(recruitmentId: string): Promise<BulkUploadHistoryItem[]> {
    await this.validateAuth();

    try {
      const response = await httpClient.get(
        `${this.buildUrl(recruitmentId)}/candidates/bulk-upload/history`
      );

      return response.data;
    } catch (error: any) {
      // If endpoint doesn't exist, return empty array
      if (error.response?.status !== 404) {
        this.handleError(error, 'fetch upload history');
      }
    }
    return [];
  }

  /**
   * Get bulk upload statistics
   */
  async getUploadStatistics(recruitmentId?: string): Promise<BulkUploadStatistics> {
    await this.validateAuth();

    try {
      const url = recruitmentId 
        ? `${this.buildUrl(recruitmentId)}/candidates/bulk-upload/statistics`
        : `${this.baseUrl}/candidates/bulk-upload/statistics`;

      const response = await httpClient.get(url);
      return response.data;
    } catch (error: any) {
      this.handleError(error, 'fetch upload statistics');
    }
    throw Error("Unsupported operation!");
  }

  // ==================== Convenience Methods ====================

  /**
   * Start upload (alias for uploadCandidates)
   */
  async startUpload(
    recruitmentId: string,
    file: File,
    options?: BulkUploadOptions
  ): Promise<BulkUploadResponse> {
    return this.uploadCandidates(recruitmentId, file, options);
  }

  /**
   * Track progress with callback
   */
  async trackProgress(
    recruitmentId: string,
    uploadId: string,
    onProgress?: (status: BulkUploadStatus) => void
  ): Promise<BulkUploadResults> {
    return this.pollUploadStatus(recruitmentId, uploadId, onProgress);
  }

  /**
   * Complete upload workflow with progress tracking
   */
  async uploadAndTrack(
    recruitmentId: string,
    file: File,
    options?: BulkUploadOptions,
    onProgress?: (status: BulkUploadStatus) => void
  ): Promise<BulkUploadResults> {
    // Step 1: Validate file
    const validation = this.validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Step 2: Upload file
    const uploadResponse = await this.uploadCandidates(recruitmentId, file, options);

    // Step 3: Poll for completion
    return this.pollUploadStatus(
      recruitmentId,
      uploadResponse.uploadId,
      onProgress
    );
  }

  /**
   * Upload with CSV validation
   */
  async uploadWithValidation(
    recruitmentId: string,
    file: File,
    options?: BulkUploadOptions
  ): Promise<BulkUploadResults> {
    // Validate CSV content first
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      const csvValidation = await this.validateCsvContent(file);
      
      if (!csvValidation.isValid) {
        const errorMessage = csvValidation.errors
          .map((e: any) => `Row ${e.row}: ${e.message}`)
          .join('; ');
        throw new Error(`CSV validation failed: ${errorMessage}`);
      }

      if (csvValidation.warnings.length > 0) {
        const warningMessage = csvValidation.warnings
          .map((w: any) => `Row ${w.row}: ${w.message}`)
          .join('; ');
        toast.custom(`CSV warnings: ${warningMessage}`);
      }
    }

    return this.uploadAndTrack(recruitmentId, file, options);
  }

  // ==================== Error Handling ====================

  /**
   * Enhanced error handling for bulk upload specific errors
   */
  protected handleError(error: any, operation: string): void {
    console.error(`BulkCandidateService ${operation} error:`, error);

    // Handle specific bulk upload errors
    if (error.response?.data?.code) {
      const apiError: BulkUploadApiError = error.response.data;
      
      switch (apiError.code) {
        case 'INVALID_FILE_FORMAT':
          toast.error('Invalid file format. Please upload a CSV or Excel file.');
          break;
        case 'FILE_TOO_LARGE':
          toast.error('File size exceeds the maximum limit of 10MB.');
          break;
        case 'PROCESS_NOT_COMPLETED':
          toast.error('Upload process is still in progress. Please wait.');
          break;
        case 'DUPLICATE_EMAIL':
          toast.error('Some candidates have duplicate email addresses.');
          break;
        default:
          toast.error(apiError.message || `Failed to ${operation}`);
      }
    } else {
      super.handleError(error, operation);
    }
  }
}

// Singleton instance
export const bulkCandidateService = new BulkCandidateService();
export default bulkCandidateService;