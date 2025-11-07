// lib/gemini.ts
// Robust OpenRouter client: auto-picks an available Gemini model or falls back.

const OR_KEY = process.env.OPENROUTER_API_KEY;
const BASE = "https://openrouter.ai/api/v1";

/** Preferred order when choosing Gemini models */
const GEMINI_PREFER = [
  // ใส่ชื่อที่พบบ่อยบน OpenRouter (อาจแตกต่างตามบัญชี/เวลา)
  "google/gemini-2.0-flash",
  "google/gemini-2.0-flash-exp",
  "google/gemini-1.5-flash",
  "google/gemini-1.5-flash-8b",
  "google/gemini-1.5-pro",
];

/** Fallback non-Gemini (เพื่อให้ pipeline ไม่ล่มหากบัญชีคุณไม่มี Gemini) */
const FALLBACK_PREFER = [
  "openai/gpt-4o-mini",
  "openai/gpt-4.1-mini",
  "meta-llama/llama-3.1-8b-instant",
  "perplexity/llama-3.1-sonar-small-online",
];

type Source = { name: string; url?: string; text: string };
type SummarizeArgs = { prompt: string; sources: Source[] };

function buildUserContent(prompt: string, sources: Source[]) {
  const bundle = sources
    .map(
      (s, i) =>
        `SOURCE #${i + 1}: ${s.name}${s.url ? `\nURL: ${s.url}` : ""}\n---\n${s.text}`
    )
    .join("\n\n====\n\n");
  return `${prompt}\n\n=== SOURCES BEGIN ===\n${bundle}\n=== SOURCES END ===`;
}

async function listModels(): Promise<string[]> {
  const res = await fetch(`${BASE}/models`, {
    headers: { Authorization: `Bearer ${OR_KEY || ""}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`OpenRouter /models ${res.status}: ${t || res.statusText}`);
  }
  const j = await res.json();
  const ids: string[] = (j?.data || []).map((m: any) => m?.id).filter(Boolean);
  return ids;
}

// ... ภายใน resolveModelId()

const allRaw = await listModels();

// กรองพวก vision/image ออก (ไม่เอามาใช้กับงานข้อความ)
const all = allRaw.filter(id =>
  !/image|vision|multimodal|audio|speech/i.test(id)
);

// ต่อจากนี้ใช้ตัวแปร all แทน allRaw


  // 2) Auto-pick from available models
  const all = await listModels();

  // Try preferred Gemini order
  for (const id of GEMINI_PREFER) {
    if (all.includes(id)) return id;
  }

  // Try any “google/*gemini*” model if exists
  const anyGemini = all.find((id) => id.startsWith("google/") && id.includes("gemini"));
  if (anyGemini) return anyGemini;

  // 3) Fallback to other capable models
  for (const id of FALLBACK_PREFER) {
    if (all.includes(id)) return id;
  }

  // Last resort: pick the first available model
  if (all.length) return all[0];

  throw new Error("No available models found on OpenRouter. Check your account/providers.");
}

export async function geminiSummarizeFromSources(args: SummarizeArgs): Promise<string> {
  if (!OR_KEY) throw new Error("Missing OPENROUTER_API_KEY in env");
  if (!args?.prompt || !Array.isArray(args?.sources) || args.sources.length === 0) {
    throw new Error("geminiSummarizeFromSources: invalid args (prompt/sources)");
  }

  const model = await resolveModelId();
  const userContent = buildUserContent(args.prompt, args.sources);

// ... ด้านบนเหมือนเดิม
// lib/gemini.ts (ภายใน geminiSummarizeFromSources)

const bodyBase = {
  model,
  messages: [
    {
      role: "system",
      content:
        "You are a precise technical summarizer. Use ONLY provided sources. If unknown, leave blank. Return JSON only, without code fences.",
    },
    { role: "user", content: userContent },
  ],
  temperature: 0.0,
};

// รอบแรก: ขอ JSON mode
const bodyWithJsonMode = { ...bodyBase, response_format: { type: "json_object" } };

async function callOnce(body: any) {  
  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OR_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "BIR Part Generator",
    },
    body: JSON.stringify(body),
  });
  const text = await res.text().catch(() => "");
  return { ok: res.ok, status: res.status, text };
}

let resp = await callOnce(bodyWithJsonMode);

// ถ้าเจอ error ว่า JSON mode ใช้ไม่ได้ → ยิงใหม่โดยตัด response_format
if (!resp.ok && /json mode.*not enabled/i.test(resp.text)) {
  resp = await callOnce(bodyBase);
}

if (!resp.ok) {
  // พ่น error ที่อ่านง่าย
  try {
    const j = JSON.parse(resp.text);
    throw new Error(`OpenRouter ${resp.status} (${model}): ${j?.error?.message || j?.message || resp.text}`);
  } catch {
    throw new Error(`OpenRouter ${resp.status} (${model}): ${resp.text}`);
  }
}

const json = JSON.parse(resp.text);
const content =
  json?.choices?.[0]?.message?.content ??
  json?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments ?? "";

// ถ้าโมเดลยังพ่นเป็น ```json ... ``` ให้เราจัดระเบียบก่อน parse จริง
if (!content) throw new Error(`Empty completion from model ${model}`);
return content};
