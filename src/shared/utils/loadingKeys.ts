// Constantes para las keys de loading - Requirements
export const REQUIREMENTS_LOADING_KEYS = {
  FETCH_REQUIREMENTS: 'fetchRequirements',
  FETCH_REQUIREMENT_DETAIL: 'fetchRequirementDetail',
  CREATE_REQUIREMENT: 'createRequirement',
  UPDATE_REQUIREMENT: 'updateRequirement',
  DELETE_REQUIREMENT: 'deleteRequirement',
  UPDATE_STATUS: 'updateStatus',
  REGISTER_RECRUITMENT: 'registerRecruitment',
  EDIT_REQUIREMENT: 'editRequirement'
} as const;

// Constantes para las keys de loading - Recruitment
export const RECRUITMENT_LOADING_KEYS = {
  FETCH_RECRUITMENTS: 'fetchRecruitments',
  FETCH_RECRUITMENT_DETAIL: 'fetchRecruitmentDetail',
  CREATE_RECRUITMENT: 'createRecruitment',
  UPDATE_RECRUITMENT: 'updateRecruitment',
  DELETE_RECRUITMENT: 'deleteRecruitment',
  UPDATE_STATUS: 'updateRecruitmentStatus',
  CREATE_PUBLICATION: 'createPublication',
  UPDATE_PUBLICATION: 'updatePublication',
  DELETE_PUBLICATION: 'deletePublication',
  REFRESH_DATA: 'refreshRecruitmentData',
  CHANGE_TAB: 'changeRecruitmentTab'
} as const;

// Constantes para las keys de loading - Candidates
export const CANDIDATES_LOADING_KEYS = {
  FETCH_CANDIDATES: 'fetchCandidates',
  FETCH_CANDIDATE_DETAIL: 'fetchCandidateDetail',
  CREATE_CANDIDATE: 'createCandidate',
  UPDATE_CANDIDATE: 'updateCandidate',
  DELETE_CANDIDATE: 'deleteCandidate',
  UPDATE_STATUS: 'updateCandidateStatus',
  UPLOAD_RESUME: 'uploadResume'
} as const;

// Constantes para las keys de loading - Interviews
export const INTERVIEWS_LOADING_KEYS = {
  FETCH_INTERVIEWS: 'fetchInterviews',
  FETCH_INTERVIEW_DETAIL: 'fetchInterviewDetail',
  CREATE_INTERVIEW: 'createInterview',
  UPDATE_INTERVIEW: 'updateInterview',
  DELETE_INTERVIEW: 'deleteInterview',
  SCHEDULE_INTERVIEW: 'scheduleInterview',
  UPDATE_FEEDBACK: 'updateFeedback'
} as const;

// Helper para crear keys dinámicas
export const createLoadingKey = (operation: string, id?: string | number) => {
  return id ? `${operation}_${id}` : operation;
};