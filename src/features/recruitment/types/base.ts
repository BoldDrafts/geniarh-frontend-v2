// types/base.ts - Tipos base del sistema de reclutamiento

// ==================== TIPOS DE ESTADO ====================

export type RecruitmentStatus = 'Draft' | 'Active' | 'Paused' | 'Completed' | 'Cancelled';

export type RequirementStatus = 'Active' | 'Draft' | 'Closed' | 'Email' | 'Recruitment';

export type CandidateStatus = 
  | 'new' 
  | 'contacted' 
  | 'interview' 
  | 'offer' 
  | 'hired' 
  | 'rejected';

export type CandidateStage = 
  | 'applied'
  | 'screening'
  | 'technical'
  | 'cultural'
  | 'offer'
  | 'hired';

// ==================== TIPOS DE CLASIFICACIÓN ====================

export type Priority = 'High' | 'Medium' | 'Low' | 'Urgent';

export type ExperienceLevel = 'Entry' | 'Mid' | 'Senior' | 'Lead' | 'Executive';

export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship';

export type Timeframe = 'Immediate' | '1-2 months' | '3-6 months' | '6+ months';

// ==================== TIPOS DE DATOS ====================

export type Currency = 'PEN' | 'USD';

export type SalaryFrequency = 'Hourly' | 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';

export type SortField = 'createdAt' | 'updatedAt' | 'title' | 'department' | 'priority';

export type SortOrder = 'asc' | 'desc';

// ==================== TIPOS DE PUBLICACIÓN ====================

export type PublicationPlatform = 
  | 'LinkedIn' 
  | 'Computrabajo' 
  | 'Indeed' 
  | 'Glassdoor' 
  | 'CompanyWebsite' 
  | 'Other';

export type PublicationStatus = 'Draft' | 'Published' | 'Expired' | 'Suspended' | 'Archived';

// ==================== TIPOS DE ENTREVISTA ====================

export type InterviewType = 
  | 'Phone' 
  | 'Video' 
  | 'InPerson' 
  | 'Technical' 
  | 'Panel' 
  | 'Behavioral';

export type InterviewStatus = 
  | 'Scheduled' 
  | 'InProgress' 
  | 'Completed' 
  | 'Cancelled' 
  | 'Rescheduled';

export type HiringRecommendation = 
  | 'StrongHire' 
  | 'Hire' 
  | 'MaybeHire' 
  | 'NoHire' 
  | 'StrongNoHire';

// ==================== TIPOS DE HABILIDADES Y EDUCACIÓN ====================

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export type LanguageProficiency = 'Basic' | 'Conversational' | 'Business' | 'Fluent' | 'Native';

export type EducationLevel = 
  | 'HighSchool' 
  | 'Associate' 
  | 'Bachelor' 
  | 'Master' 
  | 'Doctorate' 
  | 'Professional';