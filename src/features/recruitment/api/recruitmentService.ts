import { toast } from 'react-hot-toast';
import {
  RecruitmentProcess,
  RecruitmentStatus,
  RecruitmentListParams,
  Candidate,
  CandidateFilterParams,
  CandidateListResponse,
  CandidateStatusUpdateRequest,
  Publication,
  PublicationFilterParams,
  PublicationListResponse,
  Recruiter,
  RecruiterFilterParams,
  RecruiterListResponse,
  UpdateRecruitmentRequest,
  CreatePublicationRequest,
  UpdatePublicationRequest,
  AssociateCandidatesRequest,
  AssociateCandidatesResponse,
  CandidateEmailUpdateRequest,
  CandidateEmailUpdateData
} from '../types/recruitment';
import { 
  mockRecruitmentProcesses, 
  mockRecruiters, 
  mockCandidates,
  generateMockCandidate,
  generateMockPublication
} from './dummyData';

/**
 * Dummy Recruitment Service
 * Simulates API calls with mock data for development
 */
class RecruitmentService {
  private processes: RecruitmentProcess[] = [...mockRecruitmentProcesses];
  private recruiters: Recruiter[] = [...mockRecruiters];

  // Simulate API delay
  private delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ==================== Core CRUD Operations ====================

  async list(params?: RecruitmentListParams) {
    await this.delay();
    
    let filteredProcesses = [...this.processes];
    
    // Filter by status
    if (params?.status) {
      filteredProcesses = filteredProcesses.filter(p => p.status === params.status);
    }
    
    // Filter by department
    if (params?.department) {
      filteredProcesses = filteredProcesses.filter(p => 
        p.requirement.department.toLowerCase().includes(params.department!.toLowerCase())
      );
    }
    
    // Sort
    if (params?.sortBy) {
      filteredProcesses.sort((a, b) => {
        const aValue = params.sortBy === 'createdAt' ? a.createdAt : 
                      params.sortBy === 'title' ? a.requirement.title : a.updatedAt;
        const bValue = params.sortBy === 'createdAt' ? b.createdAt : 
                      params.sortBy === 'title' ? b.requirement.title : b.updatedAt;
        
        if (params.sortOrder === 'desc') {
          return bValue.localeCompare(aValue);
        }
        return aValue.localeCompare(bValue);
      });
    }
    
    // Pagination
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProcesses = filteredProcesses.slice(startIndex, endIndex);
    
    return {
      data: paginatedProcesses,
      pagination: {
        current: page,
        limit,
        total: filteredProcesses.length,
        pages: Math.ceil(filteredProcesses.length / limit),
        hasNext: endIndex < filteredProcesses.length,
        hasPrevious: page > 1
      }
    };
  }

  async get(id: string): Promise<RecruitmentProcess> {
    await this.delay();
    
    const process = this.processes.find(p => p.id === id);
    if (!process) {
      throw new Error('Recruitment process not found');
    }
    
    return process;
  }

