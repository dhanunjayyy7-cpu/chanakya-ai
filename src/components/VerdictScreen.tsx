import { useState, useEffect } from "react";
import { ArrowRight, TrendingUp } from "lucide-react";
import { VerdictData } from "@/lib/groq";

interface VerdictScreenProps {
  verdict: VerdictData;
  onReset: () => void;
}

const verdictStyles: Record<string, string> = {
  PASS: "border-verdict-pass text-verdict-pass shadow-[0_0_30px_hsl(var(--verdict-pass)/0.15)]",
  "CONDITIONAL YES": "border-verdict-conditional text-verdict-conditional shadow-[0_0_30px_hsl(var(--verdict-conditional)/0.15)]",
  INVEST: "border-verdict-invest text-verdict-invest shadow-[0_0_30px_hsl(var(--verdict-invest)/0.15)]",
};

const VerdictScreen = ({ verdict, onReset }: VerdictScreenProps) => {
  const [loading, setLoading] = useState(true);
  const style = verdictStyles[verdict.type] || verdictStyles.PASS;

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center animate-fade-up">
          <div className="flex gap-1.5 justify-center mb-4">
            <span className="w-2 h-2 rounded-full bg-primary animate-dot-pulse" />
            <span className="w-2 h-2 rounded-full bg-primary animate-dot-pulse [animation-delay:0.2s]" />
            <span className="w-2 h-2 rounded-full bg-primary animate-dot-pulse [animation-delay:0.4s]" />
          </div>
          <p className="text-muted-foreground text-sm tracking-wide">Final Investment Decision Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-lg text-center animate-verdict-reveal">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
            <TrendingUp size={14} className="text-primary" />
          </div>
          <p className="text-muted-foreground text-sm tracking-wide">
            Arjun · AI Venture Capitalist
          </p>
        </div>

        <div
          className={`inline-block border-2 rounded-xl px-10 py-5 text-3xl md:text-4xl font-heading font-bold mb-5 ${style}`}
        >
          {verdict.type}
        </div>

        {verdict.criticism && (
          <p className="text-muted-foreground italic text-sm md:text-base mb-8 max-w-md mx-auto leading-relaxed">
            "{verdict.criticism}"
          </p>
        )}

        <p className="text-foreground leading-relaxed mb-10 max-w-md mx-auto text-[15px]">
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
              className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl py-5 shadow-sm"
            >
              <div className="text-2xl font-heading font-bold text-primary">
                {s.score}/10
              </div>
              <div className="text-xs text-muted-foreground mt-1.5 tracking-wide">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onReset}
          className="bg-primary text-primary-foreground font-medium py-3 px-8 rounded-xl inline-flex items-center gap-2 hover:scale-[1.03] hover:brightness-110 transition-all duration-200"
        >
          Pitch a different idea <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default VerdictScreen;
