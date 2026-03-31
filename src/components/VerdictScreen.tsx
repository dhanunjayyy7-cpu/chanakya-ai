import { ArrowRight } from "lucide-react";
import { VerdictData } from "@/lib/groq";

interface VerdictScreenProps {
  verdict: VerdictData;
  onReset: () => void;
}

const verdictStyles: Record<string, string> = {
  PASS: "border-verdict-pass text-verdict-pass",
  "CONDITIONAL YES": "border-verdict-conditional text-verdict-conditional",
  INVEST: "border-verdict-invest text-verdict-invest",
};

const VerdictScreen = ({ verdict, onReset }: VerdictScreenProps) => {
  const style = verdictStyles[verdict.type] || verdictStyles.PASS;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-lg text-center">
        <p className="text-muted-foreground text-sm mb-2">
          Marcus Reid · Final Verdict
        </p>

        <div
          className={`inline-block border-2 rounded-lg px-8 py-3 text-2xl font-heading font-bold mb-6 ${style}`}
        >
          {verdict.type}
        </div>

        <p className="text-foreground leading-relaxed mb-8 max-w-md mx-auto">
          {verdict.reason}
        </p>

        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { label: "Idea", score: verdict.scores.idea },
            { label: "Market", score: verdict.scores.market },
            { label: "Execution", score: verdict.scores.execution },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-card border border-border rounded-lg py-4"
            >
              <div className="text-2xl font-heading font-bold text-primary">
                {s.score}/10
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onReset}
          className="bg-primary text-primary-foreground font-medium py-2.5 px-6 rounded-md inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          Pitch a different idea <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default VerdictScreen;
