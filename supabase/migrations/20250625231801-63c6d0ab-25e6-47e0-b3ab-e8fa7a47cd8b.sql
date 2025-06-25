
-- Phase 1: Clean up stuck active conversations from the past 24 hours
-- This will allow Make.com triggers to fire for completed calls that were missed

UPDATE conversations 
SET 
  call_status = 'completed',
  ended_at = COALESCE(ended_at, started_at + INTERVAL '10 minutes', created_at + INTERVAL '10 minutes'),
  extraction_status = 'pending'
WHERE 
  call_status = 'active' 
  AND created_at > NOW() - INTERVAL '24 hours'
  AND started_at IS NOT NULL;

-- Also clean up any conversations that are stuck in active status without a started_at time
UPDATE conversations 
SET 
  call_status = 'completed',
  ended_at = created_at + INTERVAL '5 minutes',
  extraction_status = 'pending'
WHERE 
  call_status = 'active' 
  AND created_at > NOW() - INTERVAL '24 hours'
  AND started_at IS NULL;

-- Show the results of what we just fixed
SELECT 
  id, 
  call_sid, 
  agent_id,
  call_status, 
  created_at, 
  started_at, 
  ended_at,
  extraction_status
FROM conversations 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
