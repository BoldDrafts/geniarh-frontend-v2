import { RecruitmentProcess } from "./recruitmentProcess";

// types/LinkedInModalTypes.ts
export interface PublicationData {
  platform: 'LinkedIn';
  description: string;
  includeCompanyInfo: boolean;
  includeSalaryRange: boolean;
  includeRemoteOption: boolean;
  hashtags: string[];
  scheduledDate?: string;
  autoPost: boolean;
}

export interface LinkedInPublicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePublication: (publicationData: PublicationData) => void;
  description?: string;
  loading?: boolean;
  initialContent: RecruitmentProcess;
  position?: string;
  department?: string;
}

export interface ValidationErrors {
  [key: string]: string;
}