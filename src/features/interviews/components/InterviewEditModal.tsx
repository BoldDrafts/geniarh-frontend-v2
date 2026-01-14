import { Calendar, ChevronDown, Clock, FileText, Loader2, MapPin, Save, Search, Users, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Input from '../../../shared/components/ui/Input';
import Select from '../../../shared/components/ui/Select';
import Textarea from '../../../shared/components/ui/Textarea';
import { Interview, InterviewStatus, InterviewType } from '../types/interview';

// Mock data for available interviewers
interface InterviewerOption {
  id: string;
  name: string;
  email: string;
  type: 'recruiter' | 'technical';
  department?: string;
  avatar?: string;
}

const mockInterviewers: InterviewerOption[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@company.com',
    type: 'technical',
    department: 'Engineering',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    type: 'recruiter',
    department: 'HR',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
  },
  {
    id: '3',
    name: 'Emily Williams',
    email: 'emily.williams@company.com',
    type: 'technical',
    department: 'Engineering',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
  },
  {
    id: '4',
    name: 'Robert Chen',
    email: 'robert.chen@company.com',
    type: 'recruiter',
    department: 'HR',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
  },
  {
    id: '5',
    name: 'Michael Rodriguez',
    email: 'michael.rodriguez@company.com',
    type: 'technical',
    department: 'Engineering',
    avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
  },
  {
    id: '6',
    name: 'Lisa Anderson',
    email: 'lisa.anderson@company.com',
    type: 'recruiter',
    department: 'HR',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
  }
];

interface InterviewEditModalProps {
  isOpen: boolean;
  interview: Interview;
  onClose: () => void;
  onSave: (updatedInterview: Partial<Interview>) => Promise<void>;
  loading?: boolean;
}

