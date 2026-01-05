'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronRight
} from 'lucide-react';

interface Position {
  id: string;
  title: string;
  decoded_jd: any;
  client: { name: string } | null;
}

interface Application {
  id: string;
  status: string;
  candidate: { id: string; full_name: string };
  cv: { id: string; file_name: string; parsed_data: any };
  evaluations: any[];
}

export default function EvaluatePage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<string>('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function fetchPositions() {
      const { data } = await supabase
        .from('positions')
        .select('id, title, decoded_jd, client:clients(name)')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      if (data) {
        // Map the data to match our interface (client comes as array from join)
        const mappedPositions = data.map((p: any) => ({
          ...p,
          client: Array.isArray(p.client) ? p.client[0] : p.client
        }));
        setPositions(mappedPositions);
      }
      setLoading(false);
    }
    fetchPositions();
  }, []);

  useEffect(() => {
    async function fetchApplications() {
      if (!selectedPosition) {
        setApplications([]);
        return;
      }

      const { data } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          candidate:candidates(id, full_name),
          cv:cvs(id, file_name, parsed_data),
          evaluations:evaluations(*)
        `)
        .eq('position_id', selectedPosition)
        .in('status', ['new', 'l1_review', 'l2_review'])
        .order('created_at', { ascending: true });

      if (data) setApplications(data as any);
    }
    fetchApplications();
  }, [selectedPosition]);

  const handleEvaluate = async (type: 'l1' | 'l2') => {
    if (!selectedApplication || !selectedPosition) return;

    setEvaluating(true);
    setEvaluation(null);

    try {
      const position = positions.find((p) => p.id === selectedPosition);
      const parsedCV = selectedApplication.cv?.parsed_data;

      if (!parsedCV) {
        throw new Error('CV has not been parsed yet');
      }

      const endpoint = type === 'l1' ? '/api/ai/evaluate-l1' : '/api/ai/evaluate-l2';
      const body: any = {
        parsedCV,
        jobRequirements: position?.decoded_jd,
      };

      if (type === 'l2') {
        const l1Eval = selectedApplication.evaluations?.find(
          (e: any) => e.evaluation_type === 'l1_auto'
        );
        body.l1Evaluation = l1Eval;
        body.clientDomain = position?.client?.name;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Evaluation failed');
      }

      const data = await response.json();
      setEvaluation(data.evaluation);

      // Save evaluation to database
      const { data: { user } } = await supabase.auth.getUser();

      await supabase.from('evaluations').insert({
        application_id: selectedApplication.id,
        evaluation_type: type === 'l1' ? 'l1_auto' : 'l2_deep',
        evaluated_by: user?.id,
        overall_score: data.evaluation.overallScore || data.evaluation.revisedOverallScore,
        keyword_match_percentage: data.evaluation.keywordMatchPercentage,
        strengths: data.evaluation.strengths,
        gaps: data.evaluation.gaps || data.evaluation.honestGaps,
        summary: data.evaluation.summary || data.evaluation.pitchToClient,
        recommendation: data.evaluation.recommendation || data.evaluation.revisedRecommendation,
        send_to_l2: data.evaluation.shouldSendToL2,
        l2_reason: data.evaluation.l2Reason,
        raw_ai_response: data.evaluation,
        model_used: data.modelUsed,
      });

      // Update application status
      const newStatus = type === 'l1'
        ? data.evaluation.recommendation?.includes('yes') ? 'l1_pass' : 'l1_fail'
        : data.evaluation.revisedRecommendation?.includes('yes') ? 'l2_pass' : 'l2_fail';

      await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', selectedApplication.id);

    } catch (error: any) {
      console.error('Evaluation error:', error);
    } finally {
      setEvaluating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRecommendationIcon = (rec: string) => {
    if (rec?.includes('yes')) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (rec === 'maybe') return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">CV Evaluation</h1>
        <p className="text-muted-foreground mt-1">
          AI-powered L1 and L2 evaluation for candidate CVs
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Position & Application Selection */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Select Position</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedPosition} onValueChange={setSelectedPosition}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a position" />
              </SelectTrigger>
              <SelectContent>
                {positions.map((pos) => (
                  <SelectItem key={pos.id} value={pos.id}>
                    {pos.title} - {pos.client?.name || 'No client'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedPosition && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Pending Reviews ({applications.length})</h4>
                {applications.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {applications.map((app) => (
                      <button
                        key={app.id}
                        onClick={() => {
                          setSelectedApplication(app);
                          setEvaluation(null);
                        }}
                        className={`w-full p-3 text-left border rounded-lg transition-colors ${
                          selectedApplication?.id === app.id
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <p className="font-medium text-sm">{app.candidate?.full_name}</p>
                        <p className="text-xs text-muted-foreground">{app.cv?.file_name}</p>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {app.status}
                        </Badge>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No pending reviews</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Evaluation Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedApplication
                ? selectedApplication.candidate?.full_name
                : 'Select a candidate'}
            </CardTitle>
            {selectedApplication && (
              <CardDescription>
                {selectedApplication.cv?.file_name}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {selectedApplication ? (
              <div className="space-y-6">
                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    onClick={() => handleEvaluate('l1')}
                    disabled={evaluating}
                  >
                    {evaluating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4 mr-2" />
                    )}
                    Run L1 Evaluation
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleEvaluate('l2')}
                    disabled={evaluating || !selectedApplication.evaluations?.length}
                  >
                    {evaluating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mr-2" />
                    )}
                    Run L2 Deep Analysis
                  </Button>
                </div>

                {/* Evaluation Results */}
                {evaluation && (
                  <div className="space-y-4">
                    {/* Score Summary */}
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="p-4 border rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">Overall Score</p>
                        <p className={`text-3xl font-bold ${getScoreColor(evaluation.overallScore || evaluation.revisedOverallScore)}`}>
                          {evaluation.overallScore || evaluation.revisedOverallScore}/10
                        </p>
                      </div>
                      {evaluation.keywordMatchPercentage !== undefined && (
                        <div className="p-4 border rounded-lg text-center">
                          <p className="text-sm text-muted-foreground">Keyword Match</p>
                          <p className="text-3xl font-bold">{evaluation.keywordMatchPercentage}%</p>
                        </div>
                      )}
                      <div className="p-4 border rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">Recommendation</p>
                        <div className="flex items-center justify-center gap-2 mt-1">
                          {getRecommendationIcon(evaluation.recommendation || evaluation.revisedRecommendation)}
                          <span className="font-medium capitalize">
                            {(evaluation.recommendation || evaluation.revisedRecommendation)?.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Summary */}
                    {(evaluation.summary || evaluation.pitchToClient) && (
                      <div className="p-4 border rounded-lg bg-muted/50">
                        <p className="font-medium mb-2">Summary</p>
                        <p className="text-sm">{evaluation.summary || evaluation.pitchToClient}</p>
                      </div>
                    )}

                    {/* Strengths & Gaps */}
                    <div className="grid gap-4 md:grid-cols-2">
                      {evaluation.strengths && (
                        <div className="p-4 border rounded-lg">
                          <p className="font-medium mb-2 text-green-600">Strengths</p>
                          <ul className="space-y-2">
                            {evaluation.strengths.map((s: any, i: number) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                                <span>{s.point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {(evaluation.gaps || evaluation.honestGaps) && (
                        <div className="p-4 border rounded-lg">
                          <p className="font-medium mb-2 text-red-600">Gaps</p>
                          <ul className="space-y-2">
                            {(evaluation.gaps || evaluation.honestGaps).map((g: any, i: number) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                                <span>{typeof g === 'string' ? g : g.point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* L2 Specific */}
                    {evaluation.deepAnalysis && (
                      <div className="space-y-4">
                        <h4 className="font-medium">Deep Analysis</h4>
                        <div className="grid gap-4 md:grid-cols-2">
                          {Object.entries(evaluation.deepAnalysis).map(([key, value]: [string, any]) => (
                            <div key={key} className="p-4 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                                <span className={`font-bold ${getScoreColor(value.score)}`}>
                                  {value.score}/10
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">{value.reasoning}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!evaluation && !evaluating && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Select an evaluation type to analyze this candidate
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Select a position and candidate to start evaluation
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
