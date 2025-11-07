// app/api/ai-generate-image/route.ts
import { NextResponse } from "next/server";
import { image_gen } from "@/lib/image_gen";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      part_number,
      product_name,
      common_name_en,
      characteristics_of_material_en,
    } = body;

    if (!part_number) {
      return NextResponse.json(
        { error: "part_number is required" },
        { status: 400 }
      );
    }

    const prompt = [
      `High-quality professional product photo of ${product_name || common_name_en || part_number}`,
      `Part number: ${part_number}`,
      characteristics_of_material_en ? `Material: ${characteristics_of_material_en}` : "",
      "Studio lighting, clean white background, sharp focus, professional photography",
    ]
      .filter(Boolean)
      .join(", ");

    console.log("🎨 Generating image with prompt:", prompt);

    // ตรวจสอบว่ามี API key หรือไม่
    if (!process.env.OPENAI_API_KEY && !process.env.OPENROUTER_API_KEY) {
      throw new Error("No image generation API key configured. Set OPENAI_API_KEY or OPENROUTER_API_KEY in .env");
    }

    const result = await image_gen.text2im({
      prompt,
      size: "1024x1024",
      n: 1,
    });

    if (!result.urls || result.urls.length === 0) {
      throw new Error("No images returned from API");
    }

    return NextResponse.json({
      ok: true,
      urls: result.urls,
      count: result.urls.length,
    });
  } catch (e: any) {
    console.error("[ai-generate-image] error:", e?.message || e);
    return NextResponse.json(
      { error: e?.message || "Failed to generate image" },
      { status: 500 }
    );
  }
}
