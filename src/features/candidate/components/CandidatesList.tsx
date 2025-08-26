import {
  ArrowUpRight,
  Calendar,
  Mail,
  MoreVertical,
  Phone,
  Star,
  UserPlus
} from 'lucide-react';
import React, { useState } from 'react';
import { Candidate } from '../api/candidatesService';
import DeleteConfirmationModal from '../../../shared/components/DeleteConfirmationModal';
import ScheduleInterviewModal from '../../../features/recruitment/components/ScheduleInterviewModal';
import ViewCandidateModal from './ViewCandidateModal';

interface CandidatesListProps {
  candidates: Candidate[];
  onAddCandidate?: () => void;
  onUpdateStatus?: (candidateId: string, newStatus: Candidate['status'], newStage: Candidate['stage']) => void;
  onDeleteCandidate?: (candidateId: string) => void;
}

const CandidatesList: React.FC<CandidatesListProps> = ({ 
  candidates, 
  onAddCandidate,
  onUpdateStatus,
  onDeleteCandidate
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [scheduleCandidate, setScheduleCandidate] = useState<Candidate | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Candidate | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const handleScheduleInterview = (data: any) => {
    // Here you would typically make an API call to schedule the interview
    console.log('Scheduling interview:', data);
    // Close the modal
    setScheduleCandidate(null);
    // Show success message
    alert('Interview scheduled successfully!');
  };

  const handleStatusChange = (candidateId: string, newStatus: Candidate['status']) => {
    let newStage: Candidate['stage'] = 'applied';
    
    // Map status to appropriate stage
    switch (newStatus) {
      case 'new':
        newStage = 'applied';
        break;
      case 'contacted':
        newStage = 'screening';
        break;
      case 'interview':
        newStage = 'technical';
        break;
      case 'offer':
        newStage = 'offer';
        break;
      case 'hired':
        newStage = 'hired';
        break;
      case 'rejected':
        newStage = 'applied';
        break;
    }

    onUpdateStatus?.(candidateId, newStatus, newStage);
    setMenuOpen(null);
  };

  const handleDeleteConfirm = () => {
    if (deleteCandidate?.id) {
      onDeleteCandidate?.(deleteCandidate.id);
      setDeleteCandidate(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-md font-medium text-gray-900">Candidates</h3>
        {onAddCandidate && (
          <button 
            onClick={onAddCandidate}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Add Candidate
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {candidates.map((candidate) => (
          <div 
            key={candidate.id} 
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-200 transition-colors cursor-pointer"
            onClick={() => setSelectedCandidate(candidate)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${candidate.id}`}
                  alt={`${candidate.firstName} ${candidate.lastName}`}
                  className="h-10 w-10 rounded-full"
                />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {candidate.firstName} {candidate.lastName}
                  </h4>
                  <div className="mt-1 flex items-center">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="ml-1 text-sm font-medium text-gray-700">
                      {candidate.assessment.matchScore}% Match
                    </span>
                  </div>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                    <a 
                      href={`mailto:${candidate.email}`} 
                      className="flex items-center hover:text-gray-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      {candidate.email}
                    </a>
                    {candidate.phone && (
                      <a 
                        href={`tel:${candidate.phone}`} 
                        className="flex items-center hover:text-gray-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        {candidate.phone}
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
                    className="p-1 hover:bg-gray-100 rounded-full"
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
                        {['new', 'contacted', 'interview', 'offer', 'hired', 'rejected'].map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(candidate.id!, status as Candidate['status'])}
                            className={`block w-full text-left px-4 py-2 text-sm ${
                              candidate.status === status 
                                ? 'bg-blue-50 text-blue-700' 
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        ))}
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                          onClick={() => {
                            setDeleteCandidate(candidate);
                            setMenuOpen(null);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Delete Candidate
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  candidate.status === 'new' ? 'bg-blue-100 text-blue-800' :
                  candidate.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                  candidate.status === 'interview' ? 'bg-green-100 text-green-800' :
                  candidate.status === 'offer' ? 'bg-purple-100 text-purple-800' :
                  candidate.status === 'hired' ? 'bg-teal-100 text-teal-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                </span>
              </div>
            </div>
            
            <div className="mt-3">
              <div className="flex flex-wrap gap-1">
                {candidate.skills?.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {candidate.location?.city}, {candidate.location?.country}
                {candidate.location?.remote && ' · Remote'}
              </div>
              <div className="flex space-x-2">
                <button 
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    setScheduleCandidate(candidate);
                  }}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Schedule
                </button>
                <button 
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCandidate(candidate);
                  }}
                >
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  View Profile
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedCandidate && (
        <ViewCandidateModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          setScheduleCandidate={setScheduleCandidate}
        />
      )}

      {scheduleCandidate && (
        <ScheduleInterviewModal
          isOpen={true}
          candidate={scheduleCandidate}
          onClose={() => setScheduleCandidate(null)}
          onSchedule={handleScheduleInterview}
        />
      )}

      {deleteCandidate && (
        <DeleteConfirmationModal
          isOpen={true}
          onClose={() => setDeleteCandidate(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Candidate"
          itemToDelete={`${deleteCandidate.firstName} ${deleteCandidate.lastName}`}
        />
      )}
    </div>
  );
};

export default CandidatesList;