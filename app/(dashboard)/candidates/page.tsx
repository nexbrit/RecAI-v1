import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, MapPin, Building2, Clock, Plus } from 'lucide-react';
import Link from 'next/link';

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const supabase = await createClient();
  const search = searchParams.search || '';

  let query = supabase
    .from('candidates')
    .select(`
      *,
      cvs:cvs(id, file_name, created_at, is_latest),
      applications:applications(
        id,
        status,
        position:positions(id, title, client:clients(name))
      )
    `)
    .order('created_at', { ascending: false });

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,current_company.ilike.%${search}%`);
  }

  const { data: candidates } = await query.limit(50);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
          <p className="text-muted-foreground mt-1">
            Search and manage your candidate database
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Candidate
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <form className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  name="search"
                  placeholder="Search by name, email, or company..."
                  defaultValue={search}
                  className="pl-10"
                />
              </div>
            </div>
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      {/* Candidates List */}
      {candidates && candidates.length > 0 ? (
        <div className="space-y-4">
          {candidates.map((candidate: any) => {
            const initials = candidate.full_name
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase();

            const latestCV = candidate.cvs?.find((cv: any) => cv.is_latest);
            const activeApplications = candidate.applications?.filter(
              (app: any) => !['rejected', 'withdrawn', 'l1_fail', 'l2_fail'].includes(app.status)
            );

            return (
              <Link key={candidate.id} href={`/candidates/${candidate.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {candidate.full_name}
                            </h3>
                            <p className="text-muted-foreground">
                              {candidate.current_title}
                              {candidate.current_company && ` at ${candidate.current_company}`}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {latestCV && (
                              <Badge variant="outline">CV on file</Badge>
                            )}
                            {activeApplications?.length > 0 && (
                              <Badge variant="secondary">
                                {activeApplications.length} active application{activeApplications.length !== 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                          {candidate.current_location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {candidate.current_location}
                            </span>
                          )}
                          {candidate.total_experience_years && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {candidate.total_experience_years} years exp
                            </span>
                          )}
                          {candidate.email && (
                            <span>{candidate.email}</span>
                          )}
                        </div>
                        {activeApplications?.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {activeApplications.slice(0, 3).map((app: any) => (
                              <Badge key={app.id} variant="outline" className="text-xs">
                                {app.position?.title} - {app.position?.client?.name}
                              </Badge>
                            ))}
                            {activeApplications.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{activeApplications.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No candidates found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {search
                ? 'Try adjusting your search terms'
                : 'Start by uploading CVs to positions'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
