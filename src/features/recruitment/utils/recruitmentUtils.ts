// utils/recruitmentUtils.ts
import { 
  RecruitmentProcess, 
  RecruitmentStatus, 
  RecruitmentStage 
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
    case 'Active': return 'bg-green-100 text-green-800';
    case 'Paused': return 'bg-yellow-100 text-yellow-800';
    case 'Completed': return 'bg-blue-100 text-blue-800';
    case 'Cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Get status icon component
export const getStatusIconName = (status: RecruitmentStatus): string => {
  switch (status) {
    case 'Active': return 'CheckCircle';
    case 'Paused': return 'Clock';
    case 'Completed': return 'CheckCircle';
    case 'Cancelled': return 'AlertCircle';
    default: return 'Clock';
  }
};

// Get platform color
export const getPlatformColor = (platform: string): string => {
  switch (platform) {
    case 'LinkedIn': return 'bg-blue-100 text-blue-800';
    case 'Computrabajo': return 'bg-green-100 text-green-800';
    case 'Indeed': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Get publication status color
export const getPublicationStatusColor = (status: string): string => {
  switch (status) {
    case 'Published': return 'bg-green-100 text-green-800';
    case 'Draft': return 'bg-yellow-100 text-yellow-800';
    case 'Suspended': return 'bg-red-100 text-red-800';
    case 'Expired': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Generate dynamic stages based on recruitment process state
export const getRecruitmentStages = (process: RecruitmentProcess): RecruitmentStage[] => {
  const hasPublications = process.publications && process.publications.length > 0;
  const hasActivePublications = hasPublications && process.publications.some(pub => pub.status === 'Published');
  const hasCandidates = process.metrics.totalCandidates > 0;
  const hasInterviews = process.metrics.interviewsScheduled > 0;
  const hasOffers = process.metrics.offersExtended > 0;
  const isCompleted = process.status === 'Completed';
  const isCancelled = process.status === 'Cancelled';

  const stages: RecruitmentStage[] = [
    {
      name: 'Created',
      status: 'complete',
      description: 'Recruitment process created'
    },
    {
      name: 'Published',
      status: hasActivePublications ? 'complete' : 
              hasPublications ? 'current' : 'upcoming',
      description: hasActivePublications ? 'Job posted on platforms' : 
                  hasPublications ? 'Preparing publications' : 'Ready to publish'
    },
    {
      name: 'Sourcing',
      status: hasCandidates ? 'complete' :
              hasActivePublications ? 'current' : 'upcoming',
      description: hasCandidates ? `${process.metrics.totalCandidates} candidates sourced` :
                  hasActivePublications ? 'Actively sourcing candidates' : 'Awaiting publication'
    },
    {
      name: 'Screening',
      status: hasInterviews ? 'complete' :
              hasCandidates ? 'current' : 'upcoming',
      description: hasInterviews ? `${process.metrics.interviewsScheduled} interviews scheduled` :
                  hasCandidates ? `Screening ${process.metrics.qualifiedCandidates} qualified candidates` : 'No candidates yet'
    },
    {
      name: 'Interviews',
      status: hasOffers ? 'complete' :
              hasInterviews ? 'current' : 'upcoming',
      description: hasOffers ? `${process.metrics.offersExtended} offers extended` :
                  hasInterviews ? 'Conducting interviews' : 'Pending interviews'
    },
    {
      name: 'Short List',
      status: hasOffers ? 'complete' :
              hasInterviews ? 'current' : 'upcoming',
      description: hasOffers ? `${process.metrics.offersExtended} offers extended` :
                  hasInterviews ? 'Conducting interviews' : 'Pending interviews'
    },
    {
      name: 'Hiring',
      status: isCompleted ? 'complete' :
              isCancelled ? 'cancelled' :
              hasOffers ? 'current' : 'upcoming',
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
  const completedStages = stages.filter(stage => stage.status === 'complete').length;
  return Math.round((completedStages / stages.length) * 100);
};

// Get priority color
export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'High': 
    case 'Urgent': 
      return 'bg-red-100 text-red-800';
    case 'Medium': 
      return 'bg-yellow-100 text-yellow-800';
    case 'Low': 
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
  quality: 'high' | 'medium' | 'low';
  percentage: number;
  message: string;
} => {
  if (process.metrics.totalCandidates === 0) {
    return {
      quality: 'low',
      percentage: 0,
      message: 'No candidates yet'
    };
  }

  const qualityRatio = process.metrics.qualifiedCandidates / process.metrics.totalCandidates;
  const percentage = Math.round(qualityRatio * 100);

  if (qualityRatio >= 0.6) {
    return {
      quality: 'high',
      percentage,
      message: 'Excellent candidate quality'
    };
  } else if (qualityRatio >= 0.3) {
    return {
      quality: 'medium',
      percentage,
      message: 'Good candidate quality'
    };
  } else {
    return {
      quality: 'low',
      percentage,
      message: 'Low candidate quality - consider refining requirements'
    };
  }
};

// Get recruitment health score
export const getRecruitmentHealthScore = (process: RecruitmentProcess): {
  score: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  recommendations: string[];
} => {
  let score = 0;
  const recommendations: string[] = [];

  // Publications (25 points)
  if (process.publications && process.publications.length > 0) {
    const activePublications = process.publications.filter(pub => pub.status === 'Published');
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
  if (qualityIndicator.quality === 'high') {
    score += 25;
  } else if (qualityIndicator.quality === 'medium') {
    score += 15;
    recommendations.push('Consider refining job requirements to attract better candidates');
  } else if (qualityIndicator.quality === 'low' && process.metrics.totalCandidates > 0) {
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
  let status: 'excellent' | 'good' | 'warning' | 'critical';
  if (score >= 80) {
    status = 'excellent';
  } else if (score >= 60) {
    status = 'good';
  } else if (score >= 40) {
    status = 'warning';
  } else {
    status = 'critical';
  }

  return { score, status, recommendations };
};