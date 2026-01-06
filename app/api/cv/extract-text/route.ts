import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { extractText, validateExtraction } from '@/lib/cv/extractor';

/**
 * Extract text from a CV file stored in Supabase Storage
 * POST /api/cv/extract-text
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

    // Convert to buffer
    const buffer = Buffer.from(await fileData.arrayBuffer());

    // Extract text
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

    // Validate extraction quality
    const validation = validateExtraction(extractionResult);

    // Update CV record with extracted text
    const { error: updateError } = await supabase
      .from('cvs')
      .update({ raw_text: extractionResult.text })
      .eq('id', cvId);

    if (updateError) {
      console.error('Failed to update CV with extracted text:', updateError);
    }

    return NextResponse.json({
      success: true,
      data: {
        text: extractionResult.text,
        pageCount: extractionResult.pageCount,
        format: extractionResult.format,
        validation: {
          isValid: validation.isValid,
          confidence: validation.confidence,
          warnings: validation.warnings,
        },
      },
    });
  } catch (error) {
    console.error('Extract text error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
