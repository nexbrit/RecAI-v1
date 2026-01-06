import { createClient } from '@/lib/supabase/server';

export interface SkillMatch {
  original: string;
  normalized: string | null;
  skillId: string | null;
  matchType: 'exact' | 'alias' | 'fuzzy' | 'none';
  confidence: number;
}

/**
 * Normalize a skill name to its canonical form using the skills taxonomy
 */
export async function normalizeSkill(skillName: string): Promise<SkillMatch> {
  const supabase = await createClient();
  const cleanedName = skillName.trim();

  // Try exact match first
  const { data: exactMatch } = await supabase
    .from('skills')
    .select('*')
    .ilike('name', cleanedName)
    .single();

  if (exactMatch) {
    return {
      original: skillName,
      normalized: exactMatch.name,
      skillId: exactMatch.id,
      matchType: 'exact',
      confidence: 1.0,
    };
  }

  // Try alias match
  const { data: aliasMatches } = await supabase
    .from('skills')
    .select('*')
    .contains('aliases', [cleanedName]);

  if (aliasMatches && aliasMatches.length > 0) {
    return {
      original: skillName,
      normalized: aliasMatches[0].name,
      skillId: aliasMatches[0].id,
      matchType: 'alias',
      confidence: 0.9,
    };
  }

  // Try case-insensitive alias match
  const { data: allSkills } = await supabase
    .from('skills')
    .select('*');

  if (allSkills) {
    for (const skill of allSkills) {
      const aliases = skill.aliases || [];
      for (const alias of aliases) {
        if (alias.toLowerCase() === cleanedName.toLowerCase()) {
          return {
            original: skillName,
            normalized: skill.name,
            skillId: skill.id,
            matchType: 'alias',
            confidence: 0.85,
          };
        }
      }
    }

    // Try fuzzy match (contains or starts with)
    for (const skill of allSkills) {
      const skillNameLower = skill.name.toLowerCase();
      const cleanedNameLower = cleanedName.toLowerCase();

      if (
        skillNameLower.includes(cleanedNameLower) ||
        cleanedNameLower.includes(skillNameLower)
      ) {
        return {
          original: skillName,
          normalized: skill.name,
          skillId: skill.id,
          matchType: 'fuzzy',
          confidence: 0.7,
        };
      }
    }
  }

  // No match found
  return {
    original: skillName,
    normalized: null,
    skillId: null,
    matchType: 'none',
    confidence: 0,
  };
}

/**
 * Normalize multiple skills in batch
 */
export async function normalizeSkills(
  skillNames: string[]
): Promise<SkillMatch[]> {
  const results: SkillMatch[] = [];

  for (const skillName of skillNames) {
    const match = await normalizeSkill(skillName);
    results.push(match);
  }

  return results;
}

/**
 * Get related skills for a given skill
 */
export async function getRelatedSkills(skillId: string): Promise<string[]> {
  const supabase = await createClient();

  const { data: skill } = await supabase
    .from('skills')
    .select('related_skills')
    .eq('id', skillId)
    .single();

  if (!skill || !skill.related_skills) {
    return [];
  }

  // related_skills contains skill IDs, fetch their names
  const { data: relatedSkills } = await supabase
    .from('skills')
    .select('name')
    .in('id', skill.related_skills);

  return relatedSkills ? relatedSkills.map((s) => s.name) : [];
}

/**
 * Check if two skills are related (same or related)
 */
export async function areSkillsRelated(
  skill1Id: string,
  skill2Id: string
): Promise<boolean> {
  if (skill1Id === skill2Id) return true;

  const supabase = await createClient();

  const { data: skill1 } = await supabase
    .from('skills')
    .select('related_skills')
    .eq('id', skill1Id)
    .single();

  if (!skill1 || !skill1.related_skills) {
    return false;
  }

  return skill1.related_skills.includes(skill2Id);
}

/**
 * Get skill by ID
 */
export async function getSkillById(skillId: string) {
  const supabase = await createClient();

  const { data: skill } = await supabase
    .from('skills')
    .select('*')
    .eq('id', skillId)
    .single();

  return skill;
}

/**
 * Search skills by query
 */
export async function searchSkills(query: string, limit: number = 10) {
  const supabase = await createClient();

  const { data: skills } = await supabase
    .from('skills')
    .select('*')
    .or(`name.ilike.%${query}%, description.ilike.%${query}%`)
    .eq('is_current', true)
    .limit(limit);

  return skills || [];
}
