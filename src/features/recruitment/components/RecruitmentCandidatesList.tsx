import {
  ArrowUpRight,
  Briefcase,
  Calendar,
  Clock,
  EyeIcon,
  Mail,
  MapPin,
  MoreVertical,
  Phone,
  Star,
  UserPlus
} from 'lucide-react';
import React, { useState } from 'react';
import DeleteConfirmationModal from '../../../shared/components/DeleteConfirmationModal';
import ScheduleInterviewModal from './ScheduleInterviewModal';
import { Candidate, CandidateStage, CandidateStatus } from '../types/recruitment';
import RecruitmentViewCandidateModal from './RecruitmentViewCandidateModal';
import CandidateStatusUpdateModal from './CandidateStatusUpdateModal';

interface CandidatesListProps {
  candidates: Candidate[];
  recruitmentId: string;
  onAddCandidate?: () => void;
  onUpdateStatus?: (
    candidateId: string, 
    newStatus: CandidateStatus,
    newStage?: CandidateStage,
    reason?: string,
    notes?: string
  ) => void;
  onDeleteCandidate?: (candidateId: string) => void;
  onGetCandidateDetails?: (recruitmentId: string, candidateId: string) => Promise<Candidate>;
  loading?: boolean;
  onUpdateCandidateEmail?: (recruitmentId: string, candidateId: string, newEmail: string) => Promise<void>;
}

// Mapeo de labels para mejor presentación - SWAGGER COMPLIANT
const STATUS_LABELS: Record<CandidateStatus, string> = {
  'new': 'New',
  'contacted': 'Contacted',
  'interview': 'Interview',
  'offer': 'Offer Extended',
  'hired': 'Hired',
  'rejected': 'Rejected'
};

const STAGE_LABELS: Record<CandidateStage, string> = {
  'applied': 'Applied',
  'screening': 'Screening',
  'technical': 'Technical',
  'cultural': 'Cultural',
  'offer': 'Offer',
  'hired': 'Hired'
};

interface StatusUpdateRequest {
  candidate: Candidate;
  newStatus: CandidateStatus;
}

