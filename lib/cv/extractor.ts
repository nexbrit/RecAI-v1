import pdf from 'pdf-parse';
import mammoth from 'mammoth';

export interface ExtractionResult {
  text: string;
  pageCount?: number;
  format: 'pdf' | 'docx' | 'txt';
  success: boolean;
  error?: string;
}

/**
 * Extract text from PDF files
 */
export async function extractPDF(buffer: Buffer): Promise<ExtractionResult> {
  try {
    const data = await pdf(buffer);

    return {
      text: data.text,
      pageCount: data.numpages,
      format: 'pdf',
      success: true,
    };
  } catch (error) {
    console.error('PDF extraction error:', error);
    return {
      text: '',
      format: 'pdf',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Extract text from DOCX files
 */
export async function extractDOCX(buffer: Buffer): Promise<ExtractionResult> {
  try {
    const result = await mammoth.extractRawText({ buffer });

    return {
      text: result.value,
      format: 'docx',
      success: true,
    };
  } catch (error) {
    console.error('DOCX extraction error:', error);
    return {
      text: '',
      format: 'docx',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Extract text from TXT files
 */
export async function extractTXT(buffer: Buffer): Promise<ExtractionResult> {
  try {
    const text = buffer.toString('utf-8');

    return {
      text,
      format: 'txt',
      success: true,
    };
  } catch (error) {
    console.error('TXT extraction error:', error);
    return {
      text: '',
      format: 'txt',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Extract text from CV file based on format
 */
export async function extractText(
  buffer: Buffer,
  filename: string
): Promise<ExtractionResult> {
  const ext = filename.toLowerCase().split('.').pop();

  switch (ext) {
    case 'pdf':
      return extractPDF(buffer);
    case 'docx':
    case 'doc':
      return extractDOCX(buffer);
    case 'txt':
      return extractTXT(buffer);
    default:
      return {
        text: '',
        format: 'pdf',
        success: false,
        error: `Unsupported file format: ${ext}`,
      };
  }
}

/**
 * Validate extracted text quality
 */
export function validateExtraction(result: ExtractionResult): {
  isValid: boolean;
  confidence: 'high' | 'medium' | 'low';
  warnings: string[];
} {
  const warnings: string[] = [];
  const text = result.text.trim();

  // Check minimum length
  if (text.length < 100) {
    warnings.push('Text is suspiciously short (< 100 chars)');
  }

  // Check for readable content (not just symbols/numbers)
  const wordCount = text.split(/\s+/).filter(word => /[a-zA-Z]{2,}/.test(word)).length;
  if (wordCount < 20) {
    warnings.push('Very few readable words found - may be scanned/image-based PDF');
  }

  // Check for common CV keywords
  const commonKeywords = ['experience', 'education', 'skills', 'work', 'project', 'university'];
  const hasKeywords = commonKeywords.some(keyword =>
    text.toLowerCase().includes(keyword)
  );

  if (!hasKeywords) {
    warnings.push('No common CV keywords found');
  }

  // Determine confidence
  let confidence: 'high' | 'medium' | 'low' = 'high';
  if (warnings.length === 0 && text.length > 500) {
    confidence = 'high';
  } else if (warnings.length <= 1 && text.length > 200) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  return {
    isValid: result.success && text.length > 50,
    confidence,
    warnings,
  };
}
