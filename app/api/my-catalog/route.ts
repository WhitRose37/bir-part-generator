import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

// ------- helpers -------
const toStr = (v: any) => (v ?? "") as string;
const toArr = <T = unknown>(v: any): T[] => (Array.isArray(v) ? v : []);

// ===== POST: บันทึกลงใน My Catalog (Glossary) =====
export async function POST(req: Request) {
  try {
    console.log("[my-catalog POST] 🔍 Checking user...");

    const user = await getCurrentUser();
    console.log(
      "[my-catalog POST] User:",
      user ? `${user.id} (${user.name})` : "NOT AUTHENTICATED"
    );

    if (!user) {
      console.log("[my-catalog POST] ❌ User is null - returning 401");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      part_number,
      product_name,
      common_name_en,
      common_name_th,
      uom,
      characteristics_of_material_en,
      characteristics_of_material_th,
      estimated_capacity_machine_year,
      quantity_to_use,
      function_en,
      function_th,
      where_used_en,
      where_used_th,
      eccn,
      hts,
      coo,
      tags = [],
      images = [],
      sources = [],
    } = body;

    if (!part_number) {
      return NextResponse.json(
        { error: "part_number is required" },
        { status: 400 }
      );
    }

    // ✅ บันทึกลงใน Glossary (My Catalog)
    const glossary = await prisma.glossary.upsert({
      where: { partNumber: part_number },
      update: {
        productName: product_name,
        commonNameEn: common_name_en,
        commonNameTh: common_name_th,
        uom,
        characteristicsOfMaterialEn: characteristics_of_material_en,
        characteristicsOfMaterialTh: characteristics_of_material_th,
        estimatedCapacityMachineYear: estimated_capacity_machine_year,
        quantityToUse: quantity_to_use,
        functionEn: function_en,
        functionTh: function_th,
        whereUsedEn: where_used_en,
        whereUsedTh: where_used_th,
        eccn,
        hts,
        coo,
        tagsJson: tags.length ? tags : null,
        imagesJson: images.length ? images : null,
        sourcesJson: sources.length ? sources : null,
        createdById: user.id,
        createdByName: user.name,
        updatedAt: new Date(),
      },
      create: {
        partNumber: part_number,
        termEn: common_name_en || product_name || part_number,
        termTh: common_name_th || part_number,
        productName: product_name,
        commonNameEn: common_name_en,
        commonNameTh: common_name_th,
        uom,
        characteristicsOfMaterialEn: characteristics_of_material_en,
        characteristicsOfMaterialTh: characteristics_of_material_th,
        estimatedCapacityMachineYear: estimated_capacity_machine_year,
        quantityToUse: quantity_to_use,
        functionEn: function_en,
        functionTh: function_th,
        whereUsedEn: where_used_en,
        whereUsedTh: where_used_th,
        eccn,
        hts,
        coo,
        tagsJson: tags.length ? tags : null,
        imagesJson: images.length ? images : null,
        sourcesJson: sources.length ? sources : null,
        createdById: user.id,
        createdByName: user.name,
      },
    });

    return NextResponse.json({ ok: true, id: glossary.id });
  } catch (e: any) {
    console.error("[my-catalog POST] ❌ Error:", e?.message || e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

// ===== GET: ดึงรายการจาก My Catalog =====
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // Build search filter - เฉพาะของผู้ใช้ปัจจุบัน
    const whereClause: any = {
      createdById: user.id,
    };
    if (search.trim()) {
      whereClause.OR = [
        { partNumber: { contains: search, mode: "insensitive" } },
        { commonNameEn: { contains: search, mode: "insensitive" } },
        { commonNameTh: { contains: search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.glossary.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.glossary.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      items,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

// ===== PATCH: แก้ไขข้อมูล =====
export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, partNumber } = body || {};
    if (!id && !partNumber) {
      return NextResponse.json({ error: "id or partNumber is required" }, { status: 400 });
    }

    const data: any = {};
    if ("productName" in body) data.productName = body.productName ?? null;
    if ("commonNameEn" in body) data.commonNameEn = body.commonNameEn ?? null;
    if ("commonNameTh" in body) data.commonNameTh = body.commonNameTh ?? null;
    if ("uom" in body) data.uom = body.uom ?? null;
    if ("eccn" in body) data.eccn = body.eccn ?? null;
    if ("hts" in body) data.hts = body.hts ?? null;
    if ("coo" in body) data.coo = body.coo ?? null;

    const where = id ? { id: String(id) } : { partNumber: String(partNumber) };

    const row = await prisma.glossary.update({ where, data });
    return NextResponse.json(row);
  } catch (err: any) {
    console.error("[my-catalog] PATCH error:", err);
    return NextResponse.json({ error: err?.message || "Internal Server Error" }, { status: 500 });
  }
}

// ===== DELETE: ลบ =====
export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const partNumber = url.searchParams.get("partNumber");

    if (!id && !partNumber) {
      return NextResponse.json({ error: "id or partNumber is required" }, { status: 400 });
    }

    const where = id ? { id } : { partNumber: String(partNumber) };
    const row = await prisma.glossary.delete({ where });

    return NextResponse.json({ ok: true, id: row.id, partNumber: row.partNumber });
  } catch (err: any) {
    console.error("[my-catalog] DELETE error:", err);
    return NextResponse.json({ error: err?.message || "Internal Server Error" }, { status: 500 });
  }
}