const RecruitmentCandidatesList: React.FC<CandidatesListProps> = ({ 
  candidates, 
  recruitmentId,
  onAddCandidate,
  onUpdateStatus,
  onDeleteCandidate,
  onGetCandidateDetails,
  onUpdateCandidateEmail,
  loading = false
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [scheduleCandidate, setScheduleCandidate] = useState<Candidate | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Candidate | null>(null);
  const [statusUpdateRequest, setStatusUpdateRequest] = useState<StatusUpdateRequest | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Calculate match score based on candidate data
  const calculateMatchScore = (candidate: Candidate): number => {
    return candidate.assessment?.matchScore || 0;
  };

  // Get candidate's current position
  const getCurrentPosition = (candidate: Candidate): string => {
    if (candidate.profile?.experience && candidate.profile.experience.length > 0) {
      const currentExperience = candidate.profile.experience.find(exp => exp.current) ||
                               candidate.profile.experience[0];
      return currentExperience.position;
    }
    return 'Candidate';
  };

  // Get candidate's location string
  const getLocationString = (candidate: Candidate): string => {
    const location = candidate.personalInfo.location;
    if (!location) return 'Location not specified';
    
    const parts = [location.city, location.state, location.country].filter(Boolean);
    return parts.join(', ');
  };

  // Get candidate's skills array
  const getCandidateSkills = (candidate: Candidate): string[] => {
    return candidate.profile?.skills?.map(skill => skill.name) || [];
  };

  // Get status color classes - SWAGGER COMPLIANT
  const getStatusColor = (status: CandidateStatus) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'contacted':
        return 'bg-indigo-100 text-indigo-800';
      case 'interview':
        return 'bg-yellow-100 text-yellow-800';
      case 'offer':
        return 'bg-pink-100 text-pink-800';
      case 'hired':
        return 'bg-emerald-100 text-emerald-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get stage color classes
  const getStageColor = (stage: CandidateStage) => {
    switch (stage) {
      case 'applied':
        return 'bg-slate-100 text-slate-800';
      case 'screening':
        return 'bg-amber-100 text-amber-800';
      case 'technical':
        return 'bg-cyan-100 text-cyan-800';
      case 'cultural':
        return 'bg-violet-100 text-violet-800';
      case 'offer':
        return 'bg-lime-100 text-lime-800';
      case 'hired':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleScheduleInterview = (data: any) => {
    console.log('Scheduling interview:', data);
    setScheduleCandidate(null);
  };

  const handleStatusChange = (candidate: Candidate, newStatus: CandidateStatus) => {
    if (candidate.status === newStatus) {
      setMenuOpen(null);
      return;
    }

    setStatusUpdateRequest({ candidate, newStatus });
    setMenuOpen(null);
  };

  const handleStatusUpdateConfirm = async (reason?: string, notes?: string) => {
    if (!statusUpdateRequest || !onUpdateStatus) return;

    try {
      setUpdating(true);
      
      // Map status to appropriate stage - SWAGGER COMPLIANT
      let newStage: CandidateStage | undefined;
      
      switch (statusUpdateRequest.newStatus) {
        case 'contacted':
          newStage = 'applied';
          break;
        case 'interview':
          newStage = 'screening';
          break;
        case 'offer':
          newStage = 'offer';
          break;
        case 'hired':
          newStage = 'hired';
          break;
        default:
          newStage = 'applied';
      }

      await onUpdateStatus(
        statusUpdateRequest.candidate.id, 
        statusUpdateRequest.newStatus, 
        newStage, 
        reason, 
        notes
      );

      setStatusUpdateRequest(null);
    } catch (error) {
      console.error('Error updating candidate status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusUpdateCancel = () => {
    setStatusUpdateRequest(null);
  };

  const handleDeleteConfirm = () => {
    if (deleteCandidate?.id) {
      onDeleteCandidate?.(deleteCandidate.id);
      setDeleteCandidate(null);
    }
  };

  if (candidates.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <UserPlus className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
        <p className="text-gray-500 mb-4">
          Get started by adding candidates to this recruitment process.
        </p>
        {onAddCandidate && (
          <button 
            onClick={onAddCandidate}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add First Candidate
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-md font-medium text-gray-900">
          Candidates ({candidates.length})
        </h3>
        {onAddCandidate && (
          <button 
            onClick={onAddCandidate}
            disabled={loading}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Add Candidate
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {candidates.map((candidate) => {
          const matchScore = calculateMatchScore(candidate);
          const currentPosition = getCurrentPosition(candidate);
          const locationString = getLocationString(candidate);
          const skills = getCandidateSkills(candidate);
          const candidateName = `${candidate.personalInfo.firstName} ${candidate.personalInfo.lastName}`;
          
          return (
            <div 
              key={candidate.id} 
              className={`p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-200 transition-colors cursor-pointer ${
                loading || updating ? 'opacity-50 pointer-events-none' : ''
              }`}
              onClick={() => setSelectedCandidate(candidate)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${candidate.id}`}
                    alt={candidateName}
                    className="h-10 w-10 rounded-full"
                  />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {candidateName}
                    </h4>
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <Briefcase className="h-3 w-3 mr-1" />
                      {currentPosition}
                    </p>
                    <div className="mt-1 flex items-center">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="ml-1 text-sm font-medium text-gray-700">
                        {matchScore}% Match
                      </span>
                    </div>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <a 
                        href={`mailto:${candidate.contact.email}`} 
                        className="flex items-center hover:text-gray-700 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        {candidate.contact.email}
                      </a>
                      {candidate.contact.phone && (
                        <a 
                          href={`tel:${candidate.contact.phone}`} 
                          className="flex items-center hover:text-gray-700 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          {candidate.contact.phone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(menuOpen === candidate.id ? null : candidate.id);
                      }}
                      disabled={loading || updating}
                      className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-500" />
                    </button>
                    
                    {menuOpen === candidate.id && (
                      <div 
                        className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="py-1">
                          <div className="px-3 py-2 text-xs font-medium text-gray-500">
                            Change Status
                          </div>
                          {(['new', 'contacted', 'interview', 'offer', 'hired', 'rejected'] as CandidateStatus[]).map((status) => (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(candidate, status)}
                              className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                                candidate.status === status 
                                  ? 'bg-blue-50 text-blue-700' 
                                  : 'text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {STATUS_LABELS[status]}
                            </button>
                          ))}
                          <div className="border-t border-gray-100 my-1"></div>
                          <button
                            onClick={() => {
                              setDeleteCandidate(candidate);
                              setMenuOpen(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Remove from Process
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    {/* Status Badge */}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}>
                      {STATUS_LABELS[candidate.status]}
                    </span>
                    {/* Stage Badge */}
                    {candidate.stage && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(candidate.stage)}`}>
                        {STAGE_LABELS[candidate.stage]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Skills */}
              {skills.length > 0 && (
                <div className="mt-3">
                  <div className="flex flex-wrap gap-1">
                    {skills.slice(0, 6).map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {skill}
                      </span>
                    ))}
                    {skills.length > 6 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-600">
                        +{skills.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {/* Footer */}
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                <div className="text-sm text-gray-500 flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {locationString}
                </div>
                <div className="flex space-x-2">
                  <button 
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setScheduleCandidate(candidate);
                    }}
                    disabled={loading || updating}
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Schedule
                  </button>
                  <button 
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCandidate(candidate);
                    }}
                    disabled={loading || updating}
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View Profile
                  </button>
                  <a href={candidate.contact.linkedin} target='_blank' onClick={(e) => {
                    e.stopPropagation();
                  }}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    View Linkedin
                  </a>
                </div>
              </div>

              {/* Application Date */}
              {candidate.application?.appliedAt && (
                <div className="mt-2 text-xs text-gray-400 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Applied: {new Date(candidate.application.appliedAt).toLocaleDateString()}
                </div>
              )}

              {/* Additional Info */}
              {candidate.source && (
                <div className="mt-1 text-xs text-gray-400">
                  Source: {candidate.source}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Status Update Modal */}
      {statusUpdateRequest && (
        <CandidateStatusUpdateModal
          isOpen={true}
          candidateName={`${statusUpdateRequest.candidate.personalInfo.firstName} ${statusUpdateRequest.candidate.personalInfo.lastName}`}
          currentStatus={statusUpdateRequest.candidate.status}
          currentStage={statusUpdateRequest.candidate.stage}
          newStatus={statusUpdateRequest.newStatus}
          onClose={handleStatusUpdateCancel}
          onConfirm={handleStatusUpdateConfirm}
          loading={updating}
        />
      )}

      {/* View Candidate Modal */}
      {selectedCandidate && (
        <RecruitmentViewCandidateModal
          candidate={selectedCandidate}
          recruitmentId={recruitmentId}
          onClose={() => setSelectedCandidate(null)}
          setScheduleCandidate={setScheduleCandidate}
          onGetCandidateDetails={onGetCandidateDetails}
          onUpdateCandidateEmail={onUpdateCandidateEmail}
        />
      )}

      {/* Schedule Interview Modal */}
      {scheduleCandidate && (
        <ScheduleInterviewModal
          isOpen={true}
          candidate={scheduleCandidate}
          onClose={() => setScheduleCandidate(null)}
          onSchedule={handleScheduleInterview}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <DeleteConfirmationModal
          isOpen={true}
          onClose={() => setDeleteCandidate(null)}
          onConfirm={handleDeleteConfirm}
          title="Remove Candidate"
          message={`Are you sure you want to remove ${deleteCandidate.personalInfo.firstName} ${deleteCandidate.personalInfo.lastName} from this recruitment process?`}
          itemToDelete={`${deleteCandidate.personalInfo.firstName} ${deleteCandidate.personalInfo.lastName}`}
          confirmationType="type-to-confirm"
          confirmButtonText="Remove"
          isDangerous={false}
        />
      )}
    </div>
  );
};

export default RecruitmentCandidatesList;