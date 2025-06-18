
-- Add new columns to conversations table for enhanced Retell data
ALTER TABLE public.conversations 
ADD COLUMN retell_call_data JSONB,
ADD COLUMN retell_call_analysis JSONB;

-- Add comments to document the new columns
COMMENT ON COLUMN public.conversations.retell_call_data IS 'Complete call data from Retell API including transcript_object, metadata, and performance metrics';
COMMENT ON COLUMN public.conversations.retell_call_analysis IS 'Post-call analysis from Retell API including sentiment, summary, and custom extracted data';

-- Create indexes for better query performance on JSONB columns
CREATE INDEX IF NOT EXISTS idx_conversations_retell_call_data ON public.conversations USING GIN (retell_call_data);
CREATE INDEX IF NOT EXISTS idx_conversations_retell_call_analysis ON public.conversations USING GIN (retell_call_analysis);
