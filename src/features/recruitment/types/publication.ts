// types/publication.ts - Tipos relacionados con publicaciones

import { PublicationPlatform, PublicationStatus } from './base';
import { BulkOperationResult } from './shared';

// ==================== INTERFACE PRINCIPAL DE PUBLICACIÓN ====================

export interface Publication {
  id: string;
  description?: string;
  title?: string;
  platform: PublicationPlatform;
  url: string;
  status: PublicationStatus;
  publishedAt?: string;
  expiresAt?: string;
  views: number;
  applications: number;
  engagement: PublicationEngagement;
  platformJobId?: string;
  autoRenewal?: boolean;
  budgetAllocated?: number;
}

// ==================== INTERFACES DE ENGAGEMENT ====================

export interface PublicationEngagement {
  likes: number;
  shares: number;
  clicks: number;
  comments: number;
}

// ==================== INTERFACES DE REQUEST/RESPONSE ====================

export interface CreatePublicationRequest {
  platform: PublicationPlatform;
  platformJobId?: string;
  url: string;
  title?: string;
  description?: string;
  publishedAt?: string;
  expiresAt?: string;
  autoRenewal?: boolean;
}

export interface UpdatePublicationRequest {
  platformJobId?: string;
  url?: string;
  title?: string;
  description?: string;
  status?: PublicationStatus;
  publishedAt?: string;
  expiresAt?: string;
  autoRenewal?: boolean;
  budgetAllocated?: number;
  views?: number;
  applications?: number;
  likes?: number;
  shares?: number;
  clicks?: number;
  comments?: number;
}

export interface PublicationListResponse {
  data: Publication[];
}

// ==================== INTERFACES DE FILTROS ====================

export interface PublicationFilterParams {
  status?: PublicationStatus;
  platform?: PublicationPlatform;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'publishedAt' | 'views' | 'applications';
  sortOrder?: 'asc' | 'desc';
}

// ==================== INTERFACES DE OPERACIONES EN LOTE ====================

export interface PublicationBulkUpdateResult extends BulkOperationResult<Publication> {
  publicationId: string;
}

export interface PublicationBulkUpdateRequest {
  publicationId: string;
  views?: number;
  applications?: number;
  likes?: number;
  shares?: number;
  clicks?: number;
  comments?: number;
}

// ==================== INTERFACES DE ERRORES ESPECÍFICOS ====================

export interface PublicationError {
  publicationId: string;
  platform: PublicationPlatform;
  reason: string;
  details?: any;
}

// ==================== INTERFACES DE MÉTRICAS Y ANALYTICS ====================

export interface PublicationMetrics {
  totalPublications: number;
  activePublications: number;
  totalViews: number;
  totalApplications: number;
  averageEngagement: number;
  platformBreakdown: Record<PublicationPlatform, {
    count: number;
    views: number;
    applications: number;
    engagement: PublicationEngagement;
  }>;
  performanceByPlatform: Record<PublicationPlatform, {
    conversionRate: number;
    costPerApplication: number;
    averageViews: number;
  }>;
}

// ==================== INTERFACES DE CONFIGURACIÓN ====================

export interface PublicationSettings {
  autoExpiry: boolean;
  defaultExpiryDays: number;
  allowedPlatforms: PublicationPlatform[];
  defaultBudget: number;
  autoRenewal: boolean;
  engagementTracking: boolean;
}

// ==================== INTERFACES DE TEMPLATES ====================

export interface PublicationTemplate {
  id: string;
  name: string;
  platform: PublicationPlatform;
  title: string;
  description: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}