
-- Fix the ai_profiles table to have the proper unique constraint for the upsert operation
ALTER TABLE ai_profiles 
ADD CONSTRAINT ai_profiles_lead_conversation_unique 
UNIQUE (lead_id, conversation_id);
