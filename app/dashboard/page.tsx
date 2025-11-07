"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type DashboardStats = {
  totalUsers: number;
  totalParts: number;
  totalSearches: number;
  topSearches: { part_number: string; count: number }[];
  topUsers: {
    id: string;
    name: string;
    email: string;
    searchCount: number;
    savedCount: number;
  }[];
  recentSearches: {
    id: string;
    part_number: string;
    userId: string;
    userName: string;
    createdAt: string;
  }[];
};

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      console.log("[dashboard] 📊 Fetching stats...");

      const res = await fetch("/api/dashboard", {
        cache: "no-store",
        credentials: "include",
      });

      console.log("[dashboard] Response status:", res.status);

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (res.status === 403) {
        setError("Access denied: Admin only");
        return;
      }

      if (res.ok) {
        const data = await res.json();
        console.log("[dashboard] ✅ Stats loaded:", data);
        setStats(data);
      } else {
        setError("Failed to load dashboard");
      }
    } catch (e: any) {
      console.error("[dashboard] ❌ Error:", e);
      setError(e?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container" style={{ marginTop: 40 }}>
        <div className="card glass">
          <p style={{ color: "#9b59b6" }}>⏳ Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ marginTop: 40 }}>
        <div className="card glass">
          <p style={{ color: "#e74c3c" }}>❌ {error}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container" style={{ marginTop: 40 }}>
        <div className="card glass">
          <p>No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: 20, marginBottom: 40 }}>
      {/* Header */}
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: 28, marginBottom: 5 }}>📊 Dashboard</h1>
        <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: 13 }}>
          System statistics and activity overview
        </p>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 15,
          marginBottom: 30,
        }}
      >
        <div className="card glass" style={{ textAlign: "center", padding: 20 }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>👥</div>
          <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 5, color: "#9b59b6" }}>
            {stats.totalUsers}
          </div>
          <div style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.6)" }}>Total Users</div>
        </div>

        <div className="card glass" style={{ textAlign: "center", padding: 20 }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>📦</div>
          <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 5, color: "#3498db" }}>
            {stats.totalParts}
          </div>
          <div style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.6)" }}>Total Parts</div>
        </div>

        <div className="card glass" style={{ textAlign: "center", padding: 20 }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
          <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 5, color: "#2ecc71" }}>
            {stats.totalSearches}
          </div>
          <div style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.6)" }}>Total Searches</div>
        </div>
      </div>

      {/* Top 10 Saved Parts */}
      <div className="card glass" style={{ marginBottom: 30 }}>
        <h3 style={{ fontSize: 16, marginBottom: 15, fontWeight: 700 }}>🏆 Top 10 Saved Parts</h3>

        {stats.topSearches.length === 0 ? (
          <p style={{ color: "rgba(255, 255, 255, 0.5)", textAlign: "center", padding: 20 }}>
            ℹ️ No saved parts yet
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid rgba(155, 89, 182, 0.3)" }}>
                  <th style={{ textAlign: "left", padding: 12, fontSize: 12 }}>Rank</th>
                  <th style={{ textAlign: "left", padding: 12, fontSize: 12 }}>Part Number</th>
                  <th style={{ textAlign: "center", padding: 12, fontSize: 12 }}>Saved Count</th>
                </tr>
              </thead>
              <tbody>
                {stats.topSearches.map((item, idx) => (
                  <tr
                    key={item.part_number}
                    style={{
                      borderBottom: "1px solid rgba(155, 89, 182, 0.1)",
                      backgroundColor: idx % 2 === 0 ? "rgba(155, 89, 182, 0.03)" : "transparent",
                    }}
                  >
                    <td style={{ padding: 12 }}>
                      <span
                        style={{
                          background:
                            idx === 0
                              ? "rgba(241, 196, 15, 0.2)"
                              : idx === 1
                              ? "rgba(149, 165, 166, 0.2)"
                              : idx === 2
                              ? "rgba(205, 127, 50, 0.2)"
                              : "rgba(155, 89, 182, 0.1)",
                          color:
                            idx === 0
                              ? "#f1c40f"
                              : idx === 1
                              ? "#95a5a6"
                              : idx === 2
                              ? "#cd7f32"
                              : "#9b59b6",
                          padding: "4px 10px",
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {idx === 0 && "🥇 "}
                        {idx === 1 && "🥈 "}
                        {idx === 2 && "🥉 "}
                        #{idx + 1}
                      </span>
                    </td>
                    <td style={{ padding: 12, fontWeight: 500, fontSize: 13 }}>
                      {item.part_number}
                    </td>
                    <td style={{ textAlign: "center", padding: 12 }}>
                      <span
                        style={{
                          background: "rgba(46, 204, 113, 0.2)",
                          color: "#2ecc71",
                          padding: "4px 12px",
                          borderRadius: 4,
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        {item.count}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Top Users & Recent Activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
        {/* Top Users */}
        <div className="card glass">
          <h3 style={{ fontSize: 16, marginBottom: 15, fontWeight: 700 }}>👥 Top Active Users</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {stats.topUsers.slice(0, 5).map((user) => (
              <div
                key={user.id}
                style={{
                  padding: 12,
                  background: "rgba(155, 89, 182, 0.05)",
                  borderRadius: 6,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{user.name}</div>
                  <div style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.5)" }}>
                    {user.email}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#9b59b6",
                  }}
                >
                  {user.searchCount} 🔍
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card glass">
          <h3 style={{ fontSize: 16, marginBottom: 15, fontWeight: 700 }}>⏱️ Recent Activity</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {stats.recentSearches.slice(0, 5).map((log) => (
              <div
                key={log.id}
                style={{
                  padding: 12,
                  background: "rgba(155, 89, 182, 0.05)",
                  borderRadius: 6,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                  {log.part_number}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.5)" }}>
                  by {log.userName} •{" "}
                  {new Date(log.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
