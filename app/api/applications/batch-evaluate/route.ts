import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Run L1 evaluation for multiple applications in batch
 * POST /api/applications/batch-evaluate
 * Body: { applicationIds?: string[], positionId?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { applicationIds, positionId } = await request.json();

    const supabase = await createClient();

    let applicationsToEvaluate: string[] = [];

    if (applicationIds && applicationIds.length > 0) {
      applicationsToEvaluate = applicationIds;
    } else if (positionId) {
      // Get all 'new' applications for this position
      const { data: applications } = await supabase
        .from('applications')
        .select('id')
        .eq('position_id', positionId)
        .eq('status', 'new');

      if (applications) {
        applicationsToEvaluate = applications.map((app) => app.id);
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Either applicationIds or positionId is required',
        },
        { status: 400 }
      );
    }

    if (applicationsToEvaluate.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          message: 'No applications to evaluate',
          processed: 0,
        },
      });
    }

    // Trigger L1 evaluation for each application
    const results = await Promise.allSettled(
      applicationsToEvaluate.map(async (appId) => {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/applications/evaluate-l1`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ applicationId: appId }),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to evaluate application ${appId}`);
        }

        return await response.json();
      })
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return NextResponse.json({
      success: true,
      data: {
        total: applicationsToEvaluate.length,
        successful,
        failed,
        results: results.map((r, i) => ({
          applicationId: applicationsToEvaluate[i],
          status: r.status,
          data: r.status === 'fulfilled' ? r.value : null,
          error: r.status === 'rejected' ? r.reason.message : null,
        })),
      },
    });
  } catch (error) {
    console.error('Batch evaluation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
