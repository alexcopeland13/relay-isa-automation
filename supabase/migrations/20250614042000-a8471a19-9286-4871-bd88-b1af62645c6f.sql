
-- First, check for duplicates and clean them up
-- Delete duplicate rows, keeping only the newest one for each (conversation_id, seq) combination
DELETE FROM public.conversation_messages
WHERE id NOT IN (
  SELECT DISTINCT ON (conversation_id, seq) id
  FROM public.conversation_messages
  ORDER BY conversation_id, seq, created_at DESC
);

-- Now add the unique constraint for conversation_id and seq combination
ALTER TABLE public.conversation_messages
ADD CONSTRAINT conversation_messages_unique_seq
UNIQUE (conversation_id, seq);
