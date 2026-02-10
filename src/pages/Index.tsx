import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRandomIdentity, Identity, identities } from "@/data/gameData";
import { joinSession } from "@/lib/gameService";

const Index = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"home" | "join" | "solo" | "reveal">("home");
  const [roomCode, setRoomCode] = useState("");
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [sessionData, setSessionData] = useState<{
    sessionId: string;
    participantId: string;
    participantToken: string;
  } | null>(null);

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) return;
    setJoining(true);
    setError("");

    const result = await joinSession(roomCode.trim());
    if (!result) {
      setError("房间不存在或已关闭，请检查房间码");
      setJoining(false);
      return;
    }

    setSessionData({ sessionId: result.sessionId, participantId: result.participantId, participantToken: result.participantToken });

    // Find full identity
    const fullIdentity = identities.find((i) => i.id === result.identityId) || {
      id: result.identityId,
      name: result.identityName,
      emoji: result.identityEmoji,
      description: "",
      color: "hsl(352, 85%, 44%)",
    };

    // Shuffle animation
    setMode("reveal");
    setIsRevealing(true);
    let count = 0;
    const interval = setInterval(() => {
      setIdentity(getRandomIdentity());
      count++;
      if (count > 8) {
        clearInterval(interval);
        setIdentity(fullIdentity);
        setRevealed(true);
        setJoining(false);
      }
    }, 120);
  };

  const handleSoloStart = () => {
    setMode("reveal");
    setIsRevealing(true);
    const finalIdentity = getRandomIdentity();
    let count = 0;
    const interval = setInterval(() => {
      setIdentity(getRandomIdentity());
      count++;
      if (count > 8) {
        clearInterval(interval);
        setIdentity(finalIdentity);
        setRevealed(true);
      }
    }, 120);
  };

  const handleStart = () => {
    if (identity) {
      navigate("/game", {
        state: {
          identity,
          sessionId: sessionData?.sessionId || null,
          participantId: sessionData?.participantId || null,
          participantToken: sessionData?.participantToken || null,
        },
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="mb-4 flex items-center justify-center gap-3">
          <span className="text-4xl text-rc-red font-bold">✚</span>
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            向前一步
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">Power Walk · 社区平等意识互动体验</p>
      </div>

      {/* Content */}
      <div className="w-full max-w-md">
        {mode === "home" && (
          <div className="flex flex-col items-center gap-6 question-enter">
            <p className="text-center text-muted-foreground leading-relaxed">
              你将随机获得一个社区身份。<br />
              请尝试站在这个角色的视角，<br />
              回答接下来的 10 个问题。
            </p>
            <button
              onClick={handleSoloStart}
              className="w-full rounded-xl bg-rc-red px-10 py-4 text-lg font-semibold text-primary-foreground shadow-lg transition-all hover:opacity-90 active:scale-95 pulse-glow"
            >
              开始体验
            </button>
            <div className="flex items-center gap-4 w-full">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">或</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <button
              onClick={() => setMode("join")}
              className="w-full rounded-xl border-2 border-border bg-card px-10 py-4 text-lg font-semibold text-foreground shadow transition-all hover:bg-muted active:scale-95"
            >
              输入房间码加入
            </button>
            <button
              onClick={() => navigate("/instructor")}
              className="text-sm text-muted-foreground underline hover:text-foreground transition-colors"
            >
              我是讲师 →
            </button>
          </div>
        )}

        {mode === "join" && (
          <div className="flex flex-col items-center gap-6 question-enter">
            <p className="text-center text-muted-foreground">输入讲师提供的房间码</p>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="例如: AB12"
              maxLength={4}
              className="w-48 rounded-xl border-2 border-border bg-card py-4 text-center text-2xl font-bold tracking-[0.3em] text-foreground outline-none focus:border-rc-red transition-colors"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button
              onClick={handleJoinRoom}
              disabled={joining || roomCode.length < 4}
              className="w-full rounded-xl bg-rc-red px-10 py-4 text-lg font-semibold text-primary-foreground shadow-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            >
              {joining ? "加入中..." : "加 入"}
            </button>
            <button
              onClick={() => setMode("home")}
              className="text-sm text-muted-foreground underline hover:text-foreground transition-colors"
            >
              ← 返回
            </button>
          </div>
        )}

        {mode === "reveal" && (
          <div className="flex flex-col items-center gap-6 question-enter">
            <div
              className="flex h-32 w-32 items-center justify-center rounded-2xl bg-card shadow-xl border border-border text-6xl transition-all"
              style={{ borderColor: identity?.color }}
            >
              {identity?.emoji}
            </div>
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-bold text-foreground">{identity?.name}</h2>
              {revealed && (
                <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto question-enter">
                  {identity?.description}
                </p>
              )}
            </div>
            {revealed && (
              <button
                onClick={handleStart}
                className="mt-4 rounded-xl bg-rc-red px-10 py-4 text-lg font-semibold text-primary-foreground shadow-lg transition-all hover:opacity-90 active:scale-95 question-enter"
              >
                开 始 游 戏
              </button>
            )}
          </div>
        )}
      </div>

      <p className="mt-16 text-xs text-muted-foreground">
        本活动仅用于培训体验，不代表真实判断
      </p>
    </div>
  );
};

export default Index;
