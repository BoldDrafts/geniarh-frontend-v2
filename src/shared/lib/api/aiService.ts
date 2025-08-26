import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_AIGENERATE_DESCRIPTION;

interface GenerateContentRequest {
  title: string;
  department: string;
  experienceLevel: string;
  skills: string[];
  softSkills: string[];
  description: string;
  type: 'description' | 'qualifications';
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
  }
};