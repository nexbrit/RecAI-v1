import { NextRequest, NextResponse } from 'next/server';
import { normalizeSkill, normalizeSkills } from '@/lib/skills/normalizer';

/**
 * Normalize skill names using the skills taxonomy
 * POST /api/skills/normalize
 * Body: { skill?: string, skills?: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { skill, skills } = body;

    if (!skill && (!skills || skills.length === 0)) {
      return NextResponse.json(
        { success: false, error: 'Either skill or skills array is required' },
        { status: 400 }
      );
    }

    if (skill) {
      const match = await normalizeSkill(skill);
      return NextResponse.json({
        success: true,
        data: match,
      });
    }

    if (skills) {
      const matches = await normalizeSkills(skills);
      return NextResponse.json({
        success: true,
        data: matches,
      });
    }
  } catch (error) {
    console.error('Skill normalization error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
