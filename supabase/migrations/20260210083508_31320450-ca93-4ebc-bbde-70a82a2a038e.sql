
-- Add creator_token for ownership verification
ALTER TABLE public.game_sessions ADD COLUMN creator_token UUID NOT NULL DEFAULT gen_random_uuid();

-- Drop the overly permissive UPDATE policy
DROP POLICY "Anyone can update sessions" ON public.game_sessions;

-- Create security definer function to update session with token check
CREATE OR REPLACE FUNCTION public.update_session_status(
  p_session_id UUID,
  p_creator_token UUID,
  p_status TEXT,
  p_current_question INT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE game_sessions
  SET status = p_status,
      current_question = COALESCE(p_current_question, current_question)
  WHERE id = p_session_id AND creator_token = p_creator_token;
  RETURN FOUND;
END;
$$;
