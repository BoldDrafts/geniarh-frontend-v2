import { CandidateStage, CandidateStatus } from "../model/recruitment";

// Definición de opciones basadas en los tipos del modelo - SWAGGER COMPLIANT
export const CANDIDATE_STATUS_OPTIONS: CandidateStatus[] = [
  'new',
  'contacted',
  'interview',
  'offer',
  'hired',
  'rejected'
];

export const CANDIDATE_STAGE_OPTIONS: CandidateStage[] = [
  'applied',
  'screening',
  'technical',
  'cultural',
  'offer',
  'hired'
];

// Mapeo de labels para mejor presentación - SWAGGER COMPLIANT
export const STATUS_LABELS: Record<CandidateStatus, string> = {
  'new': 'New',
  'contacted': 'Contacted',
  'interview': 'Interview',
  'offer': 'Offer Extended',
  'hired': 'Hired',
  'rejected': 'Rejected'
};

export const STAGE_LABELS: Record<CandidateStage, string> = {
  'applied': 'Applied',
  'screening': 'Screening',
  'technical': 'Technical',
  'cultural': 'Cultural',
  'offer': 'Offer',
  'hired': 'Hired'
};

// Razones predefinidas por estado - SWAGGER COMPLIANT
export const STATUS_REASONS: Record<CandidateStatus, string[]> = {
  'new': [
    'Initial candidate entry',
    'Sourced from job board',
    'Referral received',
    'Direct application'
  ],
  'contacted': [
    'Initial outreach sent',
    'Follow-up contact made',
    'Phone call completed',
    'Email response received'
  ],
  'interview': [
    'Interview scheduled',
    'Interview completed',
    'Multiple rounds scheduled',
    'Assessment phase'
  ],
  'offer': [
    'Offer letter prepared',
    'Salary negotiation',
    'Offer extended',
    'Waiting for acceptance'
  ],
  'hired': [
    'Offer accepted',
    'Start date confirmed',
    'Onboarding initiated',
    'Successfully hired'
  ],
  'rejected': [
    'Skills mismatch',
    'Cultural fit concerns',
    'Failed technical assessment',
    'Position requirements not met',
    'Salary expectations misaligned',
    'Other candidate selected'
  ]
};