  async create(data: any): Promise<RecruitmentProcess> {
    await this.delay(800);
    
    const newProcess: RecruitmentProcess = {
      id: `rec-proc-${Date.now()}`,
      requirement: {
        id: `req-${Date.now()}`,
        title: data.title || 'New Position',
        department: data.department || 'Technology',
        priority: data.priority || 'Medium',
        timeframe: data.urgency || '1-2 months',
        experienceLevel: data.experienceLevel || 'Mid',
        workType: data.workType || 'Remote',
        employmentType: data.employmentType || 'Full-time',
        salaryMin: parseFloat(data.salaryMin) || 5000,
        salaryMax: parseFloat(data.salaryMax) || 8000,
        salaryCurrency: data.salaryCurrency || 'PEN',
        skills: data.skills || [],
        softSkills: data.softSkills || [],
        description: data.description || 'Job description...',
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expectedStartDate: data.expectedStartDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      candidates: [],
      publications: [],
      status: 'Active',
      metrics: {
        totalCandidates: 0,
        qualifiedCandidates: 0,
        interviewsScheduled: 0,
        offersExtended: 0,
        offerAcceptanceRate: 0,
        timeToHire: 0,
        costPerHire: 0
      },
      timeline: {
        created: new Date().toISOString()
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      recruiterId: data.recruiterId || '',
      recruiterName: this.recruiters.find(r => r.id === data.recruiterId)?.name || '',
      recruiterEmail: this.recruiters.find(r => r.id === data.recruiterId)?.email || '',
      positionsCount: parseInt(data.positionsCount) || 1
    };
    
    this.processes.unshift(newProcess);
    return newProcess;
  }

  async updateRecruitmentProcess(id: string, data: UpdateRecruitmentRequest): Promise<RecruitmentProcess> {
    await this.delay();
    
    const processIndex = this.processes.findIndex(p => p.id === id);
    if (processIndex === -1) {
      throw new Error('Recruitment process not found');
    }
    
    const process = this.processes[processIndex];
    
    // Update requirement fields
    if (data.title) process.requirement.title = data.title;
    if (data.department) process.requirement.department = data.department;
    if (data.workType) process.requirement.workType = data.workType;
    if (data.employmentType) process.requirement.employmentType = data.employmentType;
    if (data.priority) process.requirement.priority = data.priority;
    if (data.expectedStartDate) process.requirement.expectedStartDate = data.expectedStartDate;
    if (data.experienceLevel) process.requirement.experienceLevel = data.experienceLevel;
    if (data.budgetMin) process.requirement.salaryMin = data.budgetMin;
    if (data.budgetMax) process.requirement.salaryMax = data.budgetMax;
    if (data.currency) process.requirement.salaryCurrency = data.currency;
    if (data.urgency) process.requirement.timeframe = data.urgency;
    if (data.technicalSkills) process.requirement.skills = data.technicalSkills;
    if (data.softSkills) process.requirement.softSkills = data.softSkills;
    if (data.description) process.requirement.description = data.description;
    if (data.recruiterId) {
      process.recruiterId = data.recruiterId;
      const recruiter = this.recruiters.find(r => r.id === data.recruiterId);
      if (recruiter) {
        process.recruiterName = recruiter.name;
        process.recruiterEmail = recruiter.email;
      }
    }
    
    process.updatedAt = new Date().toISOString();
    
    this.processes[processIndex] = process;
    return process;
  }

  async delete(id: string): Promise<void> {
    await this.delay();
    
    const processIndex = this.processes.findIndex(p => p.id === id);
    if (processIndex === -1) {
      throw new Error('Recruitment process not found');
    }
    
    this.processes.splice(processIndex, 1);
  }

  // ==================== Status Management ====================

  async setStatus(id: string, status: RecruitmentStatus, reason?: string): Promise<RecruitmentProcess> {
    await this.delay();
    
    const processIndex = this.processes.findIndex(p => p.id === id);
    if (processIndex === -1) {
      throw new Error('Recruitment process not found');
    }
    
    this.processes[processIndex].status = status;
    this.processes[processIndex].updatedAt = new Date().toISOString();
    
    return this.processes[processIndex];
  }

  // ==================== Candidates Management ====================

  async getCandidates(id: string, params?: CandidateFilterParams): Promise<CandidateListResponse> {
    await this.delay();
    
    const process = this.processes.find(p => p.id === id);
    if (!process) {
      throw new Error('Recruitment process not found');
    }
    
    let candidates = [...process.candidates];
    
    // Filter by status
    if (params?.status) {
      candidates = candidates.filter(c => c.status === params.status);
    }
    
    // Pagination
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCandidates = candidates.slice(startIndex, endIndex);
    
    return {
      data: paginatedCandidates,
      pagination: {
        current: page,
        limit,
        total: candidates.length,
        pages: Math.ceil(candidates.length / limit),
        hasNext: endIndex < candidates.length,
        hasPrevious: page > 1
      }
    };
  }

  async getCandidate(id: string, candidateId: string): Promise<Candidate> {
    await this.delay();
    
    const process = this.processes.find(p => p.id === id);
    if (!process) {
      throw new Error('Recruitment process not found');
    }
    
    const candidate = process.candidates.find(c => c.id === candidateId);
    if (!candidate) {
      throw new Error('Candidate not found');
    }
    
    return candidate;
  }

  async associateCandidates(id: string, request: AssociateCandidatesRequest): Promise<AssociateCandidatesResponse> {
    await this.delay(1000);
    
    const processIndex = this.processes.findIndex(p => p.id === id);
    if (processIndex === -1) {
      throw new Error('Recruitment process not found');
    }
    
    const newCandidate = generateMockCandidate({
      personalInfo: {
        firstName: request.profileName.split(' ')[0] || 'Nuevo',
        lastName: request.profileName.split(' ')[1] || 'Candidato',
        location: {
          city: request.profileLocation?.split(',')[0] || 'Lima',
          country: 'Peru'
        }
      },
      contact: {
        email: request.profileEmail || `${request.profileName.toLowerCase().replace(' ', '.')}@email.com`,
        linkedin: request.profileLink
      },
      profile: {
        summary: request.profileSummary || 'Candidato interesado en la posición'
      }
    });
    
    this.processes[processIndex].candidates.push(newCandidate);
    this.processes[processIndex].metrics.totalCandidates += 1;
    this.processes[processIndex].metrics.qualifiedCandidates += Math.random() > 0.5 ? 1 : 0;
    
    return {
      id: newCandidate.id,
      recruitmentCandidateId: `rc-${Date.now()}`,
      candidateNumber: `CN-${String(this.processes[processIndex].candidates.length).padStart(4, '0')}`,
      firstName: newCandidate.personalInfo.firstName,
      lastName: newCandidate.personalInfo.lastName,
      email: newCandidate.contact.email,
      position: this.processes[processIndex].requirement.title,
      department: this.processes[processIndex].requirement.department,
      summary: newCandidate.profile?.summary,
      city: newCandidate.personalInfo.location?.city,
      country: newCandidate.personalInfo.location?.country,
      linkedinUrl: newCandidate.contact.linkedin,
      statusId: 1,
      stageId: 1,
      createdAt: new Date().toISOString()
    };
  }

  async updateCandidateStatus(
    id: string,
    candidateId: string,
    request: CandidateStatusUpdateRequest
  ): Promise<Candidate> {
    await this.delay();
    
    const processIndex = this.processes.findIndex(p => p.id === id);
    if (processIndex === -1) {
      throw new Error('Recruitment process not found');
    }
    
    const candidateIndex = this.processes[processIndex].candidates.findIndex(c => c.id === candidateId);
    if (candidateIndex === -1) {
      throw new Error('Candidate not found');
    }
    
    this.processes[processIndex].candidates[candidateIndex].status = request.status;
    if (request.stage) {
      this.processes[processIndex].candidates[candidateIndex].stage = request.stage;
    }
    this.processes[processIndex].candidates[candidateIndex].updatedAt = new Date().toISOString();
    
    return this.processes[processIndex].candidates[candidateIndex];
  }

  async removeCandidate(id: string, candidateId: string): Promise<void> {
    await this.delay();
    
    const processIndex = this.processes.findIndex(p => p.id === id);
    if (processIndex === -1) {
      throw new Error('Recruitment process not found');
    }
    
    const candidateIndex = this.processes[processIndex].candidates.findIndex(c => c.id === candidateId);
    if (candidateIndex === -1) {
      throw new Error('Candidate not found');
    }
    
    this.processes[processIndex].candidates.splice(candidateIndex, 1);
    this.processes[processIndex].metrics.totalCandidates -= 1;
  }

  async updateCandidateEmail(
    id: string,
    candidateId: string,
    request: CandidateEmailUpdateRequest
  ): Promise<CandidateEmailUpdateData> {
    await this.delay();
    
    const processIndex = this.processes.findIndex(p => p.id === id);
    if (processIndex === -1) {
      throw new Error('Recruitment process not found');
    }
    
    const candidateIndex = this.processes[processIndex].candidates.findIndex(c => c.id === candidateId);
    if (candidateIndex === -1) {
      throw new Error('Candidate not found');
    }
    
    const candidate = this.processes[processIndex].candidates[candidateIndex];
    const previousEmail = candidate.contact.email;
    
    candidate.contact.email = request.email;
    candidate.updatedAt = new Date().toISOString();
    
    return {
      candidateId,
      recruitmentProcessId: id,
      email: request.email,
      previousEmail,
      updatedAt: new Date().toISOString(),
      updatedBy: 'current-user'
    };
  }

  // ==================== Recruiters Management ====================

  async getAvailableRecruiters(params?: RecruiterFilterParams): Promise<RecruiterListResponse> {
    await this.delay();
    
    let filteredRecruiters = this.recruiters.filter(r => r.isActive);
    
    // Filter by department
    if (params?.department) {
      filteredRecruiters = filteredRecruiters.filter(r => 
        r.department?.toLowerCase().includes(params.department!.toLowerCase())
      );
    }
    
    // Pagination
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRecruiters = filteredRecruiters.slice(startIndex, endIndex);
    
    return {
      data: paginatedRecruiters,
      pagination: {
        current: page,
        limit,
        total: filteredRecruiters.length,
        pages: Math.ceil(filteredRecruiters.length / limit),
        hasNext: endIndex < filteredRecruiters.length,
        hasPrevious: page > 1
      }
    };
  }

  // ==================== Publications Management ====================

  async getPublications(id: string, params?: PublicationFilterParams): Promise<PublicationListResponse> {
    await this.delay();
    
    const process = this.processes.find(p => p.id === id);
    if (!process) {
      throw new Error('Recruitment process not found');
    }
    
    let publications = [...process.publications];
    
    // Filter by status
    if (params?.status) {
      publications = publications.filter(p => p.status === params.status);
    }
    
    // Filter by platform
    if (params?.platform) {
      publications = publications.filter(p => p.platform === params.platform);
    }
    
    return {
      data: publications
    };
  }

  async createPublication(id: string, request: CreatePublicationRequest): Promise<Publication> {
    await this.delay(1200);
    
    const processIndex = this.processes.findIndex(p => p.id === id);
    if (processIndex === -1) {
      throw new Error('Recruitment process not found');
    }
    
    const newPublication = generateMockPublication({
      platform: request.platform,
      url: request.url,
      title: request.title,
      description: request.description,
      status: 'Published',
      publishedAt: new Date().toISOString(),
      views: Math.floor(Math.random() * 100) + 50,
      applications: Math.floor(Math.random() * 20) + 5
    });
    
    this.processes[processIndex].publications.push(newPublication);
    
    return newPublication;
  }

  // ==================== Convenience Methods ====================

  async createFromRequirement(requirementId: string): Promise<RecruitmentProcess> {
    // For dummy implementation, create a basic process
    return this.create({
      title: 'New Recruitment Process',
      department: 'Technology',
      requirementId
    });
  }

  async pause(id: string, reason?: string): Promise<RecruitmentProcess> {
    return this.setStatus(id, 'Paused', reason);
  }

  async resume(id: string, reason?: string): Promise<RecruitmentProcess> {
    return this.setStatus(id, 'Active', reason);
  }

  async complete(id: string, reason?: string): Promise<RecruitmentProcess> {
    return this.setStatus(id, 'Completed', reason);
  }

  async cancel(id: string, reason?: string): Promise<RecruitmentProcess> {
    return this.setStatus(id, 'Cancelled', reason);
  }
}

// Singleton instance
export const recruitmentService = new RecruitmentService();
export default recruitmentService;