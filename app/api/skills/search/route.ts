import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Search skills in the taxonomy
 * GET /api/skills/search?q=react&category=framework&limit=20
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');

    const supabase = await createClient();

    let dbQuery = supabase
      .from('skills')
      .select('*')
      .eq('is_current', true)
      .limit(limit);

    if (query) {
      dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }

    if (category) {
      dbQuery = dbQuery.eq('category', category);
    }

    const { data: skills, error } = await dbQuery.order('name');

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: skills || [],
    });
  } catch (error) {
    console.error('Skills search error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
