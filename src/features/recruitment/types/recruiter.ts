// types/recruiter.ts - Tipos relacionados con reclutadores

import { Pagination } from './shared';

// ==================== INTERFACE PRINCIPAL DE RECLUTADOR ====================

export interface Recruiter {
  id: string;
  name: string;
  email: string;
  department?: string;
  isActive?: boolean;
  specializations?: string[];
  experience?: number;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ==================== INTERFACES DE REQUEST/RESPONSE ====================

export interface CreateRecruiterRequest {
  name: string;
  email: string;
  department?: string;
  specializations?: string[];
  experience?: number;
  location?: string;
}

export interface UpdateRecruiterRequest {
  name?: string;
  email?: string;
  department?: string;
  specializations?: string[];
  experience?: number;
  location?: string;
  isActive?: boolean;
}

export interface RecruiterListResponse {
  data: Recruiter[];
  pagination: Pagination;
}

// ==================== INTERFACES DE ASOCIACIÓN ====================

export interface AssociateRecruiterRequest {
  recruiterId: string;
}

export interface RecruiterAssociationResponse {
  id: string;
  recruitmentProcessId: string;
  recruiterId: string;
  recruiterName: string;
  recruiterEmail: string;
  recruiterDepartment?: string;
  assignedAt: string;
  assignedBy: string;
  isActive: boolean;
}

// ==================== INTERFACES DE FILTROS ====================

export interface RecruiterFilterParams {
  department?: string;
  isActive?: boolean;
  specialization?: string;
  experience?: {
    min?: number;
    max?: number;
  };
  location?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'email' | 'department' | 'experience' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ==================== INTERFACES DE PERFORMANCE ====================

export interface RecruiterPerformance {
  recruiterId: string;
  recruiterName: string;
  period: {
    start: string;
    end: string;
  };
  metrics: {
    totalRecruitments: number;
    activeRecruitments: number;
    completedRecruitments: number;
    totalCandidates: number;
    hiredCandidates: number;
    averageTimeToHire: number;
    successRate: number;
    candidateQualityScore: number;
  };
  rankings: {
    overallRank: number;
    departmentRank: number;
    totalRecruiters: number;
  };
}

// ==================== INTERFACES DE DISPONIBILIDAD ====================

export interface RecruiterAvailability {
  recruiterId: string;
  currentWorkload: number;
  maxCapacity: number;
  availabilityScore: number;
  activeRecruitments: string[];
  estimatedCapacityDate?: string;
}

// ==================== INTERFACES DE ESPECIALIZACIÓN ====================

export interface RecruiterSpecialization {
  area: string;
  level: 'Junior' | 'Intermediate' | 'Senior' | 'Expert';
  yearsOfExperience: number;
  certifications?: string[];
}

// ==================== INTERFACES DE NOTIFICACIONES ====================

export interface RecruiterNotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  types: {
    newAssignment: boolean;
    candidateUpdate: boolean;
    deadlineReminder: boolean;
    performanceReport: boolean;
  };
}