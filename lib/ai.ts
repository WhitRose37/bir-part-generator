import { fetchAndExtractText } from "@/lib/fetchPages";
import { summarizeStrict } from "@/lib/pipeline/summarize";
import type { SourceText } from "@/lib/pipeline/fetchSources";

/**
 * Generate part data using Perplexity + Google Images
 * 
 * Flow:
 * 1. Search sources via Perplexity (with fallback)
 * 2. Summarize with AI
 * 3. Fetch images from Google
 * 4. Return complete part data
 */
export async function generatePartData(
  partNumber: string,
  options: {
    strict?: boolean;
    searchEngine?: string;
    withImage?: boolean;
  } = {}
): Promise<any> {
  try {
    const { searchEngine = "google", withImage = true } = options;

    console.log(`\n[generatePartData] 🔍 Generating for: ${partNumber}`);
    console.log(`[generatePartData] 🖼️ With Images: ${withImage}`);

    // 1️⃣ Search sources (with fallback)
    let sources: any[] = [];
    try {
      console.log(`[generatePartData] 🌐 Searching sources...`);
      sources = await fetchAndExtractText(partNumber, { engine: searchEngine });
      
      if (sources && sources.length > 0) {
        console.log(`[generatePartData] ✅ Found ${sources.length} sources`);
      } else {
        throw new Error("No sources found");
      }
    } catch (e: any) {
      console.warn(`[generatePartData] ⚠️ Search failed: ${e?.message}`);
      console.log(`[generatePartData] 🔄 Using fallback...`);
      
      // Fallback: minimal source from part number
      sources = [{
        title: partNumber,
        snippet: `Product: ${partNumber}`,
        link: "",
      }];
    }

    // 2️⃣ Convert to SourceText
    const sourceTexts: SourceText[] = sources
      .filter((s: any) => s && (s.title || s.snippet))
      .map((s: any) => ({
        url: s.link || s.url || "",
        name: (s.title || s.name || "source").substring(0, 100),
        text: (s.snippet || "").substring(0, 500),
      }));

    if (sourceTexts.length === 0) {
      throw new Error("No valid sources to summarize");
    }

    // 3️⃣ Summarize
    console.log(`[generatePartData] 🤖 Summarizing...`);
    const summary = await summarizeStrict(partNumber, sourceTexts);

    if (!summary) {
      throw new Error("Summarize returned null");
    }

    console.log(`[generatePartData] ✅ Complete`);
    console.log(`[generatePartData] 📸 Images: ${summary.images?.length || 0}\n`);

    return summary;

  } catch (e: any) {
    console.error(`[generatePartData] ❌ Error: ${e?.message}`);
    
    // Return minimal fallback on error
    return {
      part_number: partNumber,
      common_name_en: partNumber,
      common_name_th: partNumber,
      function_en: "Product information",
      function_th: "ข้อมูลผลิตภัณฑ์",
      where_used_en: "Industrial use",
      where_used_th: "ใช้งานอุตสาหกรรม",
      characteristics_of_material_en: "Unknown",
      characteristics_of_material_th: "ไม่ทราบ",
      uom: "piece",
      images: [],
      tags: ["product", "part", partNumber],
      sources: [{
        name: partNumber,
        url: "",
      }],
      source_confidence: "low",
    };
  }
}
