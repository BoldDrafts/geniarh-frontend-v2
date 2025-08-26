import React from 'react';
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  Video,
  Clock,
  MessageSquare,
  UserCheck,
  AlertCircle,
  FileText,
  BrainCircuit,
  ChevronDown
} from 'lucide-react';
import { Interview } from '../types/interview';

interface InterviewDetailProps {
  interview: Interview;
  onClose: () => void;
  onAction: (action: string, interview: Interview) => void;
  onShowAIAssistant?: () => void;
}

const InterviewDetail: React.FC<InterviewDetailProps> = ({
  interview,
  onClose,
  onAction,
  onShowAIAssistant
}) => {
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'canceled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <h2 className="text-lg font-medium text-gray-900">Interview Details</h2>
            <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(interview.status)}`}>
              {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="flex items-start mb-6">
              <img 
                src={interview.candidatePhoto} 
                alt={interview.candidateName}
                className="h-16 w-16 rounded-full object-cover mr-4" 
              />
              <div>
                <h3 className="text-xl font-medium text-gray-900">{interview.candidateName}</h3>
                <p className="text-gray-600">{interview.position}</p>
                {interview.candidateMatchScore && (
                  <div className="mt-1 flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className={`text-sm font-medium ${
                      interview.candidateMatchScore >= 85 ? 'text-green-600' :
                      interview.candidateMatchScore >= 70 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {interview.candidateMatchScore}% Match
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Interview Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Date:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(interview.date).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Time:</span>
                    <span className="text-sm font-medium text-gray-900">{interview.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Duration:</span>
                    <span className="text-sm font-medium text-gray-900">45 minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Type:</span>
                    <span className={`text-sm font-medium ${
                      interview.type === 'technical' ? 'text-purple-700' :
                      interview.type === 'hr' ? 'text-blue-700' :
                      interview.type === 'cultural' ? 'text-teal-700' :
                      'text-indigo-700'
                    }`}>
                      {interview.type.charAt(0).toUpperCase() + interview.type.slice(1)} Interview
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Location:</span>
                    <span className="text-sm font-medium text-gray-900">Zoom Meeting</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Interviewers</h4>
                {interview.type === 'ai' ? (
                  <div className="flex items-center py-2">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                      <BrainCircuit className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">AI Interview Assistant</p>
                      <p className="text-xs text-gray-500">Automated technical assessment</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {interview.interviewers.map((interviewer, index) => (
                      <div key={index} className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-700 mr-3">
                          {interviewer.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{interviewer}</p>
                          <p className="text-xs text-gray-500">
                            {index === 0 ? 'Primary Interviewer' : 'Co-interviewer'}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {interview.interviewers.length === 0 && (
                      <p className="text-sm text-gray-500">No interviewers assigned yet</p>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {interview.status === 'completed' ? (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Interview Feedback</h4>
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <ThumbsUp className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-900">Recommendation: Proceed to next round</p>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>The candidate demonstrated strong technical skills and problem-solving abilities. Their experience with React and TypeScript is impressive, and they showed good understanding of state management concepts.</p>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs font-medium text-blue-800">Technical Skills</p>
                            <div className="w-full bg-blue-200 rounded-full h-1.5 mt-1">
                              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-blue-800">Communication</p>
                            <div className="w-full bg-blue-200 rounded-full h-1.5 mt-1">
                              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '90%' }}></div>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-blue-800">Problem Solving</p>
                            <div className="w-full bg-blue-200 rounded-full h-1.5 mt-1">
                              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '80%' }}></div>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-blue-800">Culture Fit</p>
                            <div className="w-full bg-blue-200 rounded-full h-1.5 mt-1">
                              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '95%' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-700">Interview Questions</h4>
                  {onShowAIAssistant && (
                    <button
                      onClick={onShowAIAssistant}
                      className="ml-auto text-xs text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <BrainCircuit className="h-3 w-3 mr-1" />
                      AI-Generated Questions
                    </button>
                  )}
                </div>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <div className="space-y-3">
                    <div className="p-3 bg-white rounded-md shadow-sm">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        1. Can you describe a challenging project you worked on recently and how you approached it?
                      </p>
                      <p className="text-xs text-gray-500">Assesses problem-solving and project experience</p>
                    </div>
                    <div className="p-3 bg-white rounded-md shadow-sm">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        2. How do you handle state management in a complex React application?
                      </p>
                      <p className="text-xs text-gray-500">Evaluates technical knowledge and best practices</p>
                    </div>
                    <div className="p-3 bg-white rounded-md shadow-sm">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        3. Can you explain your approach to writing maintainable and reusable code?
                      </p>
                      <p className="text-xs text-gray-500">Focuses on code quality and engineering practices</p>
                    </div>
                    <div className="p-3 bg-white rounded-md shadow-sm">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        4. Tell me about a time when you had to learn a new technology quickly.
                      </p>
                      <p className="text-xs text-gray-500">Assesses adaptability and learning capacity</p>
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Show more questions
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div>
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-6">
              <h3 className="text-md font-medium text-gray-900 mb-3">Candidate Summary</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-1">Experience</h4>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start">
                      <span className="flex-shrink-0 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">2020-Present</span>
                      <div className="ml-2">
                        <p className="text-gray-900 font-medium">Frontend Developer at TechCorp</p>
                        <p className="text-gray-600 text-xs">React, TypeScript, GraphQL</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">2018-2020</span>
                      <div className="ml-2">
                        <p className="text-gray-900 font-medium">Web Developer at StartupX</p>
                        <p className="text-gray-600 text-xs">JavaScript, Vue.js, Node.js</p>
                      </div>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-1">Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">React</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">TypeScript</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">GraphQL</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">Redux</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-600">+6 more</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-1">Education</h4>
                  <p className="text-sm text-gray-900">B.S. Computer Science, University of Technology</p>
                  <p className="text-xs text-gray-600">Graduated 2018</p>
                </div>
                
                <div className="pt-2 border-t border-gray-200">
                  <a href="#" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    View full profile
                  </a>
                </div>
              </div>
            </div>
            
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="text-md font-medium text-gray-900 mb-3">Quick Actions</h3>
              
              <div className="space-y-3">
                {interview.status === 'scheduled' && (
                  <button 
                    onClick={() => onAction('join', interview)}
                    className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                  >
                    <Video className="mr-2 h-4 w-4" />
                    Join Interview
                  </button>
                )}
                
                {interview.status === 'scheduled' && (
                  <button 
                    onClick={() => onAction('reschedule', interview)}
                    className="w-full flex items-center justify-center px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors text-sm"
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Reschedule
                  </button>
                )}
                
                {interview.status === 'completed' && (
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => onAction('approve', interview)}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                    >
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      Approve
                    </button>
                    <button 
                      onClick={() => onAction('reject', interview)}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                    >
                      <ThumbsDown className="mr-2 h-4 w-4" />
                      Reject
                    </button>
                  </div>
                )}
                
                {interview.status === 'scheduled' && (
                  <button 
                    onClick={() => onAction('sendReminder', interview)}
                    className="w-full flex items-center justify-center px-4 py-2 bg-white border border-amber-600 text-amber-600 rounded-md hover:bg-amber-50 transition-colors text-sm"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send Reminder
                  </button>
                )}
                
                {interview.status === 'completed' && (
                  <button 
                    onClick={() => onAction('scheduleNext', interview)}
                    className="w-full flex items-center justify-center px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors text-sm"
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Schedule Next Round
                  </button>
                )}
                
                {interview.status === 'scheduled' && (
                  <button 
                    onClick={() => onAction('cancel', interview)}
                    className="w-full flex items-center justify-center px-4 py-2 bg-white border border-red-600 text-red-600 rounded-md hover:bg-red-50 transition-colors text-sm"
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Cancel Interview
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewDetail;