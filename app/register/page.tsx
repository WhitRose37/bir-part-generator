"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login (registration is automatic)
    router.push("/login");
  }, [router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        className="card glass"
        style={{
          maxWidth: 400,
          width: "100%",
          padding: 40,
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 48, margin: "0 0 20px 0" }}>🔄</p>
        <h1 style={{ fontSize: 24, marginBottom: 10 }}>กำลังเปลี่ยนหน้า...</h1>
        <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: 13 }}>
          ระบบสร้างบัญชีอัตโนมัติ ไม่ต้องสมัครสมาชิก
        </p>
        <Link
          href="/login"
          className="btn btn--primary"
          style={{
            marginTop: 20,
            textDecoration: "none",
            display: "inline-block",
            padding: "12px 24px",
          }}
        >
          ไปหน้า Login
        </Link>
      </div>
    </div>
  );
}
