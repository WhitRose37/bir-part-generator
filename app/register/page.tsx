"use client";

import { useEffect, useState } from "react";
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

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    checkIfLoggedIn();
  }, []);

  async function checkIfLoggedIn() {
    try {
      const res = await fetch("/api/me", {
        credentials: "include",
        cache: "no-store",
      });

      if (res.ok) {
        // ถ้า logged in ให้ redirect ไป home
        router.push("/");
        return;
      }
    } catch (e) {
      console.error("Error checking login status:", e);
    } finally {
      setChecking(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showToast("❌ Passwords do not match", "error");
      return;
    }

    if (formData.password.length < 6) {
      showToast("❌ Password must be at least 6 characters", "error");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
        credentials: "include",
      });

      const contentType = res.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        showToast("❌ Server error - invalid response", "error");
        return;
      }

      const data = await res.json();

      if (res.ok) {
        showToast("✅ Registration successful! Redirecting...");
        setFormData({ name: "", email: "", password: "", confirmPassword: "" });

        setTimeout(() => {
          window.location.href = "/";
        }, 500);
      } else {
        showToast(`❌ ${data.error || "Registration failed"}`, "error");
      }
    } catch (e: any) {
      console.error("Register error:", e);
      showToast(`❌ ${e?.message || "Network error"}`, "error");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return null;
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
          ✍️ Register
        </h1>
        <p
          style={{
            textAlign: "center",
            color: "rgba(255, 255, 255, 0.6)",
            marginBottom: 30,
            fontSize: 13,
          }}
        >
          Create your BIR Parts account
        </p>

        <form
          onSubmit={handleRegister}
          style={{ display: "flex", flexDirection: "column", gap: 15 }}
        >
          <div>
            <label
              style={{
                fontSize: 12,
                color: "rgba(255, 255, 255, 0.6)",
                fontWeight: 600,
              }}
            >
              👤 Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="John Doe"
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

          <div>
            <label
              style={{
                fontSize: 12,
                color: "rgba(255, 255, 255, 0.6)",
                fontWeight: 600,
              }}
            >
              🔐 Confirm Password
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
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
            {loading ? "⏳ Registering..." : "🚀 Register"}
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
          Already have an account?{" "}
          <Link
            href="/login"
            style={{
              color: "#9b59b6",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
