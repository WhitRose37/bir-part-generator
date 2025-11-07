// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function showToast(msg: string) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => {
    t.classList.add("toast--hide");
    setTimeout(() => t.remove(), 400);
  }, 1500);
}

export default function LobbyPage() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchUser();
    }
  }, [mounted]);

  async function fetchUser() {
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error("Error fetching user:", e);
      setUser(null);
    }
  }

  if (!mounted) return null;

  return (
    <div className="container" style={{ marginTop: 0, marginBottom: 0 }}>
      {/* Hero Section */}
      <section style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, rgba(155, 89, 182, 0.1) 0%, rgba(52, 152, 219, 0.05) 100%)",
        borderBottom: "1px solid rgba(155, 89, 182, 0.2)",
        padding: "60px 20px",
        marginBottom: 80,
      }}>
        <div style={{ textAlign: "center", maxWidth: 700 }}>
          <h1 style={{
            fontSize: "clamp(28px, 6vw, 48px)",
            marginBottom: 20,
            background: "linear-gradient(135deg, #9b59b6 0%, #3498db 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 800,
            letterSpacing: "-1px",
          }}>
            🚀 BIR Part Generator
          </h1>
          <p style={{
            fontSize: "clamp(14px, 2vw, 18px)",
            color: "rgba(255, 255, 255, 0.7)",
            marginBottom: 40,
            lineHeight: 1.6,
          }}>
            Generate detailed specifications for industrial parts in seconds using AI-powered technology
          </p>
          
          <div style={{
            display: "flex",
            gap: 15,
            justifyContent: "center",
            flexWrap: "wrap",
          }}>
            {user ? (
              <>
                <Link
                  href="/generator"
                  className="btn btn--primary"
                  style={{
                    textDecoration: "none",
                    padding: "14px 32px",
                    fontSize: 14,
                    fontWeight: 600,
                    boxShadow: "0 8px 24px rgba(155, 89, 182, 0.3)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(155, 89, 182, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(155, 89, 182, 0.3)";
                  }}
                >
                  🚀 Start Generating
                </Link>
                <Link
                  href="/my-catalog"
                  className="btn btn--ghost"
                  style={{
                    textDecoration: "none",
                    padding: "14px 32px",
                    fontSize: 14,
                    fontWeight: 600,
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(155, 89, 182, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  📚 My Catalog
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="btn btn--primary"
                  style={{
                    textDecoration: "none",
                    padding: "14px 32px",
                    fontSize: 14,
                    fontWeight: 600,
                    boxShadow: "0 8px 24px rgba(155, 89, 182, 0.3)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(155, 89, 182, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(155, 89, 182, 0.3)";
                  }}
                >
                  🔐 Login
                </Link>
                <Link
                  href="/register"
                  className="btn btn--ghost"
                  style={{
                    textDecoration: "none",
                    padding: "14px 32px",
                    fontSize: 14,
                    fontWeight: 600,
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(155, 89, 182, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  ✍️ Register
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ marginBottom: 100, padding: "0 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h2 style={{
            fontSize: "clamp(24px, 4vw, 36px)",
            marginBottom: 10,
            fontWeight: 700,
          }}>
            ✨ Key Features
          </h2>
          <div style={{
            width: 60,
            height: 4,
            background: "linear-gradient(90deg, #9b59b6, #3498db)",
            margin: "0 auto 20px",
            borderRadius: 2,
          }} />
          <p style={{
            fontSize: 14,
            color: "rgba(255, 255, 255, 0.6)",
          }}>
            Everything you need to manage industrial parts
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 24,
          maxWidth: 1200,
          margin: "0 auto",
        }}>
          {/*
            { icon: "⚙️", title: "Generate Parts", desc: "Enter a part number and get instant specifications with AI-powered descriptions" },
            { icon: "📚", title: "My Catalog", desc: "Build and manage your personal collection of parts with advanced filtering" },
            { icon: "💾", title: "Saved Parts", desc: "Share and sync parts globally across your organization" },
            { icon: "🌐", title: "Auto Translate", desc: "Automatically translate specifications between English and Thai" },
            { icon: "📊", title: "Dashboard", desc: "Track usage statistics and top searched parts" },
            { icon: "📋", title: "Tech Specs", desc: "Generate professional technical specification documents" },
          */}
          {Array(6).fill(0).map((_, i) => (
            <div
              key={i}
              className="card glass"
              style={{
                padding: 30,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-8px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 40px rgba(155, 89, 182, 0.2)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <div style={{
                fontSize: 40,
                height: 50,
                display: "flex",
                alignItems: "center",
              }}>
                ⚙️
              </div>
              <h3 style={{
                fontSize: 16,
                fontWeight: 600,
                margin: "8px 0 0 0",
              }}>
                Generate Parts
              </h3>
              <p style={{
                fontSize: 13,
                color: "rgba(255, 255, 255, 0.65)",
                lineHeight: 1.5,
                margin: 0,
              }}>
                Enter a part number and get instant specifications with AI-powered descriptions
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        background: "linear-gradient(135deg, rgba(155, 89, 182, 0.15) 0%, rgba(52, 152, 219, 0.08) 100%)",
        borderTop: "1px solid rgba(155, 89, 182, 0.2)",
        borderBottom: "1px solid rgba(155, 89, 182, 0.2)",
        padding: "80px 20px",
        textAlign: "center",
      }}>
        <h2 style={{
          fontSize: "clamp(20px, 3vw, 32px)",
          marginBottom: 15,
          fontWeight: 700,
        }}>
          🎯 Ready to Get Started?
        </h2>
        <p style={{
          fontSize: 15,
          color: "rgba(255, 255, 255, 0.6)",
          marginBottom: 40,
          maxWidth: 500,
          margin: "0 auto 40px",
        }}>
          Generate your first part specification now and experience the power of AI-driven documentation
        </p>
        <div style={{
          display: "flex",
          gap: 15,
          justifyContent: "center",
          flexWrap: "wrap",
        }}>
          {user ? (
            <>
              <Link
                href="/generator"
                className="btn btn--primary"
                style={{
                  textDecoration: "none",
                  padding: "14px 36px",
                  fontSize: 14,
                  fontWeight: 600,
                  boxShadow: "0 8px 24px rgba(155, 89, 182, 0.3)",
                }}
              >
                🚀 Start Generating
              </Link>
              <Link
                href="/my-catalog"
                className="btn btn--ghost"
                style={{
                  textDecoration: "none",
                  padding: "14px 36px",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                📚 Browse Parts
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="btn btn--primary"
                style={{
                  textDecoration: "none",
                  padding: "14px 36px",
                  fontSize: 14,
                  fontWeight: 600,
                  boxShadow: "0 8px 24px rgba(155, 89, 182, 0.3)",
                }}
              >
                🔐 Login
              </Link>
              <Link
                href="/register"
                className="btn btn--ghost"
                style={{
                  textDecoration: "none",
                  padding: "14px 36px",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                ✍️ Register
              </Link>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
