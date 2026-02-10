import { supabase } from "@/integrations/supabase/client";
import { getRandomIdentity } from "@/data/gameData";

// Generate a random 4-character room code
function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function createSession(): Promise<{ sessionId: string; roomCode: string } | null> {
  const roomCode = generateRoomCode();
  const { data, error } = await supabase
    .from("game_sessions")
    .insert({ room_code: roomCode })
    .select("id, room_code")
    .single();

  if (error) {
    console.error("Failed to create session:", error);
    return null;
  }
  return { sessionId: data.id, roomCode: data.room_code };
}

export async function joinSession(roomCode: string): Promise<{
  sessionId: string;
  participantId: string;
  identityName: string;
  identityEmoji: string;
  identityId: string;
} | null> {
  // Find session
  const { data: session, error: sessionError } = await supabase
    .from("game_sessions")
    .select("id, status")
    .eq("room_code", roomCode.toUpperCase())
    .single();

  if (sessionError || !session) {
    console.error("Session not found:", sessionError);
    return null;
  }

  // Assign random identity
  const identity = getRandomIdentity();

  // Create participant
  const { data: participant, error: participantError } = await supabase
    .from("participants")
    .insert({
      session_id: session.id,
      identity_id: identity.id,
      identity_name: identity.name,
      identity_emoji: identity.emoji,
    })
    .select("id")
    .single();

  if (participantError || !participant) {
    console.error("Failed to join session:", participantError);
    return null;
  }

  return {
    sessionId: session.id,
    participantId: participant.id,
    identityName: identity.name,
    identityEmoji: identity.emoji,
    identityId: identity.id,
  };
}

export async function updateParticipantPosition(participantId: string, position: number) {
  await supabase
    .from("participants")
    .update({ position })
    .eq("id", participantId);
}

export async function updateSessionStatus(sessionId: string, status: string, currentQuestion?: number) {
  const update: Record<string, unknown> = { status };
  if (currentQuestion !== undefined) update.current_question = currentQuestion;
  await supabase
    .from("game_sessions")
    .update(update)
    .eq("id", sessionId);
}

export interface ParticipantData {
  id: string;
  identity_id: string;
  identity_name: string;
  identity_emoji: string;
  position: number;
  current_question: number;
}

export function subscribeToParticipants(
  sessionId: string,
  callback: (participants: ParticipantData[]) => void
) {
  // Initial fetch
  const fetchAll = async () => {
    const { data } = await supabase
      .from("participants")
      .select("*")
      .eq("session_id", sessionId);
    if (data) callback(data);
  };

  fetchAll();

  // Realtime subscription
  const channel = supabase
    .channel(`participants-${sessionId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "participants",
        filter: `session_id=eq.${sessionId}`,
      },
      () => {
        fetchAll();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToSession(
  sessionId: string,
  callback: (session: { status: string; current_question: number }) => void
) {
  const channel = supabase
    .channel(`session-${sessionId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "game_sessions",
        filter: `id=eq.${sessionId}`,
      },
      (payload) => {
        callback(payload.new as { status: string; current_question: number });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
