
CREATE OR REPLACE FUNCTION public.get_active_calls()
RETURNS TABLE (
  conversation_id uuid,
  lead_id uuid,
  call_status text,
  started_at timestamp with time zone,
  call_sid text,
  lead_name text,
  lead_phone text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as conversation_id,
    c.lead_id,
    c.call_status,
    c.started_at,
    c.call_sid,
    CONCAT(l.first_name, ' ', l.last_name) as lead_name,
    COALESCE(l.phone_e164, l.phone, l.phone_raw) as lead_phone
  FROM conversations c
  LEFT JOIN leads l ON c.lead_id = l.id
  WHERE c.call_status = 'active'
  ORDER BY c.started_at DESC;
END;
$$;
