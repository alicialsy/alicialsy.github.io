DROP FUNCTION IF EXISTS public.join_game_session(uuid, text, text, text);

CREATE OR REPLACE FUNCTION public.join_game_session(p_session_id uuid, p_identity_id text, p_identity_name text, p_identity_emoji text)
 RETURNS TABLE(participant_id uuid, participant_token uuid, assigned_identity_id text, assigned_identity_name text, assigned_identity_emoji text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  v_participant_id uuid;
  v_participant_token uuid;
  v_status text;
  v_final_identity_id text;
  v_final_identity_name text;
  v_final_identity_emoji text;
  v_existing_count int;
BEGIN
  SELECT status INTO v_status FROM game_sessions WHERE id = p_session_id;
  IF v_status IS NULL THEN
    RAISE EXCEPTION 'Session not found';
  END IF;

  -- Check if requested identity is already taken
  SELECT COUNT(*) INTO v_existing_count
  FROM participants
  WHERE session_id = p_session_id AND identity_id = p_identity_id;

  IF v_existing_count = 0 THEN
    v_final_identity_id := p_identity_id;
    v_final_identity_name := p_identity_name;
    v_final_identity_emoji := p_identity_emoji;
  ELSE
    -- All 10 taken? allow duplicate as fallback
    v_final_identity_id := p_identity_id;
    v_final_identity_name := p_identity_name;
    v_final_identity_emoji := p_identity_emoji;
  END IF;

  INSERT INTO participants (session_id, identity_id, identity_name, identity_emoji)
  VALUES (p_session_id, v_final_identity_id, v_final_identity_name, v_final_identity_emoji)
  RETURNING id, participants.participant_token INTO v_participant_id, v_participant_token;

  RETURN QUERY SELECT v_participant_id, v_participant_token, v_final_identity_id, v_final_identity_name, v_final_identity_emoji;
END;
$$;