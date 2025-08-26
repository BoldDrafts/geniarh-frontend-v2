// hooks/useRecruitmentForm.ts
import { useState, useEffect } from 'react';
import { Recruiter, RecruitmentProcess, Requirement } from '../types/recruitment';
import { toast } from 'react-hot-toast';
import recruitmentService from '../api/recruitmentService';

export const useRecruitmentForm = (initialData?: RecruitmentProcess) => {
  const [useAI, setUseAI] = useState(false);
  
  // Technical Skills (existing)
  const [skills, setSkills] = useState<string[]>(initialData?.requirement.skills || []);
  const [newSkill, setNewSkill] = useState('');
  
  // Soft Skills (new)
  const [softSkills, setSoftSkills] = useState<string[]>(initialData?.requirement.softSkills || []);
  const [newSoftSkill, setNewSoftSkill] = useState('');
  
  // Recruiters state
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [loadingRecruiters, setLoadingRecruiters] = useState(false);
  const [recruitersError, setRecruitersError] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobDescription, setJobDescription] = useState(initialData?.requirement.description || '');

  // Load recruiters on component mount
  useEffect(() => {
    loadRecruiters();
  }, []);

  const loadRecruiters = async () => {
    setLoadingRecruiters(true);
    setRecruitersError(null);
    
    try {
      const response = await recruitmentService.getAvailableRecruiters({
        page: 1,
        limit: 100 // Load all available recruiters
      });
      
      setRecruiters(response.data);
      
      if (response.data.length === 0) {
        toast.custom('No hay reclutadores disponibles en este momento');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al cargar reclutadores';
      setRecruitersError(errorMessage);
      toast.error(errorMessage);
      console.error('Error loading recruiters:', error);
    } finally {
      setLoadingRecruiters(false);
    }
  };

  // Retry loading recruiters
  const retryLoadRecruiters = () => {
    loadRecruiters();
  };

  // Technical Skills handlers (existing)
  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  // Soft Skills handlers (new)
  const handleAddSoftSkill = () => {
    if (newSoftSkill.trim() && !softSkills.includes(newSoftSkill.trim())) {
      setSoftSkills([...softSkills, newSoftSkill.trim()]);
      setNewSoftSkill('');
    }
  };

  const handleRemoveSoftSkill = (skillToRemove: string) => {
    setSoftSkills(softSkills.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = async (
    e: React.FormEvent, 
    onSubmit: (data: any) => void | Promise<void>
  ) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const data = Object.fromEntries(formData.entries());
      //console.log("form data: ", data);
      
      // Add skills, soft skills and description to form data
      const submitData = { 
        ...data, 
        skills,
        softSkills, // Added soft skills to submit data
        description: jobDescription,
        useAI 
      };
      
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    useAI,
    setUseAI,
    
    // Technical Skills
    skills,
    newSkill,
    setNewSkill,
    handleAddSkill,
    handleRemoveSkill,
    
    // Soft Skills
    softSkills,
    newSoftSkill,
    setNewSoftSkill,
    handleAddSoftSkill,
    handleRemoveSoftSkill,
    
    // Recruiters
    recruiters,
    loadingRecruiters,
    recruitersError,
    retryLoadRecruiters,
    
    // Common
    isSubmitting,
    jobDescription,
    setJobDescription,
    handleSubmit
  };
};