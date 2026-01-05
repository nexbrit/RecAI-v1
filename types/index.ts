// Database types for IntelStack RecAI

export type OrganizationType = 'staffing_firm' | 'client';

export type UserRole = 'recruiter' | 'account_manager' | 'admin';

export type IR35Status = 'inside' | 'outside' | 'unknown';

export type PositionStatus = 'active' | 'on_hold' | 'filled' | 'cancelled';

export type RequirementType = 'must_have' | 'nice_to_have' | 'bonus';

export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type ApplicationStatus =
  | 'new'
  | 'l1_review'
  | 'l1_pass'
  | 'l1_fail'
  | 'l2_review'
  | 'l2_pass'
  | 'l2_fail'
  | 'submitted_to_client'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

export type EvaluationType = 'l1_auto' | 'l2_deep' | 'manual';

export type Recommendation = 'strong_yes' | 'yes' | 'maybe' | 'no' | 'strong_no';

// Organization
export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  created_at: string;
}

// User
export interface User {
  id: string;
  organization_id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

// Client
export interface Client {
  id: string;
  name: string;
  industry: string | null;
  domain: string | null;
  notes: string | null;
  created_at: string;
}

// Position
export interface Position {
  id: string;
  client_id: string;
  title: string;
  original_jd: string;
  formatted_jd: string | null;
  decoded_jd: DecodedJD | null;
  ir35_status: IR35Status;
  location: string | null;
  duration: string | null;
  rate_range: string | null;
  status: PositionStatus;
  boolean_search_broad: string | null;
  boolean_search_refined: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  client?: Client;
}

// Decoded JD structure
export interface DecodedJD {
  summary: string;
  responsibilities: string[];
  must_have_skills: SkillRequirement[];
  nice_to_have_skills: SkillRequirement[];
  experience_required: string;
  domain_knowledge: string[];
  soft_skills: string[];
  certifications: string[];
  work_arrangement: string;
  team_structure: string | null;
}

export interface SkillRequirement {
  name: string;
  years_required: number | null;
  context: string | null;
}

// Position Requirement
export interface PositionRequirement {
  id: string;
  position_id: string;
  skill_id: string;
  requirement_type: RequirementType;
  years_required: number | null;
  context: string | null;
  created_at: string;
  skill?: Skill;
}

// Skill
export interface Skill {
  id: string;
  name: string;
  category: string | null;
  parent_skill_id: string | null;
  description: string | null;
  aliases: string[];
  related_skills: string[];
  is_current: boolean;
  superseded_by: string | null;
  created_at: string;
}

// Candidate
export interface Candidate {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string;
  current_location: string | null;
  current_company: string | null;
  current_title: string | null;
  linkedin_url: string | null;
  total_experience_years: number | null;
  notice_period: string | null;
  expected_rate: string | null;
  visa_status: string | null;
  created_at: string;
  updated_at: string;
}

// CV
export interface CV {
  id: string;
  candidate_id: string;
  file_path: string;
  file_name: string;
  raw_text: string | null;
  parsed_data: ParsedCV | null;
  version: number;
  is_latest: boolean;
  uploaded_by: string;
  created_at: string;
}

// Parsed CV structure
export interface ParsedCV {
  candidate: {
    fullName: string;
    email: string | null;
    phone: string | null;
    location: string | null;
    linkedIn: string | null;
    summary: string | null;
    totalYearsExperience: number | null;
  };
  skills: ParsedSkill[];
  experience: ParsedExperience[];
  education: ParsedEducation[];
  certifications: ParsedCertification[];
  languages: string[];
  completenessScore: number;
  redFlags: string[];
}

export interface ParsedSkill {
  name: string;
  normalizedName: string;
  yearsExperience: number | null;
  proficiency: ProficiencyLevel | null;
  lastUsed: number | null;
  context: string | null;
}

export interface ParsedExperience {
  company: string;
  companyType: string | null;
  domain: string | null;
  title: string;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  responsibilities: string[];
  achievements: string[];
  technologiesUsed: string[];
}

export interface ParsedEducation {
  institution: string;
  degree: string;
  field: string | null;
  year: number | null;
}

export interface ParsedCertification {
  name: string;
  issuer: string | null;
  year: number | null;
}

// CV Skill
export interface CVSkill {
  id: string;
  cv_id: string;
  skill_id: string;
  years_experience: number | null;
  proficiency_level: ProficiencyLevel | null;
  last_used_year: number | null;
  context: string | null;
  created_at: string;
  skill?: Skill;
}

// CV Experience
export interface CVExperience {
  id: string;
  cv_id: string;
  company_name: string | null;
  company_domain: string | null;
  job_title: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  responsibilities: string[];
  achievements: string[];
  created_at: string;
}

// Application
export interface Application {
  id: string;
  position_id: string;
  cv_id: string;
  candidate_id: string;
  source: string | null;
  status: ApplicationStatus;
  submitted_by: string;
  created_at: string;
  updated_at: string;
  position?: Position;
  cv?: CV;
  candidate?: Candidate;
  evaluations?: Evaluation[];
}

// Evaluation
export interface Evaluation {
  id: string;
  application_id: string;
  evaluation_type: EvaluationType;
  evaluated_by: string | null;
  overall_score: number | null;
  keyword_match_percentage: number | null;
  experience_match_score: number | null;
  domain_match_score: number | null;
  strengths: EvaluationPoint[];
  gaps: EvaluationPoint[];
  cv_recommendations: string[];
  summary: string | null;
  recommendation: Recommendation | null;
  send_to_l2: boolean;
  l2_reason: string | null;
  raw_ai_response: Record<string, unknown> | null;
  model_used: string | null;
  created_at: string;
}

export interface EvaluationPoint {
  point: string;
  requirement_ref: string;
  confidence?: 'high' | 'medium' | 'low';
  severity?: 'critical' | 'moderate' | 'minor';
}

// Activity Log
export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
  user?: User;
}

// Dashboard Stats
export interface DashboardStats {
  activePositions: number;
  pendingReviews: number;
  l2Reviews: number;
  todaySubmissions: number;
}

// Skill Match for evaluation
export interface SkillMatch {
  required: string;
  found: string | null;
  matchType: 'exact' | 'alias' | 'related' | 'none';
  yearsRequired: number | null;
  yearsFound: number | null;
}
