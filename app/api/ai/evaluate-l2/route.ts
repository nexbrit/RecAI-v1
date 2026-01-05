import { NextRequest, NextResponse } from 'next/server';
import { generateStructuredOutput } from '@/lib/ai/claude';
import { L2_EVALUATION_SYSTEM, L2_EVALUATION_USER } from '@/lib/ai/prompts/l2-evaluation';
import { L2EvaluationSchema, type L2Evaluation } from '@/lib/ai/schemas/evaluation';

export async function POST(request: NextRequest) {
  try {
    const {
      parsedCV,
      jobRequirements,
      l1Evaluation,
      clientDomain,
      positionSeniority,
      teamContext
    } = await request.json();

    if (!parsedCV || !jobRequirements || !l1Evaluation) {
      return NextResponse.json(
        { error: 'Parsed CV, job requirements, and L1 evaluation are required' },
        { status: 400 }
      );
    }

    const evaluation = await generateStructuredOutput<L2Evaluation>(
      L2_EVALUATION_SYSTEM,
      L2_EVALUATION_USER(
        JSON.stringify(parsedCV, null, 2),
        JSON.stringify(jobRequirements, null, 2),
        JSON.stringify(l1Evaluation, null, 2),
        {
          clientDomain,
          positionSeniority,
          teamContext
        }
      ),
      { temperature: 0.3, maxTokens: 4096 }
    );

    // Validate the response
    const validated = L2EvaluationSchema.safeParse(evaluation);
    if (!validated.success) {
      console.error('Validation error:', validated.error);
      return NextResponse.json({ evaluation, modelUsed: 'claude-sonnet-4-20250514' });
    }

    return NextResponse.json({
      evaluation: validated.data,
      modelUsed: 'claude-sonnet-4-20250514'
    });
  } catch (error: any) {
    console.error('Error in L2 evaluation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to perform deep evaluation' },
      { status: 500 }
    );
  }
}
