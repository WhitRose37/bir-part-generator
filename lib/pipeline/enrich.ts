// lib/pipeline/enrich.ts
import { perplexitySummarizeFromSources } from "@/lib/perplexity";
import { coerceToJson } from "@/lib/utils/llm";
import { resolvePerplexityOnlineModel } from "@/lib/perplexityModels";

const DEFAULT_TIMEOUT = 15_000;

function runWithTimeout<T>(p: Promise<T>, ms = DEFAULT_TIMEOUT): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("LLM timeout")), ms);
    p.then((v) => {
      clearTimeout(t);
      resolve(v);
    }).catch((e) => {
      clearTimeout(t);
      reject(e);
    });
  });
}

function isPlainObject(x: any) {
  return !!x && typeof x === "object" && !Array.isArray(x);
}

function validateResultKeys(original: any, candidate: any): boolean {
  if (!isPlainObject(candidate)) return false;
  const origKeys = Object.keys(original).filter((k) => typeof k === "string");
  // require at least part_number and one other key to be present
  if (!("part_number" in candidate)) return false;
  // ensure candidate contains all keys that original had (non-strict: allow extra keys)
  for (const k of origKeys) {
    if (!(k in candidate)) return false;
  }
  return true;
}

export async function aiFillMissingFields(part: any): Promise<Partial<typeof part>> {
  try {
    const key = process.env.PERPLEXITY_API_KEY;
    if (!key) return {};

    const model = await resolvePerplexityOnlineModel();

    const prompt = `Given this partial part data:
Part Number: ${part.part_number}
Common Name EN: ${part.common_name_en || "unknown"}
Common Name TH: ${part.common_name_th || "unknown"}

Fill in missing fields with BEST GUESS based on part number/name:
- common_name_en
- common_name_th
- uom
- characteristics_of_material_en
- characteristics_of_material_th
- eccn
- hts
- coo

Return ONLY valid JSON, no explanations.`;

    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "You are a part specification expert. Fill in missing data based on industry standards.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!res.ok) return {};

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content || "";
    return JSON.parse(content);
  } catch (e) {
    console.error("[aiFillMissingFields] error:", e);
    return {};
  }
}

export async function aiFillMissingFields(part: any) {
  const inputJson = JSON.stringify(part, null, 2);

  const prompt = `
You are a technical AI that fills missing part data for manufacturing.

Given this JSON of a part, fill in realistic values for any empty ("", null, or "Unknown") fields.
Base your knowledge on the part name, standard specs, and general manufacturing practices.
Keep the tone factual and concise (engineering-style).

Return a valid JSON with the same keys.

Example:
Input: {"part_number":"BZX55C-5V6","common_name_en":"","uom":"","function_en":""}
Output: {"part_number":"BZX55C-5V6","common_name_en":"Zener Diode 5.6V","uom":"pcs","function_en":"Voltage regulation component"}

Input JSON:
${inputJson}
  `.trim();

  try {
    const raw = await runWithTimeout(
      perplexitySummarizeFromSources({
        prompt,
        sources: [{ name: "ai_fill", url: "", text: "" }],
      })
    );

    const safe = coerceToJson(raw);
    if (!safe || typeof safe !== "string") {
      console.warn("aiFillMissingFields: coerceToJson returned non-string, falling back");
      return part;
    }

    let parsed: any;
    try {
      parsed = JSON.parse(safe);
    } catch (parseErr) {
      console.warn("aiFillMissingFields: JSON.parse failed, falling back", String(parseErr));
      return part;
    }

    if (!validateResultKeys(part, parsed)) {
      console.warn("aiFillMissingFields: validation failed, returning original part");
      return part;
    }

    return parsed;
  } catch (err: any) {
    console.error("aiFillMissingFields error - returning original part:", err?.message ?? String(err));
    return part;
  }
}
