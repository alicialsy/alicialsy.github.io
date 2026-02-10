import { Identity } from "@/data/gameData";

interface AvatarTrackProps {
  identity: Identity;
  position: number;
  totalSteps: number;
}

const AvatarTrack = ({ identity, position, totalSteps }: AvatarTrackProps) => {
  const percentage = (position / totalSteps) * 100;

  return (
    <div className="w-full max-w-2xl">
      {/* Avatar moving along the track */}
      <div className="relative mb-4 h-20">
        <div
          className="avatar-token absolute top-0"
          style={{
            left: `${percentage}%`,
            transform: `translateX(-50%)`,
          }}
        >
          <div className="flex flex-col items-center">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full bg-card shadow-lg border-2 text-3xl"
              style={{ borderColor: identity.color }}
            >
              {identity.emoji}
            </div>
            <span className="mt-1 text-xs font-semibold text-foreground">{identity.name}</span>
          </div>
        </div>
      </div>

      {/* Track */}
      <div className="relative">
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${percentage}%`,
              backgroundColor: identity.color,
            }}
          />
        </div>

        {/* Step markers */}
        <div className="mt-2 flex justify-between">
          {Array.from({ length: totalSteps + 1 }, (_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div
                className={`h-2 w-0.5 rounded ${
                  i <= position ? "bg-rc-red" : "bg-muted-foreground/30"
                }`}
              />
              <span
                className={`mt-1 text-xs ${
                  i <= position ? "font-bold text-foreground" : "text-muted-foreground"
                }`}
              >
                {i}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AvatarTrack;
