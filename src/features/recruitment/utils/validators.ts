// utils/validators.ts - Funciones de validación y type guards

import {
  RecruitmentStatus,
  RequirementStatus,
  CandidateStatus,
  CandidateStage,
  PublicationPlatform,
  PublicationStatus,
  Priority,
  ExperienceLevel,
  EmploymentType,
  InterviewType,
  InterviewStatus,
  HiringRecommendation,
  SkillLevel,
  LanguageProficiency,
  EducationLevel
} from '../types/base';
import { Candidate } from '../types/candidate';

// ==================== VALIDADORES DE UUID ====================

/**
 * Type guard to validate if a string is a valid UUID
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

// ==================== VALIDADORES DE ESTADO ====================

/**
 * Type guard para validar RecruitmentStatus
 */
export function isValidRecruitmentStatus(status: string): status is RecruitmentStatus {
  return ['Draft', 'Active', 'Paused', 'Completed', 'Cancelled'].includes(status);
}

/**
 * Type guard para validar RequirementStatus
 */
export function isValidRequirementStatus(status: string): status is RequirementStatus {
  return ['Active', 'Draft', 'Closed', 'Email', 'Recruitment'].includes(status);
}

/**
 * Type guard para validar CandidateStatus
 */
export function isValidCandidateStatus(status: string): status is CandidateStatus {
  return ['new', 'contacted', 'interview', 'offer', 'hired', 'rejected'].includes(status);
}

/**
 * Type guard para validar CandidateStage
 */
export function isValidCandidateStage(stage: string): stage is CandidateStage {
  return ['applied', 'screening', 'technical', 'cultural', 'offer', 'hired'].includes(stage);
}

// ==================== VALIDADORES DE PUBLICACIÓN ====================

/**
 * Type guard para validar PublicationPlatform
 */
export function isValidPublicationPlatform(platform: string): platform is PublicationPlatform {
  return ['LinkedIn', 'Computrabajo', 'Indeed', 'Glassdoor', 'CompanyWebsite', 'Other'].includes(platform);
}

/**
 * Type guard para validar PublicationStatus
 */
export function isValidPublicationStatus(status: string): status is PublicationStatus {
  return ['Draft', 'Published', 'Expired', 'Suspended', 'Archived'].includes(status);
}

// ==================== VALIDADORES DE CLASIFICACIÓN ====================

/**
 * Type guard para validar Priority
 */
export function isValidPriority(priority: string): priority is Priority {
  return ['High', 'Medium', 'Low', 'Urgent'].includes(priority);
}

/**
 * Type guard para validar ExperienceLevel
 */
export function isValidExperienceLevel(level: string): level is ExperienceLevel {
  return ['Entry', 'Mid', 'Senior', 'Lead', 'Executive'].includes(level);
}

/**
 * Type guard para validar EmploymentType
 */
export function isValidEmploymentType(type: string): type is EmploymentType {
  return ['Full-time', 'Part-time', 'Contract', 'Internship'].includes(type);
}

// ==================== VALIDADORES DE ENTREVISTA ====================

/**
 * Type guard para validar InterviewType
 */
export function isValidInterviewType(type: string): type is InterviewType {
  return ['Phone', 'Video', 'InPerson', 'Technical', 'Panel', 'Behavioral'].includes(type);
}

/**
 * Type guard para validar InterviewStatus
 */
export function isValidInterviewStatus(status: string): status is InterviewStatus {
  return ['Scheduled', 'InProgress', 'Completed', 'Cancelled', 'Rescheduled'].includes(status);
}

/**
 * Type guard para validar HiringRecommendation
 */
export function isValidHiringRecommendation(recommendation: string): recommendation is HiringRecommendation {
  return ['StrongHire', 'Hire', 'MaybeHire', 'NoHire', 'StrongNoHire'].includes(recommendation);
}

// ==================== VALIDADORES DE HABILIDADES Y EDUCACIÓN ====================

/**
 * Type guard para validar SkillLevel
 */
export function isValidSkillLevel(level: string): level is SkillLevel {
  return ['Beginner', 'Intermediate', 'Advanced', 'Expert'].includes(level);
}

