import { CandidateStage, CandidateStatus } from "../types/recruitment";

// Definición de opciones basadas en los tipos del modelo - SWAGGER COMPLIANT
export const CANDIDATE_STATUS_OPTIONS: CandidateStatus[] = [
  'New',
  'Contacted',
  'Interview',
  'Offer',
  'Hired',
  'Rejected'
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
  'New': 'New',
  'Contacted': 'Contacted',
  'Interview': 'Interview',
  'Offer': 'Offer Extended',
  'Hired': 'Hired',
  'Rejected': 'Rejected'
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
  'New': [
    'Initial candidate entry',
    'Sourced from job board',
    'Referral received',
    'Direct application'
  ],
  'Contacted': [
    'Initial outreach sent',
    'Follow-up contact made',
    'Phone call completed',
    'Email response received'
  ],
  'Interview': [
    'Interview scheduled',
    'Interview completed',
    'Multiple rounds scheduled',
    'Assessment phase'
  ],
  'Offer': [
    'Offer letter prepared',
    'Salary negotiation',
    'Offer extended',
    'Waiting for acceptance'
  ],
  'Hired': [
    'Offer accepted',
    'Start date confirmed',
    'Onboarding initiated',
    'Successfully hired'
  ],
  'Rejected': [
    'Skills mismatch',
    'Cultural fit concerns',
    'Failed technical assessment',
    'Position requirements not met',
    'Salary expectations misaligned',
    'Other candidate selected'
  ]
};