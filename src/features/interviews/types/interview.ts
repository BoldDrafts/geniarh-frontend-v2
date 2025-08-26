// Types based on the OpenAPI specification
export type InterviewStatus = 'Scheduled' | 'Confirmed' | 'InProgress' | 'Completed' | 'Cancelled' | 'NoShow' | 'Rescheduled';
export type InterviewType = 'Phone' | 'Video' | 'InPerson' | 'Technical' | 'Panel' | 'Final';
export type InterviewPriority = 'High' | 'Medium' | 'Low';
export type InterviewResult = 'Pass' | 'Fail' | 'Pending';
export type ParticipantRole = 'Interviewer' | 'Candidate' | 'Recruiter' | 'HiringManager';
export type ParticipantStatus = 'Invited' | 'Confirmed' | 'Declined' | 'NoShow' | 'Attended';

export interface Participant {
  id: string;
  name: string;
  email: string;
  role: ParticipantRole;
  department?: string;
  phone?: string;
  isRequired: boolean;
  status: ParticipantStatus;
}

export interface EvaluationCriteria {
  id: string;
  name: string;
  description: string;
}

export interface EvaluationScore {
  criteriaId: string;
  score: number;
  comment?: string;
  evaluatorId: string;
}

export interface Interview {
  id: string;
  recruitmentId: string;
  title?: string;
  type: InterviewType;
  status: InterviewStatus;
  priority?: InterviewPriority;
  scheduledDateTime: string;
  endDateTime?: string;
  duration: number; // Duration in minutes
  location?: string;
  meetingLink?: string;
  description?: string;
  participants: Participant[];
  evaluationCriteria?: EvaluationCriteria[];
  evaluationScores?: EvaluationScore[];
  overallScore?: number;
  result?: InterviewResult;
  feedback?: string;
  nextSteps?: string;
  reminderSent?: boolean;
  calendarEventId?: string;
  recordingUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  
  // Additional fields for UI compatibility (these might come from joined data)
  candidateName?: string;
  candidatePhoto?: string;
  position?: string;
  date?: string;
  time?: string;
  interviewers?: string[];
  candidateMatchScore?: number;
}

// Request/Response types for API calls
export interface CreateInterviewRequest {
  recruitmentId: string;
  candidateId: string;
  // Additional fields would be added based on the complete API spec
}

export interface RescheduleRequest {
  newDateTime: string;
  reason?: string;
  notifyParticipants?: boolean;
}

export interface StatusUpdateRequest {
  status: InterviewStatus;
  reason?: string;
}

// Filter types for the UI
export interface InterviewFilters {
  status?: InterviewStatus;
  type?: InterviewType;
  requirementId?: string;
  dateRange?: string;
  interviewer?: string;
  position?: string;
}

// Utility type for the legacy Interview interface (for backward compatibility)
export interface LegacyInterview {
  id: string;
  candidateName: string;
  candidatePhoto: string;
  position: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'canceled' | 'pending';
  type: 'technical' | 'hr' | 'cultural' | 'ai';
  interviewers: string[];
  candidateMatchScore?: number;
}