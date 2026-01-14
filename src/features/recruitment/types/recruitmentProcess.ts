// types/recruitmentProcess.ts - Tipos del proceso de reclutamiento

import { RecruitmentStatus, SortField, SortOrder, Priority, EmploymentType, ExperienceLevel, Currency, Timeframe } from './base';
import { Pagination } from './shared';
import { Requirement } from './requirement';
import { Candidate } from './candidate';
import { Publication } from './publication';

// ==================== INTERFACE PRINCIPAL DEL PROCESO ====================

export interface RecruitmentProcess {
  id: string;
  requirement: Requirement;
  candidates: Candidate[];
  publications: Publication[];
  status: RecruitmentStatus;
  metrics: RecruitmentMetrics;
  timeline: RecruitmentTimeline;
  assignedRecruiter?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  recruiterId: string;
  recruiterName: string;
  recruiterEmail: string;
  positionsCount: number;
}

export interface UpdateRecruitmentRequest {
  title?: string; // minLength: 1, maxLength: 255
  department?: string; // maxLength: 100
  workType?: string; // maxLength: 255
  employmentType?: EmploymentType;
  priority?: Priority;
  expectedStartDate?: string; // formato date: "2025-09-01"
  positionsCount?: number; // minimum: 1, maximum: 50
  experienceLevel?: ExperienceLevel;
  budgetMin?: number; // minimum: 0
  budgetMax?: number; // minimum: 0
  currency?: Currency;
  urgency?: Timeframe;
  technicalSkills?: string[]; // maxItems: 20
  softSkills?: string[]; // maxItems: 10
  recruiterId?: string; // UUID format
  description?: string; // maxLength: 5000
  status?: RecruitmentStatus;
}

// ==================== INTERFACES DE MÉTRICAS ====================

export interface RecruitmentMetrics {
  totalCandidates: number;
  qualifiedCandidates: number;
  interviewsScheduled: number;
  offersExtended: number;
  offerAcceptanceRate: number;
  timeToHire: number;
  costPerHire: number;
}

export interface RecruitmentTimeline {
  created: string;
  published?: string;
  firstCandidate?: string;
  firstInterview?: string;
  completed?: string;
}

// ==================== INTERFACES DE REQUEST/RESPONSE ====================

export interface CreateRecruitmentRequest {
  requirementId: string;
}

export interface UpdateStatusRequest {
  status: RecruitmentStatus;
  reason?: string;
}

export interface RecruitmentListResponse {
  data: RecruitmentProcess[];
  pagination: Pagination;
}

// ==================== INTERFACES DE FILTROS Y PARÁMETROS ====================

export interface RecruitmentListParams {
  status?: RecruitmentStatus;
  department?: string;
  priority?: Priority;
  recruiterId?: string;
  createdBy?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  page?: number;
  limit?: number;
  sortBy?: SortField;
  sortOrder?: SortOrder;
}

export interface RecruitmentFiltersType {
  department: string;
  priority: Priority | '';
  status: RecruitmentStatus | '';
  sortBy: SortField;
  sortOrder: SortOrder;
}

// ==================== INTERFACES DE ESTADÍSTICAS ====================

export interface RecruitmentSummaryStats {
  total: number;
  active: number;
  completed: number;
  paused: number;
  cancelled: number;
  totalCandidates: number;
  avgTimeToHire: number;
}

export interface RecruitmentAnalytics {
  period: {
    start: string;
    end: string;
  };
  summary: RecruitmentSummaryStats;
  trends: {
    date: string;
    totalProcesses: number;
    activeCandidates: number;
    completedHires: number;
  }[];
  departmentBreakdown: Record<string, RecruitmentSummaryStats>;
  priorityBreakdown: Record<Priority, RecruitmentSummaryStats>;
  performance: {
    averageTimeToHire: number;
    averageCostPerHire: number;
    successRate: number;
    candidateQualityScore: number;
  };
}

// ==================== INTERFACES DE ETAPAS Y WORKFLOW ====================

export interface RecruitmentStage {
  name: string;
  status: 'upcoming' | 'current' | 'complete' | 'cancelled';
  description: string;
  startDate?: string;
  endDate?: string;
  duration?: number;
  responsible?: string;
}

export interface RecruitmentWorkflow {
  id: string;
  name: string;
  stages: RecruitmentStage[];
  isDefault: boolean;
  department?: string;
  priority?: Priority;
  estimatedDuration: number;
  createdAt: string;
  updatedAt: string;
}

// ==================== INTERFACES DE REPORTES ====================

export interface RecruitmentReport {
  id: string;
  title: string;
  type: 'summary' | 'detailed' | 'performance' | 'trends';
  period: {
    start: string;
    end: string;
  };
  data: RecruitmentAnalytics;
  generatedAt: string;
  generatedBy: string;
  filters: RecruitmentListParams;
}

// ==================== INTERFACES DE CONFIGURACIÓN ====================

export interface RecruitmentSettings {
  autoAssignRecruiters: boolean;
  defaultCandidateStatus: string;
  allowBulkOperations: boolean;
  maxCandidatesPerProcess: number;
  requireApprovalForStatusChange: boolean;
  defaultWorkflow?: string;
  notifications: {
    enabled: boolean;
    events: {
      processCreated: boolean;
      statusChanged: boolean;
      candidateAdded: boolean;
      deadlineApproaching: boolean;
    };
  };
}

// ==================== INTERFACES DE APROBACIÓN ====================

export interface RecruitmentApproval {
  id: string;
  recruitmentProcessId: string;
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  comments?: string;
}

// ==================== INTERFACES DE AUDIT LOG ====================

export interface RecruitmentAuditLog {
  id: string;
  recruitmentProcessId: string;
  action: string;
  performedBy: string;
  performedAt: string;
  oldValue?: any;
  newValue?: any;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
}