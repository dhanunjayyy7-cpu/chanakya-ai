import { useState } from "react";
import LandingScreen from "@/components/LandingScreen";
import ChatScreen from "@/components/ChatScreen";
import VerdictScreen from "@/components/VerdictScreen";
import { VerdictData } from "@/lib/groq";

type Screen = "landing" | "chat" | "verdict";

const Index = () => {
  const [screen, setScreen] = useState<Screen>("landing");
  const [idea, setIdea] = useState("");
  const [verdict, setVerdict] = useState<VerdictData | null>(null);

  const handleStart = (startupIdea: string) => {
    setIdea(startupIdea);
    setScreen("chat");
  };

  const handleVerdict = (v: VerdictData) => {
    setVerdict(v);
    setScreen("verdict");
  };

  const handleReset = () => {
    setApiKey("");
    setIdea("");
    setVerdict(null);
    setScreen("landing");
  };

  if (screen === "chat") {
    return (
      <ChatScreen
        apiKey={apiKey}
        initialIdea={idea}
        onVerdict={handleVerdict}
      />
    );
  }

  if (screen === "verdict" && verdict) {
    return <VerdictScreen verdict={verdict} onReset={handleReset} />;
  }

  return <LandingScreen onStart={handleStart} />;
};

export default Index;
