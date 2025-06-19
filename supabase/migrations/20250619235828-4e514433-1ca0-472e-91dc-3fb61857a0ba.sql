
-- Enable pg_net extension to allow HTTP requests from database functions
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove the check_property_type constraint that's causing extraction failures
ALTER TABLE conversation_extractions 
DROP CONSTRAINT IF EXISTS check_property_type;
