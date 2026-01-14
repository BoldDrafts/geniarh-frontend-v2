// ==================== TYPES AND INTERFACES FOR REQUIREMENTS ====================
// Basado en las especificaciones OpenAPI originales

export interface Requirement {
  id?: string;
  title: string;
  department: string;
  priority: RequirementPriority;
  timeframe: RequirementTimeframe;
  experienceLevel: ExperienceLevel;
  location: string;
  employmentType: EmploymentType;
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: SalaryCurrency;
  skills: string[];
  softSkills: string[];
  description: string;
  qualifications?: string;
  status: RequirementStatus;
  createdAt?: string;
  updatedAt?: string;
  // New fields for recruitment
  candidates?: string[]; // Array of candidate IDs
  publications?: Publication[];
  // Additional metadata
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  closedAt?: string;
  notes?: string;
}

export interface Publication {
  id: string;
  platform: PublicationPlatform;
  url: string;
  status: PublicationStatus;
  publishedAt?: string;
  expiresAt?: string;
  views?: number;
  applications?: number;
  engagement?: PublicationEngagement;
  // Additional fields
  createdBy?: string;
  cost?: number;
  costCurrency?: SalaryCurrency;
  targetAudience?: string;
  description?: string;
}

export interface PublicationEngagement {
  likes?: number;
  shares?: number;
  clicks?: number;
  comments?: number;
  saves?: number;
}

// ==================== ENUMS AND TYPES (From Original Service) ====================

export type RequirementPriority = 'High' | 'Medium' | 'Low';

export type RequirementTimeframe = 
  | 'Immediate' 
  | '1-2 months' 
  | '3-6 months' 
  | '6+ months';

export type ExperienceLevel = 
  | 'Entry' 
  | 'Mid' 
  | 'Senior' 
  | 'Lead' 
  | 'Executive';

export type EmploymentType = 
  | 'Full-time' 
  | 'Part-time' 
  | 'Contract' 
  | 'Internship'
  | 'Freelance'
  | 'Temporary';

export type SalaryCurrency = 'USD' | 'PEN';

// Status from original service
export type RequirementStatus = 
  | 'Active' 
  | 'Draft' 
  | 'Closed' 
  | 'Approved'
  | 'Rejected'
  | 'Expired'
  | 'On Hold';

// Platforms from original service
export type PublicationPlatform = 
  | 'LinkedIn' 
  | 'Computrabajo' 
  | 'Other'
  | 'Indeed'
  | 'Glassdoor'
  | 'ZipRecruiter'
  | 'AngelList'
  | 'Stack Overflow Jobs'
  | 'GitHub Jobs'
  | 'Remote.co'
  | 'We Work Remotely';

// Status from original service
export type PublicationStatus = 
  | 'Draft' 
  | 'Published' 
  | 'Expired'
  | 'Paused'
  | 'Rejected'
  | 'Under Review';

// ==================== REQUEST/RESPONSE INTERFACES (Compatible with BaseService) ====================

// Note: PaginationParams should be imported from your baseService file
// Example: import { PaginationParams } from '../lib/api/baseService';

// Parámetros que extiende PaginationParams del baseService
export interface RequirementListParams {
  // From PaginationParams
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  // Requirement specific filters
  status?: 'Active' | 'Draft' | 'Closed'; // Mantenemos los originales del servicio
  department?: string;
  priority?: RequirementPriority;
  experienceLevel?: ExperienceLevel;
  employmentType?: EmploymentType;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: SalaryCurrency;
  skills?: string[];
  timeframe?: RequirementTimeframe;
  createdBy?: string;
  approvedBy?: string;
  // Date filters
  createdAfter?: string;
  createdBefore?: string;
  approvedAfter?: string;
  approvedBefore?: string;
}

export interface CreateRequirementRequest extends Omit<Requirement, 'id' | 'createdAt' | 'updatedAt' | 'status'> {
  // Override status to be optional in creation (defaults to 'Draft')
  status?: RequirementStatus;
}

export interface UpdateRequirementRequest extends Partial<Requirement> {
  id: string;
}

