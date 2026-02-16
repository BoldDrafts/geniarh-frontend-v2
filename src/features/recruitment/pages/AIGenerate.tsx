import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, Clock, Plus, Send, AlertCircle, CheckCircle, XCircle, RefreshCw, ChevronRight, Wand2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// Hooks
import { useAIGeneration } from '../hooks/useAIGeneration';

// Services
import { AIGenerateRequest } from '../api/aiGenerateService';

// Types
import { RecruitmentProcess } from '../types/recruitment';
import { recruitmentService } from '../api/recruitmentService';

type ViewMode = 'create' | 'monitor';

const AIGeneratePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // State management
  const [viewMode, setViewMode] = useState<ViewMode>('create');
  const [prompt, setPrompt] = useState('');
  const [priority, setPriority] = useState<AIGenerateRequest['priority']>('medium');
  const [recruitment, setRecruitment] = useState<RecruitmentProcess | null>(null);
  const [loadingRecruitment, setLoadingRecruitment] = useState(false);
  const [generatingPrompt, setGeneratingPrompt] = useState(false);

  // Custom hook
  const {
    prompts,
    aiGenerations,
    loading,
    submitting,
    error,
    createPrompt,
    fetchPrompts,
    fetchAIGenerations,
    refreshPrompts,
    clearError,
    generateJobPrompt
  } = useAIGeneration(id || '');

  // Fetch recruitment process data
  useEffect(() => {
    const fetchRecruitmentProcess = async () => {
      if (!id) return;
      
      try {
        setLoadingRecruitment(true);
        const process = await recruitmentService.get(id);
        if (process) {
          setRecruitment(process);
        }
      } catch (error) {
        console.error('Error fetching recruitment process:', error);
        toast.error('Failed to load recruitment process');
        navigate('/recruitment');
      } finally {
        setLoadingRecruitment(false);
      }
    };

    fetchRecruitmentProcess();
  }, [id, navigate]);

  // Initial data load
  useEffect(() => {
    if (id) {
      fetchPrompts(id);
      fetchAIGenerations(id);
    }
  }, [id, fetchPrompts, fetchAIGenerations]);

  // Event handlers
  const handleGeneratePrompt = async () => {
    if (!recruitment) {
      toast.error('Recruitment data not loaded');
      return;
    }

    try {
      setGeneratingPrompt(true);
      
      const promptData = {
        jobTitle: recruitment.requirement.title,
        department: recruitment.requirement.department,
        workType: recruitment.requirement.workType,
        description: recruitment.requirement.description,
        skills: recruitment.requirement.skills || [],
        experienceLevel: recruitment.requirement.experienceLevel || 'mid'
      };

      const generatedPrompt = await generateJobPrompt(promptData);
      
      // Set the generated prompt in the form
      setPrompt(generatedPrompt);
      toast.success('Prompt generated successfully using AI');
    } catch (error) {
      console.error('Error generating prompt:', error);
    } finally {
      setGeneratingPrompt(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    if (!id) {
      toast.error('Invalid recruitment process ID');
      return;
    }

    try {
      await createPrompt({
        customPrompt: prompt.trim(),
        count: 10,
        experienceLevel: recruitment?.requirement.experienceLevel!,
        skills: recruitment?.requirement.skills!
      });

      // Reset form and switch to monitor view
      setPrompt('');
      setPriority('medium');
      setViewMode('monitor');
    } catch (error) {
      console.error('Error creating prompt:', error);
    }
  };

  const getAIGenerationStatusIcon = (status: import('../types/aiGeneration.types').AIGenerationStatusEnum) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'generating':
      case 'validating':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAIGenerationStatusColor = (status: import('../types/aiGeneration.types').AIGenerationStatusEnum) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'generating':
      case 'validating':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Early return for invalid ID
  if (!id) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-10">
          <p className="text-gray-500">Invalid recruitment process ID</p>
          <button
            onClick={() => navigate('/recruitment')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Back to Recruitment
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loadingRecruitment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Error state
  if (!recruitment) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-10">
          <p className="text-gray-500">Recruitment process not found</p>
          <button
            onClick={() => navigate('/recruitment')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Back to Recruitment
          </button>
        </div>
      </div>
    );
  }

  const MAX_LENGTH_PROMPT = 900;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(`/recruitment/${id}/candidates`)}
          className="mr-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Sparkles className="h-6 w-6 mr-2 text-purple-600" />
            AI Candidate Generation
          </h1>
          <p className="text-gray-500 mt-1">
            {recruitment.requirement.title} · {recruitment.requirement.department}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setViewMode('create')}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                viewMode === 'create'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Create Prompt
              </div>
            </button>
            
            <button
              onClick={() => setViewMode('monitor')}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                viewMode === 'monitor'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Monitor Prompts
                {(prompts.length > 0 || aiGenerations.data.length > 0) && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-purple-600 rounded-full">
                    {prompts.length + aiGenerations.data.length}
                  </span>
                )}
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {viewMode === 'create' && (
        <div className="space-y-6">
          {/* Quick Access Banner */}
          {(prompts.length > 0 || aiGenerations.data.length > 0) && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-purple-600 mr-2" />
                  <div>
                    <div className="font-medium text-purple-900">
                      {prompts.length + aiGenerations.data.length} AI generation{prompts.length + aiGenerations.data.length !== 1 ? 's' : ''} in queue
                    </div>
                    <div className="text-sm text-purple-700">
                      {prompts.filter(p => p.status === 'processing').length + aiGenerations.data.filter(g => g.status === 'generating').length} currently processing
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setViewMode('monitor')}
                  className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                >
                  View Details →
                </button>
              </div>
            </div>
          )}

          {/* Create Prompt Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Generate Candidates with AI</h2>
                <p className="text-gray-600">
                  Describe the type of candidates you're looking for and our AI will generate potential matches.
                </p>
              </div>

              {/* Prompt Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
                    Candidate Description Prompt
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePrompt}
                    disabled={generatingPrompt || !recruitment}
                    className="flex items-center px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generatingPrompt ? (
                      <>
                        <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-1 h-3 w-3" />
                        AI Generate
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={6}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Example: I'm looking for senior software engineers with 5+ years of experience in React, Node.js, and cloud technologies. They should have experience with microservices, be familiar with Agile methodologies, and have strong communication skills. Ideal candidates would have worked in fast-paced startup environments and be comfortable with full-stack development..."
                />
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Be specific about skills, experience level, and qualifications you're looking for.
                  </p>
                  <span className={`text-xs ${prompt.length > MAX_LENGTH_PROMPT ? 'text-red-600' : 'text-gray-500'}`}>
                    {prompt.length}/{MAX_LENGTH_PROMPT}
                  </span>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setPrompt('');
                    setPriority('medium');
                    clearError();
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={submitting || !prompt.trim() || prompt.length > MAX_LENGTH_PROMPT}
                  className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Generate Candidates
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Help Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tips for Better Results</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-medium text-purple-600 mr-3">
                  1
                </div>
                <p className="text-sm text-gray-600">
                  <strong>Be specific:</strong> Include exact technologies, years of experience, and required qualifications.
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-medium text-purple-600 mr-3">
                  2
                </div>
                <p className="text-sm text-gray-600">
                  <strong>Mention soft skills:</strong> Include communication style, teamwork preferences, and leadership qualities.
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-medium text-purple-600 mr-3">
                  3
                </div>
                <p className="text-sm text-gray-600">
                  <strong>Context matters:</strong> Describe your company culture, team size, and project types.
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-medium text-purple-600 mr-3">
                  4
                </div>
                <p className="text-sm text-gray-600">
                  <strong>Set appropriate priority:</strong> Use high priority for urgent positions, medium for regular hiring, and low for exploratory searches.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'monitor' && (
        <div className="space-y-6">
          {/* Loading State */}
          {loading && prompts.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading prompts...</h3>
              <p className="text-gray-500">Please wait while we fetch your AI prompts.</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && prompts.length === 0 && aiGenerations.data.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No prompts found</h3>
              <p className="text-gray-500 mb-4">
                You haven't created any AI generation prompts yet.
              </p>
              <button
                onClick={() => setViewMode('create')}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Prompt
              </button>
            </div>
          )}

          {/* Prompts List */}
          {(prompts.length > 0 || aiGenerations.data.length > 0) && (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-500">Total Generations</div>
                      <div className="text-2xl font-bold text-gray-900">{prompts.length + aiGenerations.data.length}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-500">Processing</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {prompts.filter(p => p.status === 'processing').length + aiGenerations.data.filter(g => g.status === 'generating' || g.status === 'validating').length}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-500">Completed</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {prompts.filter(p => p.status === 'completed').length + aiGenerations.data.filter(g => g.status === 'completed').length}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <XCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-500">Failed</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {prompts.filter(p => p.status === 'failed').length + aiGenerations.data.filter(g => g.status === 'failed' || g.status === 'cancelled').length}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Generations List */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">AI Generation History</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        refreshPrompts(id);
                        fetchAIGenerations(id);
                      }}
                      disabled={loading}
                      className="text-sm text-gray-600 hover:text-gray-800 font-medium px-3 py-1 rounded border border-gray-300 hover:border-gray-400 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                    <button
                      onClick={() => setViewMode('create')}
                      className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                    >
                      + New Prompt
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {aiGenerations.data.map((generation) => (
                      <div
                        key={generation.generationId}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center mb-2">
                              {getAIGenerationStatusIcon(generation.status)}
                              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getAIGenerationStatusColor(generation.status)}`}>
                                {generation.status.charAt(0).toUpperCase() + generation.status.slice(1)}
                              </span>
                            </div>
                            
                            <div className="text-sm text-gray-900 mb-2">
                              <div className="font-medium">Generation ID: {generation.generationId}</div>
                              <div className="text-gray-600">
                                Requested: {generation.requestedCount} candidates · Generated: {generation.generatedCount} candidates
                              </div>
                            </div>
                            
                            <div className="flex items-center text-xs text-gray-500 space-x-4">
                              <span>Created: {new Date(generation.createdAt).toLocaleString()}</span>
                              {generation.completedAt && (
                                <span>Completed: {new Date(generation.completedAt).toLocaleString()}</span>
                              )}
                              {generation.processingTime && (
                                <span>Duration: {(generation.processingTime / 1000).toFixed(1)}s</span>
                              )}
                            </div>

                            {generation.currentOperation && (
                              <div className="mt-2 text-xs text-blue-600">
                                {generation.currentOperation}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
      )}
    </div>
  );
};

export default AIGeneratePage;