
-- 1. Add participant_token column
ALTER TABLE public.participants ADD COLUMN participant_token uuid NOT NULL DEFAULT gen_random_uuid();

-- 2. Create a public view excluding participant_token
CREATE VIEW public.participants_public
WITH (security_invoker = on) AS
SELECT id, session_id, identity_id, identity_name, identity_emoji, position, current_question, created_at
FROM public.participants;

GRANT SELECT ON public.participants_public TO anon, authenticated;

-- 3. Drop old permissive policies
DROP POLICY "Anyone can read participants" ON public.participants;
DROP POLICY "Anyone can update participants" ON public.participants;
DROP POLICY "Anyone can create participants" ON public.participants;

-- 4. Deny direct SELECT on base table
CREATE POLICY "No direct select on participants"
ON public.participants FOR SELECT USING (false);

-- 5. Deny direct INSERT on base table
CREATE POLICY "No direct insert on participants"
ON public.participants FOR INSERT WITH CHECK (false);

-- 6. Deny direct UPDATE on base table
CREATE POLICY "No direct update on participants"
ON public.participants FOR UPDATE USING (false);

-- 7. RPC to join session (returns participant_token securely)
CREATE OR REPLACE FUNCTION public.join_game_session(
  p_session_id uuid,
  p_identity_id text,
  p_identity_name text,
  p_identity_emoji text
)
RETURNS TABLE(participant_id uuid, participant_token uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_participant_id uuid;
  v_participant_token uuid;
  v_status text;
BEGIN
  -- Check session exists and is active
  SELECT status INTO v_status FROM game_sessions WHERE id = p_session_id;
  IF v_status IS NULL THEN
    RAISE EXCEPTION 'Session not found';
  END IF;

  INSERT INTO participants (session_id, identity_id, identity_name, identity_emoji)
  VALUES (p_session_id, p_identity_id, p_identity_name, p_identity_emoji)
  RETURNING id, participants.participant_token INTO v_participant_id, v_participant_token;

  RETURN QUERY SELECT v_participant_id, v_participant_token;
END;
$$;

-- 8. RPC to update position (requires participant_token)
CREATE OR REPLACE FUNCTION public.update_participant_position(
  p_participant_id uuid,
  p_participant_token uuid,
  p_position integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_position < 0 OR p_position > 10 THEN
    RAISE EXCEPTION 'Invalid position value';
  END IF;

  UPDATE participants
  SET position = p_position
  WHERE id = p_participant_id AND participant_token = p_participant_token;

  RETURN FOUND;
END;
$$;
