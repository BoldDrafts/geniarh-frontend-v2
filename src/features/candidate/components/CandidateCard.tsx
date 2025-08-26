import React from 'react';
import { Star, Mail, Calendar, ArrowUpRight, Building, Clock } from 'lucide-react';

interface CandidateProps {
  id: string;
  name: string;
  position: string;
  department: string;
  skills: string[];
  matchScore: number;
  imageSrc: string;
  status: 'new' | 'contacted' | 'interview' | 'offer' | 'hired' | 'rejected';
  createdAt: string; // ISO date string
  onViewProfile: () => void;
}

const CandidateCard: React.FC<CandidateProps> = ({
  id,
  name,
  position,
  department,
  skills,
  matchScore,
  imageSrc,
  status,
  createdAt,
  onViewProfile
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-purple-100 text-purple-800';
      case 'interview': return 'bg-amber-100 text-amber-800';
      case 'offer': return 'bg-teal-100 text-teal-800';
      case 'hired': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = () => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getScoreColor = () => {
    if (matchScore >= 85) return 'text-green-600';
    if (matchScore >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  const formatCreatedDate = () => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return '1 day ago';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={imageSrc}
              alt={name}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <h3 className="text-lg font-medium text-gray-900">{name}</h3>
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <span>{position}</span>
                {department && (
                  <>
                    <span className="text-gray-400">•</span>
                    <div className="flex items-center">
                      <Building className="h-3 w-3 mr-1" />
                      <span>{department}</span>
                    </div>
                  </>
                )}
              </div>
              <div 
                className="flex items-center mt-1 text-xs text-gray-400 cursor-default"
                title={new Date(createdAt).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  timeZoneName: 'short'
                })}
              >
                <Clock className="h-3 w-3 mr-1" />
                <span>Added {formatCreatedDate()}</span>
              </div>
            </div>
          </div>
          <div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
        </div>
        
        <div className="mt-4">
          {matchScore && (
          <>
            <div className="flex items-center mb-2">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <span className={`text-sm font-medium ${getScoreColor()}`}>
                {matchScore}% Match
              </span>
            </div>
          </>
          )}
          <div className="flex flex-wrap gap-1 mt-2">
            {skills.slice(0, 3).map((skill, idx) => (
              <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                {skill}
              </span>
            ))}
            {skills.length > 3 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-600">
                +{skills.length - 3} more
              </span>
            )}
          </div>
        </div>
        
        <div className="mt-4 flex justify-between pt-3 border-t border-gray-100">
          <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center">
            <Mail className="h-4 w-4 mr-1" />
            Contact
          </button>
          <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            Schedule
          </button>
          <button 
            onClick={onViewProfile}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            <ArrowUpRight className="h-4 w-4 mr-1" />
            View Profile
          </button>
          <a 
            onClick={onViewProfile}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            <ArrowUpRight className="h-4 w-4 mr-1" />
            View Linkedin
          </a>
        </div>
      </div>
    </div>
  );
};

export default CandidateCard;