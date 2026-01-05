'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Upload,
  Loader2,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

interface Application {
  id: string;
  status: string;
  candidate: { id: string; full_name: string };
  cv: { id: string; file_name: string };
  evaluations: any[];
  created_at: string;
}

interface Position {
  id: string;
  title: string;
  client: { name: string } | null;
}

const PIPELINE_STAGES = [
  { id: 'new', label: 'New', color: 'bg-gray-100' },
  { id: 'l1_review', label: 'L1 Review', color: 'bg-blue-100' },
  { id: 'l1_pass', label: 'L1 Pass', color: 'bg-green-100' },
  { id: 'l2_review', label: 'L2 Review', color: 'bg-yellow-100' },
  { id: 'l2_pass', label: 'L2 Pass', color: 'bg-green-200' },
  { id: 'submitted_to_client', label: 'Submitted', color: 'bg-purple-100' },
  { id: 'interview', label: 'Interview', color: 'bg-indigo-100' },
  { id: 'offer', label: 'Offer', color: 'bg-emerald-100' },
];

export default function PipelinePage() {
  const params = useParams();
  const router = useRouter();
  const [position, setPosition] = useState<Position | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [processingCV, setProcessingCV] = useState(false);

  const supabase = createClient();
  const positionId = params.id as string;

  const fetchData = useCallback(async () => {
    const { data: posData } = await supabase
      .from('positions')
      .select('id, title, client:clients(name)')
      .eq('id', positionId)
      .single();

    if (posData) {
      // Map the data to match our interface (client comes as array from join)
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
        cv:cvs(id, file_name),
        evaluations:evaluations(id, overall_score, recommendation, evaluation_type)
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

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      for (const file of Array.from(files)) {
        // Upload file to storage
        const filePath = `${positionId}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('cvs')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Create candidate (basic info for now)
        const candidateName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        const { data: candidate, error: candidateError } = await supabase
          .from('candidates')
          .insert({
            full_name: candidateName,
          })
          .select()
          .single();

        if (candidateError) throw candidateError;

        // Create CV record
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

        // Create application
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
      }

      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const moveToStage = async (applicationId: string, newStatus: string) => {
    await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', applicationId);

    fetchData();
  };

  const getApplicationsByStage = (stageId: string) => {
    return applications.filter((app) => app.status === stageId);
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
            <Button asChild disabled={uploading}>
              <span>
                {uploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Upload CVs
              </span>
            </Button>
          </label>
        </div>
      </div>

      {/* Pipeline Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((stage) => {
          const stageApps = getApplicationsByStage(stage.id);
          return (
            <div
              key={stage.id}
              className={`flex-shrink-0 w-72 rounded-lg ${stage.color}`}
            >
              <div className="p-3 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{stage.label}</h3>
                  <Badge variant="secondary">{stageApps.length}</Badge>
                </div>
              </div>
              <div className="p-3 space-y-3 min-h-[400px]">
                {stageApps.map((app) => {
                  const evaluation = getLatestEvaluation(app);
                  return (
                    <Card key={app.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <p className="font-medium text-sm">
                              {app.candidate?.full_name}
                            </p>
                            {evaluation && (
                              <Badge
                                variant={
                                  evaluation.recommendation?.includes('yes')
                                    ? 'default'
                                    : 'destructive'
                                }
                                className="text-xs"
                              >
                                {evaluation.overall_score}/10
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {app.cv?.file_name}
                          </p>
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-xs text-muted-foreground">
                              {new Date(app.created_at).toLocaleDateString()}
                            </span>
                            <div className="flex gap-1">
                              <Link href={`/evaluate?application=${app.id}`}>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <FileText className="h-3 w-3" />
                                </Button>
                              </Link>
                              {stage.id !== 'offer' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => {
                                    const currentIndex = PIPELINE_STAGES.findIndex(
                                      (s) => s.id === stage.id
                                    );
                                    if (currentIndex < PIPELINE_STAGES.length - 1) {
                                      moveToStage(
                                        app.id,
                                        PIPELINE_STAGES[currentIndex + 1].id
                                      );
                                    }
                                  }}
                                >
                                  <ChevronRight className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {stageApps.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No candidates
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Failed Applications */}
      {applications.filter((a) => ['l1_fail', 'l2_fail', 'rejected'].includes(a.status))
        .length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rejected / Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {applications
                .filter((a) => ['l1_fail', 'l2_fail', 'rejected'].includes(a.status))
                .map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
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
