import { Question } from "@/data/gameData";

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  onAnswer: (canDo: boolean) => void;
  animating: boolean;
}

const QuestionCard = ({ question, questionNumber, onAnswer, animating }: QuestionCardProps) => {
  return (
    <div key={question.id} className="w-full max-w-lg question-enter">
      <div className="rounded-2xl bg-card border border-border p-8 shadow-lg">
        <div className="mb-6 text-center">
          <span className="inline-block rounded-full bg-rc-red px-3 py-1 text-xs font-bold text-primary-foreground mb-4">
            第 {questionNumber} 题
          </span>
          <p className="text-lg font-medium text-foreground leading-relaxed">
            {question.text}
          </p>
        </div>

        <p className="text-center text-sm text-muted-foreground mb-6">
          以你的角色身份，你觉得自己能做到吗？
        </p>

        <div className="flex gap-4">
          <button
            onClick={() => onAnswer(true)}
            disabled={animating}
            className="flex-1 rounded-xl border-2 border-rc-red bg-rc-red py-4 text-base font-bold text-primary-foreground shadow transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
          >
            ✓ 能做到
          </button>
          <button
            onClick={() => onAnswer(false)}
            disabled={animating}
            className="flex-1 rounded-xl border-2 border-border bg-card py-4 text-base font-bold text-foreground shadow transition-all hover:bg-muted active:scale-95 disabled:opacity-50"
          >
            ✗ 做不到
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
