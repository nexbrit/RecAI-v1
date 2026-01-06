import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Users, Clock, CheckCircle, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { DashboardClient } from '@/components/dashboard/DashboardClient';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('full_name')
    .eq('id', user?.id)
    .single();

  // Get dashboard stats
  const { count: activePositions } = await supabase
    .from('positions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const { count: pendingReviews } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .in('status', ['new', 'l1_review']);

  const { count: l2Reviews } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'l2_review');

  const { count: totalCandidates } = await supabase
    .from('candidates')
    .select('*', { count: 'exact', head: true });

  // Get recent positions
  const { data: recentPositions } = await supabase
    .from('positions')
    .select(`
      *,
      client:clients(name),
      applications:applications(count)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(5);

  // Get recent activity
  const { data: recentActivity } = await supabase
    .from('activity_log')
    .select(`
      *,
      user:users(full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Good morning, {firstName}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening with your recruitment pipeline today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Positions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePositions || 0}</div>
            <p className="text-xs text-muted-foreground">
              Positions currently open
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReviews || 0}</div>
            <p className="text-xs text-muted-foreground">
              CVs awaiting L1 review
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">L2 Reviews</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{l2Reviews || 0}</div>
            <p className="text-xs text-muted-foreground">
              Candidates for deep analysis
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCandidates || 0}</div>
            <p className="text-xs text-muted-foreground">
              In your database
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Positions */}
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Your Positions</CardTitle>
              <CardDescription>Active positions you&apos;re working on</CardDescription>
            </div>
            <Link href="/positions/new">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Position
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentPositions && recentPositions.length > 0 ? (
              <div className="space-y-4">
                {recentPositions.map((position) => (
                  <Link
                    key={position.id}
                    href={`/positions/${position.id}`}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{position.title}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{position.client?.name || 'No client'}</span>
                        {position.location && (
                          <>
                            <span>|</span>
                            <span>{position.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary">
                        {position.applications?.[0]?.count || 0} CVs
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No active positions yet</p>
                <Link href="/positions/new">
                  <Button className="mt-4">Create Your First Position</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex gap-4 text-sm">
                    <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                    <div className="flex-1">
                      <p>
                        <span className="font-medium">
                          {activity.user?.full_name || 'System'}
                        </span>{' '}
                        {activity.action}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to get you started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Link href="/positions/new">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                <FileText className="h-6 w-6" />
                <span>Create Position</span>
              </Button>
            </Link>
            <Link href="/evaluate">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                <CheckCircle className="h-6 w-6" />
                <span>Evaluate CVs</span>
              </Button>
            </Link>
            <Link href="/tools/jd-decoder">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                <FileText className="h-6 w-6" />
                <span>Decode JD</span>
              </Button>
            </Link>
            <Link href="/candidates">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                <Users className="h-6 w-6" />
                <span>Search Candidates</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Analytics & Real-time Feed */}
      <DashboardClient initialActivity={recentActivity || []} />
    </div>
  );
}
