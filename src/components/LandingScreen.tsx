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
        <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-4">
          Pitch your idea.
          <br />
          <span className="text-primary">Get destroyed.</span>
        </h1>
        <p className="text-muted-foreground mb-14 max-w-md mx-auto leading-relaxed">
          An AI that responds like a real VC — skeptical, direct, and impossible
          to impress.
        </p>

        <div className="w-full h-px bg-primary/30 mb-10" />

        <div className="space-y-5 text-left">
          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">
              Your Startup Idea
            </label>
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Describe your idea in 2-3 sentences."
              rows={3}
              className="w-full bg-secondary border border-border rounded-md px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary text-sm resize-none"
            />
          </div>
          <button
            onClick={() => canSubmit && onStart(idea.trim())}
            disabled={!canSubmit}
            className="w-full max-w-md mx-auto bg-primary text-primary-foreground font-semibold py-3 rounded-md flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Start Pitch <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingScreen;
