// types/shared.ts - Interfaces compartidas entre módulos

import { Currency, SalaryFrequency, SkillLevel, LanguageProficiency, EducationLevel } from './base';

// ==================== INTERFACES DE UBICACIÓN ====================

export interface JobLocation {
  city: string;
  state?: string;
  country: string;
  address?: string;
  timezone?: string;
}

// ==================== INTERFACES DE PAGINACIÓN ====================

export interface Pagination {
  total: number;
  pages: number;
  current: number;
  limit: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

// ==================== INTERFACES DE DOCUMENTOS ====================

export interface DocumentInfo {
  id: string;
  filename: string;
  fileType: string;
  fileSize?: number;
  uploadedAt: string;
  url?: string;
}

// ==================== INTERFACES DE HABILIDADES ====================

export interface Skill {
  name: string;
  level: SkillLevel;
  required?: boolean;
  yearsOfExperience?: number;
}

export interface LanguageSkill {
  language: string;
  proficiency: LanguageProficiency;
  certifications?: string[];
}

// ==================== INTERFACES DE EDUCACIÓN ====================

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate?: string;
  endDate?: string;
  gpa?: number;
  honors?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  dateObtained: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
}

// ==================== INTERFACES DE EXPERIENCIA LABORAL ====================

export interface WorkExperience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  location?: JobLocation;
}

// ==================== INTERFACES DE COMPENSACIÓN ====================

export interface SalaryRange {
  min?: number;
  max?: number;
  frequency: SalaryFrequency;
}

export interface BonusStructure {
  signing?: number;
  performance?: number;
  annual?: number;
}

export interface Compensation {
  currency: Currency;
  salary?: SalaryRange;
  benefits?: string[];
  bonuses?: BonusStructure;
}

// ==================== INTERFACES DE REFERENCIA ====================

export interface ReferralInfo {
  referrerName: string;
  referrerEmail?: string;
  relationship?: string;
  notes?: string;
}

// ==================== INTERFACES DE ERROR ====================

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp?: string;
  requestId?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ValidationError[];
  };
  timestamp: string;
  requestId?: string;
}

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  timestamp: string;
  requestId?: string;
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

// ==================== INTERFACES DE OPERACIONES EN LOTE ====================

export interface BulkOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}