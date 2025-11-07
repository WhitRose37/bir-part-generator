import { resolvePerplexityOnlineModel } from "@/lib/perplexityModels";

type Source = { name: string; url?: string; text: string };
type SummarizeArgs = { prompt: string; sources: Source[] };

function bundle(prompt: string, sources: Source[]) {
  const join = sources.map(
    (s,i)=>`SOURCE #${i+1}: ${s.name}${s.url?`\nURL: ${s.url}`:""}\n---\n${s.text}`
  ).join("\n\n====\n\n");
  return `${prompt}

Rules:
- Use ONLY the provided sources. If unknown, leave field empty.
- Return a single JSON object only (no code fences, no extra text).

=== SOURCES BEGIN ===
${join}
=== SOURCES END ===`;
}

export async function perplexitySummarizeFromSources(args: SummarizeArgs): Promise<string> {
  const key = process.env.PERPLEXITY_API_KEY;
  if (!key) throw new Error("Missing PERPLEXITY_API_KEY");
  if (!args?.prompt || !args?.sources?.length) throw new Error("invalid args");

  const model = await resolvePerplexityOnlineModel();

  const res = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "You are a precise technical summarizer for manufacturing/BOM." },
        { role: "user", content: bundle(args.prompt, args.sources) },
      ],
      temperature: 0.0,
    }),
  });

  const text = await res.text().catch(() => "");
  if (!res.ok) throw new Error(`Perplexity ${res.status}: ${text || res.statusText}`);

  const j = JSON.parse(text);
  const content = j?.choices?.[0]?.message?.content ?? "";
  if (!content) throw new Error("Empty completion from Perplexity");
  return content;
}
