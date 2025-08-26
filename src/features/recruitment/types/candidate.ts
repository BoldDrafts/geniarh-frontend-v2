// types/candidate.ts - Tipos relacionados con candidatos

import { CandidateStatus, CandidateStage, InterviewType, InterviewStatus, HiringRecommendation } from './base';
import { 
  JobLocation, 
  Pagination, 
  DocumentInfo, 
  LanguageSkill, 
  Education, 
  Certification, 
  WorkExperience,
  ReferralInfo,
  BulkOperationResult 
} from './shared';

// ==================== INTERFACES PRINCIPALES DEL CANDIDATO ====================

export interface Candidate {
  /** Unique identifier for the candidate - UUID format */
  id: string;
  
  /** Personal information about the candidate (required) */
  personalInfo: PersonalInfo;
  
  /** Contact information for the candidate (required) */
  contact: ContactInfo;
  
  /** Professional profile information (optional) */
  profile?: CandidateProfile;
  
  /** Application specific information (optional) */
  application?: ApplicationInfo;
  
  /** Assessment results and scores (optional) */
  assessment?: CandidateAssessment;
  
  /** Array of interviews conducted (optional) */
  interviews?: Interview[];
  
  /** Current status in the recruitment process (required) */
  status: CandidateStatus;
  
  /** Current stage in the recruitment process (optional) */
  stage?: CandidateStage;
  
  /** How the candidate was sourced (optional) */
  source?: string;
  
  /** When the candidate record was created (ISO date-time) */
  createdAt: string;
  
  /** When the candidate record was last updated (ISO date-time) */
  updatedAt: string;
}

// ==================== INTERFACES DE INFORMACIÓN PERSONAL ====================

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  nationality?: string;
  location?: JobLocation;
}

export interface ContactInfo {
  email: string;
  phone?: string;
  linkedin?: string;
  portfolio?: string;
  github?: string;
}

// ==================== INTERFACES DE PERFIL PROFESIONAL ====================

export interface CandidateProfile {
  summary?: string;
  experience?: WorkExperience[];
  education?: Education[];
  skills?: string[];
  softSkills?: string[];
  languages?: LanguageSkill[];
  certifications?: Certification[];
}

// ==================== INTERFACES DE APLICACIÓN ====================

export interface ApplicationInfo {
  appliedAt: string;
  source: string;
  coverLetter?: string;
  resume?: DocumentInfo;
  additionalDocuments?: DocumentInfo[];
  referral?: ReferralInfo;
}

// ==================== INTERFACES DE EVALUACIÓN ====================

export interface CandidateAssessment {
  overallScore?: number;
  technicalScore?: number;
  culturalFitScore?: number;
  communicationScore?: number;
  strengths?: string[];
  weaknesses?: string[];
  notes?: string;
  assessedBy?: string;
  assessedAt?: string;
  matchScore?: number;
}

// ==================== INTERFACES DE ENTREVISTAS ====================

export interface Interview {
  id: string;
  type: InterviewType;
  round: number;
  scheduledAt: string;
  duration?: number;
  status: InterviewStatus;
  interviewers?: Interviewer[];
  location?: string;
  feedback?: InterviewFeedback;
  notes?: string;
}

export interface Interviewer {
  id: string;
  name: string;
  email: string;
  role?: string;
  department?: string;
}

export interface InterviewFeedback {
  overallRating: number;
  technicalSkills?: number;
  communication?: number;
  problemSolving?: number;
  culturalFit?: number;
  recommendation: HiringRecommendation;
  strengths?: string[];
  concerns?: string[];
  detailedFeedback?: string;
  interviewerName: string;
  submittedAt: string;
}

// ==================== INTERFACES DE REQUEST/RESPONSE ====================

export interface CandidateListResponse {
  data: Candidate[];
  pagination: Pagination;
}

export interface CandidateFilterParams {
  status?: CandidateStatus;
  stage?: CandidateStage;
  source?: string;
  department?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'firstName' | 'lastName';
  sortOrder?: 'asc' | 'desc';
}

export interface CandidateStatusUpdateRequest {
  status: CandidateStatus;
  stage?: CandidateStage;
  reason?: string;
  notes?: string;
}

// ==================== INTERFACES DE ASOCIACIÓN DE CANDIDATOS ====================

export interface AssociateCandidatesRequest {
  profileLink: string;
  profileName: string;
  profileDescription?: string;
  profileEmail?: string;
  profileSummary?: string;
  profileCvUri?: string;
  profileLocation?: string;
}

export interface AssociateCandidatesResponse {
  id: string;
  recruitmentCandidateId: string;
  candidateNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department: string;
  summary?: string;
  city?: string;
  country?: string;
  linkedinUrl?: string;
  statusId: number;
  stageId?: number;
  createdAt: string;
}

export interface FailedAssociation {
  candidateId: string;
  reason: string;
}

// ==================== INTERFACES DE OPERACIONES EN LOTE ====================

export interface CandidateBulkUpdateResult extends BulkOperationResult<Candidate> {
  candidateId: string;
}

export interface CandidateBulkUpdateRequest {
  candidateId: string;
  status: CandidateStatus;
  reason?: string;
  notes?: string;
}

// ==================== INTERFACES DE ERRORES ESPECÍFICOS ====================

export interface CandidateAssociationError {
  profileLink: string;
  reason: string;
  details?: any;
}

// ==================== INTERFACES DE ACTUALIZACIÓN DE EMAIL ====================

export interface CandidateEmailUpdateRequest {
  email: string;
}

export interface CandidateEmailUpdateData {
  candidateId: string;
  recruitmentProcessId: string;
  email: string;
  previousEmail?: string;
  updatedAt: string;
  updatedBy?: string;
}