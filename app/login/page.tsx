"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function showToast(msg: string, type: "success" | "error" = "success") {
  const t = document.createElement("div");
  t.className = `toast toast--${type}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => {
    t.classList.add("toast--hide");
    setTimeout(() => t.remove(), 400);
  }, 2000);
}

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (!username.trim()) {
      showToast("❌ กรุณากรอกชื่อผู้ใช้", "error");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/simple-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: "admin12345", // Fixed password
        }),
        credentials: "include",
      });

      const contentType = res.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        showToast("❌ Server error - invalid response", "error");
        console.error("Invalid response type:", contentType);
        return;
      }

      const data = await res.json();

      if (res.ok) {
        showToast("✅ เข้าสู่ระบบสำเร็จ");

        setTimeout(() => {
          window.location.href = "/";
        }, 500);
      } else {
        showToast(`❌ ${data.error || "Login failed"}`, "error");
      }
    } catch (e: any) {
      console.error("Login error:", e);
      showToast(`❌ ${e?.message || "Network error"}`, "error");
    } finally {
      setLoading(false);
    }
  }

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
        }}
      >
        <h1 style={{ fontSize: 28, marginBottom: 10, textAlign: "center" }}>
          🔐 เข้าสู่ระบบ
        </h1>
        <p
          style={{
            textAlign: "center",
            color: "rgba(255, 255, 255, 0.6)",
            marginBottom: 30,
            fontSize: 13,
          }}
        >
          ใส่ชื่อผู้ใช้อะไรก็ได้เพื่อเข้าใช้งาน
        </p>

        <form
          onSubmit={handleLogin}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 15,
          }}
        >
          <div>
            <label
              style={{
                fontSize: 12,
                color: "rgba(255, 255, 255, 0.6)",
                fontWeight: 600,
              }}
            >
              👤 ชื่อผู้ใช้
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ใส่ชื่ออะไรก็ได้"
              required
              autoFocus
              style={{
                width: "100%",
                padding: "12px",
                marginTop: 8,
                background: "rgba(0, 0, 0, 0.2)",
                border: "1px solid rgba(155, 89, 182, 0.3)",
                borderRadius: 6,
                color: "white",
                fontSize: 13,
              }}
            />
          </div>

          <div
            style={{
              background: "rgba(155, 89, 182, 0.1)",
              border: "1px solid rgba(155, 89, 182, 0.2)",
              borderRadius: 6,
              padding: 12,
              textAlign: "center",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 11,
                color: "rgba(255, 255, 255, 0.5)",
              }}
            >
              🔑 รหัสผ่านคงที่
            </p>
            <p
              style={{
                margin: "5px 0 0 0",
                fontSize: 14,
                fontWeight: 600,
                color: "#9b59b6",
              }}
            >
              admin12345
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn--primary"
            style={{
              padding: "12px",
              marginTop: 10,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "⏳ กำลังเข้าสู่ระบบ..." : "🚀 เข้าสู่ระบบ"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: 20,
            fontSize: 13,
            color: "rgba(255, 255, 255, 0.6)",
          }}
        >
          ไม่มีบัญชี?{" "}
          <Link
            href="/register"
            style={{
              color: "#9b59b6",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            สมัครสมาชิก
          </Link>
        </p>

        <div
          style={{
            marginTop: 20,
            padding: 12,
            background: "rgba(46, 204, 113, 0.1)",
            border: "1px solid rgba(46, 204, 113, 0.2)",
            borderRadius: 6,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 11,
              color: "rgba(255, 255, 255, 0.6)",
            }}
          >
            💡 <strong>วิธีใช้:</strong> ใส่ชื่อผู้ใช้อะไรก็ได้ (ไม่ต้องสมัครก่อน)
            ระบบจะสร้างบัญชีให้อัตโนมัติ
          </p>
        </div>
      </div>
    </div>
  );
}
