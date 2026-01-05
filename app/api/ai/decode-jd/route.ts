import { NextRequest, NextResponse } from 'next/server';
import { generateStructuredOutput } from '@/lib/ai/claude';
import { JD_DECODING_SYSTEM, JD_DECODING_USER } from '@/lib/ai/prompts/jd-decoding';
import { DecodedJDSchema, type DecodedJD } from '@/lib/ai/schemas/jd-parsed';

export async function POST(request: NextRequest) {
  try {
    const { jd } = await request.json();

    if (!jd || typeof jd !== 'string') {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      );
    }

    const decodedJd = await generateStructuredOutput<DecodedJD>(
      JD_DECODING_SYSTEM,
      JD_DECODING_USER(jd),
      { temperature: 0.2 }
    );

    // Validate the response
    const validated = DecodedJDSchema.safeParse(decodedJd);
    if (!validated.success) {
      console.error('Validation error:', validated.error);
      // Return the raw response if validation fails, as it might still be usable
      return NextResponse.json({ decodedJd });
    }

    return NextResponse.json({ decodedJd: validated.data });
  } catch (error: any) {
    console.error('Error decoding JD:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to decode job description' },
      { status: 500 }
    );
  }
}
