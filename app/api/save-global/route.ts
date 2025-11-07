import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getCurrentUser(); // ถ้ายังไม่ล็อกอิน จะเป็น null ได้
  const body = await req.json();
  const part = body?.part;

  if (!part || !part.part_number) {
    return NextResponse.json({ error: "part.part_number is required" }, { status: 400 });
  }

  const saved = await prisma.savedPartGlobal.upsert({
    where: { partNumber: String(part.part_number) },
    update: {
      data: part,
      createdById: user?.id ?? null,       // เก็บคนล่าสุดที่อัปเดตไว้ด้วยก็ได้
      createdByName: user?.name ?? null,
      updatedAt: new Date(),
    },
    create: {
      partNumber: String(part.part_number),
      data: part,
      createdById: user?.id ?? null,
      createdByName: user?.name ?? null,
    },
  });

  return NextResponse.json({ ok: true, id: saved.id });
}
