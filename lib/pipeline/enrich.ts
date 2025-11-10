/**
 * ⚠️ FILE DEPRECATED - Enrich logic moved to summarize.ts
 * 
 * This file is kept for reference but not used in production.
 * Use lib/pipeline/summarize.ts → summarizeStrict() instead
 */

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

export async function aiFillMissingFields(): Promise<never> {
  throw new Error(
    "❌ aiFillMissingFields is deprecated. Use summarizeStrict() instead. " +
    "See: lib/pipeline/summarize.ts"
  );
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
