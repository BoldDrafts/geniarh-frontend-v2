// hooks/useBulkUpload.ts
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { bulkCandidateService } from '../api/bulkCandidateService';
import {
  BulkUploadResponse,
  BulkUploadStatus,
  BulkUploadResults,
  BulkUploadOptions,
  BulkUploadSummary,
  FileValidationResult,
  CsvValidationResult
} from '../types/bulkCandidate.types';

interface UploadState {
  file: File | null;
  uploading: boolean;
  uploadResponse: BulkUploadResponse | null;
  status: BulkUploadStatus | null;
  results: BulkUploadResults | null;
  error: string | null;
  csvValidation: CsvValidationResult | null;
}

export interface ActiveUpload {
  id: string;
  fileName: string;
  uploadId: string;
  status: BulkUploadStatus;
  results?: BulkUploadResults;
  createdAt: Date;
  recruitmentId: string;
}

export const useBulkUpload = (recruitmentId: string) => {
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    uploading: false,
    uploadResponse: null,
    status: null,
    results: null,
    error: null,
    csvValidation: null
  });

  const [activeUploads, setActiveUploads] = useState<ActiveUpload[]>([]);
  const [loadingUploads, setLoadingUploads] = useState(false);
  const [uploadsFetched, setUploadsFetched] = useState(false);

  // Save active uploads to localStorage
  const saveActiveUploads = useCallback((uploads: ActiveUpload[]) => {
    try {
      localStorage.setItem('activeUploads', JSON.stringify(uploads));
    } catch (error) {
      console.error('Error saving active uploads:', error);
    }
  }, []);

  // Load active uploads from localStorage
  const loadActiveUploads = useCallback(() => {
    try {
      const saved = localStorage.getItem('activeUploads');
      if (saved) {
        const uploads: ActiveUpload[] = JSON.parse(saved);
        const currentUploads = uploads.filter(upload =>
          upload.recruitmentId === recruitmentId &&
          upload.status.status !== 'completed' &&
          upload.status.status !== 'completed_with_errors' &&
          upload.status.status !== 'failed'
        );
        setActiveUploads(currentUploads);
        return currentUploads;
      }
    } catch (error) {
      console.error('Error loading active uploads:', error);
    }
    return [];
  }, [recruitmentId]);

  // Fetch bulk uploads from API
  const fetchBulkUploads = useCallback(async (options?: {
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    if (!recruitmentId) return;

    setLoadingUploads(true);
    try {
      const response = await bulkCandidateService.listBulkUploads(recruitmentId, {
        page: options?.page || 1,
        limit: options?.limit || 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        ...(options?.status && { status: options.status as any })
      });

      // Convert BulkUploadSummary to ActiveUpload format
      const uploads: ActiveUpload[] = response.data.map((summary: BulkUploadSummary) => ({
        id: summary.uploadId,
        fileName: summary.fileName,
        uploadId: summary.uploadId,
        status: {
          status: summary.status,
          progress: {
            totalRows: summary.totalRows,
            processedRows: summary.processedRows || 0,
            successfullyProcessed: summary.successfullyProcessed || 0,
            failedToProcess: summary.failedToProcess || 0,
            percentageComplete: summary.processedRows
              ? (summary.processedRows / summary.totalRows) * 100
              : 0
          },
          currentOperation: summary.currentOperation || getOperationMessage(summary.status),
          estimatedTimeRemaining: undefined
        },
        createdAt: new Date(summary.createdAt),
        recruitmentId
      }));

      setActiveUploads(uploads);
      setUploadsFetched(true);

      // Fetch results for completed uploads that don't have results yet
      uploads.forEach(async (upload) => {
        if ((upload.status.status === 'completed' || upload.status.status === 'completed_with_errors' || upload.status.status === 'failed') && !upload.results) {
          try {
            const results = await bulkCandidateService.getUploadResults(recruitmentId, upload.uploadId);
            setActiveUploads(prev => {
              const updated = prev.map(u =>
                u.uploadId === upload.uploadId
                  ? { ...u, results }
                  : u
              );
              saveActiveUploads(updated);
              return updated;
            });
          } catch (error) {
            console.error(`Failed to fetch results for upload ${upload.uploadId}:`, error);
          }
        }
      });

      return uploads;
    } catch (error) {
      console.error('Error fetching bulk uploads:', error);
      toast.error('Failed to load bulk uploads');
      return [];
    } finally {
      setLoadingUploads(false);
    }
  }, [recruitmentId, saveActiveUploads]);

  // Helper function to get operation message based on status
  const getOperationMessage = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'Upload queued for processing...';
      case 'processing':
        return 'Processing candidates...';
      case 'completed':
        return 'Upload completed successfully';
      case 'completed_with_errors':
        return 'Upload completed with some errors';
      case 'failed':
        return 'Upload failed';
      case 'cancelled':
        return 'Upload cancelled';
      default:
        return 'Unknown status';
    }
  };

  // Track upload progress
  const trackUploadProgress = useCallback(async (uploadId: string, fileName: string) => {
    try {
      const results = await bulkCandidateService.trackProgress(recruitmentId, uploadId, (status) => {
        setActiveUploads(prev => {
          const updated = prev.map(upload =>
            upload.uploadId === uploadId
              ? { ...upload, status }
              : upload
          );
          saveActiveUploads(updated);
          return updated;
        });
      });

      setActiveUploads(prev => {
        const updated = prev.map(upload =>
          upload.uploadId === uploadId
            ? { ...upload, results, status: { ...upload.status, status: results.status } }
            : upload
        );
        saveActiveUploads(updated);
        return updated;
      });

      if (results.summary.successfullyProcessed > 0) {
        toast.success(`${fileName}: Successfully processed ${results.summary.successfullyProcessed} candidates!`);
      }
      if (results.summary.failedToProcess > 0) {
        toast.error(`${fileName}: ${results.summary.failedToProcess} candidates failed to process`);
      }

    } catch (error) {
      console.error('Error tracking upload progress:', error);
      setActiveUploads(prev => {
        const updated = prev.map(upload =>
          upload.uploadId === uploadId
            ? { ...upload, status: { ...upload.status, status: 'failed' } }
            : upload
        );
        saveActiveUploads(updated);
        return updated;
      });
    }
  }, [recruitmentId, saveActiveUploads]);

  // Add new upload to active uploads
  const addActiveUpload = useCallback((uploadResponse: BulkUploadResponse, fileName: string) => {
    const newUpload: ActiveUpload = {
      id: `${uploadResponse.uploadId}-${Date.now()}`,
      fileName,
      uploadId: uploadResponse.uploadId,
      status: {
        status: 'processing',
        progress: {
          totalRows: 0,
          processedRows: 0,
          successfullyProcessed: 0,
          failedToProcess: 0,
          percentageComplete: 0
        },
        currentOperation: 'Starting upload...',
        estimatedTimeRemaining: undefined
      },
      createdAt: new Date(),
      recruitmentId
    };

    setActiveUploads(prev => {
      const updated = [...prev, newUpload];
      saveActiveUploads(updated);
      return updated;
    });

    return newUpload;
  }, [recruitmentId, saveActiveUploads]);

  // Remove upload from active uploads
  const removeActiveUpload = useCallback((uploadId: string) => {
    setActiveUploads(prev => {
      const updated = prev.filter(upload => upload.uploadId !== uploadId);
      saveActiveUploads(updated);
      return updated;
    });
  }, [saveActiveUploads]);

  // Cancel upload
  const cancelUpload = useCallback(async (uploadId: string) => {
    try {
      await bulkCandidateService.cancelUpload(uploadId);
      removeActiveUpload(uploadId);
      toast.success('Upload cancelled successfully');
    } catch (error) {
      console.error('Error cancelling upload:', error);
      toast.error('Failed to cancel upload');
    }
  }, [removeActiveUpload]);

  // Clear completed uploads
  const clearCompletedUploads = useCallback(() => {
    setActiveUploads(prev => {
      const updated = prev.filter(u => u.status.status === 'processing');
      saveActiveUploads(updated);
      return updated;
    });
  }, [saveActiveUploads]);

  // Validate file
  const validateFile = useCallback((file: File): boolean => {
    const validation: FileValidationResult = bulkCandidateService.validateFile(file);
    
    if (!validation.isValid) {
      toast.error(validation.error || 'Invalid file');
      return false;
    }

    if (validation.warnings && validation.warnings.length > 0) {
      validation.warnings.forEach(warning => toast.warning(warning));
    }

    return true;
  }, []);

  // Validate CSV content
  const validateCsvContent = useCallback(async (file: File) => {
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      try {
        const csvValidation = await bulkCandidateService.validateCsvContent(file);
        setUploadState(prev => ({ ...prev, csvValidation }));

        if (!csvValidation.isValid) {
          toast.error(`CSV validation failed: ${csvValidation.errors.length} errors found`);
        } else if (csvValidation.warnings.length > 0) {
          toast.warning(`CSV validation completed with ${csvValidation.warnings.length} warnings`);
        } else {
          toast.success(`CSV validation passed: ${csvValidation.validRows} valid rows found`);
        }
      } catch (error) {
        console.error('CSV validation error:', error);
        toast.error('Failed to validate CSV content');
      }
    }
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    if (!validateFile(file)) return;

    setUploadState(prev => ({
      ...prev,
      file,
      error: null,
      results: null,
      status: null,
      uploadResponse: null,
      csvValidation: null
    }));

    await validateCsvContent(file);

    // Automatically trigger upload after validation
    if (!recruitmentId) {
      toast.error('Invalid recruitment ID');
      return;
    }

    // Set uploading state
    setUploadState(prev => ({ ...prev, uploading: true, error: null }));

    try {
      const options: BulkUploadOptions = {
        skipDuplicates: true,
        validateEmails: true,
        validateLinkedIn: false,
        notifyOnCompletion: true
      };

      const uploadResponse = await bulkCandidateService.startUpload(recruitmentId, file, options);

      addActiveUpload(uploadResponse, file.name);
      trackUploadProgress(uploadResponse.uploadId, file.name);

      setUploadState({
        file: null,
        uploading: false,
        uploadResponse: null,
        status: null,
        results: null,
        error: null,
        csvValidation: null
      });

      toast.success('Upload started! Track progress in Active Uploads section.');

    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadState(prev => ({
        ...prev,
        uploading: false,
        error: error.message || 'Upload failed'
      }));
      toast.error(error.message || 'Failed to process file. Please try again.');
    }
  }, [validateFile, validateCsvContent, recruitmentId, addActiveUpload, trackUploadProgress]);

  // Handle upload
  const handleUpload = useCallback(async () => {
    if (!uploadState.file || !recruitmentId) return;

    if (uploadState.csvValidation && !uploadState.csvValidation.isValid) {
      toast.error('Please fix CSV validation errors before uploading');
      return;
    }

    setUploadState(prev => ({ ...prev, uploading: true, error: null }));

    try {
      const options: BulkUploadOptions = {
        skipDuplicates: true,
        validateEmails: true,
        validateLinkedIn: false,
        notifyOnCompletion: true
      };

      const uploadResponse = await bulkCandidateService.startUpload(recruitmentId, uploadState.file, options);
      
      addActiveUpload(uploadResponse, uploadState.file.name);
      trackUploadProgress(uploadResponse.uploadId, uploadState.file.name);

      setUploadState({
        file: null,
        uploading: false,
        uploadResponse: null,
        status: null,
        results: null,
        error: null,
        csvValidation: null
      });

      toast.success('Upload started! Track progress in Active Uploads section.');

    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadState(prev => ({
        ...prev,
        uploading: false,
        error: error.message || 'Upload failed'
      }));
      toast.error(error.message || 'Failed to process file. Please try again.');
    }
  }, [uploadState.file, uploadState.csvValidation, recruitmentId, addActiveUpload, trackUploadProgress]);

  // Reset upload state
  const resetUpload = useCallback(() => {
    if (uploadState.uploadResponse?.uploadId) {
      bulkCandidateService.cancelUpload(uploadState.uploadResponse.uploadId);
    }
    
    setUploadState({
      file: null,
      uploading: false,
      uploadResponse: null,
      status: null,
      results: null,
      error: null,
      csvValidation: null
    });
  }, [uploadState.uploadResponse?.uploadId]);

  // Download template
  const downloadTemplate = useCallback(async () => {
    try {
      await bulkCandidateService.downloadTemplate({
        includeExamples: true,
        includeInstructions: true,
        format: 'csv'
      });
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Failed to download template');
    }
  }, []);

  // Fetch upload results for a completed upload
  const fetchUploadResults = useCallback(async (uploadId: string): Promise<BulkUploadResults | null> => {
    if (!recruitmentId) {
      toast.error('Invalid recruitment ID');
      return null;
    }

    try {
      const results = await bulkCandidateService.getUploadResults(recruitmentId, uploadId);

      // Update the active upload with the results
      setActiveUploads(prev => {
        const updated = prev.map(upload =>
          upload.uploadId === uploadId
            ? { ...upload, results }
            : upload
        );
        saveActiveUploads(updated);
        return updated;
      });

      return results;
    } catch (error: any) {
      console.error('Error fetching upload results:', error);
      toast.error('Failed to load upload results');
      return null;
    }
  }, [recruitmentId, saveActiveUploads]);

  // Initialize on mount - fetch uploads from API
  useEffect(() => {
    if (recruitmentId && !uploadsFetched) {
      // Fetch bulk uploads from API instead of loading from localStorage
      fetchBulkUploads();
    }
  }, [recruitmentId, uploadsFetched, fetchBulkUploads]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (uploadState.uploadResponse?.uploadId) {
        bulkCandidateService.cancelUpload(uploadState.uploadResponse.uploadId);
      }
    };
  }, [uploadState.uploadResponse?.uploadId]);

  return {
    uploadState,
    activeUploads,
    loadingUploads,
    handleFileSelect,
    handleUpload,
    resetUpload,
    downloadTemplate,
    cancelUpload,
    removeActiveUpload,
    clearCompletedUploads,
    fetchBulkUploads,
    refreshUploads: fetchBulkUploads,
    fetchUploadResults
  };
};