export interface RequirementStatusUpdateRequest {
  status: RequirementStatus;
  reason?: string;
  notes?: string;
}

// Parámetros originales para publicaciones
export interface CreatePublicationRequest extends Omit<Publication, 'id'> {
  requirementId: string;
}

export interface UpdatePublicationRequest extends Partial<Publication> {
  id: string;
}

export interface PublicationMetricsUpdate {
  views?: number;
  applications?: number;
  engagement?: Partial<PublicationEngagement>;
}

export interface CandidateAssignmentRequest {
  candidateIds: string[];
}

export interface CandidateAssignmentResponse {
  success: string[];
  failed: string[];
  errors?: Record<string, string>;
}

// ==================== RESPONSE INTERFACES ====================

export interface RequirementResponse extends Requirement {
  // Additional computed fields
  totalApplications?: number;
  totalViews?: number;
  publicationCount?: number;
  candidateCount?: number;
  averageEngagement?: number;
}

export interface RequirementListResponse {
  data: RequirementResponse[];
  pagination: {
    total: number;
    pages: number;
    current: number;
    limit: number;
  };
  filters?: {
    departments: string[];
    locations: string[];
    skills: string[];
  };
}

export interface RequirementStatistics {
  total: number;
  byStatus: Record<RequirementStatus, number>;
  byDepartment: Record<string, number>;
  byPriority: Record<RequirementPriority, number>;
  byExperienceLevel: Record<ExperienceLevel, number>;
  byEmploymentType: Record<EmploymentType, number>;
  averageSalary: Record<SalaryCurrency, {
    min: number;
    max: number;
    average: number;
  }>;
  timeline: {
    created: Array<{ date: string; count: number }>;
    approved: Array<{ date: string; count: number }>;
    closed: Array<{ date: string; count: number }>;
  };
}

export interface PublicationStatistics {
  total: number;
  byPlatform: Record<PublicationPlatform, number>;
  byStatus: Record<PublicationStatus, number>;
  totalViews: number;
  totalApplications: number;
  totalCost: Record<SalaryCurrency, number>;
  averageEngagement: {
    likesPerPublication: number;
    sharesPerPublication: number;
    clicksPerPublication: number;
    applicationsPerView: number;
  };
  topPerformingPlatforms: Array<{
    platform: PublicationPlatform;
    views: number;
    applications: number;
    cost: number;
    roi: number;
  }>;
}

// ==================== VALIDATION INTERFACES ====================

export interface RequirementValidation {
  valid: boolean;
  errors: ValidationError[];
  warnings?: ValidationWarning[];
}

export interface ValidationError {
  field: keyof Requirement;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: keyof Requirement;
  message: string;
  suggestion?: string;
}

// ==================== FILTER AND SEARCH INTERFACES ====================

export interface RequirementSearchCriteria {
  query?: string; // Free text search
  skills?: string[];
  softSkills?: string[];
  departments?: string[];
  locations?: string[];
  salaryRange?: {
    min: number;
    max: number;
    currency: SalaryCurrency;
  };
  experience?: {
    levels: ExperienceLevel[];
  };
  employment?: {
    types: EmploymentType[];
  };
  timeframes?: RequirementTimeframe[];
  priorities?: RequirementPriority[];
  statuses?: RequirementStatus[];
  dateRange?: {
    field: 'createdAt' | 'updatedAt' | 'approvedAt' | 'closedAt';
    from: string;
    to: string;
  };
}

export interface RequirementSearchResponse {
  data: RequirementResponse[];
  pagination: {
    total: number;
    pages: number;
    current: number;
    limit: number;
  };
  facets: {
    departments: Array<{ name: string; count: number }>;
    locations: Array<{ name: string; count: number }>;
    skills: Array<{ name: string; count: number }>;
    priorities: Array<{ name: RequirementPriority; count: number }>;
    experienceLevels: Array<{ name: ExperienceLevel; count: number }>;
  };
  searchMeta: {
    query: string;
    executionTime: number;
    totalResults: number;
  };
}

// ==================== TEMPLATE INTERFACES ====================

