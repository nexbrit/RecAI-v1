import { NextRequest, NextResponse } from 'next/server';
import { generateStructuredOutput } from '@/lib/ai/claude';
import { CV_EXTRACTION_SYSTEM, CV_EXTRACTION_USER } from '@/lib/ai/prompts/cv-extraction';
import { ParsedCVSchema, type ParsedCV } from '@/lib/ai/schemas/cv-parsed';

export async function POST(request: NextRequest) {
  try {
    const { cvText } = await request.json();

    if (!cvText || typeof cvText !== 'string') {
      return NextResponse.json(
        { error: 'CV text is required' },
        { status: 400 }
      );
    }

    const parsedCV = await generateStructuredOutput<ParsedCV>(
      CV_EXTRACTION_SYSTEM,
      CV_EXTRACTION_USER(cvText),
      { temperature: 0.1, maxTokens: 4096 }
    );

    // Validate the response
    const validated = ParsedCVSchema.safeParse(parsedCV);
    if (!validated.success) {
      console.error('Validation error:', validated.error);
      return NextResponse.json({ parsedCV });
    }

    return NextResponse.json({ parsedCV: validated.data });
  } catch (error: any) {
    console.error('Error extracting CV:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to extract CV data' },
      { status: 500 }
    );
  }
}
