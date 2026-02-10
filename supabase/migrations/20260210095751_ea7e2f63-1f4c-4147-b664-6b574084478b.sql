
-- 1. Create a public view that excludes creator_token
CREATE VIEW public.game_sessions_public
WITH (security_invoker = on) AS
SELECT id, room_code, status, current_question, created_at
FROM public.game_sessions;

-- 2. Drop the old permissive SELECT policy on base table
DROP POLICY "Anyone can read sessions" ON public.game_sessions;

-- 3. Deny direct SELECT on the base table (force use of view)
CREATE POLICY "No direct select on game_sessions"
ON public.game_sessions FOR SELECT
USING (false);

-- 4. Grant SELECT on the view to anon and authenticated
GRANT SELECT ON public.game_sessions_public TO anon, authenticated;

-- 5. Create a SECURITY DEFINER function to create sessions and return token securely
CREATE OR REPLACE FUNCTION public.create_game_session(p_room_code text)
RETURNS TABLE(session_id uuid, room_code text, creator_token uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_id uuid;
  v_creator_token uuid;
BEGIN
  INSERT INTO game_sessions (room_code)
  VALUES (p_room_code)
  RETURNING id, game_sessions.creator_token INTO v_session_id, v_creator_token;

  RETURN QUERY SELECT v_session_id, p_room_code, v_creator_token;
END;
$$;
