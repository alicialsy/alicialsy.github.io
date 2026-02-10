import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { identities } from "@/data/gameData";
import {
  createSession,
  subscribeToParticipants,
  updateSessionStatus,
  ParticipantData,
} from "@/lib/gameService";

const Instructor = () => {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [creatorToken, setCreatorToken] = useState<string>("");
  const [roomCode, setRoomCode] = useState<string>("");
  const [participants, setParticipants] = useState<ParticipantData[]>([]);
  const [creating, setCreating] = useState(false);

  const handleCreate = useCallback(async () => {
    setCreating(true);
    const result = await createSession();
    if (result) {
      setSessionId(result.sessionId);
      setRoomCode(result.roomCode);
      setCreatorToken(result.creatorToken);
    }
    setCreating(false);
  }, []);

  // Subscribe to participants when session exists
  useEffect(() => {
    if (!sessionId) return;
    const unsub = subscribeToParticipants(sessionId, (data) => {
      setParticipants(data);
    });
    return unsub;
  }, [sessionId]);

  const handleEndGame = async () => {
    if (sessionId && creatorToken) {
      await updateSessionStatus(sessionId, creatorToken, "finished");
    }
  };

  const getColor = (identityId: string) => {
    return identities.find((i) => i.id === identityId)?.color || "hsl(352, 85%, 44%)";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl text-rc-red font-bold">✚</span>
            <div>
              <h1 className="text-lg font-bold text-foreground">向前一步 · 讲师大屏</h1>
              <p className="text-xs text-muted-foreground">Power Walk Instructor Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {sessionId && (
              <>
                <span className="rounded-full bg-muted px-4 py-1.5 text-sm text-muted-foreground">
                  参与者: {participants.length}
                </span>
                <button
                  onClick={handleEndGame}
                  className="rounded-full bg-muted px-4 py-1.5 text-sm text-muted-foreground hover:bg-destructive hover:text-primary-foreground transition-colors"
                >
                  结束游戏
                </button>
              </>
            )}
            <button
              onClick={() => navigate("/")}
              className="text-sm text-muted-foreground underline hover:text-foreground"
            >
              返回首页
            </button>
          </div>
        </div>
      </header>

      <div className="p-8">
        {!sessionId ? (
          <div className="flex flex-col items-center justify-center py-20 question-enter">
            <h2 className="mb-4 text-2xl font-bold text-foreground">创建游戏房间</h2>
            <p className="mb-8 text-muted-foreground text-center max-w-md">
              创建一个房间后，参与者可以用房间码加入。你将实时看到所有人在刻度线上的位置。
            </p>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="rounded-xl bg-rc-red px-10 py-4 text-lg font-semibold text-primary-foreground shadow-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            >
              {creating ? "创建中..." : "创建房间"}
            </button>
          </div>
        ) : (
          <div className="question-enter">
            {/* Room code display */}
            <div className="mb-8 flex items-center justify-center gap-6">
              <div className="rounded-2xl bg-card border border-border p-6 shadow-sm text-center">
                <p className="text-sm text-muted-foreground mb-2">房间码</p>
                <p className="text-4xl font-black tracking-[0.3em] text-rc-red">{roomCode}</p>
                <p className="mt-2 text-xs text-muted-foreground">请将此房间码告知参与者</p>
              </div>
            </div>

            {participants.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground">等待参与者加入...</p>
                <div className="mt-4 flex justify-center">
                  <div className="h-2 w-2 rounded-full bg-rc-red animate-pulse mx-1" />
                  <div className="h-2 w-2 rounded-full bg-rc-red animate-pulse mx-1" style={{ animationDelay: "0.2s" }} />
                  <div className="h-2 w-2 rounded-full bg-rc-red animate-pulse mx-1" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-card border border-border p-8 shadow-sm">
                {/* Scale header */}
                <div className="mb-2 flex justify-between px-36">
                  {Array.from({ length: 11 }, (_, i) => (
                    <span key={i} className="w-8 text-center text-sm font-semibold text-muted-foreground">
                      {i}
                    </span>
                  ))}
                </div>

                {/* Scale line */}
                <div className="relative mx-36 mb-8">
                  <div className="h-1 w-full rounded-full bg-muted" />
                  <div className="absolute top-0 left-0 right-0 flex justify-between">
                    {Array.from({ length: 11 }, (_, i) => (
                      <div key={i} className="flex flex-col items-center -mt-1">
                        <div className="w-0.5 h-3 rounded bg-rc-gray" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Participants */}
                <div className="space-y-4">
                  {participants.map((p) => (
                    <div key={p.id} className="flex items-center gap-4">
                      <div className="flex w-36 items-center gap-2 shrink-0">
                        <span className="text-2xl">{p.identity_emoji}</span>
                        <span className="text-sm font-medium text-foreground truncate">
                          {p.identity_name}
                        </span>
                      </div>
                      <div className="relative flex-1 h-8">
                        <div className="absolute inset-0 rounded-full bg-muted/50" />
                        <div
                          className="absolute top-1 avatar-token"
                          style={{
                            left: `${(p.position / 10) * 100}%`,
                          }}
                        >
                          <div
                            className="flex h-6 items-center gap-1 rounded-full px-3 text-xs font-bold text-primary-foreground shadow"
                            style={{ backgroundColor: getColor(p.identity_id) }}
                          >
                            {p.identity_emoji} {p.position}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Instructor;
