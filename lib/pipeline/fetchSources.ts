// lib/pipeline/fetchSources.ts
import { fetchAndExtractText } from "@/lib/fetchPages";

export type SourceText = { url: string; name: string; text: string; priority?: number };

export async function fetchTopSources(urls: string[], limit = 5): Promise<SourceText[]> {
  const picked = urls.slice(0, limit);
  const out: SourceText[] = []; 
  
  for (const u of picked) {
    try {
      // ✅ ดึง text จาก URL
      const { text, title } = await fetchAndExtractText(u);
      
      // ✅ ลำดับความสำคัญ: datasheet > manual > product page
      const priority = 
        u.includes("datasheet") ? 1000 :
        u.includes("manual") ? 900 :
        u.includes("product") ? 800 : 0;
      
      if (text && text.length > 300) {
        out.push({ 
          url: u, 
          name: title || new URL(u).hostname,
          text,
          priority 
        } as any);
      }
    } catch {}
  }
  
  // เรียง datasheet ขึ้นมาก่อน
  out.sort((a, b) => (b as any).priority - (a as any).priority);
  return out;
}

