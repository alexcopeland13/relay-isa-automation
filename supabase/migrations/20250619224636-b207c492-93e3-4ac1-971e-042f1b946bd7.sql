
-- Phase 1: Create app settings table for webhook control
CREATE TABLE IF NOT EXISTS public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Insert the Make.com webhook settings
INSERT INTO public.app_settings (key, value, description) 
VALUES 
  ('app.enable_make_webhook', 'true', 'Enable/disable Make.com webhook notifications for completed conversations'),
  ('make.webhook_url', 'https://hook.us2.make.com/ry8ndgtneeyi8jrmtjsf6g99p27g5qa4', 'Make.com webhook endpoint URL'),
  ('make.api_key', 'mk_relay_7Kj9mN3pQr5tXy8zA2bC4dF6gH', 'Make.com API key for authentication')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Create the notification function for Make.com webhook
CREATE OR REPLACE FUNCTION public.notify_make_com_webhook()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  payload jsonb;
  webhook_enabled boolean;
  current_setting text;
  webhook_url text;
  api_key text;
  http_response jsonb;
BEGIN
  -- Check if webhook is enabled
  SELECT value INTO current_setting 
  FROM app_settings 
  WHERE key = 'app.enable_make_webhook';
  
  -- If setting doesn't exist or is not 'true', return early
  IF NOT COALESCE(current_setting, 'true')::boolean THEN
    RETURN NEW;
  END IF;

  -- Get webhook URL and API key
  SELECT value INTO webhook_url FROM app_settings WHERE key = 'make.webhook_url';
  SELECT value INTO api_key FROM app_settings WHERE key = 'make.api_key';
  
  -- If credentials are missing, log and return
  IF webhook_url IS NULL OR api_key IS NULL THEN
    RAISE NOTICE 'Make.com webhook credentials not configured, skipping webhook for conversation: %', NEW.id;
    RETURN NEW;
  END IF;

  -- Only process when call_status changes to 'completed'
  IF NEW.call_status = 'completed' AND (OLD.call_status IS NULL OR OLD.call_status != 'completed') THEN
    
    -- Build comprehensive payload with all conversation and lead data
    SELECT jsonb_build_object(
      'event_type', 'conversation_completed',
      'timestamp', now(),
      'conversation', jsonb_build_object(
        'id', NEW.id,
        'call_sid', NEW.call_sid,
        'created_at', NEW.created_at,
        'started_at', NEW.started_at,
        'ended_at', NEW.ended_at,
        'duration', NEW.duration,
        'direction', NEW.direction,
        'call_status', NEW.call_status,
        'agent_id', NEW.agent_id,
        'transcript', NEW.transcript,
        'recording_url', NEW.recording_url,
        'sentiment_score', NEW.sentiment_score,
        'extraction_status', NEW.extraction_status,
        'retell_call_data', NEW.retell_call_data,
        'retell_call_analysis', NEW.retell_call_analysis
      ),
      'lead', COALESCE(
        (SELECT jsonb_build_object(
          'id', l.id,
          'first_name', l.first_name,
          'last_name', l.last_name,
          'email', l.email,
          'phone', l.phone,
          'phone_e164', l.phone_e164,
          'status', l.status,
          'source', l.source,
          'created_at', l.created_at,
          'last_contacted', l.last_contacted
        ) FROM leads l WHERE l.id = NEW.lead_id),
        '{}'::jsonb
      ),
      'extractions', COALESCE(
        (SELECT jsonb_agg(
          jsonb_build_object(
            'id', ce.id,
            'extraction_timestamp', ce.extraction_timestamp,
            'conversation_summary', ce.conversation_summary,
            'lead_qualification_status', ce.lead_qualification_status,
            'lead_temperature', ce.lead_temperature,
            'buying_timeline', ce.buying_timeline,
            'lead_score', ce.lead_score,
            'property_price', ce.property_price,
            'annual_income', ce.annual_income,
            'loan_amount', ce.loan_amount,
            'down_payment_amount', ce.down_payment_amount,
            'pre_approval_status', ce.pre_approval_status,
            'current_lender', ce.current_lender,
            'extraction_version', ce.extraction_version
          )
        ) FROM conversation_extractions ce WHERE ce.conversation_id = NEW.id),
        '[]'::jsonb
      )
    ) INTO payload;

    -- Send webhook to Make.com using pg_net extension
    BEGIN
      SELECT net.http_post(
        url := webhook_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-make-apikey', api_key
        ),
        body := payload
      ) INTO http_response;
      
      -- Log successful webhook delivery
      INSERT INTO webhook_events (provider, event_id, payload) 
      VALUES ('make-com-sent', NEW.id::text, 
        jsonb_build_object(
          'payload', payload,
          'response', http_response,
          'webhook_url', webhook_url,
          'status', 'sent'
        )
      );
      
      RAISE NOTICE 'Make.com webhook sent successfully for conversation: %', NEW.id;
      
    EXCEPTION WHEN OTHERS THEN
      -- Log failed webhook delivery
      INSERT INTO webhook_events (provider, event_id, payload) 
      VALUES ('make-com-error', NEW.id::text, 
        jsonb_build_object(
          'payload', payload,
          'error', SQLERRM,
          'webhook_url', webhook_url,
          'status', 'failed'
        )
      );
      
      RAISE NOTICE 'Make.com webhook failed for conversation %, error: %', NEW.id, SQLERRM;
    END;
    
  END IF;

  RETURN NEW;
END;
$$;

-- Phase 2: Create the trigger
DROP TRIGGER IF EXISTS trigger_notify_make_com ON conversations;

CREATE TRIGGER trigger_notify_make_com
  AFTER UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION notify_make_com_webhook();

-- Add comments for documentation
COMMENT ON TABLE public.app_settings IS 'Application-wide settings and configuration values';
COMMENT ON FUNCTION public.notify_make_com_webhook() IS 'Sends webhook to Make.com when conversations are completed. Includes comprehensive conversation, lead, and extraction data. Can be enabled/disabled via app_settings.';

-- Show current configuration
SELECT 
  'Make.com webhook configured and ready' AS status,
  'Webhook enabled: ' || COALESCE((SELECT value FROM app_settings WHERE key = 'app.enable_make_webhook'), 'true') AS webhook_status,
  'Webhook URL configured: ' || CASE WHEN (SELECT value FROM app_settings WHERE key = 'make.webhook_url') IS NOT NULL THEN 'Yes' ELSE 'No' END AS url_status,
  'API Key configured: ' || CASE WHEN (SELECT value FROM app_settings WHERE key = 'make.api_key') IS NOT NULL THEN 'Yes' ELSE 'No' END AS key_status;

-- Helper commands for managing the webhook
SELECT 'To disable webhook: UPDATE app_settings SET value = ''false'' WHERE key = ''app.enable_make_webhook'';' AS disable_command;
SELECT 'To enable webhook: UPDATE app_settings SET value = ''true'' WHERE key = ''app.enable_make_webhook'';' AS enable_command;
