-- Post-Consultation Results & Email Pipeline
-- Migration: Add tables for post-consultation email enrichment and 3D visualization

-- ============================================================
-- POST CONSULTATION RESULTS
-- ============================================================
CREATE TABLE IF NOT EXISTS post_consultation_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  practitioner_id UUID NOT NULL REFERENCES profiles(id),
  treatment_id UUID REFERENCES treatment_records(id) ON DELETE SET NULL,
  clinical_note_id UUID REFERENCES clinical_notes(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,

  -- AI-generated content
  ai_summary TEXT,
  ai_summary_plain TEXT,
  research_enrichment JSONB DEFAULT '[]'::jsonb,
  classical_references JSONB DEFAULT '[]'::jsonb,
  lifestyle_recommendations JSONB DEFAULT '{}'::jsonb,
  dietary_therapy JSONB DEFAULT '{}'::jsonb,

  -- Visualization data
  visualization_data JSONB DEFAULT '{}'::jsonb,
  treated_points JSONB DEFAULT '[]'::jsonb,
  pathology_state JSONB DEFAULT '{}'::jsonb,

  -- Email tracking
  access_token UUID NOT NULL DEFAULT uuid_generate_v4(),
  email_sent_at TIMESTAMPTZ,
  email_status TEXT DEFAULT 'pending',

  -- Metadata
  patient_gender TEXT DEFAULT 'neutral',
  treatment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  next_appointment TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- POST CONSULTATION VIEWS (engagement tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS post_consultation_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  result_id UUID NOT NULL REFERENCES post_consultation_results(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_hash TEXT,
  user_agent TEXT,
  duration_seconds INTEGER
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_post_consultation_results_practice
  ON post_consultation_results(practice_id);
CREATE INDEX IF NOT EXISTS idx_post_consultation_results_patient
  ON post_consultation_results(patient_id);
CREATE INDEX IF NOT EXISTS idx_post_consultation_results_token
  ON post_consultation_results(access_token);
CREATE INDEX IF NOT EXISTS idx_post_consultation_results_treatment
  ON post_consultation_results(treatment_id);
CREATE INDEX IF NOT EXISTS idx_post_consultation_views_result
  ON post_consultation_views(result_id);

-- ============================================================
-- AUTO-UPDATE TRIGGER
-- ============================================================
CREATE TRIGGER update_post_consultation_results_updated_at
  BEFORE UPDATE ON post_consultation_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE post_consultation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_consultation_views ENABLE ROW LEVEL SECURITY;

-- Practice owners can manage their consultation results
CREATE POLICY "Practice owners manage post consultation results"
  ON post_consultation_results
  FOR ALL
  USING (
    practice_id IN (
      SELECT id FROM practices WHERE owner_id = auth.uid()
    )
  );

-- Patients can view their own results
CREATE POLICY "Patients view own post consultation results"
  ON post_consultation_results
  FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

-- Public access via token (for email links — no auth required)
CREATE POLICY "Public access via token"
  ON post_consultation_results
  FOR SELECT
  USING (true);

-- Views can be inserted by anyone (public page)
CREATE POLICY "Anyone can insert views"
  ON post_consultation_views
  FOR INSERT
  WITH CHECK (true);

-- Practice owners can view engagement data
CREATE POLICY "Practice owners view engagement"
  ON post_consultation_views
  FOR SELECT
  USING (
    result_id IN (
      SELECT id FROM post_consultation_results
      WHERE practice_id IN (
        SELECT id FROM practices WHERE owner_id = auth.uid()
      )
    )
  );
