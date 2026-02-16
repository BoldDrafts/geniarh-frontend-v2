/**
 * AI Generation Types - Based on OpenAPI specification
 * Following the same pattern as BulkUploadResponse for async operations
 */

import { ExperienceLevel } from "./base";

// ==================== Enums ====================

/**
 * Status values from OpenAPI spec (lowercase)
 */
export type AIGenerationStatusEnum = 'pending' | 'generating' | 'validating' | 'completed' | 'failed' | 'cancelled';

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'it';

// ==================== Request Types ====================

/**
 * Request to generate candidates using AI
 * Based on OpenAPI: AIGenerateCandidatesRequest
 */
export interface AIGenerateCandidatesRequest {
  count: number; // 1-50
  experienceLevel: ExperienceLevel;
  skills: string[];
  location?: string;
  language?: SupportedLanguage;
  includeCoverLetter?: boolean;
  customPrompt?: string;
}

/**
 * Request to approve AI-generated candidates
 * Based on OpenAPI: AIApproveCandidatesRequest
 */
export interface AIApproveCandidatesRequest {
  candidateIds: string[]; // UUIDs or ['all']
  sendNotifications?: boolean;
  customMessage?: string;
}

// ==================== Response Types ====================

/**
 * Immediate response when AI generation process starts (202 Accepted)
 * Based on OpenAPI: AIGenerateCandidatesResponse
 */
export interface AIGenerateCandidatesResponse {
  generationId: string;
  status: AIGenerationStatusEnum;
  requestedCount: number;
  estimatedProcessingTime?: number;
  createdAt: string;
}

/**
 * Progress tracking for AI generation process
 * Based on OpenAPI: AIGenerationStatus.progress
 */
export interface AIGenerationProgress {
  requestedCount: number;
  generatedCount: number;
  validatedCount: number;
  percentageComplete: number;
}

/**
 * AI generation status response
 * Based on OpenAPI: AIGenerationStatus
 */
export interface AIGenerationStatus {
  generationId: string;
  status: AIGenerationStatusEnum;
  progress: AIGenerationProgress;
  startedAt: string;
  completedAt?: string;
  estimatedTimeRemaining?: number;
  currentOperation?: string;
  errors?: AIGenerationError[];
}

/**
 * Error information for AI generation failures
 * Based on OpenAPI: AIGenerationError
 */
export interface AIGenerationError {
  code: string;
  message: string;
  candidateIndex?: number;
  details?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Education information for generated candidate
 * Based on OpenAPI: Education
 */
export interface CandidateEducation {
  degree: string;
  institution: string;
  year: number;
  field?: string;
}

/**
 * Experience information for generated candidate
 */
export interface CandidateExperience {
  position: string;
  company: string;
  duration: string;
  description?: string;
  skills?: string[];
}

/**
 * AI-generated candidate data
 * Based on OpenAPI: AIGeneratedCandidate
 */
export interface AIGeneratedCandidate {
  candidateId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  experienceLevel: ExperienceLevel;
  yearsOfExperience?: number;
  skills: string[];
  education?: CandidateEducation;
  experience?: string[]; // Array of certifications per OpenAPI
  summary: string;
  coverLetter?: string;
  matchScore: number; // 0-100
  aiConfidence?: number; // 0-100
  generatedAt: string;
}

/**
 * Complete AI generation results
 * Based on OpenAPI: AIGenerationResults
 */
export interface AIGenerationResults {
  generationId: string;
  status: AIGenerationStatusEnum;
  requestedCount: number;
  generatedCount: number;
  validatedCount?: number;
  candidates: AIGeneratedCandidate[];
  errors?: AIGenerationError[];
  processingTime?: number;
  completedAt: string;
}

/**
 * Basic candidate interface for approved candidates
 */
export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  status: string;
  matchScore?: number;
  createdAt: string;
}

/**
 * Response for candidate approval operation
 * Based on OpenAPI: AIApproveCandidatesResponse
 */
export interface AIApproveCandidatesResponse {
  generationId: string;
  approvedCount: number;
  skippedCount?: number;
  successCount: number;
  failedCount: number;
  approvedCandidates?: Candidate[];
  errors?: AIGenerationError[];
  processedAt: string;
}

// ==================== Service Options ====================

export interface AIGenerationOptions {
  prioritizeSkills?: string[];
  excludeExistingCandidates?: boolean;
  validateEmails?: boolean;
  customWeighting?: {
    experienceWeight: number;
    skillsWeight: number;
    educationWeight: number;
  };
}

export interface AIApproveOptions {
  autoAssociate?: boolean;
  sendWelcomeEmail?: boolean;
  assignRecruiter?: boolean;
  customStatus?: string;
}

// ==================== History and Statistics ====================

export interface AIGenerationHistoryItem {
  generationId: string;
  requestedCount: number;
  generatedCount: number;
  status: AIGenerationStatusEnum;
  processingTime?: number;
  averageMatchScore?: number;
  generatedBy: string;
  startedAt: string;
  completedAt?: string;
}

/**
 * Summary information for AI generation (from list endpoint)
 */
export interface AIGenerationSummary {
  generationId: string;
  status: AIGenerationStatusEnum;
  requestedCount: number;
  generatedCount: number;
  validatedCount?: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  processingTime?: number;
  currentOperation?: string;
}

/**
 * Paginated response for AI generations list
 */
export interface AIGenerationListResponse {
  data: AIGenerationSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AIGenerationStatistics {
  totalGenerations: number;
  totalCandidatesGenerated: number;
  averageSuccessRate: number;
  averageProcessingTime: number;
  averageMatchScore: number;
  recentGenerations: AIGenerationHistoryItem[];
}

// ==================== Error Handling ====================

export interface AIGenerationApiError {
  code: string;
  message: string;
  timestamp: string;
  requestId: string;
  details?: Record<string, unknown>;
}

// ==================== Progress Tracking ====================

export type AIGenerationProgressEventEnum = 'pending' | 'generating' | 'validating' | 'completed' | 'failed';

export interface AIGenerationProgressEvent {
  generationId: string;
  stage: AIGenerationProgressEventEnum;
  progress: number;
  message?: string;
  currentCandidate?: number;
  totalCandidates?: number;
}

// ==================== Filter and Search ====================

export interface AIGenerationFilterParams {
  page?: number;
  limit?: number;
  status?: AIGenerationStatusEnum;
  experienceLevel?: ExperienceLevel;
  dateFrom?: string;
  dateTo?: string;
  minMatchScore?: number;
  maxMatchScore?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'status';
  sortOrder?: 'asc' | 'desc';
}

// ==================== Legacy Types (for backward compatibility) ====================

/** @deprecated Use AIGenerateCandidatesRequest instead */
export interface AIGenerateRequest {
  recruitmentId: string;
  prompt: string;
  priority?: 'low' | 'medium' | 'high';
}

/** @deprecated Use AIGenerationStatus instead */
export interface AIGenerateResponse {
  id: string;
  recruitmentId: string;
  prompt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  processedAt?: string;
  result?: unknown;
  error?: string;
}

/** @deprecated Use AIGenerationListResponse instead */
export interface PromptListResponse {
  data: AIGenerateResponse[];
  pagination: {
    current: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

/** @deprecated Use AIGenerationFilterParams instead */
export interface PromptFilterParams {
  page?: number;
  limit?: number;
  status?: AIGenerateResponse['status'];
  priority?: AIGenerateRequest['priority'];
}
