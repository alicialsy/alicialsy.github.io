import { useState, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Identity, questions } from "@/data/gameData";
import AvatarTrack from "@/components/AvatarTrack";
import QuestionCard from "@/components/QuestionCard";
import { updateParticipantPosition, subscribeToSession } from "@/lib/gameService";

const Game = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const identity = location.state?.identity as Identity | undefined;
  const sessionId = location.state?.sessionId as string | undefined;
  const participantId = location.state?.participantId as string | undefined;
  const participantToken = location.state?.participantToken as string | undefined;

  const [currentQ, setCurrentQ] = useState(0);
  const [position, setPosition] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [animating, setAnimating] = useState(false);

  // Subscribe to session changes (instructor can control question flow)
  useEffect(() => {
    if (!sessionId) return;
    const unsub = subscribeToSession(sessionId, (session) => {
      if (session.status === "finished") {
        navigate("/result", {
          state: { identity, position, answers },
        });
      }
    });
    return unsub;
  }, [sessionId, identity, position, answers, navigate]);

  const handleAnswer = useCallback(
    async (canDo: boolean) => {
      if (animating || !identity) return;
      setAnimating(true);
      const newAnswers = [...answers, canDo];
      setAnswers(newAnswers);

      const newPos = canDo ? position + 1 : position;
      if (canDo) {
        setPosition(newPos);
      }

      // Sync to database
      if (participantId && participantToken) {
        await updateParticipantPosition(participantId, participantToken, newPos);
      }

      setTimeout(() => {
        if (currentQ < questions.length - 1) {
          setCurrentQ((q) => q + 1);
        } else {
          navigate("/result", {
            state: { identity, position: newPos, answers: newAnswers, sessionId },
          });
        }
        setAnimating(false);
      }, 700);
    },
    [animating, answers, currentQ, identity, navigate, position, participantId]
  );

  useEffect(() => {
    if (!identity) {
      navigate("/", { replace: true });
    }
  }, [identity, navigate]);

  if (!identity) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-xl text-rc-red font-bold">✚</span>
          <span className="text-sm font-semibold text-foreground">向前一步</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {identity.emoji} {identity.name}
          </span>
          <span className="rounded-full bg-rc-red px-3 py-1 text-xs font-medium text-primary-foreground">
            {currentQ + 1} / {questions.length}
          </span>
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-8">
        <AvatarTrack identity={identity} position={position} totalSteps={10} />
        <QuestionCard
          question={questions[currentQ]}
          questionNumber={currentQ + 1}
          onAnswer={handleAnswer}
          animating={animating}
        />
      </div>
    </div>
  );
};

export default Game;