/**
 * Type guard para validar LanguageProficiency
 */
export function isValidLanguageProficiency(proficiency: string): proficiency is LanguageProficiency {
  return ['Basic', 'Conversational', 'Business', 'Fluent', 'Native'].includes(proficiency);
}

/**
 * Type guard para validar EducationLevel
 */
export function isValidEducationLevel(level: string): level is EducationLevel {
  return ['HighSchool', 'Associate', 'Bachelor', 'Master', 'Doctorate', 'Professional'].includes(level);
}

// ==================== VALIDADORES DE FORMATO ====================

/**
 * Valida si un email tiene formato válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida si una URL tiene formato válido
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valida si un número de teléfono tiene formato válido
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

/**
 * Valida si una fecha tiene formato ISO válido
 */
export function isValidISODate(date: string): boolean {
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  return isoDateRegex.test(date) && !isNaN(Date.parse(date));
}

// ==================== VALIDADORES DE OBJETOS COMPLEJOS ====================

/**
 * Valida si un objeto Candidate cumple con los campos requeridos
 */
export function validateCandidateRequired(candidate: Partial<Candidate>): candidate is Pick<Candidate, 'id' | 'personalInfo' | 'contact' | 'status'> {
  return !!(
    candidate.id &&
    candidate.personalInfo &&
    candidate.contact &&
    candidate.status &&
    isValidUUID(candidate.id) &&
    isValidCandidateStatus(candidate.status) &&
    candidate.personalInfo.firstName &&
    candidate.personalInfo.lastName &&
    candidate.contact.email &&
    isValidEmail(candidate.contact.email)
  );
}

/**
 * Valida si un rango de salario es válido
 */
export function isValidSalaryRange(min: number, max: number): boolean {
  return min >= 0 && max >= 0 && max >= min;
}

/**
 * Valida si un rango de fechas es válido
 */
export function isValidDateRange(startDate: string, endDate: string): boolean {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end;
}

// ==================== VALIDADORES DE NEGOCIO ====================

/**
 * Valida si un candidato puede cambiar a un estado específico
 */
export function canChangeToStatus(currentStatus: CandidateStatus, newStatus: CandidateStatus): boolean {
  const statusFlow: Record<CandidateStatus, CandidateStatus[]> = {
    'new': ['contacted', 'rejected'],
    'contacted': ['interview', 'rejected'],
    'interview': ['offer', 'rejected'],
    'offer': ['hired', 'rejected'],
    'hired': [],
    'rejected': []
  };
  
  return statusFlow[currentStatus]?.includes(newStatus) || false;
}

/**
 * Valida si un proceso de reclutamiento puede cambiar a un estado específico
 */
export function canChangeRecruitmentStatus(currentStatus: RecruitmentStatus, newStatus: RecruitmentStatus): boolean {
  const statusFlow: Record<RecruitmentStatus, RecruitmentStatus[]> = {
    'Draft': ['Active', 'Cancelled'],
    'Active': ['Paused', 'Completed', 'Cancelled'],
    'Paused': ['Active', 'Cancelled'],
    'Completed': [],
    'Cancelled': []
  };
  
  return statusFlow[currentStatus]?.includes(newStatus) || false;
}

// ==================== VALIDADORES DE PERMISOS ====================

/**
 * Valida si un usuario tiene permisos para realizar una acción
 */
export function hasPermission(userRoles: string[], requiredRoles: string[], requireAll: boolean = false): boolean {
  if (requireAll) {
    return requiredRoles.every(role => userRoles.includes(role));
  }
  return requiredRoles.some(role => userRoles.includes(role));
}

/**
 * Valida si un usuario puede editar un candidato
 */
export function canEditCandidate(userRoles: string[], candidateStatus: CandidateStatus): boolean {
  const restrictedStatuses: CandidateStatus[] = ['hired'];
  const managerRoles = ['hr-manager', 'recruiter-supervisor'];
  
  if (restrictedStatuses.includes(candidateStatus)) {
    return hasPermission(userRoles, managerRoles);
  }
  
  return hasPermission(userRoles, ['recruiter', 'recruiter-supervisor', 'hr-manager']);
}