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
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
        showToast("✅ Login successful");
        setFormData({ email: "", password: "" });

        setTimeout(() => {
          // Hard refresh เพื่อให้ navbar update
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
          🔐 Login
        </h1>
        <p
          style={{
            textAlign: "center",
            color: "rgba(255, 255, 255, 0.6)",
            marginBottom: 30,
            fontSize: 13,
          }}
        >
          Welcome back to BIR Parts
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
              📧 Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="your@email.com"
              required
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

          <div>
            <label
              style={{
                fontSize: 12,
                color: "rgba(255, 255, 255, 0.6)",
                fontWeight: 600,
              }}
            >
              🔑 Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="••••••••"
              required
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
            {loading ? "⏳ Logging in..." : "🚀 Login"}
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
          Don't have an account?{" "}
          <Link
            href="/register"
            style={{
              color: "#9b59b6",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
