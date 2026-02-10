import { useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Identity, questions } from "@/data/gameData";
import AvatarTrack from "@/components/AvatarTrack";
import QuestionCard from "@/components/QuestionCard";

const Game = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const identity = location.state?.identity as Identity | undefined;

  const [currentQ, setCurrentQ] = useState(0);
  const [position, setPosition] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [animating, setAnimating] = useState(false);

  const handleAnswer = useCallback(
    (canDo: boolean) => {
      if (animating || !identity) return;
      setAnimating(true);
      const newAnswers = [...answers, canDo];
      setAnswers(newAnswers);

      const newPos = canDo ? position + 1 : position;
      if (canDo) {
        setPosition(newPos);
      }

      setTimeout(() => {
        if (currentQ < questions.length - 1) {
          setCurrentQ((q) => q + 1);
        } else {
          navigate("/result", {
            state: { identity, position: newPos, answers: newAnswers },
          });
        }
        setAnimating(false);
      }, 700);
    },
    [animating, answers, currentQ, identity, navigate, position]
  );

  if (!identity) {
    navigate("/");
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
