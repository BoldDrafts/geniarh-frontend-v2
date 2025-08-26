import {
    AlertCircle,
    BrainCircuit,
    Calendar,
    CheckCircle,
    Clock,
    FileText,
    MessageSquare,
    User,
    Users,
    Video
} from 'lucide-react';
import React from 'react';
import { Interview } from '../types/interview';

interface InterviewsTableProps {
  interviews: Interview[];
  onInterviewSelect: (interview: Interview) => void;
  onActionClick: (action: string, interview: Interview, event: React.MouseEvent) => void;
  loading?: boolean;
}

const InterviewsTable: React.FC<InterviewsTableProps> = ({
  interviews,
  onInterviewSelect,
  onActionClick,
  loading = false
}) => {
  // Get status color classes
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'canceled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get type color classes
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'technical': return 'bg-purple-100 text-purple-800';
      case 'hr': return 'bg-blue-100 text-blue-800';
      case 'cultural': return 'bg-teal-100 text-teal-800';
      case 'ai': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'technical': return <FileText className="h-4 w-4 mr-1" />;
      case 'hr': return <User className="h-4 w-4 mr-1" />;
      case 'cultural': return <Users className="h-4 w-4 mr-1" />;
      case 'ai': return <BrainCircuit className="h-4 w-4 mr-1" />;
      default: return <FileText className="h-4 w-4 mr-1" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading interviews...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Candidate
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Interviewers
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {interviews.map((interview) => (
              <tr 
                key={interview.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onInterviewSelect(interview)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img 
                        className="h-10 w-10 rounded-full object-cover" 
                        src={interview.candidatePhoto} 
                        alt={interview.candidateName} 
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{interview.candidateName}</div>
                      {interview.candidateMatchScore && (
                        <div className="text-xs text-gray-500 flex items-center">
                          Match: 
                          <span className={`ml-1 font-medium ${
                            interview.candidateMatchScore >= 85 ? 'text-green-600' :
                            interview.candidateMatchScore >= 70 ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {interview.candidateMatchScore}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {interview.position}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(interview.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric'
                    })}
                  </div>
                  <div className="text-sm text-gray-500">{interview.time}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(interview.type)}`}>
                    {getTypeIcon(interview.type)}
                    {interview.type.charAt(0).toUpperCase() + interview.type.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {interview.type === 'ai' ? (
                    <span className="inline-flex items-center">
                      <BrainCircuit className="h-4 w-4 mr-1 text-indigo-600" />
                      AI Interview
                    </span>
                  ) : interview.interviewers.length > 0 ? (
                    <div className="flex items-center">
                      <div className="flex -space-x-2">
                        {interview.interviewers.slice(0, 2).map((interviewer, index) => (
                          <div 
                            key={index} 
                            className="h-7 w-7 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-700 border-2 border-white"
                            title={interviewer}
                          >
                            {interviewer.charAt(0)}
                          </div>
                        ))}
                      </div>
                      {interview.interviewers.length > 2 && (
                        <span className="ml-1 text-xs text-gray-500">
                          +{interview.interviewers.length - 2} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(interview.status)}`}>
                    {interview.status === 'scheduled' && <Calendar className="h-3 w-3 mr-1" />}
                    {interview.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {interview.status === 'canceled' && <AlertCircle className="h-3 w-3 mr-1" />}
                    {interview.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                    {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-3">
                    {(interview.status === 'scheduled' || interview.status === 'pending') && (
                      <button
                        onClick={(e) => onActionClick('join', interview, e)}
                        className="text-green-600 hover:text-green-900"
                        title="Join/Start Interview"
                      >
                        <Video className="h-4 w-4" />
                      </button>
                    )}
                    {interview.status === 'completed' && (
                      <button
                        onClick={(e) => onActionClick('feedback', interview, e)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Feedback"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>
                    )}
                    {(interview.status === 'scheduled' || interview.status === 'pending') && (
                      <button
                        onClick={(e) => onActionClick('reschedule', interview, e)}
                        className="text-amber-600 hover:text-amber-900"
                        title="Reschedule Interview"
                      >
                        <Clock className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {interviews.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-gray-500">No interviews found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default InterviewsTable;