import {
  BrainCircuit,
  Plus,
  Save,
  X
} from 'lucide-react';
import React, { useState } from 'react';
import { Candidate } from '../api/candidatesService';

interface NewCandidateFormProps {
  onClose: () => void;
  onSubmit: (data: Candidate | Omit<Candidate, 'id'>) => void;
  initialData?: Candidate;
  mode?: 'create' | 'edit';
}

const NewCandidateForm: React.FC<NewCandidateFormProps> = ({
  onClose,
  onSubmit,
  initialData,
  mode = 'create'
}) => {
  const [useAI, setUseAI] = useState(false);
  const [skills, setSkills] = useState<string[]>(initialData?.skills || []);
  const [profiles, setProfiles] = useState<string[]>(initialData?.profiles || []);
  const [newSkill, setNewSkill] = useState('');
  const [newProfile, setNewProfile] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    
    const candidateData: Candidate = {
      ...(initialData?.id ? { id: initialData.id } : {}),
      firstName: data.firstName as string,
      lastName: data.lastName as string,
      email: data.email as string,
      phone: data.phone as string,
      position: data.position as string,
      department: data.department as string,
      status: (data.status as Candidate['status']) || 'new',
      stage: (data.stage as Candidate['stage']) || 'applied',
      profiles: profiles,
      source: (data.source as Candidate['source']) || 'website',
      skills: skills,
      salary: {
        min: Number(data.salaryMin),
        max: Number(data.salaryMax),
        currency: data.salaryCurrency as 'USD' | 'PEN'
      },
      location: {
        city: data.city as string,
        country: data.country as string,
        remote: data.remote === 'true'
      },
      ...(initialData?.createdAt ? { createdAt: initialData.createdAt } : {}),
      ...(initialData?.updatedAt ? { updatedAt: initialData.updatedAt } : {})
    };

    onSubmit(candidateData);
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleAddProfile = () => {
    if (newProfile.trim() && !profiles.includes(newProfile.trim())) {
      setProfiles([...profiles, newProfile.trim()]);
      setNewProfile('');
    }
  };

  const handleRemoveProfile = (profileToRemove: string) => {
    setProfiles(profiles.filter(profile => profile !== profileToRemove));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-lg bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Add New Candidate' : 'Edit Candidate'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {useAI && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <BrainCircuit className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  AI Assistant is enabled
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>AI will help analyze and score the candidate based on your requirements.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                required
                defaultValue={initialData?.firstName}
                className="block w-full px-4 py-2.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                required
                defaultValue={initialData?.lastName}
                className="block w-full px-4 py-2.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                defaultValue={initialData?.email}
                className="block w-full px-4 py-2.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                defaultValue={initialData?.phone}
                className="block w-full px-4 py-2.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                Position *
              </label>
              <input
                type="text"
                name="position"
                id="position"
                required
                defaultValue={initialData?.position}
                className="block w-full px-4 py-2.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                Department *
              </label>
              <select
                id="department"
                name="department"
                required
                defaultValue={initialData?.department}
                className="block w-full px-4 py-2.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Select department</option>
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Product">Product</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="HR">HR</option>
              </select>
            </div>

            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
                Source
              </label>
              <select
                id="source"
                name="source"
                defaultValue={initialData?.source || 'website'}
                className="block w-full px-4 py-2.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="linkedin">LinkedIn</option>
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="agency">Agency</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={initialData?.status || 'new'}
                className="block w-full px-4 py-2.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label htmlFor="stage" className="block text-sm font-medium text-gray-700 mb-1">
                Stage
              </label>
              <select
                id="stage"
                name="stage"
                defaultValue={initialData?.stage || 'applied'}
                className="block w-full px-4 py-2.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="applied">Applied</option>
                <option value="screening">Screening</option>
                <option value="technical">Technical</option>
                <option value="cultural">Cultural</option>
                <option value="offer">Offer</option>
                <option value="hired">Hired</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills *
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-1.5 text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                placeholder="Add a skill"
                className="block w-full px-4 py-2.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profiles
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {profiles.map((profile, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  <a href={profile} target="_blank" rel="noopener noreferrer" className="hover:underline">{profile}</a>
                  <button
                    type="button"
                    onClick={() => handleRemoveProfile(profile)}
                    className="ml-1.5 text-green-600 hover:text-green-800"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newProfile}
                onChange={(e) => setNewProfile(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddProfile())}
                placeholder="Add a profile URL (LinkedIn, GitHub, etc.)"
                className="block w-full px-4 py-2.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={handleAddProfile}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salary Range
              </label>
              <div className="mt-1 flex space-x-2">
                <input
                  type="number"
                  name="salaryMin"
                  placeholder="Min"
                  defaultValue={initialData?.salary?.min}
                  className="block w-full px-4 py-2.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <input
                  type="number"
                  name="salaryMax"
                  placeholder="Max"
                  defaultValue={initialData?.salary?.max}
                  className="block w-full px-4 py-2.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <select
                  name="salaryCurrency"
                  defaultValue={initialData?.salary?.currency || 'USD'}
                  className="block w-24 px-4 py-2.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  defaultValue={initialData?.location?.city}
                  className="block w-full px-4 py-2.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <input
                  type="text"
                  name="country"
                  placeholder="Country"
                  defaultValue={initialData?.location?.country}
                  className="block w-full px-4 py-2.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div className="mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="remote"
                    value="true"
                    defaultChecked={initialData?.location?.remote}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Remote work possible</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="useAI"
              checked={useAI}
              onChange={(e) => setUseAI(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="useAI" className="text-sm text-gray-700">
              Use AI to analyze candidate profile
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-5 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Save className="mr-2 h-4 w-4" />
              {mode === 'create' ? 'Add Candidate' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewCandidateForm;