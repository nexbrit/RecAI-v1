'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Upload,
  Loader2,
  CheckCircle,
  Eye,
  Zap,
  XCircle,
  Briefcase,
  TrendingUp,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ParsedCV {
  candidate?: { fullName?: string; totalYearsExperience?: number };
  skills?: Array<{ name: string; normalizedName?: string; yearsExperience?: number }>;
}

interface Evaluation {
  id: string;
  overall_score: number;
  recommendation: string;
  evaluation_type: string;
  summary?: string;
}

interface Application {
  id: string;
  status: string;
  candidate: { id: string; full_name: string };
  cv: { id: string; file_name: string; parsed_data: ParsedCV };
  evaluations: Evaluation[];
  created_at: string;
}

interface Position {
  id: string;
  title: string;
  client: { name: string } | null;
}

const PIPELINE_STAGES = [
  { id: 'new', label: 'New', color: 'stage-new' },
  { id: 'l1_review', label: 'L1 Review', color: 'stage-review' },
  { id: 'l1_pass', label: 'L1 Pass', color: 'stage-pass' },
  { id: 'l2_review', label: 'L2 Review', color: 'stage-review' },
  { id: 'l2_pass', label: 'L2 Pass', color: 'stage-pass' },
  { id: 'submitted_to_client', label: 'Submitted', color: 'stage-interview' },
  { id: 'interview', label: 'Interview', color: 'stage-interview' },
  { id: 'offer', label: 'Offer', color: 'stage-offer' },
];

export default function PipelinePage() {
  const params = useParams();
  const [position, setPosition] = useState<Position | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [processingCV, setProcessingCV] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());

  const supabase = createClient();
  const positionId = params.id as string;

  const fetchData = useCallback(async () => {
    const { data: posData } = await supabase
      .from('positions')
      .select('id, title, client:clients(name)')
      .eq('id', positionId)
      .single();

    if (posData) {
      const mappedPosition = {
        ...posData,
        client: Array.isArray(posData.client) ? posData.client[0] : posData.client
      };
      setPosition(mappedPosition as Position);
    }

    const { data: appData } = await supabase
      .from('applications')
      .select(`
        id,
        status,
        created_at,
        candidate:candidates(id, full_name),
        cv:cvs(id, file_name, parsed_data),
        evaluations:evaluations(id, overall_score, recommendation, evaluation_type, summary)
      `)
      .eq('position_id', positionId)
      .order('created_at', { ascending: false });

    if (appData) setApplications(appData as any);
    setLoading(false);
  }, [positionId, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setProcessingCV(true);

    const uploadPromise = (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const uploadedCount = files.length;

      for (const file of Array.from(files)) {
        const filePath = `${positionId}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('cvs')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const candidateName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        const { data: candidate, error: candidateError } = await supabase
          .from('candidates')
          .insert({ full_name: candidateName })
          .select()
          .single();

        if (candidateError) throw candidateError;

        const { data: cv, error: cvError } = await supabase
          .from('cvs')
          .insert({
            candidate_id: candidate.id,
            file_path: filePath,
            file_name: file.name,
            uploaded_by: user.id,
          })
          .select()
          .single();

        if (cvError) throw cvError;

        const { error: appError } = await supabase
          .from('applications')
          .insert({
            position_id: positionId,
            cv_id: cv.id,
            candidate_id: candidate.id,
            source: 'upload',
            submitted_by: user.id,
          });

        if (appError) throw appError;

        // Auto-process CV
        try {
          await fetch('/api/cv/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cvId: cv.id }),
          });
        } catch (processError) {
          console.error('CV processing error:', processError);
        }
      }

      fetchData();
      return uploadedCount;
    })();

    toast.promise(uploadPromise, {
      loading: `Uploading ${files.length} CV(s)...`,
      success: (count) => `${count} CV(s) uploaded and processing!`,
      error: 'Failed to upload CVs',
    });

    try {
      await uploadPromise;
    } finally {
      setUploading(false);
      setProcessingCV(false);
    }
  };

  const handleBulkEvaluate = useCallback(async () => {
    if (selectedCandidates.size === 0) return;

    setEvaluating(true);
    const evaluatePromise = (async () => {
      const response = await fetch('/api/applications/batch-evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationIds: Array.from(selectedCandidates) }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      fetchData();
      setSelectedCandidates(new Set());
      return result.data.successful;
    })();

    toast.promise(evaluatePromise, {
      loading: `Evaluating ${selectedCandidates.size} candidate(s)...`,
      success: (count) => `${count} candidate(s) evaluated successfully!`,
      error: 'Evaluation failed',
    });

    try {
      await evaluatePromise;
    } finally {
      setEvaluating(false);
    }
  }, [selectedCandidates, fetchData]);

  const handleBulkReject = useCallback(async () => {
    if (selectedCandidates.size === 0) return;

    const rejectPromise = (async () => {
      const candidateCount = selectedCandidates.size;
      for (const appId of Array.from(selectedCandidates)) {
        await supabase
          .from('applications')
          .update({ status: 'l1_fail' })
          .eq('id', appId);
      }
      fetchData();
      setSelectedCandidates(new Set());
      return candidateCount;
    })();

    toast.promise(rejectPromise, {
      loading: 'Rejecting candidates...',
      success: (count) => `${count} candidate(s) rejected`,
      error: 'Failed to reject candidates',
    });

    await rejectPromise;
  }, [selectedCandidates, supabase, fetchData]);

  const toggleSelection = (appId: string) => {
    const newSelection = new Set(selectedCandidates);
    if (newSelection.has(appId)) {
      newSelection.delete(appId);
    } else {
      newSelection.add(appId);
    }
    setSelectedCandidates(newSelection);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // Don't process shortcuts if typing (Cmd+K is handled by CommandPalette component)
      if (isTyping) return;

      // E: Evaluate selected
      if (e.key === 'e' && selectedCandidates.size > 0) {
        e.preventDefault();
        handleBulkEvaluate();
      }

      // R: Reject selected
      if (e.key === 'r' && selectedCandidates.size > 0) {
        e.preventDefault();
        handleBulkReject();
      }

      // Escape: Clear selection
      if (e.key === 'Escape') {
        setSelectedCandidates(new Set());
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedCandidates, handleBulkEvaluate, handleBulkReject]);

  const getScoreBadgeClass = (score: number) => {
    if (score >= 8) return 'score-excellent';
    if (score >= 6) return 'score-good';
    if (score >= 4) return 'score-fair';
    return 'score-poor';
  };

  // Memoize applications by stage for performance
  const applicationsByStage = useMemo(() => {
    return PIPELINE_STAGES.reduce((acc, stage) => {
      acc[stage.id] = applications.filter((app) => app.status === stage.id);
      return acc;
    }, {} as Record<string, Application[]>);
  }, [applications]);

  const getApplicationsByStage = (stageId: string) => {
    return applicationsByStage[stageId] || [];
  };

  const getLatestEvaluation = (app: Application) => {
    if (!app.evaluations || app.evaluations.length === 0) return null;
    return app.evaluations[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/positions/${positionId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Pipeline - {position?.title}</h1>
            <p className="text-muted-foreground">
              {position?.client?.name || 'No client'} | {applications.length} candidates
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {getApplicationsByStage('new').length > 0 && (
            <Button
              variant="secondary"
              onClick={handleBulkEvaluate}
              disabled={evaluating}
              loading={evaluating}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Evaluate All ({getApplicationsByStage('new').length})
            </Button>
          )}
          <Input
            type="file"
            accept=".pdf,.doc,.docx"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            id="cv-upload"
            disabled={uploading}
          />
          <label htmlFor="cv-upload">
            <Button
              disabled={uploading || processingCV}
              loading={uploading || processingCV}
              loadingText="Processing CVs..."
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload CVs
            </Button>
          </label>
        </div>
      </div>

      {/* Pipeline Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {PIPELINE_STAGES.map((stage) => {
          const stageApps = getApplicationsByStage(stage.id);
          return (
            <div
              key={stage.id}
              className={cn("flex-shrink-0 w-80 rounded-xl", stage.color)}
            >
              <div className="p-4 border-b bg-card/50 backdrop-blur-sm rounded-t-xl">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{stage.label}</h3>
                  <Badge variant="secondary" className="font-bold">{stageApps.length}</Badge>
                </div>
              </div>
              <div className="p-3 space-y-3 min-h-[400px]">
                {stageApps.map((app) => {
                  const evaluation = getLatestEvaluation(app);
                  const parsedCV = app.cv?.parsed_data;
                  const isSelected = selectedCandidates.has(app.id);

                  return (
                    <Card
                      key={app.id}
                      elevation="md"
                      interactive
                      className={cn(
                        "group relative animate-slide-up",
                        "bg-gradient-to-br from-background to-muted/20",
                        isSelected && "ring-2 ring-primary border-primary shadow-elevation-lg"
                      )}
                      onClick={() => {}}
                    >
                      <CardContent className="p-4">
                        {/* Quick Select Checkbox */}
                        <div className={cn(
                          "absolute top-3 left-3 transition-opacity z-10",
                          "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                        )}>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSelection(app.id)}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Select ${app.candidate?.full_name}`}
                          />
                        </div>

                        {/* Score Badge - Prominent */}
                        {evaluation && (
                          <div className={cn(
                            "absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full",
                            "text-xs font-bold shadow-md",
                            getScoreBadgeClass(evaluation.overall_score)
                          )}
                          aria-label={`Match score: ${evaluation.overall_score} out of 10`}>
                            <TrendingUp className="h-3 w-3" aria-hidden="true" />
                            {evaluation.overall_score}/10
                            <span className="sr-only">Match score: {evaluation.overall_score} out of 10</span>
                          </div>
                        )}

                        {/* Candidate Info */}
                        <div className="mt-2">
                          <h4 className="font-semibold text-sm mb-2 pr-16 truncate" title={app.candidate?.full_name}>
                            {app.candidate?.full_name}
                          </h4>

                          {/* Key Skills Preview */}
                          {parsedCV?.skills && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {parsedCV.skills.slice(0, 3).map((skill, i: number) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {skill.name || skill.normalizedName}
                                </Badge>
                              ))}
                              {parsedCV.skills.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{parsedCV.skills.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* Quick Stats */}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              {parsedCV?.candidate?.totalYearsExperience || '?'} yrs
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                            </span>
                          </div>

                          {/* AI Insights Preview */}
                          {evaluation?.summary && (
                            <p className="mt-2 text-xs text-muted-foreground line-clamp-2 italic">
                              &ldquo;{evaluation.summary}&rdquo;
                            </p>
                          )}
                        </div>

                        {/* Quick Actions Bar */}
                        <div className="mt-3 pt-3 border-t flex items-center justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.info('Quick preview coming soon!');
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>

                          <Link href={`/evaluate?application=${app.id}`}>
                            <Button variant="ghost" size="sm">
                              Evaluate
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {stageApps.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground text-sm">
                    <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    No candidates
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Bulk Action Toolbar */}
      {selectedCandidates.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <Card elevation="lg" className="shadow-2xl border-primary/50">
            <CardContent className="p-4 flex items-center gap-4">
              <span className="text-sm font-semibold">
                {selectedCandidates.size} selected
              </span>
              <Separator orientation="vertical" className="h-6" />
              <Button
                size="sm"
                variant="default"
                onClick={handleBulkEvaluate}
                disabled={evaluating}
              >
                <Zap className="h-4 w-4 mr-2" />
                Evaluate All
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleBulkReject}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedCandidates(new Set())}
              >
                Clear
              </Button>
              <div className="text-xs text-muted-foreground ml-2">
                Press ESC to clear
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Failed Applications */}
      {applications.filter((a) => ['l1_fail', 'l2_fail', 'rejected'].includes(a.status)).length > 0 && (
        <Card className="stage-rejected">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 text-lg">Rejected / Failed</h3>
            <div className="space-y-2">
              {applications
                .filter((a) => ['l1_fail', 'l2_fail', 'rejected'].includes(a.status))
                .map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-3 bg-background border rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">{app.candidate?.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {app.cv?.file_name}
                      </p>
                    </div>
                    <Badge variant="destructive">{app.status.replace('_', ' ')}</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
