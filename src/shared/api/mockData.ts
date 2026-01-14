import { EmailAudit } from './types';

export const mockAudits: EmailAudit[] = [
  {
    id: 'audit-1',
    subject: 'Senior Frontend Developer Position',
    sender_name: 'John Smith',
    sender_email: 'john.smith@company.com',
    recipient_name: 'HR Department',
    recipient_email: 'hr@company.com',
    received_date: '2024-04-15T10:30:00Z',
    processing_status: 'PROCESSED',
    web_link: 'https://mail.company.com/message/1',
    attachments: [
      {
        id: 'att-1',
        file_name: 'Job Description.pdf',
        file_extension: 'pdf',
        file_size: 245760,
        is_processed: true
      },
      {
        id: 'att-2',
        file_name: 'Requirements.docx',
        file_extension: 'docx',
        file_size: 128000,
        is_processed: true
      }
    ]
  },
  {
    id: 'audit-2',
    subject: 'UX Designer Application',
    sender_name: 'Sarah Johnson',
    sender_email: 'sarah.j@design.co',
    recipient_name: 'Recruitment Team',
    recipient_email: 'recruitment@company.com',
    received_date: '2024-04-14T15:45:00Z',
    processing_status: 'PENDING',
    web_link: 'https://mail.company.com/message/2',
    attachments: [
      {
        id: 'att-3',
        file_name: 'Portfolio.pdf',
        file_extension: 'pdf',
        file_size: 3145728,
        is_processed: false
      }
    ]
  },
  {
    id: 'audit-3',
    subject: 'DevOps Engineer Position Update',
    sender_name: 'Technical Team',
    sender_email: 'tech@company.com',
    recipient_name: 'HR Department',
    recipient_email: 'hr@company.com',
    received_date: '2024-04-13T09:15:00Z',
    processing_status: 'FAILED',
    web_link: 'https://mail.company.com/message/3',
    attachments: []
  }
];