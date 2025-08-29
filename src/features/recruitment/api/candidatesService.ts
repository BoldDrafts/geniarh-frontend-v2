import { toast } from 'react-hot-toast';
import { Candidate } from '../types/recruitment';
import { mockCandidates, generateMockCandidate } from './dummyData';

interface CandidateListParams {
  page?: number;
  limit?: number;
  department?: string;
  position?: string;
  status?: string;
  skills?: string;
  minMatchScore?: number;
}

interface CandidateListResponse {
  data: Candidate[];
  pagination: {
    current: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

/**
 * Dummy Candidates Service
 * Simulates API calls for candidate management
 */
class CandidatesService {
  private candidates: Candidate[] = [...mockCandidates];

  // Simulate API delay
  private delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async list(params?: CandidateListParams): Promise<CandidateListResponse> {
    await this.delay();
    
    let filteredCandidates = [...this.candidates];
    
    // Filter by department
    if (params?.department) {
      filteredCandidates = filteredCandidates.filter(c => 
        c.profile?.experience?.[0]?.company?.toLowerCase().includes(params.department!.toLowerCase())
      );
    }
    
    // Filter by position
    if (params?.position) {
      filteredCandidates = filteredCandidates.filter(c => 
        c.profile?.experience?.[0]?.position?.toLowerCase().includes(params.position!.toLowerCase())
      );
    }
    
    // Filter by status
    if (params?.status) {
      filteredCandidates = filteredCandidates.filter(c => c.status === params.status);
    }
    
    // Filter by skills
    if (params?.skills) {
      const skillsArray = params.skills.toLowerCase().split(',').map(s => s.trim());
      filteredCandidates = filteredCandidates.filter(c => 
        c.profile?.skills?.some(skill => 
          skillsArray.some(searchSkill => 
            skill.name.toLowerCase().includes(searchSkill)
          )
        )
      );
    }
    
    // Filter by minimum match score
    if (params?.minMatchScore) {
      filteredCandidates = filteredCandidates.filter(c => 
        (c.assessment?.matchScore || 0) >= params.minMatchScore!
      );
    }
    
    // Pagination
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCandidates = filteredCandidates.slice(startIndex, endIndex);
    
    return {
      data: paginatedCandidates,
      pagination: {
        current: page,
        limit,
        total: filteredCandidates.length,
        pages: Math.ceil(filteredCandidates.length / limit),
        hasNext: endIndex < filteredCandidates.length,
        hasPrevious: page > 1
      }
    };
  }

  async get(id: string): Promise<Candidate> {
    await this.delay();
    
    const candidate = this.candidates.find(c => c.id === id);
    if (!candidate) {
      throw new Error('Candidate not found');
    }
    
    return candidate;
  }

  async create(data: Partial<Candidate>): Promise<Candidate> {
    await this.delay(800);
    
    const newCandidate = generateMockCandidate(data);
    this.candidates.push(newCandidate);
    
    return newCandidate;
  }

  async update(id: string, data: Partial<Candidate>): Promise<Candidate> {
    await this.delay();
    
    const candidateIndex = this.candidates.findIndex(c => c.id === id);
    if (candidateIndex === -1) {
      throw new Error('Candidate not found');
    }
    
    this.candidates[candidateIndex] = {
      ...this.candidates[candidateIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    return this.candidates[candidateIndex];
  }

  async delete(id: string): Promise<void> {
    await this.delay();
    
    const candidateIndex = this.candidates.findIndex(c => c.id === id);
    if (candidateIndex === -1) {
      throw new Error('Candidate not found');
    }
    
    this.candidates.splice(candidateIndex, 1);
  }
}

// Singleton instance
export const candidatesService = new CandidatesService();
export default candidatesService;