const InterviewEditModal: React.FC<InterviewEditModalProps> = ({
  isOpen,
  interview,
  onClose,
  onSave,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    candidateName: '',
    title: '',
    date: '',
    time: '',
    duration: 45,
    type: 'Technical' as InterviewType,
    status: 'Scheduled' as InterviewStatus,
    location: '',
    description: '',
    interviewers: [] as string[]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showInterviewerDropdown, setShowInterviewerDropdown] = useState(false);
  const [interviewerSearchQuery, setInterviewerSearchQuery] = useState('');
  const [selectedInterviewers, setSelectedInterviewers] = useState<InterviewerOption[]>([]);

  // Initialize form data when modal opens or interview changes
  useEffect(() => {
    if (isOpen && interview) {
      setFormData({
        candidateName: interview.candidateName || '',
        title: interview.title || '',
        date: interview.date || '',
        time: interview.time || '',
        duration: interview.duration || 45,
        type: interview.type,
        status: interview.status,
        location: interview.location || 'Zoom Meeting',
        description: interview.description || '',
        interviewers: interview.interviewers || []
      });
      setErrors({});
    }
  }, [isOpen, interview]);

  // Initialize selected interviewers when form data changes
  useEffect(() => {
    if (formData.interviewers.length > 0) {
      const selected = formData.interviewers.map(name => {
        const found = mockInterviewers.find(interviewer => interviewer.name === name);
        return found || {
          id: `temp-${name}`,
          name,
          email: `${name.toLowerCase().replace(' ', '.')}@company.com`,
          type: 'technical' as const
        };
      });
      setSelectedInterviewers(selected);
    } else {
      setSelectedInterviewers([]);
    }
  }, [formData.interviewers]);

  // Filter available interviewers based on search query
  const filteredInterviewers = mockInterviewers.filter(interviewer => {
    const matchesSearch = interviewer.name.toLowerCase().includes(interviewerSearchQuery.toLowerCase()) ||
                         interviewer.email.toLowerCase().includes(interviewerSearchQuery.toLowerCase());
    const notSelected = !selectedInterviewers.some(selected => selected.id === interviewer.id);
    return matchesSearch && notSelected;
  });

  // Handle form field changes
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Add interviewer from dropdown selection
  const handleAddInterviewer = (interviewer: InterviewerOption) => {
    const newSelectedInterviewers = [...selectedInterviewers, interviewer];
    setSelectedInterviewers(newSelectedInterviewers);
    
    setFormData(prev => ({
      ...prev,
      interviewers: newSelectedInterviewers.map(i => i.name)
    }));
    
    setInterviewerSearchQuery('');
    setShowInterviewerDropdown(false);
  };

  // Remove interviewer
  const handleRemoveInterviewer = (interviewerId: string) => {
    const newSelectedInterviewers = selectedInterviewers.filter(i => i.id !== interviewerId);
    setSelectedInterviewers(newSelectedInterviewers);
    
    setFormData(prev => ({
      ...prev,
      interviewers: newSelectedInterviewers.map(i => i.name)
    }));
  };

  // Handle interviewer search input
  const handleInterviewerSearchChange = (value: string) => {
    setInterviewerSearchQuery(value);
    setShowInterviewerDropdown(value.length > 0);
  };

  // Get type badge color
  const getTypeBadgeColor = (type: 'recruiter' | 'technical') => {
    return type === 'recruiter' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-purple-100 text-purple-800';
  };

  // Get type icon
  const getTypeIcon = (type: 'recruiter' | 'technical') => {
    return type === 'recruiter' ? '👥' : '💻';
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.candidateName.trim()) {
      newErrors.candidateName = 'Candidate name is required';
    }

    if (!formData.title.trim()) {
      newErrors.position = 'Position is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.time) {
      newErrors.time = 'Time is required';
    }

    if (formData.duration < 15 || formData.duration > 240) {
      newErrors.duration = 'Duration must be between 15 and 240 minutes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Convert form data to Interview format
      const updatedInterview: Partial<Interview> = {
        candidateName: formData.candidateName,
        title: formData.title,
        scheduledDateTime: formData.date,
        time: formData.time,
        duration: formData.duration,
        type: formData.type,
        status: formData.status,
        location: formData.location,
        description: formData.description,
        interviewers: formData.interviewers
      };

      await onSave(updatedInterview);
    } catch (error) {
      console.error('Error saving interview:', error);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-8 mx-auto p-0 border w-full max-w-2xl shadow-lg rounded-lg bg-white mb-8">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center">
            <FileText className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Edit Interview Details</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Candidate Name */}
            <div className="md:col-span-2">
              <Input
                label="Candidate Name"
                value={formData.candidateName}
                onChange={(e) => handleInputChange('candidateName', e.target.value)}
                error={errors.candidateName}
                placeholder="Enter candidate name"
                disabled={loading}
                required
              />
            </div>

            {/* Position */}
            <div className="md:col-span-2">
              <Input
                label="Position"
                value={formData.title}
                onChange={(e) => handleInputChange('position', e.target.value)}
                error={errors.position}
                placeholder="Enter position title"
                disabled={loading}
                required
              />
            </div>

            {/* Date */}
            <div>
              <Input
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                error={errors.date}
                disabled={loading}
                required
                icon={<Calendar className="h-4 w-4" />}
              />
            </div>

            {/* Time */}
            <div>
              <Input
                label="Time"
                type="time"
                value={formData.time.replace(/\s*(AM|PM)/, '')}
                onChange={(e) => {
                  const time = e.target.value;
                  const [hours, minutes] = time.split(':');
                  const hour24 = parseInt(hours);
                  const period = hour24 >= 12 ? 'PM' : 'AM';
                  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
                  handleInputChange('time', `${hour12}:${minutes} ${period}`);
                }}
                error={errors.time}
                disabled={loading}
                required
                icon={<Clock className="h-4 w-4" />}
              />
            </div>

            {/* Duration */}
            <div>
              <Input
                label="Duration (minutes)"
                type="number"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 45)}
                error={errors.duration}
                min={15}
                max={240}
                disabled={loading}
                required
              />
            </div>

            {/* Type */}
            <div>
              <Select
                label="Interview Type"
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                disabled={loading}
                required
              >
                <option value="technical">Technical</option>
                <option value="hr">HR</option>
                <option value="cultural">Cultural</option>
                <option value="ai">AI Interview</option>
              </Select>
            </div>

            {/* Status */}
            <div>
              <Select
                label="Status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                disabled={loading}
                required
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
                <option value="pending">Pending</option>
              </Select>
            </div>

            {/* Location */}
            <div>
              <Input
                label="Location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., Zoom Meeting, Conference Room A"
                disabled={loading}
                icon={<MapPin className="h-4 w-4" />}
              />
            </div>

            {/* Interviewers */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="h-4 w-4 inline mr-1" />
                Interviewers
              </label>
              
              {/* Current interviewers */}
              {selectedInterviewers.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {selectedInterviewers.map((interviewer) => (
                    <div
                      key={interviewer.id}
                      className="inline-flex items-center px-3 py-2 rounded-lg text-sm bg-gray-50 border border-gray-200"
                    >
                      {interviewer.avatar && (
                        <img 
                          src={interviewer.avatar} 
                          alt={interviewer.name}
                          className="w-6 h-6 rounded-full mr-2"
                        />
                      )}
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{interviewer.name}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${getTypeBadgeColor(interviewer.type)}`}>
                          {getTypeIcon(interviewer.type)} {interviewer.type === 'recruiter' ? 'Recruiter' : 'Technical'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveInterviewer(interviewer.id)}
                        disabled={loading}
                        className="ml-2 text-gray-400 hover:text-red-600 disabled:opacity-50"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Search for interviewers */}
              <div className="relative">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={interviewerSearchQuery}
                    onChange={(e) => handleInterviewerSearchChange(e.target.value)}
                    placeholder="Search for interviewers..."
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    disabled={loading}
                    onFocus={() => {
                      if (interviewerSearchQuery.length > 0) {
                        setShowInterviewerDropdown(true);
                      }
                    }}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Dropdown with interviewer options */}
                {showInterviewerDropdown && filteredInterviewers.length > 0 && (
                  <>
                    {/* Click outside to close dropdown */}
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowInterviewerDropdown(false)}
                    ></div>
                    
                    <div className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                      {filteredInterviewers.map((interviewer) => (
                        <button
                          key={interviewer.id}
                          type="button"
                          onClick={() => handleAddInterviewer(interviewer)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                          disabled={loading}
                        >
                          <div className="flex items-center">
                            <img 
                              src={interviewer.avatar} 
                              alt={interviewer.name}
                              className="w-8 h-8 rounded-full mr-3"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900">{interviewer.name}</p>
                                <span className={`text-xs px-2 py-1 rounded-full ${getTypeBadgeColor(interviewer.type)}`}>
                                  {getTypeIcon(interviewer.type)} {interviewer.type === 'recruiter' ? 'Recruiter' : 'Technical'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">{interviewer.email}</p>
                              {interviewer.department && (
                                <p className="text-xs text-gray-400">{interviewer.department}</p>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* No results message */}
                {showInterviewerDropdown && interviewerSearchQuery.length > 0 && filteredInterviewers.length === 0 && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowInterviewerDropdown(false)}
                    ></div>
                    <div className="absolute z-20 mt-1 w-full bg-white shadow-lg rounded-md py-3 text-base ring-1 ring-black ring-opacity-5">
                      <p className="text-center text-sm text-gray-500">No interviewers found</p>
                    </div>
                  </>
                )}
              </div>

              {/* Helper text */}
              <p className="mt-1 text-xs text-gray-500">
                Search and select interviewers to add them to this interview
              </p>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <Textarea
                label="Description (Optional)"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Additional notes or requirements for this interview"
                rows={3}
                disabled={loading}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InterviewEditModal;