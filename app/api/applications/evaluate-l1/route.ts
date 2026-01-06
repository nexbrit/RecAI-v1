import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateStructuredOutput } from '@/lib/ai/claude';
import { L1_EVALUATION_SYSTEM, L1_EVALUATION_USER } from '@/lib/ai/prompts/l1-evaluation';
import { L1EvaluationSchema, type L1Evaluation } from '@/lib/ai/schemas/evaluation';

/**
 * Run L1 evaluation for an application
 * POST /api/applications/evaluate-l1
 * Body: { applicationId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { applicationId } = await request.json();

    if (!applicationId) {
      return NextResponse.json(
        { success: false, error: 'Application ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get application with CV and position data
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select(`
        *,
        cv:cvs(*),
        position:positions(*)
      `)
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    // Check if CV is parsed
    if (!application.cv?.parsed_data) {
      return NextResponse.json(
        { success: false, error: 'CV has not been parsed yet' },
        { status: 400 }
      );
    }

    // Check if position has decoded JD
    if (!application.position?.decoded_jd) {
      return NextResponse.json(
        { success: false, error: 'Position JD has not been decoded yet' },
        { status: 400 }
      );
    }

    // Update application status to l1_review
    await supabase
      .from('applications')
      .update({ status: 'l1_review' })
      .eq('id', applicationId);

    // Get skills taxonomy for better matching
    const { data: skillsTaxonomy } = await supabase
      .from('skills')
      .select('name, category, aliases, description')
      .eq('is_current', true)
      .limit(100); // Top 100 most common skills

    // Run L1 evaluation with skills taxonomy
    const evaluation = await generateStructuredOutput<L1Evaluation>(
      L1_EVALUATION_SYSTEM,
      L1_EVALUATION_USER(
        JSON.stringify(application.cv.parsed_data, null, 2),
        JSON.stringify(application.position.decoded_jd, null, 2),
        skillsTaxonomy ? JSON.stringify(skillsTaxonomy, null, 2) : undefined
      ),
      { temperature: 0.2 }
    );

    // Validate the response
    const validated = L1EvaluationSchema.safeParse(evaluation);
    if (!validated.success) {
      console.error('Validation error:', validated.error);
      throw new Error('Invalid evaluation format from AI');
    }

    const evaluationData = validated.data;

    // Store evaluation in database
    const { error: evalError } = await supabase
      .from('evaluations')
      .insert({
        application_id: applicationId,
        evaluation_type: 'l1_auto',
        overall_score: evaluationData.overallScore,
        keyword_match_percentage: evaluationData.keywordMatchPercentage,
        experience_match_score: evaluationData.experienceMatchScore,
        strengths: evaluationData.strengths,
        gaps: evaluationData.gaps,
        skill_matches: evaluationData.skillMatches,
        summary: evaluationData.summary,
        recommendation: evaluationData.recommendation,
        send_to_l2: evaluationData.shouldSendToL2,
        l2_reason: evaluationData.l2Reason,
        raw_ai_response: evaluationData,
        model_used: 'claude-sonnet-4-20250514',
      })
      .select()
      .single();

    if (evalError) {
      console.error('Failed to store evaluation:', evalError);
      throw new Error('Failed to store evaluation');
    }

    // Update application status based on evaluation
    let newStatus: string;
    if (evaluationData.shouldSendToL2) {
      newStatus = 'l2_review';
    } else if (
      evaluationData.overallScore >= 7 &&
      ['strong_yes', 'yes'].includes(evaluationData.recommendation)
    ) {
      newStatus = 'l1_pass';
    } else {
      newStatus = 'l1_fail';
    }

    await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', applicationId);

    return NextResponse.json({
      success: true,
      data: {
        evaluation: evaluationData,
        newStatus,
      },
    });
  } catch (error) {
    console.error('L1 evaluation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
