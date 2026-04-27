import { supabase } from "@/integrations/supabase/client";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface VerdictData {
  type: "PASS" | "CONDITIONAL YES" | "INVEST";
  criticism: string;
  reason: string;
  scores: { idea: number; market: number; execution: number };
}

export async function callGroq(messages: ChatMessage[]): Promise<string> {
  const { data, error } = await supabase.functions.invoke("groq-chat", {
    body: { messages },
  });

  if (error) {
    throw new Error(error.message || "Failed to reach AI service");
  }
  if (data?.error) {
    throw new Error(data.error);
  }
  return data?.content ?? "";
}

export function parseVerdict(text: string): VerdictData | null {
  if (!text.includes("VERDICT:")) return null;

  const verdictMatch = text.match(/VERDICT:\s*(PASS|CONDITIONAL YES|INVEST)/i);
  const criticismMatch = text.match(/CRITICISM:\s*(.+?)(?=REASON:|$)/is);
  const reasonMatch = text.match(/REASON:\s*(.+?)(?=SCORE:|$)/is);
  const scoreMatch = text.match(
    /SCORE:\s*Idea\s*\[?(\d+)\/10\]?\s*\|\s*Market\s*\[?(\d+)\/10\]?\s*\|\s*Execution\s*\[?(\d+)\/10\]?/i
  );

  if (!verdictMatch) return null;

  return {
    type: verdictMatch[1].toUpperCase() as VerdictData["type"],
    criticism: criticismMatch ? criticismMatch[1].trim().replace(/^[""]|[""]$/g, "") : "",
    reason: reasonMatch ? reasonMatch[1].trim() : "",
    scores: {
      idea: scoreMatch ? parseInt(scoreMatch[1]) : 5,
      market: scoreMatch ? parseInt(scoreMatch[2]) : 5,
      execution: scoreMatch ? parseInt(scoreMatch[3]) : 5,
    },
  };
}
