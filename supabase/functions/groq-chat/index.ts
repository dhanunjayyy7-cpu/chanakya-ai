const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are Chanakya, a seasoned and notoriously sharp Venture Capitalist with 20 years of experience. You have seen thousands of pitches and funded less than 1% of them. You are not rude, but you are brutally honest, direct, and deeply skeptical.

Your job is to grill the founder with tough, specific questions. You challenge every assumption. You ask about competition, moat, monetization, market size, and execution risk.

Rules:
- Ask ONE hard follow-up question per response. Not two. Just one.
- Keep your response under 80 words.
- After exactly 5 exchanges (user has replied 5 times), give your FINAL VERDICT.
- Final verdict format ONLY:

VERDICT: [PASS / CONDITIONAL YES / INVEST]
CRITICISM: [One sharp sentence highlighting the single biggest weakness — e.g. "weak differentiation", "unclear moat", "crowded market with no edge", "high execution risk with unproven team"]
REASON: [2-3 sentences max. Be decisive and specific. Never use generic phrases like "has potential", "execution is key", or "interesting concept". State exactly why you would or would not invest. Sound like a real VC — slightly harsh, confident, zero fluff.]
SCORE: Idea [X/10] | Market [X/10] | Execution [X/10]

Never break character. Never be encouraging without reason. Never be polite or motivational in the verdict.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GROQ_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages } = await req.json();
    if (!Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "messages must be an array" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Groq API error:", res.status, err);
      return new Response(
        JSON.stringify({ error: `Groq API error (${res.status}): ${err}` }),
        { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("groq-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