export interface RequirementTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  template: Partial<Requirement>;
  createdBy: string;
  createdAt: string;
  usageCount: number;
  isPublic: boolean;
  tags: string[];
}

export interface CreateRequirementTemplateRequest {
  name: string;
  description: string;
  category: string;
  template: Partial<Requirement>;
  isPublic?: boolean;
  tags?: string[];
}

// ==================== BULK OPERATIONS ====================

export interface BulkRequirementOperation {
  action: 'update' | 'delete' | 'updateStatus' | 'approve' | 'close';
  requirementIds: string[];
  data?: any;
}

export interface BulkRequirementResponse {
  success: string[];
  failed: Array<{
    id: string;
    error: string;
  }>;
  summary: {
    total: number;
    succeeded: number;
    failed: number;
  };
}

// ==================== EXPORT INTERFACES ====================

export interface RequirementExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  fields?: (keyof Requirement)[];
  filters?: RequirementListParams;
  includePublications?: boolean;
  includeCandidates?: boolean;
}

export interface RequirementExportResponse {
  downloadUrl: string;
  filename: string;
  expiresAt: string;
  format: string;
  recordCount: number;
}

// ==================== CONSTANTS ====================

export const REQUIREMENT_PRIORITIES: RequirementPriority[] = ['High', 'Medium', 'Low'];

export const REQUIREMENT_TIMEFRAMES: RequirementTimeframe[] = [
  'Immediate',
  '1-2 months',
  '3-6 months',
  '6+ months'
];

export const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  'Entry',
  'Mid',
  'Senior',
  'Lead',
  'Executive'
];

export const EMPLOYMENT_TYPES: EmploymentType[] = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
  'Freelance',
  'Temporary'
];

export const SALARY_CURRENCIES: SalaryCurrency[] = [
  'PEN',
  'USD'
];

export const REQUIREMENT_STATUSES: RequirementStatus[] = [
  'Draft',
  'Approved',
  'Active',
  'On Hold',
  'Closed',
  'Rejected',
  'Expired'
];

export const PUBLICATION_PLATFORMS: PublicationPlatform[] = [
  'LinkedIn',
  'Computrabajo',
  'Indeed',
  'Glassdoor',
  'ZipRecruiter',
  'AngelList',
  'Stack Overflow Jobs',
  'GitHub Jobs',
  'Remote.co',
  'We Work Remotely',
  'Other'
];

export const PUBLICATION_STATUSES: PublicationStatus[] = [
  'Draft',
  'Under Review',
  'Published',
  'Paused',
  'Expired',
  'Rejected'
];

// ==================== UTILITY TYPES ====================

export type RequirementFormData = Omit<Requirement, 'id' | 'createdAt' | 'updatedAt' | 'candidates' | 'publications'>;

export type RequirementSummary = Pick<Requirement, 
  | 'id' 
  | 'title' 
  | 'department' 
  | 'priority' 
  | 'status' 
  | 'experienceLevel'
  | 'location'
  | 'createdAt'
>;

export type PublicationSummary = Pick<Publication,
  | 'id'
  | 'platform'
  | 'status'
  | 'views'
  | 'applications'
  | 'publishedAt'
>;

// ==================== ERROR TYPES ====================

export interface RequirementServiceError {
  code: string;
  message: string;
  field?: keyof Requirement;
  details?: any;
}

export interface PublicationServiceError {
  code: string;
  message: string;
  field?: keyof Publication;
  details?: any;
}

// ==================== WEBHOOK TYPES ====================

export interface RequirementWebhookPayload {
  event: 'requirement.created' | 'requirement.updated' | 'requirement.deleted' | 'requirement.status_changed';
  requirement: Requirement;
  changes?: Partial<Requirement>;
  actor: {
    id: string;
    name: string;
    email: string;
  };
  timestamp: string;
}

export interface PublicationWebhookPayload {
  event: 'publication.created' | 'publication.updated' | 'publication.deleted' | 'publication.metrics_updated';
  publication: Publication;
  requirement: RequirementSummary;
  changes?: Partial<Publication>;
  actor: {
    id: string;
    name: string;
    email: string;
  };
  timestamp: string;
}