// model/recruitment.ts - Archivo principal que exporta todos los tipos del sistema

// ==================== EXPORTAR TIPOS BASE ====================
export type {
  RecruitmentStatus,
  RequirementStatus,
  CandidateStatus,
  CandidateStage,
  Priority,
  ExperienceLevel,
  EmploymentType,
  Currency,
  Timeframe,
  SortField,
  SortOrder,
  SalaryFrequency,
  PublicationPlatform,
  PublicationStatus,
  InterviewType,
  InterviewStatus,
  HiringRecommendation,
  SkillLevel,
  LanguageProficiency,
  EducationLevel
} from './base';

// ==================== EXPORTAR INTERFACES COMPARTIDAS ====================
export type {
  JobLocation,
  Pagination,
  DocumentInfo,
  Skill,
  LanguageSkill,
  Education,
  Certification,
  WorkExperience,
  SalaryRange,
  BonusStructure,
  Compensation,
  ReferralInfo,
  ApiError,
  ValidationError,
  ErrorResponse,
  SuccessResponse,
  ApiResponse,
  BulkOperationResult
} from './shared';

// ==================== EXPORTAR TIPOS DE REQUIREMENT ====================
export type {
  Requirement,
  JobRequirements,
  EducationRequirement,
  ExperienceRequirement,
  SkillsRequirement,
  LanguageRequirement,
  RequirementRequester,
  CreateRequirementRequest,
  UpdateRequirementRequest,
  RequirementListParams
} from './requirement';

// ==================== EXPORTAR TIPOS DE CANDIDATE ====================
export type {
  Candidate,
  PersonalInfo,
  ContactInfo,
  CandidateProfile,
  ApplicationInfo,
  CandidateAssessment,
  Interview,
  Interviewer,
  InterviewFeedback,
  CandidateListResponse,
  CandidateFilterParams,
  CandidateStatusUpdateRequest,
  AssociateCandidatesRequest,
  AssociateCandidatesResponse,
  FailedAssociation,
  CandidateBulkUpdateResult,
  CandidateBulkUpdateRequest,
  CandidateAssociationError
} from './candidate';

// ==================== EXPORTAR TIPOS DE PUBLICATION ====================
export type {
  Publication,
  PublicationEngagement,
  CreatePublicationRequest,
  UpdatePublicationRequest,
  PublicationListResponse,
  PublicationFilterParams,
  PublicationBulkUpdateResult,
  PublicationBulkUpdateRequest,
  PublicationError,
  PublicationMetrics,
  PublicationSettings,
  PublicationTemplate
} from './publication';

// ==================== EXPORTAR TIPOS DE RECRUITER ====================
export type {
  Recruiter,
  CreateRecruiterRequest,
  UpdateRecruiterRequest,
  RecruiterListResponse,
  AssociateRecruiterRequest,
  RecruiterAssociationResponse,
  RecruiterFilterParams,
  RecruiterPerformance,
  RecruiterAvailability,
  RecruiterSpecialization,
  RecruiterNotificationSettings
} from './recruiter';

// ==================== EXPORTAR TIPOS DE RECRUITMENT PROCESS ====================
export type {
  RecruitmentProcess,
  RecruitmentMetrics,
  RecruitmentTimeline,
  CreateRecruitmentRequest,
  UpdateStatusRequest,
  RecruitmentListResponse,
  RecruitmentListParams,
  RecruitmentFiltersType,
  RecruitmentSummaryStats,
  RecruitmentAnalytics,
  RecruitmentStage,
  RecruitmentWorkflow,
  RecruitmentReport,
  RecruitmentSettings,
  RecruitmentApproval,
  RecruitmentAuditLog,
  UpdateRecruitmentRequest 
} from './recruitmentProcess';