import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Candidate } from '../../features/recruitment/types/recruitment';

const API_URL = import.meta.env.VITE_CANDIDATES_API_URL;

interface Assessment {
  matchScore?: number;
}

interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

interface Education {
  institution: string;
  degree: string;
  field: string;
  graduationYear?: number;
}

interface Salary {
  min?: number;
  max?: number;
  currency: 'USD' | 'PEN';
}

interface Location {
  city?: string;
  country?: string;
  remote?: boolean;
}

interface Document {
  id: string;
  type: 'resume' | 'cover_letter' | 'portfolio' | 'other';
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  uploadedAt: string;
  uploadedBy?: string;
}

interface Note {
  id: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

interface Interview {
  id: string;
  type: 'screening' | 'technical' | 'cultural' | 'final';
  scheduledAt: string;
  interviewers?: string[];
  status: 'scheduled' | 'completed' | 'cancelled';
  feedback?: InterviewFeedback;
}

interface InterviewFeedback {
  rating?: number;
  comments?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    pages: number;
    current: number;
    limit: number;
  };
}

interface DocumentListResponse {
  data: Document[];
  pagination: {
    total: number;
    pages: number;
    current: number;
    limit: number;
  };
  summary: {
    totalSize: number;
    typeBreakdown: {
      resume: number;
      cover_letter: number;
      portfolio: number;
      other: number;
    };
  };
}

const userId = 'user-123e4567-e89b-12d3-a456-426614174000'; // This should come from auth context

export const candidatesService = {
  list: async (params?: {
    status?: Candidate['status'];
    department?: string;
    position?: string;
    minMatchScore?: number;
    skills?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Candidate>> => {
    try {
      const { data } = await axios.get(`${API_URL}/candidates`, { 
        params,
        headers: {
          userId
        }
      });
      return data;
    } catch (error: any) {
      console.error('Error fetching candidates:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch candidates');
      throw error;
    }
  },

  get: async (id: string): Promise<Candidate> => {
    try {
      const { data } = await axios.get(`${API_URL}/candidates/${id}`, {
        headers: {
          userId
        }
      });
      return data;
    } catch (error: any) {
      console.error('Error fetching candidate:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch candidate');
      throw error;
    }
  },

  create: async (candidate: Omit<Candidate, 'id'>): Promise<Candidate> => {
    try {
      const { data } = await axios.post(`${API_URL}/candidates`, candidate, {
        headers: {
          userId
        }
      });
      return data;
    } catch (error: any) {
      console.error('Error creating candidate:', error);
      toast.error(error.response?.data?.message || 'Failed to create candidate');
      throw error;
    }
  },

  update: async (id: string, candidate: Candidate): Promise<Candidate> => {
    try {
      const { data } = await axios.put(`${API_URL}/candidates/${id}`, candidate, {
        headers: {
          userId
        }
      });
      return data;
    } catch (error: any) {
      console.error('Error updating candidate:', error);
      toast.error(error.response?.data?.message || 'Failed to update candidate');
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/candidates/${id}`, {
        headers: {
          userId
        }
      });
    } catch (error: any) {
      console.error('Error deleting candidate:', error);
      toast.error(error.response?.data?.message || 'Failed to delete candidate');
      throw error;
    }
  },

  updateStatus: async (id: string, status: Candidate['status']): Promise<Candidate> => {
    try {
      const { data } = await axios.patch(`${API_URL}/candidates/${id}/status`, { status }, {
        headers: {
          userId
        }
      });
      return data;
    } catch (error: any) {
      console.error('Error updating candidate status:', error);
      toast.error(error.response?.data?.message || 'Failed to update candidate status');
      throw error;
    }
  },

  // Document management
  listDocuments: async (candidateId: string, params?: {
    type?: Document['type'];
    page?: number;
    limit?: number;
    sortBy?: 'uploadedAt' | 'fileName' | 'type' | 'size';
    sortOrder?: 'asc' | 'desc';
  }): Promise<DocumentListResponse> => {
    try {
      const { data } = await axios.get(`${API_URL}/candidates/${candidateId}/documents`, {
        params,
        headers: {
          userId
        }
      });
      return data;
    } catch (error: any) {
      console.error('Error fetching candidate documents:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch documents');
      throw error;
    }
  },

  uploadDocument: async (candidateId: string, file: File, type: Document['type']): Promise<Document> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const { data } = await axios.post(`${API_URL}/candidates/${candidateId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          userId
        }
      });
      return data;
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error(error.response?.data?.message || 'Failed to upload document');
      throw error;
    }
  },

  downloadDocument: async (candidateId: string, documentId: string, inline: boolean = false): Promise<Blob> => {
    try {
      const response = await axios.get(
        `${API_URL}/candidates/${candidateId}/documents/${documentId}`,
        {
          params: { inline },
          responseType: 'blob',
          headers: {
            userId
          }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error downloading document:', error);
      toast.error(error.response?.data?.message || 'Failed to download document');
      throw error;
    }
  },

  deleteDocument: async (candidateId: string, documentId: string): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/candidates/${candidateId}/documents/${documentId}`, {
        headers: {
          userId
        }
      });
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error(error.response?.data?.message || 'Failed to delete document');
      throw error;
    }
  },

  // Notes management
  addNote: async (candidateId: string, content: string): Promise<Note> => {
    try {
      const { data } = await axios.post(`${API_URL}/candidates/${candidateId}/notes`, { content }, {
        headers: {
          userId
        }
      });
      return data;
    } catch (error: any) {
      console.error('Error adding note:', error);
      toast.error(error.response?.data?.message || 'Failed to add note');
      throw error;
    }
  }
};