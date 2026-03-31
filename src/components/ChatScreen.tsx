import { useState, useRef, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { ChatMessage, callGroq, parseVerdict, VerdictData } from "@/lib/groq";

interface ChatScreenProps {
  initialIdea: string;
  onVerdict: (verdict: VerdictData) => void;
}

interface DisplayMessage {
  role: "user" | "assistant";
  content: string;
}

const TypingIndicator = () => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center text-xs font-heading font-bold text-primary shrink-0">
      MR
    </div>
    <div className="bg-card border border-border rounded-lg px-4 py-3 flex gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-dot-pulse" />
      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-dot-pulse [animation-delay:0.2s]" />
      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-dot-pulse [animation-delay:0.4s]" />
    </div>
  </div>
);

const RoundPips = ({ round }: { round: number }) => (
  <div className="flex flex-col items-center gap-2">
    <div className="flex gap-2">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-full border-2 border-primary transition-colors ${
            i <= round ? "bg-primary" : "bg-transparent"
          }`}
        />
      ))}
    </div>
    <span className="text-xs text-muted-foreground">
      Round {Math.min(round + 1, 3)} of 3
    </span>
  </div>
);

const ChatScreen = ({ initialIdea, onVerdict }: ChatScreenProps) => {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [round, setRound] = useState(0);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initChat = async () => {
      setLoading(true);
      const userMsg: ChatMessage = {
        role: "user",
        content: `Here's my startup idea: ${initialIdea}`,
      };
      try {
        const reply = await callGroq([userMsg]);
        setHistory([userMsg, { role: "assistant", content: reply }]);
        setMessages([
          { role: "user", content: initialIdea },
          { role: "assistant", content: reply },
        ]);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    initChat();
  }, [initialIdea]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    if (!input.trim() || loading) return;
    setError("");
    const text = input.trim();
    setInput("");

    const newRound = round + 1;
    setRound(newRound);

    const userMsg: ChatMessage = { role: "user", content: text };
    const newHistory = [...history, userMsg];

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setHistory(newHistory);
    setLoading(true);

    try {
      const reply = await callGroq(newHistory);
      const assistantMsg: ChatMessage = { role: "assistant", content: reply };
      setHistory((prev) => [...prev, assistantMsg]);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);

      const verdict = parseVerdict(reply);
      if (verdict) {
        setTimeout(() => onVerdict(verdict), 1500);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto px-4">
      <div className="pt-6 pb-4">
        <RoundPips round={round} />
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map((msg, i) =>
          msg.role === "assistant" ? (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center text-xs font-heading font-bold text-primary shrink-0">
                MR
              </div>
              <div className="bg-card border border-border rounded-lg px-4 py-3 max-w-[80%] text-sm leading-relaxed">
                {msg.content}
              </div>
            </div>
          ) : (
            <div key={i} className="flex justify-end">
              <div className="bg-secondary rounded-lg px-4 py-3 max-w-[80%] text-sm leading-relaxed">
                {msg.content}
              </div>
            </div>
          )
        )}
        {loading && <TypingIndicator />}
        {error && (
          <p className="text-destructive text-sm text-center">{error}</p>
        )}
      </div>

      <div className="py-4 border-t border-border flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your response..."
          rows={1}
          className="flex-1 bg-secondary border border-border rounded-md px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary text-sm resize-none"
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          className="bg-primary text-primary-foreground w-10 h-10 rounded-md flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          <ArrowUp size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatScreen;
