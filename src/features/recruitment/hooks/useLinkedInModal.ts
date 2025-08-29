// hooks/useLinkedInModal.ts
import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import n8nRecruitmentService from '../api/n8nRecruitmentService';
import { convertToHtml } from '../lib/utilMethods';
import { PublicationData, ValidationErrors } from '../types/linkedInModalTypes';
import { RecruitmentProcess } from '../types/recruitmentProcess';

export const useLinkedInModal = (
  isOpen: boolean,
  initialContent: RecruitmentProcess,
  onCreatePublication: (data: PublicationData) => void
) => {
  const [formData, setFormData] = useState<PublicationData>({
    platform: 'LinkedIn',
    description: '',
    includeCompanyInfo: true,
    includeSalaryRange: false,
    includeRemoteOption: true,
    hashtags: ['hiring', 'jobs', 'careers'],
    scheduledDate: '',
    autoPost: false
  });

  const [customHashtags, setCustomHashtags] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const isLoading = useRef(false);

  const initLoading = () => {
    if (isOpen) {
      setFormData({
        platform: 'LinkedIn',
        description: '',
        includeCompanyInfo: true,
        includeSalaryRange: false,
        includeRemoteOption: true,
        hashtags: ['hiring', 'jobs', 'careers'],
        scheduledDate: '',
        autoPost: false
      });
      setCustomHashtags('');
      setErrors({});
      setIsGenerating(false);
      
      handleGenerateContent();
    }
    isLoading.current = false;
  };

  useEffect(() => {
    if (!isLoading.current) {
      isLoading.current = true;
      setTimeout(() => {
        initLoading();
      }, 10);
    }
  }, [isOpen, initialContent]);

  const handleGenerateContent = async () => {
    try {
      setIsGenerating(true);
      
      const transformedContent = await n8nRecruitmentService.transformMessage(initialContent);
      
      setFormData(prev => ({ ...prev, description: convertToHtml(transformedContent) }));
      
      if (initialContent) {
        toast.success('Content regenerated successfully!');
      }
      
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInputChange = (field: keyof PublicationData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.hashtags.length === 0) {
      newErrors.hashtags = 'At least one hashtag is required';
    }

    if (formData.scheduledDate && new Date(formData.scheduledDate) <= new Date()) {
      newErrors.scheduledDate = 'Scheduled date must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onCreatePublication(formData);
    } catch (error) {
      console.error('Error creating publication:', error);
    }
  };

  return {
    formData,
    customHashtags,
    errors,
    isGenerating,
    setCustomHashtags,
    handleGenerateContent,
    handleInputChange,
    handleSubmit
  };
};