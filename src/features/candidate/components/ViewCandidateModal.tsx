import React from 'react';
import { 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Star,
  Building,
  GraduationCap,
  FileText,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight
} from 'lucide-react';
import { Candidate } from '../api/candidatesService';

interface ViewCandidateModalProps {
  candidate: Candidate;
  onClose: () => void;
  setScheduleCandidate: (candidate: Candidate | null) => void;
}

const ViewCandidateModal: React.FC<ViewCandidateModalProps> = ({ candidate, onClose, setScheduleCandidate }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'interview': return 'bg-green-100 text-green-800';
      case 'offer': return 'bg-purple-100 text-purple-800';
      case 'hired': return 'bg-teal-100 text-teal-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Clock className="h-4 w-4 mr-1" />;
      case 'contacted': return <MessageSquare className="h-4 w-4 mr-1" />;
      case 'interview': return <Calendar className="h-4 w-4 mr-1" />;
      case 'offer': return <FileText className="h-4 w-4 mr-1" />;
      case 'hired': return <CheckCircle className="h-4 w-4 mr-1" />;
      default: return <AlertCircle className="h-4 w-4 mr-1" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-lg bg-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Candidate Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="col-span-2">
            <div className="flex items-start space-x-4 mb-6">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${candidate.id}`}
                alt={`${candidate.firstName} ${candidate.lastName}`}
                className="h-20 w-20 rounded-full"
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {candidate.firstName} {candidate.lastName}
                </h3>
                <p className="text-gray-600">{candidate.position}</p>
                <div className="mt-2 flex items-center">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="ml-1 text-sm font-medium text-gray-700">
                    {candidate.matchScore}% Match
                  </span>
                </div>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}>
                    {getStatusIcon(candidate.status)}
                    {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Contact Information</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <a href={`mailto:${candidate.email}`} className="text-blue-600 hover:text-blue-800">
                      {candidate.email}
                    </a>
                  </div>
                  {candidate.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <a href={`tel:${candidate.phone}`} className="text-blue-600 hover:text-blue-800">
                        {candidate.phone}
                      </a>
                    </div>
                  )}
                  {candidate.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">
                        {candidate.location.city}, {candidate.location.country}
                        {candidate.location.remote && ' · Remote'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {candidate.experience && candidate.experience.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Experience</h4>
                  <div className="space-y-4">
                    {candidate.experience.map((exp, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start">
                          <Building className="h-4 w-4 text-gray-400 mt-1 mr-2" />
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">{exp.position}</h5>
                            <p className="text-sm text-gray-600">{exp.company}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(exp.startDate).toLocaleDateString()} - 
                              {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}
                            </p>
                            {exp.description && (
                              <p className="text-sm text-gray-600 mt-2">{exp.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {candidate.education && candidate.education.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Education</h4>
                  <div className="space-y-4">
                    {candidate.education.map((edu, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start">
                          <GraduationCap className="h-4 w-4 text-gray-400 mt-1 mr-2" />
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">{edu.degree}</h5>
                            <p className="text-sm text-gray-600">{edu.institution}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {edu.field} · {edu.graduationYear}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <button 
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  onClick={() => {
                    onClose();
                    setScheduleCandidate(candidate);
                  }}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Interview
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send Message
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm">
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  View Full Profile
                </button>
              </div>
            </div>

            {candidate.documents && candidate.documents.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Documents</h4>
                <div className="space-y-2">
                  {candidate.documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-2 hover:bg-gray-100 rounded-md text-sm text-gray-600 hover:text-gray-900"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      {doc.fileName}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCandidateModal;