import { NextRequest, NextResponse } from 'next/server';
import { generateCompletion } from '@/lib/ai/claude';
import { JD_FORMATTING_SYSTEM, JD_FORMATTING_USER } from '@/lib/ai/prompts/jd-formatting';

export async function POST(request: NextRequest) {
  try {
    const { jd } = await request.json();

    if (!jd || typeof jd !== 'string') {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      );
    }

    const formattedJd = await generateCompletion(
      JD_FORMATTING_SYSTEM,
      JD_FORMATTING_USER(jd),
      { temperature: 0.2 }
    );

    return NextResponse.json({ formattedJd });
  } catch (error: any) {
    console.error('Error formatting JD:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to format job description' },
      { status: 500 }
    );
  }
}
