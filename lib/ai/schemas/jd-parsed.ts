import { z } from 'zod';

export const SkillRequirementSchema = z.object({
  name: z.string(),
  years_required: z.number().nullable(),
  context: z.string().nullable(),
});

export const DecodedJDSchema = z.object({
  title: z.string().optional(),
  summary: z.string(),
  responsibilities: z.array(z.string()),
  must_have_skills: z.array(SkillRequirementSchema),
  nice_to_have_skills: z.array(SkillRequirementSchema),
  experience_required: z.string(),
  domain_knowledge: z.array(z.string()),
  soft_skills: z.array(z.string()),
  certifications: z.array(z.string()),
  work_arrangement: z.string(),
  team_structure: z.string().nullable(),
  location: z.string().optional(),
  duration: z.string().optional(),
  rate_range: z.string().optional(),
});

export type DecodedJD = z.infer<typeof DecodedJDSchema>;
export type SkillRequirement = z.infer<typeof SkillRequirementSchema>;
