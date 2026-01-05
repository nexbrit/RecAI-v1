-- IntelStack RecAI Database Schema
-- Run this in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations (your staffing firm + clients)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('staffing_firm', 'client')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (recruiters, AMs)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('recruiter', 'account_manager', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients (companies you're hiring for)
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT,
  domain TEXT, -- e.g., 'fintech', 'healthcare', 'retail'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skills Taxonomy (the key to consistency)
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT, -- e.g., 'programming_language', 'framework', 'cloud', 'methodology'
  parent_skill_id UUID REFERENCES skills(id),
  description TEXT,
  aliases TEXT[] DEFAULT '{}', -- e.g., ['JS', 'Javascript', 'ECMAScript']
  related_skills UUID[] DEFAULT '{}', -- skills that often go together
  is_current BOOLEAN DEFAULT true, -- false for outdated tech
  superseded_by UUID REFERENCES skills(id), -- e.g., AngularJS -> Angular
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Positions/Jobs
CREATE TABLE positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id),
  title TEXT NOT NULL,
  original_jd TEXT NOT NULL, -- raw JD as received
  formatted_jd TEXT, -- AI-formatted JD
  decoded_jd JSONB, -- structured extraction from JD
  ir35_status TEXT CHECK (ir35_status IN ('inside', 'outside', 'unknown')) DEFAULT 'unknown',
  location TEXT,
  duration TEXT,
  rate_range TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'on_hold', 'filled', 'cancelled')),
  boolean_search_broad TEXT, -- 50-70% match
  boolean_search_refined TEXT, -- 70-100% match
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Extracted JD Requirements (normalized)
CREATE TABLE position_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id UUID REFERENCES positions(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id),
  requirement_type TEXT CHECK (requirement_type IN ('must_have', 'nice_to_have', 'bonus')),
  years_required INTEGER,
  context TEXT, -- how it's used in this role
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Candidates
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  phone TEXT,
  full_name TEXT NOT NULL,
  current_location TEXT,
  current_company TEXT,
  current_title TEXT,
  linkedin_url TEXT,
  total_experience_years DECIMAL,
  notice_period TEXT,
  expected_rate TEXT,
  visa_status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CVs (a candidate can have multiple versions)
CREATE TABLE cvs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL, -- Supabase storage path
  file_name TEXT NOT NULL,
  raw_text TEXT, -- extracted text from CV
  parsed_data JSONB, -- structured extraction
  version INTEGER DEFAULT 1,
  is_latest BOOLEAN DEFAULT true,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Extracted CV Skills (normalized for matching)
CREATE TABLE cv_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_id UUID REFERENCES cvs(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id),
  years_experience DECIMAL,
  proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  last_used_year INTEGER,
  context TEXT, -- how they used it
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CV Work Experience (for company/domain matching)
CREATE TABLE cv_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_id UUID REFERENCES cvs(id) ON DELETE CASCADE,
  company_name TEXT,
  company_domain TEXT, -- extracted: fintech, healthcare, etc.
  job_title TEXT,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  responsibilities TEXT[] DEFAULT '{}',
  achievements TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Position Applications (links CVs to Positions)
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id UUID REFERENCES positions(id),
  cv_id UUID REFERENCES cvs(id),
  candidate_id UUID REFERENCES candidates(id),
  source TEXT, -- 'linkedin', 'jobboard', 'referral', etc.
  status TEXT DEFAULT 'new' CHECK (status IN (
    'new', 'l1_review', 'l1_pass', 'l1_fail',
    'l2_review', 'l2_pass', 'l2_fail',
    'submitted_to_client', 'interview', 'offer', 'rejected', 'withdrawn'
  )),
  submitted_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(position_id, candidate_id) -- prevent duplicates
);

-- Evaluations (the AI assessment records)
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  evaluation_type TEXT CHECK (evaluation_type IN ('l1_auto', 'l2_deep', 'manual')),
  evaluated_by UUID REFERENCES users(id), -- null for auto

  -- Scores
  overall_score DECIMAL CHECK (overall_score >= 0 AND overall_score <= 10),
  keyword_match_percentage DECIMAL,
  experience_match_score DECIMAL,
  domain_match_score DECIMAL,

  -- Structured feedback
  strengths JSONB DEFAULT '[]', -- [{point: "...", requirement_ref: "..."}]
  gaps JSONB DEFAULT '[]', -- [{point: "...", requirement_ref: "..."}]
  cv_recommendations TEXT[] DEFAULT '{}',
  summary TEXT,

  -- Decision
  recommendation TEXT CHECK (recommendation IN ('strong_yes', 'yes', 'maybe', 'no', 'strong_no')),
  send_to_l2 BOOLEAN DEFAULT false,
  l2_reason TEXT,

  -- Raw AI response for debugging
  raw_ai_response JSONB,
  model_used TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Log (for audit trail)
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT, -- 'position', 'candidate', 'application', etc.
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_applications_position ON applications(position_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_candidate ON applications(candidate_id);
CREATE INDEX idx_cv_skills_skill ON cv_skills(skill_id);
CREATE INDEX idx_cv_skills_cv ON cv_skills(cv_id);
CREATE INDEX idx_evaluations_application ON evaluations(application_id);
CREATE INDEX idx_skills_aliases ON skills USING GIN(aliases);
CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_positions_status ON positions(status);
CREATE INDEX idx_positions_client ON positions(client_id);
CREATE INDEX idx_cvs_candidate ON cvs(candidate_id);
CREATE INDEX idx_activity_log_user ON activity_log(user_id);
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id);

-- Row Level Security (RLS)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE position_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies (basic - users can see all data in their organization)
CREATE POLICY "Users can view their organization" ON organizations
  FOR SELECT USING (true);

CREATE POLICY "Users can view users in their organization" ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view clients" ON clients
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage clients" ON clients
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view positions" ON positions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage positions" ON positions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view requirements" ON position_requirements
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage requirements" ON position_requirements
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Everyone can view skills" ON skills
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage skills" ON skills
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view candidates" ON candidates
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage candidates" ON candidates
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view cvs" ON cvs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage cvs" ON cvs
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view cv_skills" ON cv_skills
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage cv_skills" ON cv_skills
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view cv_experiences" ON cv_experiences
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage cv_experiences" ON cv_experiences
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view applications" ON applications
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage applications" ON applications
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view evaluations" ON evaluations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage evaluations" ON evaluations
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view activity_log" ON activity_log
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert activity_log" ON activity_log
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_positions_updated_at
  BEFORE UPDATE ON positions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidates_updated_at
  BEFORE UPDATE ON candidates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'recruiter'
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Storage bucket for CVs
INSERT INTO storage.buckets (id, name, public)
VALUES ('cvs', 'cvs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Authenticated users can upload CVs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'cvs'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can view CVs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'cvs'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can delete CVs"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'cvs'
    AND auth.role() = 'authenticated'
  );
