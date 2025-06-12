
-- 1. conversation_messages (idempotent)
CREATE TABLE IF NOT EXISTS public.conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('agent','lead')),
  content TEXT NOT NULL,
  seq INTEGER NOT NULL DEFAULT 0,
  ts TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. extraction_status (idempotent)
ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS extraction_status TEXT
  DEFAULT 'pending'
  CHECK (extraction_status IN ('pending','processing','done','failed'));

-- 3. indexes (safe to run multiple times)
CREATE INDEX IF NOT EXISTS idx_conv_msgs_conv_id ON public.conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conv_msgs_seq ON public.conversation_messages(conversation_id, seq);
CREATE INDEX IF NOT EXISTS idx_convs_ext_status ON public.conversations(extraction_status);

-- Enable Row Level Security on conversation_messages
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for conversation_messages (using DO blocks for idempotency)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversation_messages' AND policyname = 'Allow public read access to conversation messages') THEN
    CREATE POLICY "Allow public read access to conversation messages" 
      ON public.conversation_messages 
      FOR SELECT 
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversation_messages' AND policyname = 'Allow public insert access to conversation messages') THEN
    CREATE POLICY "Allow public insert access to conversation messages" 
      ON public.conversation_messages 
      FOR INSERT 
      WITH CHECK (true);
  END IF;
END $$;

-- 4. realtime publication (idempotent wrapper)
ALTER TABLE public.conversation_messages REPLICA IDENTITY FULL;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_messages;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Also enable realtime for conversations table updates (if not already enabled)
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
