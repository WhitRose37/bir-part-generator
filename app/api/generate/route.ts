// app/api/generate/route.ts
import { NextResponse } from "next/server";
import { generatePartData } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Generate part data with images from Google Search
 * 
 * Flow:
 * 1. generatePartData() → Perplexity search + summarize
 * 2. getImagesOrGenerate() → Google Custom Search API
 * 3. Return part data with images
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const part_number = (body?.part_number || "").trim();
    const withImage = body?.withImage !== false;

    if (!part_number) {
      return NextResponse.json(
        { error: "part_number is required" },
        { status: 400 }
      );
    }

    console.log(`[generate] 🔍 Generating for: ${part_number}`);
    console.log(`[generate] 🖼️ With Images: ${withImage}`);

    let raw;
    try {
      raw = await generatePartData(part_number, { 
        strict: false, 
        searchEngine: "google",
        withImage 
      });
    } catch (e: any) {
      console.warn(`[generate] ⚠️ Generation error: ${e?.message}`);
      
      // Return minimal fallback on error
      return NextResponse.json({
        part_number,
        common_name_en: part_number,
        common_name_th: part_number,
        function_en: "Information not available",
        function_th: "ไม่มีข้อมูล",
        where_used_en: "Information not available",
        where_used_th: "ไม่มีข้อมูล",
        characteristics_of_material_en: "Unknown",
        characteristics_of_material_th: "ไม่ทราบ",
        uom: "",
        images: [],
        tags: ["product"],
        sources: [],
        source_confidence: "low",
      });
    }

    if (!raw) {
      throw new Error("Failed to generate part data - returned null");
    }

    console.log(`[generate] ✅ Generated successfully`);
    console.log(`[generate] 📸 Images: ${raw.images?.length || 0}`);

    // ✅ Fix: Add type annotation for filter parameter
    const response = {
      part_number: String(raw.part_number || part_number),
      common_name_en: String(raw.common_name_en || part_number),
      common_name_th: String(raw.common_name_th || part_number),
      function_en: String(raw.function_en || ""),
      function_th: String(raw.function_th || ""),
      where_used_en: String(raw.where_used_en || ""),
      where_used_th: String(raw.where_used_th || ""),
      characteristics_of_material_en: String(raw.characteristics_of_material_en || ""),
      characteristics_of_material_th: String(raw.characteristics_of_material_th || ""),
      uom: String(raw.uom || ""),
      images: Array.isArray(raw.images) ? raw.images.filter((u: any) => typeof u === "string") : [],
      tags: Array.isArray(raw.tags) ? raw.tags : [],
      sources: Array.isArray(raw.sources) ? raw.sources : [],
      source_confidence: String(raw.source_confidence || "low"),
    };

    return NextResponse.json(response);
  } catch (e: any) {
    console.error(`[generate] ❌ Fatal error:`, e?.message || e);
    
    return NextResponse.json(
      { 
        error: e?.message || "Internal error",
        part_number: "unknown"
      }, 
      { status: 500 }
    );
  }
}
