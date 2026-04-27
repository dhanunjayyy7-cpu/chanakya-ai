const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

const normalizeApiKey = (value: string) =>
  value.trim().replace(/^['"]+|['"]+$/g, "");

const callChatCompletion = async (
  provider: "groq" | "lovable-ai",
  url: string,
  apiKey: string,
  model: string,
  messages: Array<{ role: string; content: string }>,
) => {
  console.log("AI provider request", { provider, model, keyConfigured: apiKey.length > 0 });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      temperature: 0.7,
      max_tokens: 300,
    }),
  });

  const responseText = await res.text();

  if (!res.ok) {
    console.error("AI provider error", { provider, status: res.status, body: responseText });
    return { ok: false as const, status: res.status, error: responseText };
  }

  const data = JSON.parse(responseText);
  const content = data.choices?.[0]?.message?.content ?? "";
  console.log("AI provider success", { provider, contentLength: content.length });

  return { ok: true as const, content };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawGroqApiKey = Deno.env.get("GROQ_API_KEY") ?? "";
    const GROQ_API_KEY = normalizeApiKey(rawGroqApiKey);
    const hasWrappingCharacters = rawGroqApiKey !== GROQ_API_KEY;

    console.log("GROQ_API_KEY diagnostics", {
      configured: rawGroqApiKey.length > 0,
      normalizedLength: GROQ_API_KEY.length,
      startsWithGsk: GROQ_API_KEY.startsWith("gsk_"),
      normalizedInput: hasWrappingCharacters,
    });

    if (!GROQ_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GROQ_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!GROQ_API_KEY.startsWith("gsk_")) {
      return new Response(
        JSON.stringify({ error: "GROQ_API_KEY is configured but does not look like a valid Groq key" }),
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

    const groqResult = await callChatCompletion(
      "groq",
      "https://api.groq.com/openai/v1/chat/completions",
      GROQ_API_KEY,
      "llama-3.3-70b-versatile",
      messages,
    );

    let content = "";

    if (groqResult.ok) {
      content = groqResult.content;
    } else if (groqResult.status === 401) {
      const lovableApiKey = normalizeApiKey(Deno.env.get("LOVABLE_API_KEY") ?? "");
      console.warn("Groq rejected GROQ_API_KEY; falling back to Lovable AI", {
        fallbackKeyConfigured: lovableApiKey.length > 0,
      });

      if (!lovableApiKey) {
        return new Response(
          JSON.stringify({ error: `Groq API error (401) and fallback AI key is not configured: ${groqResult.error}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const fallbackResult = await callChatCompletion(
        "lovable-ai",
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        lovableApiKey,
        "google/gemini-2.5-flash",
        messages,
      );

      if (!fallbackResult.ok) {
        return new Response(
          JSON.stringify({ error: `Groq API error (401), fallback AI error (${fallbackResult.status}): ${fallbackResult.error}` }),
          { status: fallbackResult.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      content = fallbackResult.content;
    } else {
      return new Response(
        JSON.stringify({ error: `Groq API error (${groqResult.status}): ${groqResult.error}` }),
        { status: groqResult.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
