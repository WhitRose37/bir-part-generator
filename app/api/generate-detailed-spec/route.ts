import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const maxDuration = 60;

async function perplexityDetailedAnalysis(partData: any): Promise<string> {
  const key = process.env.PERPLEXITY_API_KEY;
  if (!key) throw new Error("PERPLEXITY_API_KEY not set");

  console.log("[generate-detailed-spec] 🔍 Analyzing part data...");

  const prompt = `
ให้วิเคราะห์และสรุปข้อมูลชิ้นส่วนนี้เป็นรายงานเทคนิคที่ครอบคลุม:

📋 ข้อมูลพื้นฐาน:
- Part Number: ${partData.part_number || "—"}
- Product Name: ${partData.product_name || partData.common_name_en || "—"}
- Common Name (EN): ${partData.common_name_en || "—"}
- Common Name (TH): ${partData.common_name_th || "—"}
- UOM: ${partData.uom || "—"}

⚙️ คุณสมบัติ:
- ${partData.characteristics_of_material_en || "—"}
- ${partData.characteristics_of_material_th || "—"}

🔧 หน้าที่และการใช้งาน:
- Function (EN): ${partData.function_en || "—"}
- Function (TH): ${partData.function_th || "—"}
- Where Used (EN): ${partData.where_used_en || "—"}
- Where Used (TH): ${partData.where_used_th || "—"}

📊 ข้อมูลการค้า:
- ECCN: ${partData.eccn || "ไม่ทราบ"}
- HTS: ${partData.hts || "ไม่ทราบ"}
- COO: ${partData.coo || "ไม่ทราบ"}

กรุณาให้ข้อมูลเพิ่มเติม (ถ้ามี):
1. 📌 ข้อมูลเพิ่มเติมเกี่ยวกับชิ้นส่วน
2. 🏭 อุตสาหกรรมและการประยุกต์ใช้
3. 🔄 รูปแบบ/รุ่นต่างๆ ที่เกี่ยวข้อง
4. 🛡️ มาตรฐานและการรับรอง
5. 💡 เคล็ดลับการติดตั้งและการใช้งาน
6. ⚠️ ข้อมูลเตือนความปลอดภัย

ตอบเป็นภาษาไทยและอังกฤษโดยระบุหัวข้อชัดเจน
`.trim();

  const res = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Perplexity error: ${res.status} - ${error}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || "";
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("[generate-detailed-spec] 📋 Received part data:", body.part_number);

    const analysis = await perplexityDetailedAnalysis(body);

    console.log("[generate-detailed-spec] ✅ Analysis complete");

    return NextResponse.json({
      ok: true,
      analysis,
      generatedAt: new Date().toISOString(),
    });
  } catch (e: any) {
    console.error("[generate-detailed-spec] ❌ Error:", e?.message);
    return NextResponse.json(
      { error: e?.message || "Analysis failed" },
      { status: 500 }
    );
  }
}
