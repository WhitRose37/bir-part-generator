// lib/pipeline/images.ts
import { image_gen } from "@/lib/image_gen";
import { fetchImages } from "@/lib/fetchPages";
import { googleSearchImage } from "@/lib/googleSearch";

// Placeholder images สำหรับ fallback
const PLACEHOLDER_IMAGES = [
  "https://via.placeholder.com/1024x768?text=Product+Image+1",
  "https://via.placeholder.com/1024x768?text=Product+Image+2",
  "https://via.placeholder.com/1024x768?text=Product+Image+3",
  "https://via.placeholder.com/1024x768?text=Product+Image+4",
  "https://via.placeholder.com/1024x768?text=Product+Image+5",
  "https://via.placeholder.com/1024x768?text=Product+Image+6",
];

/**
 * Build AI prompt for image generation
 * Used as fallback when Google Search returns no results
 */
function buildPrompt(part: string, fields: any): string {
  const name = fields?.product_name || fields?.common_name_en || part;
  const specs = [
    fields?.common_name_en,
    fields?.uom && `UOM: ${fields.uom}`,
    fields?.characteristics_of_material_en,
  ].filter(Boolean).join(", ");

  return [
    `high-quality studio photo of ${name}`,
    part !== name ? part : "",
    specs,
    "clean background, product photography lighting, sharp focus",
  ].filter(Boolean).join(", ");
}

/**
 * Main orchestrator for image retrieval
 * Called ONCE per summarization
 */
export async function getImagesOrGenerate(
  part: string,
  fields: any
): Promise<string[]> {
  try {
    console.log(`[getImagesOrGenerate] 🖼️ Fetching images for: ${part}`);

    // Try Google Custom Search API
    console.log(`[getImagesOrGenerate] 🔍 Searching Google Images...`);
    const raw = await googleSearchImage(part, 6);
    
    const urls = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.results)
        ? raw.results
            .map((r: any) => r?.url)
            .filter((u: any) => typeof u === "string")
        : [];

    if (urls.length > 0) {
      console.log(`[getImagesOrGenerate] ✅ Found ${urls.length} images`);
      return urls.slice(0, 6);
    }

    console.log(`[getImagesOrGenerate] ℹ️ No images found`);
    return [];

  } catch (err) {
    console.error("[getImagesOrGenerate] ❌ Error:", err);
    return [];
  }
}
