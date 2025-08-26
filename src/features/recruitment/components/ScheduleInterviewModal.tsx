import { X, Calendar, Clock, Users, MapPin } from 'lucide-react';
import React, { useState } from 'react';
import Input from '../../../shared/components/ui/Input';
import Select from '../../../shared/components/ui/Select';
import { Candidate, InterviewType, Interviewer } from '../types/recruitment';

interface ScheduleInterviewData {
  date: string;
  time: string;
  duration: number;
  type: InterviewType;
  location: string;
  interviewers: string[];
  notes?: string;
}

interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate;
  onSchedule: (data: ScheduleInterviewData) => void;
  loading?: boolean;
}

// Mock data for interviewers - in a real app, this would come from an API
const MOCK_INTERVIEWERS: Interviewer[] = [
  {
    id: 'int-1',
    name: 'John Smith',
    email: 'john.smith@company.com',
    role: 'Technical Lead',
    department: 'Engineering'
  },
  {
    id: 'int-2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    role: 'Senior Developer',
    department: 'Engineering'
  },
  {
    id: 'int-3',
    name: 'Michael Chen',
    email: 'michael.chen@company.com',
    role: 'Engineering Manager',
    department: 'Engineering'
  },
  {
    id: 'int-4',
    name: 'Emily Brown',
    email: 'emily.brown@company.com',
    role: 'HR Manager',
    department: 'Human Resources'
  },
  {
    id: 'int-5',
    name: 'David Wilson',
    email: 'david.wilson@company.com',
    role: 'Product Manager',
    department: 'Product'
  }
];

const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({
  isOpen,
  onClose,
  candidate,
  onSchedule,
  loading = false
}) => {
  const [formData, setFormData] = useState<ScheduleInterviewData>({
    date: '',
    time: '',
    duration: 45,
    type: 'Technical',
    location: 'Video Call (Google Meet)',
    interviewers: [],
    notes: ''
  });

  const [errors, setErrors] = useState<Partial<ScheduleInterviewData>>({});

  if (!isOpen) return null;

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Partial<ScheduleInterviewData> = {};

    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date = 'Date cannot be in the past';
      }
    }

    if (!formData.time) {
      newErrors.time = 'Time is required';
    }

    if (formData.interviewers.length === 0) {
      newErrors.interviewers = ['At least one interviewer is required'];
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSchedule(formData);
  };

  const handleClose = () => {
    if (!loading) {
      // Reset form
      setFormData({
        date: '',
        time: '',
        duration: 45,
        type: 'Technical',
        location: 'Video Call (Google Meet)',
        interviewers: [],
        notes: ''
      });
      setErrors({});
      onClose();
    }
  };

  // Get candidate's full name
  const candidateName = `${candidate.personalInfo.firstName} ${candidate.personalInfo.lastName}`;
  
  // Get candidate's current position
  const getCurrentPosition = (): string => {
    if (candidate.profile?.experience && candidate.profile.experience.length > 0) {
      const currentExperience = candidate.profile.experience.find(exp => exp.current) ||
                               candidate.profile.experience[0];
      return currentExperience.position;
    }
    return 'Candidate';
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  // Get minimum time for today
  const getMinTime = (): string => {
    if (formData.date === today) {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = Math.ceil(now.getMinutes() / 15) * 15; // Round to next 15-minute interval
      return `${hours}:${minutes.toString().padStart(2, '0')}`;
    }
    return '';
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-lg bg-white max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Schedule Interview</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Candidate Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${candidate.id}`}
              alt={candidateName}
              className="h-12 w-12 rounded-full"
            />
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                {candidateName}
              </h3>
              <p className="text-sm text-gray-500">{getCurrentPosition()}</p>
              <p className="text-xs text-gray-400">{candidate.contact.email}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Interview Type */}
          <div>
            <Select
              label="Interview Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as InterviewType })}
              required
              disabled={loading}
            >
              <option value="Phone">Phone Interview</option>
              <option value="Video">Video Interview</option>
              <option value="InPerson">In-Person Interview</option>
              <option value="Technical">Technical Interview</option>
              <option value="Panel">Panel Interview</option>
              <option value="Behavioral">Behavioral Interview</option>
            </Select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                type="date"
                label="Date"
                icon={<Calendar className="h-4 w-4" />}
                min={today}
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                error={errors.date}
                required
                disabled={loading}
              />
            </div>

            <div>
              <Input
                type="time"
                label="Time"
                icon={<Clock className="h-4 w-4" />}
                min={getMinTime()}
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                error={errors.time}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <Select
              label="Duration"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
              required
              disabled={loading}
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
            </Select>
          </div>

          {/* Location */}
          <div>
            <Select
              label="Location / Platform"
              icon={<MapPin className="h-4 w-4" />}
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              error={errors.location}
              required
              disabled={loading}
            >
              <option value="Video Call (Google Meet)">Video Call (Google Meet)</option>
              <option value="Video Call (Zoom)">Video Call (Zoom)</option>
              <option value="Video Call (Microsoft Teams)">Video Call (Microsoft Teams)</option>
              <option value="Phone Call">Phone Call</option>
              <option value="Office - Conference Room A">Office - Conference Room A</option>
              <option value="Office - Conference Room B">Office - Conference Room B</option>
              <option value="Office - Meeting Room 1">Office - Meeting Room 1</option>
              <option value="Client Location">Client Location</option>
            </Select>
          </div>

          {/* Interviewers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="h-4 w-4 inline mr-1" />
              Interviewers *
            </label>
            <div className="border border-gray-300 rounded-md p-3 max-h-32 overflow-y-auto">
              {MOCK_INTERVIEWERS.map((interviewer) => (
                <label key={interviewer.id} className="flex items-center space-x-2 mb-2 last:mb-0">
                  <input
                    type="checkbox"
                    value={interviewer.id}
                    checked={formData.interviewers.includes(interviewer.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          interviewers: [...formData.interviewers, interviewer.id]
                        });
                      } else {
                        setFormData({
                          ...formData,
                          interviewers: formData.interviewers.filter(id => id !== interviewer.id)
                        });
                      }
                    }}
                    disabled={loading}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {interviewer.name} ({interviewer.role})
                  </span>
                </label>
              ))}
            </div>
            {errors.interviewers && (
              <p className="mt-1 text-sm text-red-600">{errors.interviewers}</p>
            )}
            {formData.interviewers.length > 0 && (
              <p className="mt-1 text-xs text-gray-500">
                {formData.interviewers.length} interviewer(s) selected
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes or special instructions..."
              rows={3}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
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
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {loading ? 'Scheduling...' : 'Schedule Interview'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleInterviewModal;