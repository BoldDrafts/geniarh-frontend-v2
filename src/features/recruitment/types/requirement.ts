// types/requirement.ts - Tipos relacionados con requirements

import { 
  Priority, 
  RequirementStatus, 
  ExperienceLevel, 
  EmploymentType, 
  EducationLevel,
  LanguageProficiency,
  Currency 
} from './base';
import { Skill, LanguageSkill, SalaryRange, BonusStructure } from './shared';

// ==================== INTERFACE PRINCIPAL DE REQUIREMENT ====================

export interface Requirement {
  id: string;
  title: string;
  department: string;
  priority: Priority;
  timeframe: string;
  experienceLevel: ExperienceLevel;
  workType: string;
  employmentType: EmploymentType;
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: Currency;
  skills: string[];
  softSkills: string[];
  description: string;
  qualifications?: string;
  status: RequirementStatus;
  createdAt: string;
  updatedAt: string;
  expectedStartDate: string;
}

// ==================== INTERFACES DE REQUERIMIENTOS DETALLADOS ====================

export interface JobRequirements {
  education?: EducationRequirement;
  experience?: ExperienceRequirement;
  skills?: SkillsRequirement;
  languages?: LanguageRequirement[];
  certifications?: string[];
}

export interface EducationRequirement {
  level: EducationLevel;
  field?: string;
  required?: boolean;
}

export interface ExperienceRequirement {
  minimumYears?: number;
  preferredYears?: number;
  industry?: string;
  roleType?: string;
}

export interface SkillsRequirement {
  technical?: Skill[];
  soft?: Skill[];
}

export interface LanguageRequirement {
  language: string;
  level: LanguageProficiency;
  required?: boolean;
}

// ==================== INTERFACE DE SOLICITANTE ====================

export interface RequirementRequester {
  id: string;
  name: string;
  email: string;
  role?: string;
  department?: string;
}

// ==================== INTERFACES DE REQUEST/RESPONSE ====================

export interface CreateRequirementRequest {
  title: string;
  department: string;
  priority: Priority;
  timeframe: string;
  experienceLevel: ExperienceLevel;
  location: string;
  employmentType: EmploymentType;
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: Currency;
  skills: string[];
  softSkills?: string[];
  description: string;
  qualifications?: string;
  requirements?: JobRequirements;
}

export interface UpdateRequirementRequest extends Partial<CreateRequirementRequest> {
  status?: RequirementStatus;
}

export interface RequirementListParams {
  status?: RequirementStatus;
  department?: string;
  priority?: Priority;
  experienceLevel?: ExperienceLevel;
  employmentType?: EmploymentType;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'priority';
  sortOrder?: 'asc' | 'desc';
}