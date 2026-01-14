import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_AIGENERATE_DESCRIPTION;
const API_PROMPT_URL = import.meta.env.VITE_AIGENERATE_PROMPT;
const API_PREREG_CANDIDATE_URL = import.meta.env.VITE_PREREGISTER_CANDIDATE_API_URL;

interface GenerateContentRequest {
  title: string;
  department: string;
  experienceLevel: string;
  skills: string[];
  softSkills: string[];
  description: string;
  type: 'description' | 'qualifications';
}

interface PreRegisterCandidateRequest {
  Link: string;
  RecruitmentId: string;
  Name: string;
  Description?: string;
  Summary?: string;
  Image?: string;
}

export const aiService = {
  generateContent: async (params: GenerateContentRequest): Promise<string> => {
    try {
      const { data } = await axios.post(API_URL, params);
      const formattedText = data.output || '';
      return formattedText;
    } catch (error: any) {
      console.error('Error generating content:', error);
      toast.error(error.response?.data?.message || 'Failed to generate content');
      throw error;
    }
  },
  createPrompt: async (params: GenerateContentRequest): Promise<string> => {
    try {
      const { data } = await axios.post(API_PROMPT_URL, params);
      const formattedText = data.output || '';
      return formattedText;
    } catch (error: any) {
      console.error('Error generating content:', error);
      toast.error(error.response?.data?.message || 'Failed to generate content');
      throw error;
    }
  },
  preRegCandidate: async (params: PreRegisterCandidateRequest): Promise<string> => {
    try {
      const { data } = await axios.post(API_PREREG_CANDIDATE_URL, params);
      const formattedText = data.output || '';
      return formattedText;
    } catch (error: any) {
      console.error('Error generating content:', error);
      toast.error(error.response?.data?.message || 'Failed to generate content');
      throw error;
    }
  }
};