import { useLocation, useNavigate } from "react-router-dom";
import { Identity, questions } from "@/data/gameData";

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { identity, position, answers } = (location.state || {}) as {
    identity?: Identity;
    position?: number;
    answers?: boolean[];
  };

  if (!identity || position === undefined || !answers) {
    navigate("/");
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg question-enter">
        <div className="mb-8 text-center">
          <span className="text-5xl">{identity.emoji}</span>
          <h2 className="mt-4 text-2xl font-bold text-foreground">{identity.name}</h2>
          <p className="mt-2 text-muted-foreground">{identity.description}</p>
        </div>

        {/* Position result */}
        <div className="mb-8 rounded-2xl bg-card p-6 shadow-lg border border-border text-center">
          <p className="text-sm text-muted-foreground mb-2">最终位置</p>
          <div className="flex items-end justify-center gap-1">
            <span className="text-5xl font-black text-rc-red">{position}</span>
            <span className="text-xl text-muted-foreground mb-1">/ 10</span>
          </div>
          <div className="mt-4 h-3 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-rc-red transition-all duration-1000"
              style={{ width: `${(position / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* Answer breakdown */}
        <div className="rounded-2xl bg-card p-6 shadow-lg border border-border mb-8">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">回答详情</h3>
          <div className="space-y-3">
            {questions.map((q, i) => (
              <div key={q.id} className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    answers[i]
                      ? "bg-rc-red text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {answers[i] ? "✓" : "—"}
                </span>
                <p className="text-sm text-foreground leading-relaxed">{q.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="rounded-xl bg-rc-red px-8 py-3 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:opacity-90 active:scale-95"
          >
            再来一次
          </button>
          <button
            onClick={() => navigate("/instructor")}
            className="text-sm text-muted-foreground underline hover:text-foreground transition-colors"
          >
            查看讲师大屏
          </button>
        </div>
      </div>
    </div>
  );
};

export default Result;
