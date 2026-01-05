import { NextRequest, NextResponse } from 'next/server';
import { generateStructuredOutput } from '@/lib/ai/claude';
import { L1_EVALUATION_SYSTEM, L1_EVALUATION_USER } from '@/lib/ai/prompts/l1-evaluation';
import { L1EvaluationSchema, type L1Evaluation } from '@/lib/ai/schemas/evaluation';

export async function POST(request: NextRequest) {
  try {
    const { parsedCV, jobRequirements, skillsTaxonomy } = await request.json();

    if (!parsedCV || !jobRequirements) {
      return NextResponse.json(
        { error: 'Parsed CV and job requirements are required' },
        { status: 400 }
      );
    }

    const evaluation = await generateStructuredOutput<L1Evaluation>(
      L1_EVALUATION_SYSTEM,
      L1_EVALUATION_USER(
        JSON.stringify(parsedCV, null, 2),
        JSON.stringify(jobRequirements, null, 2),
        skillsTaxonomy ? JSON.stringify(skillsTaxonomy, null, 2) : undefined
      ),
      { temperature: 0.2 }
    );

    // Validate the response
    const validated = L1EvaluationSchema.safeParse(evaluation);
    if (!validated.success) {
      console.error('Validation error:', validated.error);
      return NextResponse.json({ evaluation, modelUsed: 'claude-sonnet-4-20250514' });
    }

    return NextResponse.json({
      evaluation: validated.data,
      modelUsed: 'claude-sonnet-4-20250514'
    });
  } catch (error: any) {
    console.error('Error in L1 evaluation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to evaluate CV' },
      { status: 500 }
    );
  }
}
