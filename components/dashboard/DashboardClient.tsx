'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ApplicationTrendsChart } from './ApplicationTrendsChart';
import { ConversionFunnelChart } from './ConversionFunnelChart';
import { formatDistanceToNow, subDays, format } from 'date-fns';

interface DashboardClientProps {
  initialActivity: Array<{
    id: string;
    action: string;
    created_at: string;
    user?: { full_name: string } | null;
  }>;
}

export function DashboardClient({ initialActivity }: DashboardClientProps) {
  const [recentActivity, setRecentActivity] = useState(initialActivity);
  const supabase = createClient();

  // Real-time activity feed
  useEffect(() => {
    const channel = supabase
      .channel('dashboard_activity')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity_log' },
        (payload) => {
          setRecentActivity((prev) => [payload.new as typeof initialActivity[0], ...prev].slice(0, 10));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Generate mock trends data (last 30 days)
  const trendsData = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    return {
      date: format(date, 'MMM dd'),
      applications: Math.floor(Math.random() * 15) + 3, // Mock data
    };
  });

  // Generate funnel data
  const funnelData = [
    { stage: 'New', count: recentActivity.filter(a => a.action.includes('uploaded')).length || 12 },
    { stage: 'L1 Review', count: 8 },
    { stage: 'L1 Pass', count: 6 },
    { stage: 'L2 Review', count: 4 },
    { stage: 'Submitted', count: 3 },
  ];

  return (
    <div className="space-y-6">
      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <ApplicationTrendsChart data={trendsData} />
        <ConversionFunnelChart data={funnelData} />
      </div>

      {/* Real-time Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Live Activity Feed</CardTitle>
          <CardDescription>Real-time updates from your team</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity && recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex gap-4 text-sm animate-slide-up">
                  <div className="w-2 h-2 mt-2 rounded-full bg-primary animate-pulse-slow" />
                  <div className="flex-1">
                    <p>
                      <span className="font-medium">
                        {activity.user?.full_name || 'System'}
                      </span>{' '}
                      {activity.action}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
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
  );
}
