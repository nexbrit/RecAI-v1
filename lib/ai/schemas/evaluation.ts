import { z } from 'zod';

export const StrengthSchema = z.object({
  point: z.string(),
  requirementRef: z.string(),
  confidence: z.enum(['high', 'medium', 'low']),
});

export const GapSchema = z.object({
  point: z.string(),
  requirementRef: z.string(),
  severity: z.enum(['critical', 'moderate', 'minor']),
});

export const SkillMatchSchema = z.object({
  required: z.string(),
  found: z.string().nullable(),
  matchType: z.enum(['exact', 'alias', 'related', 'none']),
  yearsRequired: z.number().nullable(),
  yearsFound: z.number().nullable(),
});

export const L1EvaluationSchema = z.object({
  candidateName: z.string(),
  overallScore: z.number().min(1).max(10),
  keywordMatchPercentage: z.number().min(0).max(100),
  experienceMatchScore: z.number().min(1).max(10),
  strengths: z.array(StrengthSchema),
  gaps: z.array(GapSchema),
  skillMatches: z.array(SkillMatchSchema),
  recommendation: z.enum(['strong_yes', 'yes', 'maybe', 'no', 'strong_no']),
  shouldSendToL2: z.boolean(),
  l2Reason: z.string().nullable(),
  summary: z.string(),
});

export const DeepAnalysisSchema = z.object({
  domainFit: z.object({
    score: z.number().min(1).max(10),
    reasoning: z.string(),
    transferableExperience: z.array(z.string()),
  }),
  skillTransferability: z.object({
    score: z.number().min(1).max(10),
    reasoning: z.string(),
    adjacentSkills: z.array(z.object({
      has: z.string(),
      canApplyTo: z.string(),
      learningCurve: z.enum(['low', 'medium', 'high']),
    })),
  }),
  experienceQuality: z.object({
    score: z.number().min(1).max(10),
    reasoning: z.string(),
    notableCompanies: z.array(z.string()),
    projectComplexity: z.enum(['low', 'medium', 'high', 'very_high']),
  }),
  growthPotential: z.object({
    score: z.number().min(1).max(10),
    reasoning: z.string(),
    careerTrajectory: z.enum(['declining', 'stable', 'growing', 'accelerating']),
  }),
});

export const L2EvaluationSchema = z.object({
  deepAnalysis: DeepAnalysisSchema,
  revisedOverallScore: z.number().min(1).max(10),
  revisedRecommendation: z.enum(['strong_yes', 'yes', 'maybe', 'no', 'strong_no']),
  pitchToClient: z.string(),
  honestGaps: z.array(z.string()),
  interviewFocusAreas: z.array(z.string()),
});

export type L1Evaluation = z.infer<typeof L1EvaluationSchema>;
export type L2Evaluation = z.infer<typeof L2EvaluationSchema>;
export type SkillMatch = z.infer<typeof SkillMatchSchema>;
