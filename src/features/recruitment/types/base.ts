// types/base.ts - Tipos base del sistema de reclutamiento

// ==================== TIPOS DE ESTADO ====================

/**
 * Enumeración de etapas del proceso de reclutamiento
 */
export type RecruitmentStageEnum = 
  | "CREATED"
  | "PUBLISHED"
  | "SOURCING"
  | "SCREENING"
  | "INTERVIEWS"
  | "SHORTLIST"
  | "HIRING";

export type StageStatusEnum = 
  | 'UPCOMING'
  | 'CURRENT'
  | 'COMPLETE'
  | 'CANCELLED'
  | 'NONE';

export type RecruitmentStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

export type RequirementStatus = 'ACTIVE' | 'DRAFT' | 'CLOSED' | 'EMAIL' | 'RECRUITMENT';

export type CandidateStatus = 
  | 'NEW' 
  | 'CONTACTED' 
  | 'INTERVIEW' 
  | 'OFFER' 
  | 'HIRED' 
  | 'REJECTED';

export type CandidateStage = 
  | 'APPLIED'
  | 'SCREENING'
  | 'TECHNICAL'
  | 'CULTURAL'
  | 'OFFER'
  | 'HIRED';

// ==================== TIPOS DE CLASIFICACIÓN ====================

export type Priority = 'HIGH' | 'MEDIUM' | 'LOW' | 'URGENT';

export type ExperienceLevel = 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE';

export type EmploymentType = 'FULL-TIME' | 'PART-TIME' | 'CONTRACT' | 'INTERNSHIP';

export type Timeframe = 'IMMEDIATE' | '1-2 MONTHS' | '3-6 MONTHS' | '6+ MONTHS';

// ==================== TIPOS DE DATOS ====================

export type Currency = 'PEN' | 'USD';

export type SalaryFrequency = 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export type SortField = 'createdAt' | 'updateAt' | 'Title' | 'Department' | 'Priority';

export type SortOrder = 'asc' | 'desc';

// ==================== TIPOS DE PUBLICACIÓN ====================

export type PublicationPlatform = 
  | 'LINKEDIN' 
  | 'COMPUTRABAJO' 
  | 'INDEED' 
  | 'GLASSDOOR' 
  | 'COMPANYWEBSITE' 
  | 'OTHER';

export type PublicationStatus = 'DRAFT' | 'PUBLISHED' | 'EXPIRED' | 'SUSPENDED' | 'ARCHIVED';

// ==================== TIPOS DE ENTREVISTA ====================

export type InterviewType = 
  | 'PHONE' 
  | 'VIDEO' 
  | 'INPERSON' 
  | 'TECHNICAL' 
  | 'PANEL' 
  | 'BEHAVIORAL';

export type InterviewStatus = 
  | 'SCHEDULED' 
  | 'INPROGRESS' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'RESCHEDULED';

export type HiringRecommendation = 
  | 'STRONGHIRE' 
  | 'HIRE' 
  | 'MAYBEHIRE' 
  | 'NOHIRE' 
  | 'STRONGNOHIRE';

// ==================== TIPOS DE HABILIDADES Y EDUCACIÓN ====================

export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export type LanguageProficiency = 'BASIC' | 'CONVERSATIONAL' | 'BUSINESS' | 'FLUENT' | 'NATIVE';

export type EducationLevel = 
  | 'HIGHSCHOOL' 
  | 'ASSOCIATE' 
  | 'BACHELOR' 
  | 'MASTER' 
  | 'DOCTORATE' 
  | 'PROFESSIONAL';

export type QualityLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type HealthScoreStatus = 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL';