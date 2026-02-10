
-- Game sessions table
CREATE TABLE public.game_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'finished')),
  current_question INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Participants table
CREATE TABLE public.participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  identity_id TEXT NOT NULL,
  identity_name TEXT NOT NULL,
  identity_emoji TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  current_question INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS (permissive for anonymous game)
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- Everyone can read/write sessions (anonymous game)
CREATE POLICY "Anyone can read sessions" ON public.game_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can create sessions" ON public.game_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update sessions" ON public.game_sessions FOR UPDATE USING (true);

-- Everyone can read/write participants
CREATE POLICY "Anyone can read participants" ON public.participants FOR SELECT USING (true);
CREATE POLICY "Anyone can create participants" ON public.participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update participants" ON public.participants FOR UPDATE USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_sessions;
