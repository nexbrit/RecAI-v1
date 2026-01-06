import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { extractText, validateExtraction } from '@/lib/cv/extractor';
import { generateStructuredOutput } from '@/lib/ai/claude';
import { CV_EXTRACTION_SYSTEM } from '@/lib/ai/prompts/cv-extraction';
import { ParsedCVSchema } from '@/lib/ai/schemas/cv-parsed';

/**
 * Process CV: Extract text + Parse with AI
 * POST /api/cv/process
 * Body: { cvId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { cvId } = await request.json();

    if (!cvId) {
      return NextResponse.json(
        { success: false, error: 'CV ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get CV record
    const { data: cv, error: cvError } = await supabase
      .from('cvs')
      .select('*')
      .eq('id', cvId)
      .single();

    if (cvError || !cv) {
      return NextResponse.json(
        { success: false, error: 'CV not found' },
        { status: 404 }
      );
    }

    // Step 1: Extract text from file
    let extractedText = cv.raw_text;

    if (!extractedText) {
      // Download file from storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('cvs')
        .download(cv.file_path);

      if (downloadError || !fileData) {
        return NextResponse.json(
          { success: false, error: 'Failed to download CV file' },
          { status: 500 }
        );
      }

      // Convert to buffer and extract
      const buffer = Buffer.from(await fileData.arrayBuffer());
      const extractionResult = await extractText(buffer, cv.file_name);

      if (!extractionResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: extractionResult.error || 'Text extraction failed',
          },
          { status: 500 }
        );
      }

      extractedText = extractionResult.text;

      // Save extracted text
      await supabase
        .from('cvs')
        .update({ raw_text: extractedText })
        .eq('id', cvId);
    }

    // Validate extraction quality
    const validation = validateExtraction({
      text: extractedText,
      format: 'pdf',
      success: true,
    });

    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Extracted text quality is too low',
          warnings: validation.warnings,
        },
        { status: 400 }
      );
    }

    // Step 2: Parse CV with AI
    const parsedCV = await generateStructuredOutput(
      CV_EXTRACTION_SYSTEM,
      extractedText,
      {
        maxTokens: 4096,
        temperature: 0.1,
      }
    );

    // Validate with Zod schema
    const validatedCV = ParsedCVSchema.parse(parsedCV);

    // Step 3: Update CV record with parsed data
    const { error: updateError } = await supabase
      .from('cvs')
      .update({ parsed_data: validatedCV })
      .eq('id', cvId);

    if (updateError) {
      console.error('Failed to update CV with parsed data:', updateError);
    }

    // Step 4: Update candidate record with basic info from parsed CV
    if (validatedCV.candidate && cv.candidate_id) {
      await supabase
        .from('candidates')
        .update({
          full_name: validatedCV.candidate.fullName || cv.candidate_id,
          email: validatedCV.candidate.email,
          phone: validatedCV.candidate.phone,
          current_location: validatedCV.candidate.location,
          linkedin_url: validatedCV.candidate.linkedIn,
          total_experience_years: validatedCV.candidate.totalYearsExperience,
        })
        .eq('id', cv.candidate_id);
    }

    // Step 5: Find associated applications and trigger L1 evaluation
    const { data: applications } = await supabase
      .from('applications')
      .select('id, position:positions(decoded_jd)')
      .eq('cv_id', cvId)
      .eq('status', 'new');

    // Auto-trigger L1 evaluation for each application (fire and forget)
    if (applications && applications.length > 0) {
      for (const app of applications) {
        // Only evaluate if position has decoded JD
        const position = Array.isArray(app.position) ? app.position[0] : app.position;
        if (position?.decoded_jd) {
          fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/applications/evaluate-l1`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ applicationId: app.id }),
          }).catch(err => console.error('Auto L1 eval failed:', err));
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        parsedCV: validatedCV,
        extractionQuality: {
          confidence: validation.confidence,
          warnings: validation.warnings,
        },
        autoEvaluationTriggered: applications?.length || 0,
      },
    });
  } catch (error) {
    console.error('CV processing error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
