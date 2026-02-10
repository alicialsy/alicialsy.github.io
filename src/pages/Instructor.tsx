import { identities } from "@/data/gameData";

// Demo data for instructor dashboard (without backend)
const demoParticipants = identities.map((identity, i) => ({
  identity,
  position: Math.floor(Math.random() * 11),
  sessionId: `demo-${i}`,
}));

const Instructor = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
            <span className="rounded-full bg-muted px-4 py-1.5 text-sm text-muted-foreground">
              参与者: {demoParticipants.length}
            </span>
            <span className="rounded-full bg-rc-red-light text-rc-red px-4 py-1.5 text-sm font-medium">
              演示模式
            </span>
          </div>
        </div>
      </header>

      {/* Main Track */}
      <div className="p-8">
        <div className="rounded-2xl bg-card border border-border p-8 shadow-sm">
          {/* Scale header */}
          <div className="mb-2 flex justify-between px-12">
            {Array.from({ length: 11 }, (_, i) => (
              <span
                key={i}
                className="w-8 text-center text-sm font-semibold text-muted-foreground"
              >
                {i}
              </span>
            ))}
          </div>

          {/* Scale line */}
          <div className="relative mx-12 mb-8">
            <div className="h-1 w-full rounded-full bg-muted" />
            <div className="absolute top-0 left-0 right-0 flex justify-between">
              {Array.from({ length: 11 }, (_, i) => (
                <div key={i} className="flex flex-col items-center -mt-1">
                  <div className="w-0.5 h-3 bg-rc-gray rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Participants */}
          <div className="space-y-4">
            {demoParticipants.map((p) => (
              <div key={p.sessionId} className="flex items-center gap-4">
                {/* Avatar & name */}
                <div className="flex w-36 items-center gap-2 shrink-0">
                  <span className="text-2xl">{p.identity.emoji}</span>
                  <span className="text-sm font-medium text-foreground truncate">
                    {p.identity.name}
                  </span>
                </div>

                {/* Track */}
                <div className="relative flex-1">
                  <div className="h-8 rounded-full bg-muted/50" />
                  <div
                    className="absolute top-1 left-0 avatar-token"
                    style={{
                      transform: `translateX(${(p.position / 10) * 100}%)`,
                    }}
                  >
                    <div
                      className="flex h-6 items-center gap-1 rounded-full px-3 text-xs font-bold text-primary-foreground shadow"
                      style={{ backgroundColor: p.identity.color }}
                    >
                      {p.identity.emoji} {p.position}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 rounded-xl bg-rc-red-light border border-rc-red/20 p-4 text-center">
          <p className="text-sm text-rc-red">
            ⚡ 当前为演示模式，显示随机数据。启用后端后可实现实时同步。
          </p>
        </div>
      </div>
    </div>
  );
};

export default Instructor;
