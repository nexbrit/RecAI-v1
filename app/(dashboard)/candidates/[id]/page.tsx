import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  MapPin,
  Mail,
  Phone,
  Linkedin,
  FileText,
  Edit,
  Download
} from 'lucide-react';
import Link from 'next/link';

export default async function CandidateDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: candidate, error } = await supabase
    .from('candidates')
    .select(`
      *,
      cvs:cvs(
        id,
        file_name,
        file_path,
        raw_text,
        parsed_data,
        is_latest,
        created_at
      ),
      applications:applications(
        id,
        status,
        created_at,
        position:positions(
          id,
          title,
          client:clients(id, name)
        ),
        evaluations:evaluations(
          id,
          evaluation_type,
          overall_score,
          recommendation,
          summary
        )
      )
    `)
    .eq('id', params.id)
    .single();

  if (error || !candidate) {
    notFound();
  }

  const initials = candidate.full_name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase();

  const latestCV = candidate.cvs?.find((cv: { is_latest: boolean }) => cv.is_latest);
  const parsedData = latestCV?.parsed_data as {
    candidate?: { fullName?: string; email?: string; phone?: string; location?: string; linkedIn?: string; totalYearsExperience?: number };
    skills?: Array<{ name: string; yearsExperience?: number; proficiency?: string }>;
    experience?: Array<{ title: string; company: string; domain?: string; startDate?: string; endDate?: string; isCurrent?: boolean; responsibilities?: string[]; achievements?: string[]; technologiesUsed?: string[] }>;
    education?: Array<{ institution: string; degree: string; field?: string; year?: number }>;
    certifications?: Array<{ name: string; issuer?: string; year?: number }>;
  } | undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/candidates">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <Avatar className="h-16 w-16">
          <AvatarFallback className="text-xl">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{candidate.full_name}</h1>
          <p className="text-lg text-muted-foreground">
            {candidate.current_title}
            {candidate.current_company && ` at ${candidate.current_company}`}
          </p>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            {candidate.current_location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {candidate.current_location}
              </span>
            )}
            {candidate.total_experience_years && (
              <span>{candidate.total_experience_years} years experience</span>
            )}
          </div>
        </div>
        <Button variant="outline">
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      {/* Contact Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-6">
            {candidate.email && (
              <a
                href={`mailto:${candidate.email}`}
                className="flex items-center gap-2 text-sm hover:text-primary"
              >
                <Mail className="h-4 w-4" />
                {candidate.email}
              </a>
            )}
            {candidate.phone && (
              <a
                href={`tel:${candidate.phone}`}
                className="flex items-center gap-2 text-sm hover:text-primary"
              >
                <Phone className="h-4 w-4" />
                {candidate.phone}
              </a>
            )}
            {candidate.linkedin_url && (
              <a
                href={candidate.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm hover:text-primary"
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn Profile
              </a>
            )}
          </div>
          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            {candidate.notice_period && (
              <Badge variant="outline">Notice: {candidate.notice_period}</Badge>
            )}
            {candidate.expected_rate && (
              <Badge variant="outline">Rate: {candidate.expected_rate}</Badge>
            )}
            {candidate.visa_status && (
              <Badge variant="outline">Visa: {candidate.visa_status}</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cv">CV Details</TabsTrigger>
          <TabsTrigger value="applications">
            Applications ({candidate.applications?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Skills */}
          {parsedData?.skills && parsedData.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {parsedData.skills?.map((skill, i: number) => (
                    <Badge
                      key={i}
                      variant={skill.proficiency === 'expert' ? 'default' : 'secondary'}
                    >
                      {skill.name}
                      {skill.yearsExperience && ` (${skill.yearsExperience}y)`}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Experience */}
          {parsedData?.experience && parsedData.experience.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {parsedData.experience?.map((exp, i: number) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        {i < (parsedData.experience?.length || 0) - 1 && (
                          <div className="w-0.5 flex-1 bg-border mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <h4 className="font-semibold">{exp.title}</h4>
                        <p className="text-muted-foreground">
                          {exp.company}
                          {exp.domain && ` | ${exp.domain}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
                        </p>
                        {exp.responsibilities && exp.responsibilities.length > 0 && (
                          <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                            {exp.responsibilities?.slice(0, 3).map((resp: string, j: number) => (
                              <li key={j}>{resp}</li>
                            ))}
                          </ul>
                        )}
                        {exp.technologiesUsed && exp.technologiesUsed.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {exp.technologiesUsed?.map((tech: string, j: number) => (
                              <Badge key={j} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="cv" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>CV Documents</CardTitle>
                <CardDescription>
                  {candidate.cvs?.length || 0} CV(s) on file
                </CardDescription>
              </div>
              {latestCV && (
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Latest
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {candidate.cvs && candidate.cvs.length > 0 ? (
                <div className="space-y-4">
                  {candidate.cvs?.map((cv: { id: string; file_name: string; is_latest: boolean; created_at: string }) => (
                    <div
                      key={cv.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{cv.file_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Uploaded {new Date(cv.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {cv.is_latest && <Badge>Latest</Badge>}
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No CVs uploaded yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Application History</CardTitle>
              <CardDescription>
                Track candidate progress across positions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {candidate.applications && candidate.applications.length > 0 ? (
                <div className="space-y-4">
                  {candidate.applications?.map((app: { id: string; status: string; created_at: string; position?: { id: string; title: string; client?: { name: string } }; evaluations?: Array<{ overall_score?: number; recommendation?: string }> }) => {
                    const evaluation = app.evaluations?.[0];
                    return (
                      <div
                        key={app.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{app.position?.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {app.position?.client?.name} |{' '}
                            {new Date(app.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          {evaluation && (
                            <div className="text-right">
                              <span className="text-lg font-bold">
                                {evaluation.overall_score}/10
                              </span>
                              <p className="text-xs text-muted-foreground">
                                {evaluation.recommendation}
                              </p>
                            </div>
                          )}
                          <Badge variant="outline">
                            {app.status.replace(/_/g, ' ')}
                          </Badge>
                          <Link href={`/positions/${app.position?.id}`}>
                            <Button variant="outline" size="sm">
                              View Position
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No applications yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
