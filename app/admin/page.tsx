"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar?: string;
  createdAt: string;
};

type UserDetail = User & {
  searchCount: number;
  lastActivityAt?: string;
  savedCount: number;
};

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

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState("");
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", role: "USER", status: "ACTIVE" });
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      checkAdminAccess();
    }
  }, [mounted]);

  async function checkAdminAccess() {
    try {
      console.log("[admin] Checking access...");

      const res = await fetch("/api/me", {
        credentials: "include",
        cache: "no-store",
      });

      console.log("[admin] API response:", res.status);

      if (!res.ok) {
        console.log("[admin] Not authenticated, redirecting to login");
        router.push("/login");
        return;
      }

      const userData = await res.json();
      console.log("[admin] User data:", { id: userData.id, role: userData.role });

      setUser(userData);

      // ตรวจสอบ role
      if (userData.role !== "ADMIN" && userData.role !== "OWNER") {
        console.log("[admin] Not admin/owner, redirecting home");
        setError("Access denied: Admin only");
        setTimeout(() => {
          router.push("/");
        }, 1000);
        return;
      }

      console.log("[admin] Access granted, fetching users");
      // ถ้าเป็น admin ให้ดึง users
      await fetchUsers();
    } catch (e) {
      console.error("[admin] Error checking access:", e);
      setError("Error checking access");
      router.push("/login");
    } finally {
      setChecking(false);
    }
  }

  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users?page=1&limit=10`, {
        cache: "no-store",
        credentials: "include",
      });

      console.log("[admin] Users API response:", res.status);

      if (res.status === 403 || res.status === 401) {
        console.log("[admin] Unauthorized to fetch users");
        router.push("/");
        return;
      }

      if (res.ok) {
        const data = await res.json();
        console.log("[admin] Users fetched:", data.users?.length || 0);
        setUsers(data.users || []);
      } else {
        console.error("[admin] Failed to fetch users");
        setError("Failed to load users");
      }
    } catch (e: any) {
      console.error("[admin] Error fetching users:", e);
      setError("Error loading users");
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(user: User) {
    setEditingId(user.id);
    setEditForm({
      name: user.name,
      role: user.role,
      status: user.status,
    });
  }

  async function handleSave(userId: string) {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        const updated = await res.json();
        setUsers(users.map(u => u.id === userId ? updated : u));
        setEditingId(null);
        showToast("✅ User updated");
      } else {
        showToast("❌ Failed to update user");
      }
    } catch (e: any) {
      showToast(`❌ Error: ${e?.message}`);
    }
  }

  async function handleDelete(userId: string) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    setDeleting(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId));
        showToast("✅ User deleted");
      } else {
        showToast("❌ Failed to delete user");
      }
    } catch (e: any) {
      showToast(`❌ Error: ${e?.message}`);
    } finally {
      setDeleting(null);
    }
  }

  async function fetchUserDetail(userId: string, event?: React.MouseEvent) {
    try {
      setLoadingDetail(true);
      if (event) {
        setTooltipPos({
          x: event.clientX,
          y: event.clientY,
        });
      }
      
      const res = await fetch(`/api/admin/users/${userId}`, {
        cache: "no-store",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedUser(data);
        setHoveredUserId(userId);
      } else {
        console.error("[fetchUserDetail] Error:", res.status);
        showToast("❌ Failed to load user details");
      }
    } catch (e) {
      console.error("[fetchUserDetail] Error:", e);
      showToast("❌ Error loading user details");
    } finally {
      setLoadingDetail(false);
    }
  }

  if (!mounted || checking) {
    return (
      <div className="container">
        <div className="card glass">
          <p style={{ color: "#9b59b6" }}>⏳ Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="card glass">
          <p style={{ color: "#e74c3c" }}>❌ {error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container">
        <div className="card glass">
          <p style={{ color: "#9b59b6" }}>⏳ Loading users...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container" style={{ marginTop: 20, marginBottom: 40 }}>
      {/* Header */}
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: 28, marginBottom: 5 }}>
          {user.role === "OWNER" ? "👑" : "🔧"} Admin - User Management
        </h1>
        <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: 13 }}>
          Manage system users and permissions - {user.role}
        </p>
      </div>

      {/* Search & Refresh */}
      <div className="card glass" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="text"
            placeholder="🔎 Search users..."
            value={searching}
            onChange={(e) => {
              setSearching(e.target.value);
              setPage(1);
            }}
            style={{
              flex: 1,
              padding: "10px",
              background: "rgba(0, 0, 0, 0.2)",
              border: "1px solid rgba(155, 89, 182, 0.3)",
              borderRadius: 6,
              color: "white",
              fontSize: 12,
            }}
          />
          <button
            onClick={fetchUsers}
            className="btn btn--primary"
            style={{ padding: "10px 16px" }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="card glass">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid rgba(155, 89, 182, 0.3)" }}>
                <th style={{ textAlign: "left", padding: 12, fontSize: 12 }}>Name</th>
                <th style={{ textAlign: "left", padding: 12, fontSize: 12 }}>Email</th>
                <th style={{ textAlign: "center", padding: 12, fontSize: 12 }}>Role</th>
                <th style={{ textAlign: "center", padding: 12, fontSize: 12 }}>Status</th>
                <th style={{ textAlign: "center", padding: 12, fontSize: 12 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr
                  key={user.id}
                  style={{
                    borderBottom: "1px solid rgba(155, 89, 182, 0.1)",
                    backgroundColor: idx % 2 === 0 ? "rgba(155, 89, 182, 0.03)" : "transparent",
                  }}
                >
                  <td style={{ padding: 12 }}>
                    <button
                      onMouseEnter={(e) => fetchUserDetail(user.id, e)}
                      onMouseLeave={() => {
                        if (hoveredUserId === user.id) {
                          setSelectedUser(null);
                          setHoveredUserId(null);
                        }
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#9b59b6",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 500,
                        textDecoration: hoveredUserId === user.id ? "underline" : "none",
                        padding: 0,
                        transition: "all 0.2s ease",
                      }}
                    >
                      {editingId === user.id ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          style={{
                            padding: "6px",
                            background: "rgba(0, 0, 0, 0.2)",
                            border: "1px solid rgba(155, 89, 182, 0.3)",
                            borderRadius: 4,
                            color: "white",
                            fontSize: 12,
                            width: "100%",
                          }}
                        />
                      ) : (
                        user.name
                      )}
                    </button>
                  </td>
                  <td
                    style={{
                      padding: 12,
                      color: "rgba(255, 255, 255, 0.7)",
                      fontSize: 12,
                    }}
                  >
                    {user.email}
                  </td>
                  <td style={{ textAlign: "center", padding: 12 }}>
                    {editingId === user.id ? (
                      <select
                        value={editForm.role}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        style={{
                          padding: "6px",
                          background: "rgba(0, 0, 0, 0.2)",
                          border: "1px solid rgba(155, 89, 182, 0.3)",
                          borderRadius: 4,
                          color: "white",
                          fontSize: 12,
                        }}
                      >
                        <option value="USER">USER</option>
                        <option value="OWNER">OWNER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    ) : (
                      <span
                        style={{
                          background:
                            user.role === "ADMIN"
                              ? "rgba(231, 76, 60, 0.2)"
                              : user.role === "OWNER"
                              ? "rgba(241, 196, 15, 0.2)"
                              : "rgba(46, 204, 113, 0.2)",
                          color:
                            user.role === "ADMIN"
                              ? "#e74c3c"
                              : user.role === "OWNER"
                              ? "#f1c40f"
                              : "#2ecc71",
                          padding: "4px 8px",
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {user.role === "OWNER" && "👑 "}
                        {user.role === "ADMIN" && "🔧 "}
                        {user.role === "USER" && "👤 "}
                        {user.role}
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: "center", padding: 12 }}>
                    {editingId === user.id ? (
                      <select
                        value={editForm.status}
                        onChange={(e) =>
                          setEditForm({ ...editForm, status: e.target.value })
                        }
                        style={{
                          padding: "6px",
                          background: "rgba(0, 0, 0, 0.2)",
                          border: "1px solid rgba(155, 89, 182, 0.3)",
                          borderRadius: 4,
                          color: "white",
                          fontSize: 12,
                        }}
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                      </select>
                    ) : (
                      <span
                        style={{
                          background:
                            user.status === "ACTIVE"
                              ? "rgba(46, 204, 113, 0.2)"
                              : "rgba(231, 76, 60, 0.2)",
                          color:
                            user.status === "ACTIVE" ? "#2ecc71" : "#e74c3c",
                          padding: "4px 8px",
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {user.status}
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: "center", padding: 12 }}>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                      {editingId === user.id ? (
                        <>
                          <button
                            onClick={() => handleSave(user.id)}
                            className="btn btn--primary"
                            style={{ padding: "6px 12px", fontSize: 11 }}
                          >
                            ✅ Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="btn btn--ghost"
                            style={{ padding: "6px 12px", fontSize: 11 }}
                          >
                            ✕ Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(user)}
                            className="btn btn--ghost"
                            style={{ padding: "6px 12px", fontSize: 11 }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            disabled={deleting === user.id}
                            className="btn btn--ghost"
                            style={{ padding: "6px 12px", fontSize: 11, color: "#e74c3c" }}
                          >
                            {deleting === user.id ? "⏳..." : "🗑️ Delete"}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Tooltip Hover Card */}
      {selectedUser && hoveredUserId && !loadingDetail && (
        <div
          style={{
            position: "fixed",
            top: tooltipPos.y + 10,
            left: tooltipPos.x + 10,
            background: "rgba(20, 20, 30, 0.95)",
            border: "2px solid rgba(155, 89, 182, 0.4)",
            borderRadius: 12,
            padding: 20,
            width: 320,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
            zIndex: 2000,
            backdropFilter: "blur(10px)",
            animation: "slideIn 0.2s ease",
            pointerEvents: "none",
          }}
        >
          {/* Avatar */}
          <div style={{ textAlign: "center", marginBottom: 15 }}>
            <div
              style={{
                width: 80,
                height: 80,
                margin: "0 auto 10px",
                borderRadius: "50%",
                background: selectedUser.avatar
                  ? `url(${selectedUser.avatar}) center/cover`
                  : "linear-gradient(135deg, #9b59b6, #8e44ad)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                border: "3px solid rgba(155, 89, 182, 0.3)",
                overflow: "hidden",
              }}
            >
              {!selectedUser.avatar && selectedUser.name.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Name */}
          <p style={{ margin: "0 0 10px 0", fontSize: 14, fontWeight: 600, textAlign: "center" }}>
            {selectedUser.name}
          </p>

          {/* Email */}
          <p style={{ margin: "0 0 15px 0", fontSize: 11, color: "rgba(255, 255, 255, 0.6)", textAlign: "center" }}>
            {selectedUser.email}
          </p>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 15 }}>
            <div style={{
              background: "rgba(155, 89, 182, 0.1)",
              border: "1px solid rgba(155, 89, 182, 0.2)",
              borderRadius: 8,
              padding: 10,
              textAlign: "center",
            }}>
              <p style={{ margin: 0, fontSize: 12, color: "rgba(255, 255, 255, 0.6)" }}>
                🔍 Searches
              </p>
              <p style={{ margin: "5px 0 0 0", fontSize: 16, fontWeight: 600, color: "#9b59b6" }}>
                {selectedUser.searchCount}
              </p>
            </div>

            <div style={{
              background: "rgba(46, 204, 113, 0.1)",
              border: "1px solid rgba(46, 204, 113, 0.2)",
              borderRadius: 8,
              padding: 10,
              textAlign: "center",
            }}>
              <p style={{ margin: 0, fontSize: 12, color: "rgba(255, 255, 255, 0.6)" }}>
                💾 Saved
              </p>
              <p style={{ margin: "5px 0 0 0", fontSize: 16, fontWeight: 600, color: "#2ecc71" }}>
                {selectedUser.savedCount}
              </p>
            </div>
          </div>

          {/* Last Activity */}
          <div style={{
            background: "rgba(0, 0, 0, 0.2)",
            borderRadius: 8,
            padding: 10,
            marginBottom: 15,
          }}>
            <p style={{ margin: 0, fontSize: 11, color: "rgba(255, 255, 255, 0.5)" }}>
              🕐 Last Activity
            </p>
            <p style={{ margin: "5px 0 0 0", fontSize: 12 }}>
              {selectedUser.lastActivityAt
                ? new Date(selectedUser.lastActivityAt).toLocaleString()
                : "Never"}
            </p>
          </div>

          {/* Member Since */}
          <p style={{ margin: 0, fontSize: 11, color: "rgba(255, 255, 255, 0.5)", textAlign: "center" }}>
            📅 Member: {new Date(selectedUser.createdAt).toLocaleDateString()}
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
