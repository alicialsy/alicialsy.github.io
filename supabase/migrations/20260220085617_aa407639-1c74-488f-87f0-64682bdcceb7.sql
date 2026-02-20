-- Recreate the view WITHOUT security_invoker so it runs as the view owner (definer)
-- This allows anon users to read public session data through the view
DROP VIEW IF EXISTS public.game_sessions_public;

CREATE VIEW public.game_sessions_public AS
  SELECT id, room_code, status, current_question, created_at
  FROM public.game_sessions;

-- Also check participants_public
DROP VIEW IF EXISTS public.participants_public;

CREATE VIEW public.participants_public AS
  SELECT id, session_id, identity_id, identity_name, identity_emoji, position, current_question, created_at
  FROM public.participants;