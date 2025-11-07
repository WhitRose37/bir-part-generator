// lib/utils/llm.ts
export function coerceToJson(text: string): string {
  if (!text) throw new Error("Empty model response");
  let t = text.trim();
  t = t.replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim(); // ตัดรั้วโค้ด
  try { JSON.parse(t); return t; } catch {}
  const start = t.indexOf("{"); if (start === -1) throw new Error("No JSON object found");
  let depth = 0, end = -1;
  for (let i = start; i < t.length; i++) {
    const ch = t[i];
    if (ch === "{") depth++;
    else if (ch === "}") { depth--; if (depth === 0) { end = i; break; } }
  }
  if (end === -1) throw new Error("Unbalanced JSON braces");
  const candidate = t.slice(start, end + 1).trim();
  JSON.parse(candidate);
  return candidate;
}
