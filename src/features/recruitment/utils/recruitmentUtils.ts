// utils/recruitmentUtils.ts
import { HealthScoreStatus, QualityLevel } from '../types/base';
import { 
  RecruitmentProcess, 
  RecruitmentStatus, 
  RecruitmentStage, 
  PublicationPlatform,
  PublicationStatus,
  Priority
} from '../types/recruitment';

// Format date helper
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Get status color
export const getStatusColor = (status: RecruitmentStatus): string => {
  switch (status) {
    case 'ACTIVE': return 'bg-green-100 text-green-800';
    case 'PAUSED': return 'bg-yellow-100 text-yellow-800';
    case 'COMPLETED': return 'bg-blue-100 text-blue-800';
    case 'CANCELLED': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Get status icon component
export const getStatusIconName = (status: RecruitmentStatus): string => {
  switch (status) {
    case 'ACTIVE': return 'CheckCircle';
    case 'PAUSED': return 'Clock';
    case 'COMPLETED': return 'CheckCircle';
    case 'CANCELLED': return 'AlertCircle';
    default: return 'Clock';
  }
};

// Get platform color
export const getPlatformColor = (platform: PublicationPlatform): string => {
  switch (platform) {
    case 'LINKEDIN': return 'bg-blue-100 text-blue-800';
    case 'COMPUTRABAJO': return 'bg-green-100 text-green-800';
    case 'INDEED': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Get publication status color
export const getPublicationStatusColor = (status: PublicationStatus): string => {
  switch (status) {
    case 'PUBLISHED': return 'bg-green-100 text-green-800';
    case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
    case 'SUSPENDED': return 'bg-red-100 text-red-800';
    case 'EXPIRED': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Generate dynamic stages based on recruitment process state
export const getRecruitmentStages = (process: RecruitmentProcess): RecruitmentStage[] => {
  const hasPublications = process.publications && process.publications.length > 0;
  const hasActivePublications = hasPublications && process.publications.some(pub => pub.status === 'PUBLISHED');
  const hasCandidates = process.metrics.totalCandidates > 0;
  const hasInterviews = process.metrics.interviewsScheduled > 0;
  const hasOffers = process.metrics.offersExtended > 0;
  const isCompleted = process.status === 'COMPLETED';
  const isCancelled = process.status === 'CANCELLED';

  const stages: RecruitmentStage[] = [
    {
      name: 'Created',
      stage: 'CREATED',
      status: 'COMPLETE',
      description: 'Recruitment process created'
    },
    {
      name: 'Published',
      stage: 'PUBLISHED',
      status: hasActivePublications ? 'COMPLETE' : 
              hasPublications ? 'CURRENT' : 'UPCOMING',
      description: hasActivePublications ? 'Job posted on platforms' : 
                  hasPublications ? 'Preparing publications' : 'Ready to publish'
    },
    {
      name: 'Sourcing',
      stage: 'SOURCING',
      status: hasCandidates ? 'COMPLETE' :
              hasActivePublications ? 'CURRENT' : 'UPCOMING',
      description: hasCandidates ? `${process.metrics.totalCandidates} candidates sourced` :
                  hasActivePublications ? 'Actively sourcing candidates' : 'Awaiting publication'
    },
    {
      name: 'Screening',
      stage: 'SCREENING',
      status: hasInterviews ? 'COMPLETE' :
              hasCandidates ? 'CURRENT' : 'UPCOMING',
      description: hasInterviews ? `${process.metrics.interviewsScheduled} interviews scheduled` :
                  hasCandidates ? `Screening ${process.metrics.qualifiedCandidates} qualified candidates` : 'No candidates yet'
    },
    {
      name: 'Interviews',
      stage: 'INTERVIEWS',
      status: hasOffers ? 'COMPLETE' :
              hasInterviews ? 'CURRENT' : 'UPCOMING',
      description: hasOffers ? `${process.metrics.offersExtended} offers extended` :
                  hasInterviews ? 'Conducting interviews' : 'Pending interviews'
    },
    {
      name: 'Short List',
      stage: 'SHORT_LIST',
      status: hasOffers ? 'COMPLETE' :
              hasInterviews ? 'CURRENT' : 'UPCOMING',
      description: hasOffers ? `${process.metrics.offersExtended} offers extended` :
                  hasInterviews ? 'Conducting interviews' : 'Pending interviews'
    },
    {
      name: 'Hiring',
      stage: 'HIRING',
      status: isCompleted ? 'COMPLETE' :
              isCancelled ? 'CANCELLED' :
              hasOffers ? 'CURRENT' : 'UPCOMING',
      description: isCompleted ? 'Position filled successfully' :
                  isCancelled ? 'Recruitment cancelled' :
                  hasOffers ? `Awaiting offer responses (${process.metrics.offerAcceptanceRate.toFixed(0)}% acceptance rate)` : 'No offers yet'
    }
  ];

  return stages;
};

// Calculate completion percentage
export const getCompletionPercentage = (process: RecruitmentProcess): number => {
  const stages = getRecruitmentStages(process);
  const completedStages = stages.filter(stage => stage.status === 'COMPLETE').length;
  return Math.round((completedStages / stages.length) * 100);
};

// Get priority color
export const getPriorityColor = (priority: Priority): string => {
  switch (priority) {
    case 'HIGH': 
    case 'URGENT': 
      return 'bg-red-100 text-red-800';
    case 'MEDIUM': 
      return 'bg-yellow-100 text-yellow-800';
    case 'LOW': 
      return 'bg-green-100 text-green-800';
    default: 
      return 'bg-gray-100 text-gray-800';
  }
};

// Format salary range
export const formatSalaryRange = (min: number, max: number, currency: string): string => {
  return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
};

// Get candidate quality indicator
export const getCandidateQualityIndicator = (process: RecruitmentProcess): {
  quality: QualityLevel;
  percentage: number;
  message: string;
} => {
  if (process.metrics.totalCandidates === 0) {
    return {
      quality: 'LOW',
      percentage: 0,
      message: 'No candidates yet'
    };
  }

  const qualityRatio = process.metrics.qualifiedCandidates / process.metrics.totalCandidates;
  const percentage = Math.round(qualityRatio * 100);

  if (qualityRatio >= 0.6) {
    return {
      quality: 'HIGH',
      percentage,
      message: 'Excellent candidate quality'
    };
  } else if (qualityRatio >= 0.3) {
    return {
      quality: 'MEDIUM',
      percentage,
      message: 'Good candidate quality'
    };
  } else {
    return {
      quality: 'LOW',
      percentage,
      message: 'Low candidate quality - consider refining requirements'
    };
  }
};

// Get recruitment health score
export const getRecruitmentHealthScore = (process: RecruitmentProcess): {
  score: number;
  status: HealthScoreStatus;
  recommendations: string[];
} => {
  let score = 0;
  const recommendations: string[] = [];

  // Publications (25 points)
  if (process.publications && process.publications.length > 0) {
    const activePublications = process.publications.filter(pub => pub.status === 'PUBLISHED');
    if (activePublications.length > 0) {
      score += 25;
    } else {
      score += 10;
      recommendations.push('Publish job postings to increase visibility');
    }
  } else {
    recommendations.push('Create job publications to start attracting candidates');
  }

  // Candidate pipeline (35 points)
  if (process.metrics.totalCandidates > 10) {
    score += 35;
  } else if (process.metrics.totalCandidates > 5) {
    score += 25;
    recommendations.push('Expand sourcing efforts to increase candidate pool');
  } else if (process.metrics.totalCandidates > 0) {
    score += 15;
    recommendations.push('Increase sourcing activities and promote job more widely');
  } else {
    recommendations.push('Start sourcing candidates immediately');
  }

  // Candidate quality (25 points)
  const qualityIndicator = getCandidateQualityIndicator(process);
  if (qualityIndicator.quality === 'HIGH') {
    score += 25;
  } else if (qualityIndicator.quality === 'MEDIUM') {
    score += 15;
    recommendations.push('Consider refining job requirements to attract better candidates');
  } else if (qualityIndicator.quality === 'LOW' && process.metrics.totalCandidates > 0) {
    score += 5;
    recommendations.push('Review and refine job requirements and sourcing strategy');
  }

  // Interview pipeline (15 points)
  if (process.metrics.interviewsScheduled > 3) {
    score += 15;
  } else if (process.metrics.interviewsScheduled > 0) {
    score += 10;
    recommendations.push('Schedule more interviews to maintain pipeline flow');
  } else if (process.metrics.qualifiedCandidates > 0) {
    score += 5;
    recommendations.push('Start scheduling interviews with qualified candidates');
  }

  // Determine status
  let status: HealthScoreStatus;
  if (score >= 80) {
    status = 'EXCELLENT';
  } else if (score >= 60) {
    status = 'GOOD';
  } else if (score >= 40) {
    status = 'WARNING';
  } else {
    status = 'CRITICAL';
  }

  return { score, status, recommendations };
};