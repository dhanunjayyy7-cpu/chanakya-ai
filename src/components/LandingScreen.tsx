import { useState } from "react";
import { ArrowRight } from "lucide-react";

interface LandingScreenProps {
  onStart: (idea: string) => void;
}

const LandingScreen = ({ onStart }: LandingScreenProps) => {
  const [idea, setIdea] = useState("");

  const canSubmit = idea.trim().length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-lg text-center">
        <div className="animate-fade-up">
          <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-4">
            Pitch your idea.
            <br />
            <span className="text-primary">Get destroyed.</span>
          </h1>
          <p className="text-muted-foreground mb-14 max-w-md mx-auto leading-relaxed">
            An AI that responds like a real VC — skeptical, direct, and impossible
            to impress.
          </p>
        </div>

        <div className="w-full h-px bg-primary/30 mb-10 animate-fade-up-delay" />

        <div className="space-y-5 text-left animate-fade-up-delay">
          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">
              Your Startup Idea
            </label>
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Describe your idea in 2-3 sentences."
              rows={3}
              className="w-full bg-secondary border border-border rounded-md px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:scale-[1.02] hover:scale-[1.02] hover:border-primary/40 hover:shadow-[0_0_15px_hsl(var(--primary)/0.1)] text-sm resize-none transition-all duration-200 origin-center"
            />
          </div>
          <button
            onClick={() => canSubmit && onStart(idea.trim())}
            disabled={!canSubmit}
            className="w-full max-w-md mx-auto bg-primary text-primary-foreground font-semibold py-3 rounded-md flex items-center justify-center gap-2 hover:brightness-110 hover:scale-[1.02] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Start Pitch <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingScreen;
