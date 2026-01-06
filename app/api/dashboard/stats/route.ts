import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Get dashboard statistics
 * GET /api/dashboard/stats
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Use the dashboard_stats view if migration is run, otherwise fallback to queries
    const { data: stats, error } = await supabase
      .from('dashboard_stats')
      .select('*')
      .single();

    if (error) {
      // Fallback: Calculate stats manually if view doesn't exist
      const [
        activePositions,
        pendingReviews,
        l2Reviews,
        todaySubmissions,
        totalCandidates,
        qualifiedCandidates,
        avgL1Score,
        positionsThisWeek,
      ] = await Promise.all([
        supabase
          .from('positions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active'),
        supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .in('status', ['new', 'l1_review']),
        supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'l2_review'),
        supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', new Date().toISOString().split('T')[0]),
        supabase.from('candidates').select('*', { count: 'exact', head: true }),
        supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .in('status', [
            'l1_pass',
            'l2_pass',
            'submitted_to_client',
            'interview',
            'offer',
          ]),
        supabase
          .from('evaluations')
          .select('overall_score')
          .eq('evaluation_type', 'l1_auto'),
        supabase
          .from('positions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      ]);

      // Calculate average L1 score
      const l1Scores = avgL1Score.data || [];
      const avgScore = l1Scores.length > 0
        ? l1Scores.reduce((sum: number, e: any) => sum + (e.overall_score || 0), 0) / l1Scores.length
        : null;

      return NextResponse.json({
        success: true,
        data: {
          active_positions: activePositions.count || 0,
          pending_reviews: pendingReviews.count || 0,
          l2_reviews: l2Reviews.count || 0,
          today_submissions: todaySubmissions.count || 0,
          total_candidates: totalCandidates.count || 0,
          qualified_candidates: qualifiedCandidates.count || 0,
          avg_l1_score: avgScore ? parseFloat(avgScore.toFixed(2)) : null,
          positions_this_week: positionsThisWeek.count || 0,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
