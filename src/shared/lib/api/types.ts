export interface EmailAudit {
  id: string;
  subject: string;
  sender_name: string;
  sender_email: string;
  recipient_name: string;
  recipient_email: string;
  received_date: string;
  processing_status: 'PROCESSED' | 'PENDING' | 'FAILED' | 'IGNORED';
  web_link: string;
  attachments: EmailAttachment[];
}

interface EmailAttachment {
  id: string;
  file_name: string;
  file_extension: string;
  file_size: number;
  is_processed: boolean;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

interface RecruitmentRequirement {
  id: string;
  subject: string;
  requirement_email: string;
  content: string;
  technical_skills: string[];
  salary_min: number;
  salary_max: number;
  salary_currency: string;
  date_receiver: string;
  web_link: string;
  created_at: string;
  updated_at: string;
}