import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    console.log("[logout] Processing logout request");

    const cookieStore = await cookies();

    // ลบ auth-token cookie
    cookieStore.delete("auth-token");

    const response = NextResponse.json({
      ok: true,
      message: "Logged out successfully",
    });

    // ลบ cookie ใน response ด้วย
    response.cookies.set({
      name: "auth-token",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    console.log("[logout] Logout successful");
    return response;
  } catch (e: any) {
    console.error("[logout] error:", e);
    return NextResponse.json(
      { error: e?.message || "Logout failed" },
      { status: 500 }
    );
  }
}
