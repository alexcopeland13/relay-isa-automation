
-- Feature flags table for controlling which systems are active
CREATE TABLE system_config (
  feature TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial feature flags
INSERT INTO system_config (feature, enabled, description) VALUES
  ('use_v2_leads', false, 'Enable new v2 leads system'),
  ('use_v2_conversations', false, 'Enable new v2 conversations system'),
  ('use_makecom_processing', false, 'Enable Make.com processing workflows'),
  ('cinc_ingestion_v2', false, 'Enable v2 CINC lead ingestion'),
  ('retell_processing_v2', false, 'Enable v2 Retell call processing');

-- Migration status tracking table
CREATE TABLE migration_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL, -- 'lead', 'conversation', 'extraction'
  old_id UUID,
  new_id UUID,
  migrated_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'migrated', 'verified', 'failed'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Simplified comprehensive leads table
CREATE TABLE leads_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Phone number as primary identifier (normalized)
  phone_e164 TEXT UNIQUE NOT NULL,
  phone_raw TEXT,
  
  -- CINC source data
  cinc_lead_id TEXT UNIQUE,
  cinc_data JSONB, -- Store all CINC fields as JSON for flexibility
  cinc_received_at TIMESTAMPTZ,
  
  -- Contact information (merged from all sources)
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  email TEXT,
  
  -- Comprehensive profile data (continuously updated)
  profile_data JSONB, -- Merged insights from all sources
  
  -- Lead scoring and temperature
  lead_score INTEGER DEFAULT 0,
  lead_temperature TEXT, -- 'hot', 'warm', 'cool', 'cold'
  qualification_status TEXT, -- 'unqualified', 'qualified', 'pre-approved', 'disqualified'
  
  -- Status and tracking
  status TEXT DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'converted', 'lost'
  source TEXT DEFAULT 'cinc',
  assigned_to TEXT, -- Specialist identifier
  
  -- Timeline tracking
  last_contacted_at TIMESTAMPTZ,
  next_follow_up_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Simplified conversations table
CREATE TABLE conversations_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  lead_id UUID NOT NULL REFERENCES leads_v2(id) ON DELETE CASCADE,
  
  -- Retell call data
  retell_call_id TEXT UNIQUE NOT NULL,
  retell_agent_id TEXT,
  
  -- Call metadata
  direction TEXT, -- 'inbound', 'outbound'
  duration_seconds INTEGER,
  call_status TEXT DEFAULT 'completed',
  
  -- Call content
  transcript TEXT,
  recording_url TEXT,
  
  -- AI analysis results (populated by Make.com)
  ai_summary TEXT,
  ai_insights JSONB, -- Structured data extracted by AI
  
  -- Call quality metrics
  sentiment_score DECIMAL(3,2), -- -1.0 to 1.0
  call_quality_score INTEGER, -- 1-10
  
  -- Timestamps
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI-generated profiles table (comprehensive lead intelligence)
CREATE TABLE ai_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  lead_id UUID NOT NULL REFERENCES leads_v2(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations_v2(id) ON DELETE SET NULL,
  
  -- Financial profile
  annual_income INTEGER,
  credit_score_range TEXT, -- 'excellent', 'good', 'fair', 'poor'
  employment_status TEXT,
  employment_length TEXT,
  is_self_employed BOOLEAN DEFAULT false,
  monthly_debt_payments INTEGER,
  debt_to_income_ratio DECIMAL(5,2),
  
  -- Property interests
  property_type TEXT, -- 'single_family', 'condo', 'townhouse', etc.
  property_use TEXT, -- 'primary_residence', 'investment', 'vacation'
  price_range_min INTEGER,
  price_range_max INTEGER,
  down_payment_percentage INTEGER,
  preferred_locations JSONB, -- Array of location preferences
  
  -- Loan preferences
  loan_type TEXT, -- 'conventional', 'fha', 'va', 'usda'
  loan_amount INTEGER,
  pre_approval_status TEXT, -- 'none', 'pre_qualified', 'pre_approved'
  current_lender TEXT,
  
  -- Timeline and motivation
  buying_timeline TEXT, -- 'immediately', '1-3_months', '3-6_months', '6+_months'
  motivation_factors JSONB, -- Array of motivating factors
  concerns JSONB, -- Array of concerns or objections
  
  -- Preferences and contact
  preferred_contact_method TEXT, -- 'phone', 'email', 'text'
  best_time_to_call TEXT,
  has_realtor BOOLEAN DEFAULT false,
  realtor_name TEXT,
  
  -- Profile confidence and quality
  profile_completeness_score INTEGER DEFAULT 0, -- 0-100
  data_confidence_score INTEGER DEFAULT 0, -- 0-100
  
  -- Processing metadata
  extraction_version TEXT DEFAULT '2.0',
  processed_by TEXT DEFAULT 'makecom', -- 'makecom', 'manual', 'migration'
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CINC lead mapping table (for webhook processing)
CREATE TABLE cinc_lead_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- CINC identifiers
  cinc_lead_id TEXT UNIQUE NOT NULL,
  cinc_contact_id TEXT,
  
  -- Phone mapping
  phone_e164 TEXT NOT NULL,
  phone_raw TEXT,
  
  -- Lead relationship
  lead_v2_id UUID REFERENCES leads_v2(id) ON DELETE CASCADE,
  
  -- CINC metadata
  cinc_payload JSONB, -- Store complete CINC webhook data
  
  -- Processing status
  processing_status TEXT DEFAULT 'pending', -- 'pending', 'processed', 'error'
  error_message TEXT,
  
  -- Timestamps
  received_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Make.com workflow tracking
CREATE TABLE makecom_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Workflow identification
  workflow_name TEXT NOT NULL, -- 'cinc_ingestion_v2', 'retell_processing_v2'
  execution_id TEXT, -- Make.com execution ID
  
  -- Related entities
  lead_id UUID REFERENCES leads_v2(id),
  conversation_id UUID REFERENCES conversations_v2(id),
  
  -- Execution data
  input_data JSONB,
  output_data JSONB,
  
  -- Status tracking
  status TEXT NOT NULL, -- 'running', 'success', 'error', 'timeout'
  error_message TEXT,
  execution_time_ms INTEGER,
  
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_leads_v2_phone_e164 ON leads_v2(phone_e164);
CREATE INDEX idx_leads_v2_cinc_lead_id ON leads_v2(cinc_lead_id);
CREATE INDEX idx_leads_v2_status ON leads_v2(status);
CREATE INDEX idx_leads_v2_lead_temperature ON leads_v2(lead_temperature);
CREATE INDEX idx_leads_v2_created_at ON leads_v2(created_at);

CREATE INDEX idx_conversations_v2_lead_id ON conversations_v2(lead_id);
CREATE INDEX idx_conversations_v2_retell_call_id ON conversations_v2(retell_call_id);
CREATE INDEX idx_conversations_v2_created_at ON conversations_v2(created_at);

CREATE INDEX idx_ai_profiles_lead_id ON ai_profiles(lead_id);
CREATE INDEX idx_ai_profiles_conversation_id ON ai_profiles(conversation_id);

CREATE INDEX idx_cinc_mapping_cinc_lead_id ON cinc_lead_mapping(cinc_lead_id);
CREATE INDEX idx_cinc_mapping_phone_e164 ON cinc_lead_mapping(phone_e164);

CREATE INDEX idx_makecom_workflows_workflow_name ON makecom_workflows(workflow_name);
CREATE INDEX idx_makecom_workflows_status ON makecom_workflows(status);
CREATE INDEX idx_makecom_workflows_created_at ON makecom_workflows(created_at);

-- Update triggers for timestamp management
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_v2_updated_at BEFORE UPDATE ON leads_v2 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_v2_updated_at BEFORE UPDATE ON conversations_v2 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_profiles_updated_at BEFORE UPDATE ON ai_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
