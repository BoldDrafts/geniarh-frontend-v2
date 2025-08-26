import {
  AlertCircle,
  Award,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  FileText,
  Github,
  Globe,
  GraduationCap,
  Languages,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Star,
  X,
  Edit2,
  Check,
  XCircle
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Candidate, CandidateStatus } from '../types/recruitment';

interface ViewCandidateModalProps {
  candidate: Candidate | null;
  recruitmentId: string;
  onClose: () => void;
  setScheduleCandidate: (candidate: Candidate | null) => void;
  onGetCandidateDetails?: (recruitmentId: string, candidateId: string) => Promise<Candidate>;
  onUpdateCandidateEmail?: (recruitmentId: string, candidateId: string, newEmail: string) => Promise<void>;
}

const RecruitmentViewCandidateModal: React.FC<ViewCandidateModalProps> = ({ 
  candidate: initialCandidate, 
  recruitmentId,
  onClose, 
  setScheduleCandidate,
  onGetCandidateDetails,
  onUpdateCandidateEmail
}) => {
  const [candidate, setCandidate] = useState<Candidate | null>(initialCandidate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Email editing state
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editedEmail, setEditedEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSaving, setEmailSaving] = useState(false);

  // Effect to load detailed candidate information when modal opens
  useEffect(() => {
    const loadCandidateDetails = async () => {
      if (!initialCandidate || !onGetCandidateDetails) {
        setCandidate(initialCandidate);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Call the API to get detailed candidate information
        const detailedCandidate = await onGetCandidateDetails(recruitmentId, initialCandidate.id);
        setCandidate(detailedCandidate);
      } catch (err) {
        console.error('Error loading candidate details:', err);
        setError('Failed to load candidate details. Showing cached information.');
        // Fallback to the initial candidate data
        setCandidate(initialCandidate);
      } finally {
        setLoading(false);
      }
    };

    loadCandidateDetails();
  }, [initialCandidate, recruitmentId, onGetCandidateDetails]);

  if (!initialCandidate) return null;

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Start editing email
  const handleStartEditEmail = () => {
    const currentEmail = candidate?.contact.email || initialCandidate.contact.email;
    setEditedEmail(currentEmail);
    setIsEditingEmail(true);
    setEmailError(null);
  };

  // Cancel editing email
  const handleCancelEditEmail = () => {
    setIsEditingEmail(false);
    setEditedEmail('');
    setEmailError(null);
  };

  // Save email changes
  const handleSaveEmail = async () => {
    if (!editedEmail.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(editedEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (!onUpdateCandidateEmail) {
      setEmailError('Email update function not available');
      return;
    }

    try {
      setEmailSaving(true);
      setEmailError(null);
      
      await onUpdateCandidateEmail(recruitmentId, displayCandidate.id, editedEmail);
      
      // Update local state
      const updatedCandidate = {
        ...displayCandidate,
        contact: {
          ...displayCandidate.contact,
          email: editedEmail
        }
      };
      setCandidate(updatedCandidate);
      
      setIsEditingEmail(false);
      setEditedEmail('');
    } catch (err) {
      console.error('Error updating email:', err);
      setEmailError('Failed to update email. Please try again.');
    } finally {
      setEmailSaving(false);
    }
  };

  // Handle email input change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedEmail(e.target.value);
    if (emailError) {
      setEmailError(null);
    }
  };

  // Handle Enter key press in email input
  const handleEmailKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveEmail();
    } else if (e.key === 'Escape') {
      handleCancelEditEmail();
    }
  };

  // Calculate match score
  const calculateMatchScore = (candidate: Candidate): number => {
    return candidate.assessment?.matchScore || 0;
  };

  // Get current position
  const getCurrentPosition = (): string => {
    if (candidate?.profile?.experience && candidate.profile.experience.length > 0) {
      const currentExperience = candidate.profile.experience.find(exp => exp.current) ||
                               candidate.profile.experience[0];
      return currentExperience.position;
    }
    return 'Candidate';
  };

  // Get status configuration - SWAGGER COMPLIANT
  const getStatusConfig = (status: CandidateStatus) => {
    switch (status) {
      case 'new':
        return { 
          color: 'bg-blue-100 text-blue-800', 
          icon: <Clock className="h-4 w-4 mr-1" /> 
        };
      case 'contacted':
        return { 
          color: 'bg-indigo-100 text-indigo-800', 
          icon: <MessageSquare className="h-4 w-4 mr-1" /> 
        };
      case 'interview':
        return { 
          color: 'bg-yellow-100 text-yellow-800', 
          icon: <Calendar className="h-4 w-4 mr-1" /> 
        };
      case 'offer':
        return { 
          color: 'bg-pink-100 text-pink-800', 
          icon: <FileText className="h-4 w-4 mr-1" /> 
        };
      case 'hired':
        return { 
          color: 'bg-emerald-100 text-emerald-800', 
          icon: <CheckCircle className="h-4 w-4 mr-1" /> 
        };
      case 'rejected':
        return { 
          color: 'bg-red-100 text-red-800', 
          icon: <AlertCircle className="h-4 w-4 mr-1" /> 
        };
      default:
        return { 
          color: 'bg-gray-100 text-gray-800', 
          icon: <AlertCircle className="h-4 w-4 mr-1" /> 
        };
    }
  };

  // Format date helper
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get location string
  const getLocationString = (): string => {
    const location = candidate?.personalInfo.location;
    if (!location) return 'Location not specified';
    
    const parts = [location.city, location.state, location.country].filter(Boolean);
    return parts.join(', ');
  };

  // Use initial candidate for basic info while loading, then switch to detailed candidate
  const displayCandidate = candidate || initialCandidate;
  const matchScore = calculateMatchScore(displayCandidate);
  const currentPosition = getCurrentPosition();
  const statusConfig = getStatusConfig(displayCandidate.status);
  const candidateName = `${displayCandidate.personalInfo.firstName} ${displayCandidate.personalInfo.lastName}`;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-6 border w-full max-w-5xl shadow-lg rounded-lg bg-white max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-900">Candidate Profile</h2>
            {loading && (
              <div className="ml-3 flex items-center text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm">Loading details...</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Basic Info */}
            <div className="flex items-start space-x-4 mb-6">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${displayCandidate.id}`}
                alt={candidateName}
                className="h-20 w-20 rounded-full"
              />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">
                  {candidateName}
                </h3>
                <p className="text-gray-600 mt-1">{currentPosition}</p>
                <div className="mt-3 flex items-center space-x-4">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="ml-1 text-sm font-medium text-gray-700">
                      {matchScore}% Match
                    </span>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                    {statusConfig.icon}
                    {displayCandidate.status}
                  </span>
                  {displayCandidate.stage && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Stage: {displayCandidate.stage}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Contact Information</h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                {/* Email with editing capability */}
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                  {isEditingEmail ? (
                    <div className="flex-1 flex items-center space-x-2">
                      <input
                        type="email"
                        value={editedEmail}
                        onChange={handleEmailChange}
                        onKeyDown={handleEmailKeyPress}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter email address"
                        disabled={emailSaving}
                        autoFocus
                      />
                      <button
                        onClick={handleSaveEmail}
                        disabled={emailSaving}
                        className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Save email"
                      >
                        {emailSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={handleCancelEditEmail}
                        disabled={emailSaving}
                        className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Cancel editing"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-between">
                      <a 
                        href={`mailto:${displayCandidate.contact.email}`} 
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {displayCandidate.contact.email}
                      </a>
                      {onUpdateCandidateEmail && (
                        <button
                          onClick={handleStartEditEmail}
                          className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Edit email"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Email error message */}
                {emailError && (
                  <div className="ml-7 text-sm text-red-600">
                    {emailError}
                  </div>
                )}

                {displayCandidate.contact.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                    <a 
                      href={`tel:${displayCandidate.contact.phone}`} 
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {displayCandidate.contact.phone}
                    </a>
                  </div>
                )}
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">{getLocationString()}</span>
                </div>
                
                {/* Social Links */}
                <div className="flex items-center space-x-4 pt-2">
                  {displayCandidate.contact.linkedin && (
                    <a
                      href={displayCandidate.contact.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Linkedin className="h-4 w-4 mr-1" />
                      LinkedIn
                    </a>
                  )}
                  {displayCandidate.contact.github && (
                    <a
                      href={displayCandidate.contact.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <Github className="h-4 w-4 mr-1" />
                      GitHub
                    </a>
                  )}
                  {displayCandidate.contact.portfolio && (
                    <a
                      href={displayCandidate.contact.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-green-600 hover:text-green-800 transition-colors"
                    >
                      <Globe className="h-4 w-4 mr-1" />
                      Portfolio
                    </a>
                  )}
                </div>
              </div>
            </div>
            
            {/* Professional Summary */}
            {displayCandidate.profile?.summary && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Professional Summary</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">{displayCandidate.profile.summary}</p>
                </div>
              </div>
            )}

            {/* Work Experience */}
            {displayCandidate.profile?.experience && displayCandidate.profile.experience.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Work Experience</h4>
                <div className="space-y-4">
                  {displayCandidate.profile.experience.map((exp, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Building className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-medium text-gray-900">{exp.position}</h5>
                            {exp.current && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{exp.company}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                          </p>
                          {exp.location && (
                            <p className="text-xs text-gray-500 mt-1 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {exp.location.city}, {exp.location.country}
                            </p>
                          )}
                          {exp.description && (
                            <p className="text-sm text-gray-700 mt-2 leading-relaxed">{exp.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {displayCandidate.profile?.education && displayCandidate.profile.education.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Education</h4>
                <div className="space-y-4">
                  {displayCandidate.profile.education.map((edu, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <GraduationCap className="h-4 w-4 text-purple-600" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <h5 className="text-sm font-medium text-gray-900">{edu.degree}</h5>
                          <p className="text-sm text-gray-600 mt-1">{edu.institution}</p>
                          <p className="text-xs text-gray-500 mt-1">{edu.field}</p>
                          {(edu.startDate || edu.endDate) && (
                            <p className="text-xs text-gray-500 mt-1">
                              {edu.startDate && formatDate(edu.startDate)} - {edu.endDate && formatDate(edu.endDate)}
                            </p>
                          )}
                          {edu.gpa && (
                            <p className="text-xs text-gray-500 mt-1">GPA: {edu.gpa}</p>
                          )}
                          {edu.honors && (
                            <p className="text-xs text-green-600 mt-1">{edu.honors}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {displayCandidate.profile?.languages && displayCandidate.profile.languages.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Languages</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {displayCandidate.profile.languages.map((lang, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Languages className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{lang.language}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        lang.proficiency === 'Native' ? 'bg-green-100 text-green-800' :
                        lang.proficiency === 'Fluent' ? 'bg-blue-100 text-blue-800' :
                        lang.proficiency === 'Business' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {lang.proficiency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {displayCandidate.profile?.certifications && displayCandidate.profile.certifications.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Certifications</h4>
                <div className="space-y-3">
                  {displayCandidate.profile.certifications.map((cert, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                            <Award className="h-4 w-4 text-yellow-600" />
                          </div>
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-medium text-gray-900">{cert.name}</h5>
                            {cert.url && (
                              <a
                                href={cert.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{cert.issuer}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Obtained: {formatDate(cert.dateObtained)}
                            {cert.expiryDate && ` • Expires: ${formatDate(cert.expiryDate)}`}
                          </p>
                          {cert.credentialId && (
                            <p className="text-xs text-gray-500 mt-1">ID: {cert.credentialId}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Application Info */}
            {displayCandidate.application && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Application Details</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500">Applied:</span> {formatDate(displayCandidate.application.appliedAt)}</p>
                  <p><span className="text-gray-500">Source:</span> {displayCandidate.application.source}</p>
                  {displayCandidate.application.referral && (
                    <div className="mt-2 p-2 bg-blue-50 rounded">
                      <p className="text-xs text-blue-800">
                        <strong>Referred by:</strong> {displayCandidate.application.referral.referrerName}
                        {displayCandidate.application.referral.relationship && ` (${displayCandidate.application.referral.relationship})`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Skills */}
            {displayCandidate.profile?.skills && displayCandidate.profile.skills.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Technical Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {displayCandidate.profile.skills.map((skill, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Soft Skills */}
            {displayCandidate.profile?.softSkills && displayCandidate.profile.softSkills.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Soft Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {displayCandidate.profile.softSkills.map((softSkill, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {softSkill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Documents */}
            {displayCandidate.application?.resume || displayCandidate.application?.additionalDocuments?.length ? (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Documents</h4>
                <div className="space-y-2">
                  {displayCandidate.application.resume && (
                    <a
                      href={displayCandidate.application.resume.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-2 hover:bg-gray-100 rounded-md text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      {displayCandidate.application.resume.filename}
                    </a>
                  )}
                  {displayCandidate.application.additionalDocuments?.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-2 hover:bg-gray-100 rounded-md text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      {doc.filename}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
            
            {/* Quick Actions */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
              <div className="flex flex-col items-center space-y-2">
                <button 
                  className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  onClick={() => {
                    onClose();
                    setScheduleCandidate(displayCandidate);
                  }}
                  disabled={loading}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Interview
                </button>
                <button 
                  className="w-full py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  disabled={loading}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send Message
                </button>
                <a
                  href={`mailto:${displayCandidate.contact.email}`}
                  className="w-full py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm flex items-center justify-center"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruitmentViewCandidateModal;