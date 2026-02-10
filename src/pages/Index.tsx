import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRandomIdentity, Identity } from "@/data/gameData";

const Index = () => {
  const navigate = useNavigate();
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const handleDraw = () => {
    setIsRevealing(true);
    // Shuffle animation
    let count = 0;
    const interval = setInterval(() => {
      setIdentity(getRandomIdentity());
      count++;
      if (count > 8) {
        clearInterval(interval);
        const final = getRandomIdentity();
        setIdentity(final);
        setRevealed(true);
      }
    }, 120);
  };

  const handleStart = () => {
    if (identity) {
      navigate("/game", { state: { identity } });
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

      {/* Card area */}
      <div className="w-full max-w-md">
        {!isRevealing ? (
          <div className="flex flex-col items-center gap-8">
            <p className="text-center text-muted-foreground leading-relaxed">
              你将随机获得一个社区身份。<br />
              请尝试站在这个角色的视角，<br />
              回答接下来的 10 个问题。
            </p>
            <button
              onClick={handleDraw}
              className="rounded-xl bg-rc-red px-10 py-4 text-lg font-semibold text-primary-foreground shadow-lg transition-all hover:opacity-90 active:scale-95 pulse-glow"
            >
              抽 取 身 份
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 question-enter">
            <div
              className="flex h-32 w-32 items-center justify-center rounded-2xl bg-card shadow-xl border border-border text-6xl transition-all"
              style={{ borderColor: identity?.color }}
            >
              {identity?.emoji}
            </div>
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-bold text-foreground">
                {identity?.name}
              </h2>
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

      {/* Footer */}
      <p className="mt-16 text-xs text-muted-foreground">
        本活动仅用于培训体验，不代表真实判断
      </p>
    </div>
  );
};

export default Index;
