// types/recruitmentFormTypes.ts
import { EmploymentType, ExperienceLevel, Priority, Recruiter, RecruitmentProcess, Requirement, Timeframe } from './recruitment';

export interface RequirementFormType {
  title?: string;
  department?: string;
  location?: string;
  workType?: 'Remote' | 'OnSite' | 'Hybrid';
  employmentType?: EmploymentType;
  priority?: Priority;
  experienceLevel?: ExperienceLevel;
  positionsCount?: number;
  urgency?: Timeframe;
  expectedStartDate?: string;
  recruiterId?: string;
  
  // Salary information
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod?: 'hour' | 'month' | 'year';
  
  // Skills
  skills?: string[];
  softSkills?: string[];
  
  // Description
  description?: string;
  
  // Benefits and additional info
  benefits?: string[];
  requirements?: string[];
  responsibilities?: string[];
  
  // AI usage
  useAI?: boolean;
}

export interface NewRecruitmentFormProps {
  onClose: () => void;
  onSubmit: (data: any) => void | Promise<void>;
  initialData?: RecruitmentProcess;
  mode?: 'create' | 'edit';
}

// Extended interface for BasicInfoSection
export interface BasicInfoSectionProps {
  initialData?: RequirementFormType;
  recruiters: Recruiter[];
  loadingRecruiters: boolean;
  recruitersError: string | null;
  onRetryLoadRecruiters: () => void;
}

// Form submission data interface
export interface RecruitmentFormSubmissionData extends RequirementFormType {
  // Additional fields that might be added during form submission
  createdBy?: string;
  organizationId?: string;
  status?: 'Draft' | 'Pending' | 'Active' | 'Paused' | 'Completed' | 'Cancelled';
}

// Validation errors interface
export interface FormValidationErrors {
  title?: string;
  department?: string;
  location?: string;
  workType?: string;
  employmentType?: string;
  experienceLevel?: string;
  positionsCount?: string;
  salaryMin?: string;
  salaryMax?: string;
  recruiterId?: string;
  skills?: string;
  description?: string;
  general?: string;
}

// Form state interface
export interface RecruitmentFormState {
  // Form data
  formData: RequirementFormType;
  
  // UI state
  isSubmitting: boolean;
  isDirty: boolean;
  
  // Validation
  errors: FormValidationErrors;
  isValid: boolean;
  
  // External data
  recruiters: Recruiter[];
  loadingRecruiters: boolean;
  recruitersError: string | null;
}