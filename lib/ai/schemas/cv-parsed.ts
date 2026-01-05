import { z } from 'zod';

export const CVSkillSchema = z.object({
  name: z.string(),
  normalizedName: z.string(),
  yearsExperience: z.number().nullable(),
  proficiency: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).nullable(),
  lastUsed: z.number().nullable(),
  context: z.string().nullable(),
});

export const CVExperienceSchema = z.object({
  company: z.string(),
  companyType: z.string().nullable(),
  domain: z.string().nullable(),
  title: z.string(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  isCurrent: z.boolean(),
  responsibilities: z.array(z.string()),
  achievements: z.array(z.string()),
  technologiesUsed: z.array(z.string()),
});

export const CVEducationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  field: z.string().nullable(),
  year: z.number().nullable(),
});

export const CVCertificationSchema = z.object({
  name: z.string(),
  issuer: z.string().nullable(),
  year: z.number().nullable(),
});

export const ParsedCVSchema = z.object({
  candidate: z.object({
    fullName: z.string(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    location: z.string().nullable(),
    linkedIn: z.string().nullable(),
    summary: z.string().nullable(),
    totalYearsExperience: z.number().nullable(),
  }),
  skills: z.array(CVSkillSchema),
  experience: z.array(CVExperienceSchema),
  education: z.array(CVEducationSchema),
  certifications: z.array(CVCertificationSchema),
  languages: z.array(z.string()),
  completenessScore: z.number(),
  redFlags: z.array(z.string()),
});

export type ParsedCV = z.infer<typeof ParsedCVSchema>;
export type CVSkill = z.infer<typeof CVSkillSchema>;
export type CVExperience = z.infer<typeof CVExperienceSchema>;
