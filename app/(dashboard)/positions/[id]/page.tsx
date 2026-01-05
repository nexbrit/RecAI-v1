import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Building2,
  Edit,
  Archive,
  Upload,
  ExternalLink,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Link from 'next/link';

export default async function PositionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: position, error } = await supabase
    .from('positions')
    .select(`
      *,
      client:clients(id, name, industry, domain),
      applications:applications(
        id,
        status,
        created_at,
        candidate:candidates(id, full_name, current_title, current_company),
        cv:cvs(id, file_name),
        evaluations:evaluations(
          id,
          evaluation_type,
          overall_score,
          recommendation,
          created_at
        )
      ),
      position_requirements:position_requirements(
        id,
        requirement_type,
        years_required,
        context,
        skill:skills(id, name, category)
      )
    `)
    .eq('id', params.id)
    .single();

  if (error || !position) {
    notFound();
  }

  const decodedJd = position.decoded_jd as any;

  // Group applications by status
  const applicationsByStatus = {
    new: position.applications?.filter((a: any) => a.status === 'new') || [],
    l1_review: position.applications?.filter((a: any) => a.status === 'l1_review') || [],
    l1_pass: position.applications?.filter((a: any) => a.status === 'l1_pass') || [],
    l2_review: position.applications?.filter((a: any) => a.status === 'l2_review') || [],
    submitted: position.applications?.filter((a: any) => a.status === 'submitted_to_client') || [],
    interview: position.applications?.filter((a: any) => a.status === 'interview') || [],
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    on_hold: 'bg-yellow-100 text-yellow-800',
    filled: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/positions">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{position.title}</h1>
              <Badge className={statusColors[position.status]}>
                {position.status}
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-2 text-muted-foreground">
              {position.client && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {position.client.name}
                </span>
              )}
              {position.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {position.location}
                </span>
              )}
              {position.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {position.duration}
                </span>
              )}
            </div>
            {position.rate_range && (
              <p className="mt-2 font-medium">{position.rate_range}</p>
            )}
            {position.ir35_status !== 'unknown' && (
              <Badge variant="outline" className="mt-2">
                {position.ir35_status === 'inside' ? 'Inside IR35' : 'Outside IR35'}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm">
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="jd">Job Description</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="pipeline">
            Pipeline ({position.applications?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="boolean">Boolean Search</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{applicationsByStatus.new.length}</div>
                <p className="text-sm text-muted-foreground">New CVs</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {applicationsByStatus.l1_review.length + applicationsByStatus.l2_review.length}
                </div>
                <p className="text-sm text-muted-foreground">In Review</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{applicationsByStatus.l1_pass.length}</div>
                <p className="text-sm text-muted-foreground">Passed L1</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{applicationsByStatus.submitted.length}</div>
                <p className="text-sm text-muted-foreground">Submitted</p>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          {decodedJd?.summary && (
            <Card>
              <CardHeader>
                <CardTitle>Position Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{decodedJd.summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Link href={`/positions/${position.id}/pipeline`}>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload CVs
                  </Button>
                </Link>
                <Link href={`/evaluate?position=${position.id}`}>
                  <Button variant="outline">
                    Review Pending CVs ({applicationsByStatus.new.length + applicationsByStatus.l1_review.length})
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jd" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
              <CardDescription>
                {position.formatted_jd ? 'AI-formatted version' : 'Original job description'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm bg-muted/50 p-4 rounded-lg">
                {position.formatted_jd || position.original_jd}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requirements" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Must Have */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Must Have Skills</CardTitle>
              </CardHeader>
              <CardContent>
                {decodedJd?.must_have_skills?.length > 0 ? (
                  <ul className="space-y-3">
                    {decodedJd.must_have_skills.map((skill: any, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                        <div>
                          <span className="font-medium">{skill.name}</span>
                          {skill.years_required && (
                            <span className="text-muted-foreground ml-2">
                              ({skill.years_required}+ years)
                            </span>
                          )}
                          {skill.context && (
                            <p className="text-sm text-muted-foreground">{skill.context}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No requirements extracted yet</p>
                )}
              </CardContent>
            </Card>

            {/* Nice to Have */}
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">Nice to Have</CardTitle>
              </CardHeader>
              <CardContent>
                {decodedJd?.nice_to_have_skills?.length > 0 ? (
                  <ul className="space-y-3">
                    {decodedJd.nice_to_have_skills.map((skill: any, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className="h-4 w-4 mt-0.5 rounded-full bg-blue-200" />
                        <span>{skill.name}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No nice-to-have skills specified</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Responsibilities */}
          {decodedJd?.responsibilities?.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Key Responsibilities</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {decodedJd.responsibilities.map((resp: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-muted-foreground">{i + 1}.</span>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pipeline" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Application Pipeline</CardTitle>
                <CardDescription>
                  Track candidates through the evaluation process
                </CardDescription>
              </div>
              <Link href={`/positions/${position.id}/pipeline`}>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload CVs
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {position.applications && position.applications.length > 0 ? (
                <div className="space-y-4">
                  {position.applications.map((app: any) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{app.candidate?.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {app.candidate?.current_title} at {app.candidate?.current_company}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        {app.evaluations?.[0] && (
                          <div className="text-right">
                            <span className="text-lg font-bold">
                              {app.evaluations[0].overall_score}/10
                            </span>
                            <p className="text-xs text-muted-foreground">
                              {app.evaluations[0].recommendation}
                            </p>
                          </div>
                        )}
                        <Badge variant="outline">{app.status.replace('_', ' ')}</Badge>
                        <Link href={`/evaluate?application=${app.id}`}>
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No applications yet</p>
                  <Link href={`/positions/${position.id}/pipeline`}>
                    <Button>Upload CVs</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="boolean" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Broad Search (50-70% match)</CardTitle>
                <CardDescription>
                  Use this to cast a wider net and find more candidates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {position.boolean_search_broad ? (
                  <div className="space-y-4">
                    <pre className="text-sm bg-muted/50 p-4 rounded-lg whitespace-pre-wrap">
                      {position.boolean_search_broad}
                    </pre>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Copy to Clipboard
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Boolean search not generated yet. Process the JD to generate.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Refined Search (70-100% match)</CardTitle>
                <CardDescription>
                  Use this for more targeted candidate searches
                </CardDescription>
              </CardHeader>
              <CardContent>
                {position.boolean_search_refined ? (
                  <div className="space-y-4">
                    <pre className="text-sm bg-muted/50 p-4 rounded-lg whitespace-pre-wrap">
                      {position.boolean_search_refined}
                    </pre>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Copy to Clipboard
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Boolean search not generated yet. Process the JD to generate.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
