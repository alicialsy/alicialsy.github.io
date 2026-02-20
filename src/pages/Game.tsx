import { useState, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Identity, questions } from "@/data/gameData";
import AvatarTrack from "@/components/AvatarTrack";
import QuestionCard from "@/components/QuestionCard";
import { updateParticipantPosition, subscribeToSession } from "@/lib/gameService";

const TRANSITION_AFTER_QUESTION = 5; // Show transition page after question 5

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
  const [showTransition, setShowTransition] = useState(false);

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
        const nextQ = currentQ + 1;
        if (currentQ < questions.length - 1) {
          // Show transition page after question 5 (index 4)
          if (nextQ === TRANSITION_AFTER_QUESTION) {
            setShowTransition(true);
          } else {
            setCurrentQ(nextQ);
          }
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

  // Transition page between question 5 and 6
  if (showTransition) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-xl text-rc-red font-bold">✚</span>
            <span className="text-sm font-semibold text-foreground">向前一步</span>
          </div>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-8">
          <div className="w-full max-w-lg question-enter">
            <div className="rounded-2xl bg-card border border-border p-10 shadow-lg text-center">
              <span className="inline-block text-5xl mb-6">🌉</span>
              <h2 className="text-xl font-bold text-foreground mb-4">场景设定</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                村里正在讨论是否修建一座桥。
              </p>
              <button
                onClick={() => {
                  setShowTransition(false);
                  setCurrentQ(TRANSITION_AFTER_QUESTION);
                }}
                className="rounded-xl bg-rc-red px-8 py-4 text-base font-bold text-primary-foreground shadow transition-all hover:opacity-90 active:scale-95"
              >
                进入下一阶段 →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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
