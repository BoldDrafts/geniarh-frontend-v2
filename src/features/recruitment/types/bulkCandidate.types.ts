/**
 * Bulk Candidate Upload Types
 * Based on the OpenAPI specifications from the documents
 */

// ==================== Enums ====================

export type BulkUploadStatusEnum = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'COMPLETED_WITH_ERRORS';

// ==================== Request Types ====================

export interface BulkUploadFileRequest {
  file: File;
}

// ==================== Response Types ====================

export interface BulkUploadResponse {
  uploadId: string;
  fileName: string;
  fileSize: number;
  status: BulkUploadStatusEnum;
  totalRows: number;
  estimatedProcessingTime?: number;
  createdAt: string;
}

export interface BulkUploadProgress {
  totalRows: number;
  processedRows: number;
  successfullyProcessed: number;
  failedToProcess: number;
  percentageComplete: number;
  duplicatesSkipped?: number;
  processingTimeSeconds?: number;
}

export interface BulkUploadStatus {
  uploadId: string;
  fileName: string;
  status: BulkUploadStatusEnum;
  progress: BulkUploadProgress;
  startedAt: string;
  completedAt?: string;
  estimatedTimeRemaining?: number;
  currentOperation?: string;
}

export interface BulkUploadError {
  row: number;
  field: string;
  error: string;
  value?: string;
  errorCode: string;
}

export interface BulkUploadResultsSummary {
  totalRows: number;
  successfullyProcessed: number;
  failedToProcess: number;
  duplicatesSkipped: number;
  processingTimeSeconds: number;
}

export interface BulkUploadSuccessRecord {
  row: number;
  candidateId: string;
  recruitmentCandidateId: string;
  candidateNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
}

export interface BulkUploadResults {
  uploadId: string;
  fileName: string;
  status: BulkUploadStatusEnum;
  summary: BulkUploadResultsSummary;
  successfulCandidates: BulkUploadSuccessRecord[];
  errors: BulkUploadError[];
  startedAt: string;
  completedAt: string;
}

// ==================== Template and CSV Types ====================

export interface CandidateTemplateData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  linkedinUrl?: string;
  location?: string;
  currentPosition?: string;
  currentCompany?: string;
  experience?: string;
  skills?: string;
  education?: string;
  summary?: string;
}

export interface CsvValidationResult {
  isValid: boolean;
  errors: Array<{
    row: number;
    field: string;
    message: string;
    value?: string;
  }>;
  warnings: Array<{
    row: number;
    field: string;
    message: string;
    value?: string;
  }>;
  totalRows: number;
  validRows: number;
}

// ==================== Service Options ====================

export interface BulkUploadOptions {
  skipDuplicates?: boolean;
  validateEmails?: boolean;
  validateLinkedIn?: boolean;
  autoAssignStatus?: string;
  notifyOnCompletion?: boolean;
}

// ==================== File Validation ====================

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
  fileInfo?: {
    name: string;
    size: number;
    type: string;
    lastModified: number;
  };
}

export interface SupportedFileFormat {
  extension: string;
  mimeType: string;
  description: string;
  maxSize: number; // in bytes
}

// ==================== Progress Tracking ====================

export type UploadProgressEventEnum = 'UPLOADING' | 'PARSING' | 'VALIDATING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface UploadProgressEvent {
  uploadId: string;
  stage: UploadProgressEventEnum;
  progress: number;
  message?: string;
  currentRow?: number;
  totalRows?: number;
}

// ==================== Error Handling ====================

export interface BulkUploadApiError {
  code: string;
  message: string;
  timestamp: string;
  requestId: string;
  details?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

// ==================== History and Statistics ====================

export interface BulkUploadHistoryItem {
  uploadId: string;
  fileName: string;
  status: BulkUploadStatusEnum;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  uploadedBy: string;
  startedAt: string;
  completedAt?: string;
  processingTimeSeconds?: number;
}

/**
 * Summary information for a bulk upload (from listBulkUploads endpoint)
 */
export interface BulkUploadSummary {
  uploadId: string;
  fileName: string;
  fileSize: number;
  status: BulkUploadStatusEnum;
  totalRows: number;
  processedRows?: number;
  successfullyProcessed?: number;
  failedToProcess?: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  currentOperation?: string;
}

/**
 * Paginated response for bulk uploads list
 */
export interface BulkUploadListResponse {
  data: BulkUploadSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BulkUploadStatistics {
  totalUploads: number;
  totalCandidatesProcessed: number;
  averageSuccessRate: number;
  averageProcessingTime: number;
  recentUploads: BulkUploadHistoryItem[];
}

// ==================== Template Generation ====================

export interface TemplateGenerationOptions {
  includeExamples?: boolean;
  includeInstructions?: boolean;
  format: 'csv' | 'xlsx';
  customFields?: Array<{
    name: string;
    required: boolean;
    description?: string;
  }>;
}

export interface TemplateDownloadResponse {
  fileName: string;
  content: Blob;
  mimeType: string;
}