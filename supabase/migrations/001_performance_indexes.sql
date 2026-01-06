-- Performance optimization migration
-- Adds missing indexes and improves query performance

-- Add index on cvs.raw_text for full-text search (if not exists)
CREATE INDEX IF NOT EXISTS idx_cvs_raw_text_search
ON cvs USING GIN(to_tsvector('english', raw_text));

-- Add index on candidates.email for faster lookups
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);

-- Add index on candidates.full_name for search
CREATE INDEX IF NOT EXISTS idx_candidates_full_name ON candidates USING GIN(to_tsvector('english', full_name));

-- Add composite index for application queries
CREATE INDEX IF NOT EXISTS idx_applications_position_status
ON applications(position_id, status);

-- Add index for CV version queries
CREATE INDEX IF NOT EXISTS idx_cvs_candidate_latest
ON cvs(candidate_id, is_latest);

-- Add index for evaluation queries
CREATE INDEX IF NOT EXISTS idx_evaluations_type_score
ON evaluations(evaluation_type, overall_score DESC);

-- Add index for activity log queries (user timeline)
CREATE INDEX IF NOT EXISTS idx_activity_log_created
ON activity_log(created_at DESC);

-- Add index for position requirements lookup
CREATE INDEX IF NOT EXISTS idx_position_requirements_position
ON position_requirements(position_id);

-- Improve position search performance
CREATE INDEX IF NOT EXISTS idx_positions_title_search
ON positions USING GIN(to_tsvector('english', title));

CREATE INDEX IF NOT EXISTS idx_positions_created
ON positions(created_at DESC);

-- Add index for client lookups
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);

-- Performance stats view for dashboard
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM positions WHERE status = 'active') as active_positions,
  (SELECT COUNT(*) FROM applications WHERE status IN ('new', 'l1_review')) as pending_reviews,
  (SELECT COUNT(*) FROM applications WHERE status = 'l2_review') as l2_reviews,
  (SELECT COUNT(*) FROM applications WHERE DATE(created_at) = CURRENT_DATE) as today_submissions,
  (SELECT COUNT(*) FROM candidates) as total_candidates,
  (SELECT COUNT(*) FROM applications WHERE status IN ('l1_pass', 'l2_pass', 'submitted_to_client', 'interview', 'offer')) as qualified_candidates,
  (SELECT AVG(overall_score) FROM evaluations WHERE evaluation_type = 'l1_auto') as avg_l1_score,
  (SELECT COUNT(*) FROM positions WHERE status = 'active' AND created_at >= NOW() - INTERVAL '7 days') as positions_this_week;

-- Function to update CV version tracking
CREATE OR REPLACE FUNCTION update_cv_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark previous CVs as not latest
  UPDATE cvs
  SET is_latest = false
  WHERE candidate_id = NEW.candidate_id
    AND id != NEW.id;

  -- Ensure new CV is marked as latest
  NEW.is_latest := true;
  NEW.version := (
    SELECT COALESCE(MAX(version), 0) + 1
    FROM cvs
    WHERE candidate_id = NEW.candidate_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for CV version management
DROP TRIGGER IF EXISTS trigger_update_cv_version ON cvs;
CREATE TRIGGER trigger_update_cv_version
  BEFORE INSERT ON cvs
  FOR EACH ROW
  EXECUTE FUNCTION update_cv_version();

-- Function to auto-populate position_requirements from decoded_jd
CREATE OR REPLACE FUNCTION populate_position_requirements()
RETURNS TRIGGER AS $$
DECLARE
  skill_item JSONB;
  skill_record RECORD;
  requirement_type TEXT;
BEGIN
  -- Only process if decoded_jd is present
  IF NEW.decoded_jd IS NOT NULL THEN

    -- Process must_have_skills
    IF NEW.decoded_jd->'must_have_skills' IS NOT NULL THEN
      FOR skill_item IN SELECT * FROM jsonb_array_elements(NEW.decoded_jd->'must_have_skills')
      LOOP
        -- Try to find matching skill in taxonomy
        SELECT * INTO skill_record
        FROM skills
        WHERE LOWER(name) = LOWER(skill_item->>'name')
           OR skill_item->>'name' = ANY(aliases)
        LIMIT 1;

        -- Insert requirement if skill found
        IF FOUND THEN
          INSERT INTO position_requirements (
            position_id,
            skill_id,
            requirement_type,
            years_required,
            context
          ) VALUES (
            NEW.id,
            skill_record.id,
            'must_have',
            (skill_item->>'years_required')::INTEGER,
            skill_item->>'context'
          )
          ON CONFLICT DO NOTHING;
        END IF;
      END LOOP;
    END IF;

    -- Process nice_to_have_skills
    IF NEW.decoded_jd->'nice_to_have_skills' IS NOT NULL THEN
      FOR skill_item IN SELECT * FROM jsonb_array_elements(NEW.decoded_jd->'nice_to_have_skills')
      LOOP
        SELECT * INTO skill_record
        FROM skills
        WHERE LOWER(name) = LOWER(skill_item->>'name')
           OR skill_item->>'name' = ANY(aliases)
        LIMIT 1;

        IF FOUND THEN
          INSERT INTO position_requirements (
            position_id,
            skill_id,
            requirement_type,
            years_required,
            context
          ) VALUES (
            NEW.id,
            skill_record.id,
            'nice_to_have',
            (skill_item->>'years_required')::INTEGER,
            skill_item->>'context'
          )
          ON CONFLICT DO NOTHING;
        END IF;
      END LOOP;
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-populate position requirements
DROP TRIGGER IF EXISTS trigger_populate_position_requirements ON positions;
CREATE TRIGGER trigger_populate_position_requirements
  AFTER INSERT OR UPDATE OF decoded_jd ON positions
  FOR EACH ROW
  EXECUTE FUNCTION populate_position_requirements();

-- Comment for documentation
COMMENT ON FUNCTION populate_position_requirements() IS
'Automatically populates position_requirements table from decoded_jd JSONB field';
