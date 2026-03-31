import { useState } from "react";
import { ArrowRight } from "lucide-react";

interface LandingScreenProps {
  onStart: (apiKey: string, idea: string) => void;
}

const LandingScreen = ({ onStart }: LandingScreenProps) => {
  const [apiKey, setApiKey] = useState("");
  const [idea, setIdea] = useState("");

  const canSubmit = apiKey.trim().length > 0 && idea.trim().length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-lg text-center">
        <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-4">
          Pitch your idea.
          <br />
          <span className="text-primary">Get destroyed.</span>
        </h1>
        <p className="text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed">
          An AI that responds like a real VC — skeptical, direct, and impossible
          to impress.
        </p>

        <div className="bg-card border border-border rounded-lg p-6 space-y-4 text-left">
          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">
              Groq API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="gsk_..."
              className="w-full bg-secondary border border-border rounded-md px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary text-sm"
            />
          </div>
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
            onClick={() => canSubmit && onStart(apiKey.trim(), idea.trim())}
            disabled={!canSubmit}
            className="w-full bg-primary text-primary-foreground font-medium py-2.5 rounded-md flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Start Pitch <ArrowRight size={16} />
          </button>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Free API key at{" "}
          <a
            href="https://console.groq.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            console.groq.com
          </a>{" "}
          · No credit card needed
        </p>
      </div>
    </div>
  );
};

export default LandingScreen;
