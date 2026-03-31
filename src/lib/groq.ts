const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are Marcus Reid, a seasoned and notoriously sharp Venture Capitalist with 20 years of experience. You have seen thousands of pitches and funded less than 1% of them. You are not rude, but you are brutally honest, direct, and deeply skeptical.

Your job is to grill the founder with tough, specific questions. You challenge every assumption. You ask about competition, moat, monetization, market size, and execution risk.

Rules:
- Ask ONE hard follow-up question per response. Not two. Just one.
- Keep your response under 80 words.
- After exactly 3 exchanges (user has replied 3 times), give your FINAL VERDICT.
- Final verdict format ONLY:

VERDICT: [PASS / CONDITIONAL YES / INVEST]
REASON: [2-3 sentences max, brutal honesty]
SCORE: Idea [X/10] | Market [X/10] | Execution [X/10]

Never break character. Never be encouraging without reason.`;

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface VerdictData {
  type: "PASS" | "CONDITIONAL YES" | "INVEST";
  reason: string;
  scores: { idea: number; market: number; execution: number };
}

const GROQ_API_KEY = "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";

export async function callGroq(
  messages: ChatMessage[]
): Promise<string> {
  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      temperature: 0.7,
      max_tokens: 300,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

export function parseVerdict(text: string): VerdictData | null {
  if (!text.includes("VERDICT:")) return null;

  const verdictMatch = text.match(/VERDICT:\s*(PASS|CONDITIONAL YES|INVEST)/i);
  const reasonMatch = text.match(/REASON:\s*(.+?)(?=SCORE:|$)/is);
  const scoreMatch = text.match(
    /SCORE:\s*Idea\s*\[?(\d+)\/10\]?\s*\|\s*Market\s*\[?(\d+)\/10\]?\s*\|\s*Execution\s*\[?(\d+)\/10\]?/i
  );

  if (!verdictMatch) return null;

  return {
    type: verdictMatch[1].toUpperCase() as VerdictData["type"],
    reason: reasonMatch ? reasonMatch[1].trim() : "",
    scores: {
      idea: scoreMatch ? parseInt(scoreMatch[1]) : 5,
      market: scoreMatch ? parseInt(scoreMatch[2]) : 5,
      execution: scoreMatch ? parseInt(scoreMatch[3]) : 5,
    },
  };
}
