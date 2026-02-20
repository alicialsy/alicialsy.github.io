-- Drop the restrictive SELECT policy on participants
DROP POLICY IF EXISTS "No direct select on participants" ON public.participants;

-- Allow SELECT so realtime subscriptions can deliver events
-- The participants_public view is still used in app code to hide participant_token
CREATE POLICY "Allow read participants for realtime"
  ON public.participants FOR SELECT
  USING (true);