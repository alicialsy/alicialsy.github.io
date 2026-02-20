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

export async function createSession(): Promise<{ sessionId: string; roomCode: string; creatorToken: string } | null> {
  const roomCode = generateRoomCode();
  // Use SECURITY DEFINER function so creator_token is never exposed via SELECT
  const { data, error } = await supabase.rpc("create_game_session", {
    p_room_code: roomCode,
  });

  if (error || !data || data.length === 0) {
    console.error("Failed to create session:", error);
    return null;
  }
  const row = data[0];
  return { sessionId: row.session_id, roomCode: row.room_code, creatorToken: row.creator_token };
}

export async function joinSession(roomCode: string): Promise<{
  sessionId: string;
  participantId: string;
  participantToken: string;
  identityName: string;
  identityEmoji: string;
  identityId: string;
} | null> {
  // Find session via public view
  const { data: session, error: sessionError } = await supabase
    .from("game_sessions_public")
    .select("id, status")
    .eq("room_code", roomCode.toUpperCase())
    .maybeSingle();

  if (sessionError || !session) {
    console.error("Session not found:", sessionError);
    return null;
  }

  // Fetch existing participants to avoid duplicate identities
  const { data: existing } = await supabase
    .from("participants_public")
    .select("identity_id")
    .eq("session_id", session.id);

  const takenIds = new Set((existing || []).map((p) => p.identity_id));
  const { identities } = await import("@/data/gameData");
  const available = identities.filter((i) => !takenIds.has(i.id));

  // Pick from available, or fallback to random if all taken
  const identity =
    available.length > 0
      ? available[Math.floor(Math.random() * available.length)]
      : getRandomIdentity();

  // Create participant via secure RPC
  const { data, error } = await supabase.rpc("join_game_session", {
    p_session_id: session.id,
    p_identity_id: identity.id,
    p_identity_name: identity.name,
    p_identity_emoji: identity.emoji,
  });

  if (error || !data || data.length === 0) {
    console.error("Failed to join session:", error);
    return null;
  }

  return {
    sessionId: session.id,
    participantId: data[0].participant_id,
    participantToken: data[0].participant_token,
    identityName: data[0].assigned_identity_name || identity.name,
    identityEmoji: data[0].assigned_identity_emoji || identity.emoji,
    identityId: data[0].assigned_identity_id || identity.id,
  };
}

export async function updateParticipantPosition(participantId: string, participantToken: string, position: number) {
  const { error } = await supabase.rpc("update_participant_position", {
    p_participant_id: participantId,
    p_participant_token: participantToken,
    p_position: position,
  });
  if (error) console.error("Failed to update position:", error);
}

export async function updateSessionStatus(sessionId: string, creatorToken: string, status: string, currentQuestion?: number) {
  const { data, error } = await supabase.rpc("update_session_status", {
    p_session_id: sessionId,
    p_creator_token: creatorToken,
    p_status: status,
    p_current_question: currentQuestion ?? null,
  });
  if (error) console.error("Failed to update session:", error);
  return data;
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
      .from("participants_public")
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
