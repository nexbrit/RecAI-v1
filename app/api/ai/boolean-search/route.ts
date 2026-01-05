import { NextRequest, NextResponse } from 'next/server';
import { generateStructuredOutput } from '@/lib/ai/claude';
import { BOOLEAN_SEARCH_SYSTEM, BOOLEAN_SEARCH_USER } from '@/lib/ai/prompts/boolean-search';

interface BooleanSearchResult {
  broadSearch: string;
  refinedSearch: string;
  linkedInFilters: {
    titles: string[];
    industries: string[];
    locations: string[];
  };
  searchTips: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { jobRequirements } = await request.json();

    if (!jobRequirements) {
      return NextResponse.json(
        { error: 'Job requirements are required' },
        { status: 400 }
      );
    }

    const result = await generateStructuredOutput<BooleanSearchResult>(
      BOOLEAN_SEARCH_SYSTEM,
      BOOLEAN_SEARCH_USER(
        typeof jobRequirements === 'string'
          ? jobRequirements
          : JSON.stringify(jobRequirements, null, 2)
      ),
      { temperature: 0.3 }
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error generating boolean search:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate boolean search' },
      { status: 500 }
    );
  }
}
