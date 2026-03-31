import { useState, useEffect } from "react";
import LandingScreen from "@/components/LandingScreen";
import ChatScreen from "@/components/ChatScreen";
import VerdictScreen from "@/components/VerdictScreen";
import { VerdictData } from "@/lib/groq";

type Screen = "landing" | "chat" | "verdict";

const Index = () => {
  const [screen, setScreen] = useState<Screen>("landing");
  const [idea, setIdea] = useState("");
  const [verdict, setVerdict] = useState<VerdictData | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [visible, setVisible] = useState(true);

  const transitionTo = (next: Screen) => {
    setVisible(false);
    setTransitioning(true);
    setTimeout(() => {
      setScreen(next);
      setTransitioning(false);
      requestAnimationFrame(() => setVisible(true));
    }, 300);
  };

  const handleStart = (startupIdea: string) => {
    setIdea(startupIdea);
    transitionTo("chat");
  };

  const handleVerdict = (v: VerdictData) => {
    setVerdict(v);
    transitionTo("verdict");
  };

  const handleReset = () => {
    setIdea("");
    setVerdict(null);
    transitionTo("landing");
  };

  const transitionClass = visible
    ? "opacity-100 translate-x-0"
    : "opacity-0 translate-x-5";

  return (
    <div
      className={`transition-all duration-300 ease-out ${transitionClass}`}
    >
      {screen === "chat" ? (
        <ChatScreen initialIdea={idea} onVerdict={handleVerdict} />
      ) : screen === "verdict" && verdict ? (
        <VerdictScreen verdict={verdict} onReset={handleReset} />
      ) : (
        <LandingScreen onStart={handleStart} />
      )}
    </div>
  );
};

export default Index;
