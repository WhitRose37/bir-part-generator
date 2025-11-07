"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  createdAt: string;
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

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchProfile();
    }
  }, [mounted]);

  async function fetchProfile() {
    try {
      setLoading(true);
      const res = await fetch("/api/me", {
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setFormData({
          name: data.name,
          email: data.email,
        });
        if (data.avatar) {
          setAvatarPreview(data.avatar);
        }
      } else if (res.status === 401) {
        router.push("/login");
      }
    } catch (e) {
      showToast("❌ Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast("❌ File size must be less than 5MB", "error");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showToast("❌ Please select an image file", "error");
      return;
    }

    setAvatarFile(file);

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (!formData.name.trim()) {
      showToast("❌ Name is required", "error");
      return;
    }

    setSaving(true);
    try {
      let avatarUrl = profile?.avatar;

      // Upload avatar if changed
      if (avatarFile) {
        const formDataWithFile = new FormData();
        formDataWithFile.append("file", avatarFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formDataWithFile,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          avatarUrl = uploadData.url;
        } else {
          showToast("❌ Failed to upload avatar", "error");
          return;
        }
      }

      // Update profile
      const res = await fetch("/api/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          avatar: avatarUrl,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setEditing(false);
        setAvatarFile(null);
        showToast("✅ Profile updated successfully", "success");
      } else {
        showToast("❌ Failed to update profile", "error");
      }
    } catch (e) {
      console.error("Error:", e);
      showToast("❌ Error saving profile", "error");
    } finally {
      setSaving(false);
    }
  }

  if (!mounted || loading) {
    return (
      <div className="container">
        <div className="card glass">
          <p style={{ color: "#9b59b6" }}>⏳ Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container">
        <div className="card glass">
          <p>❌ Failed to load profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: 20, marginBottom: 40, maxWidth: 600 }}>
      {/* Header */}
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: 28, marginBottom: 5 }}>👤 My Profile</h1>
        <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: 13 }}>
          Manage your account information
        </p>
      </div>

      {/* Profile Card */}
      <div className="card glass">
        {/* Avatar Section */}
        <div style={{ textAlign: "center", marginBottom: 30, paddingBottom: 20, borderBottom: "1px solid rgba(155, 89, 182, 0.2)" }}>
          <div
            style={{
              width: 120,
              height: 120,
              margin: "0 auto 15px",
              borderRadius: "50%",
              background: avatarPreview
                ? `url(${avatarPreview}) center/cover`
                : "linear-gradient(135deg, #9b59b6, #8e44ad)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 50,
              border: "3px solid rgba(155, 89, 182, 0.3)",
              overflow: "hidden",
              cursor: editing ? "pointer" : "default",
              position: "relative",
            }}
          >
            {!avatarPreview && profile.name.charAt(0).toUpperCase()}
            {editing && (
              <label
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0, 0, 0, 0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  opacity: 0,
                  transition: "opacity 0.3s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: "none" }}
                />
                <span style={{ fontSize: 14, color: "white", fontWeight: 600 }}>
                  📷 Upload
                </span>
              </label>
            )}
          </div>
          <p style={{ margin: 0, fontWeight: 500, fontSize: 12, color: "rgba(255, 255, 255, 0.5)" }}>
            {editing ? "Click avatar to change" : "Avatar"}
          </p>
        </div>

        {/* Info Section */}
        {!editing ? (
          <>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.5)", textTransform: "uppercase", fontWeight: 600 }}>
                👤 Name
              </label>
              <p style={{ margin: "8px 0 0 0", fontSize: 14, fontWeight: 500 }}>
                {profile.name}
              </p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.5)", textTransform: "uppercase", fontWeight: 600 }}>
                📧 Email
              </label>
              <p style={{ margin: "8px 0 0 0", fontSize: 14, color: "rgba(255, 255, 255, 0.8)" }}>
                {profile.email}
              </p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.5)", textTransform: "uppercase", fontWeight: 600 }}>
                🏷️ Role
              </label>
              <p style={{ margin: "8px 0 0 0", fontSize: 14 }}>
                <span
                  style={{
                    background:
                      profile.role === "OWNER"
                        ? "rgba(241, 196, 15, 0.2)"
                        : profile.role === "ADMIN"
                        ? "rgba(231, 76, 60, 0.2)"
                        : "rgba(46, 204, 113, 0.2)",
                    color:
                      profile.role === "OWNER"
                        ? "#f1c40f"
                        : profile.role === "ADMIN"
                        ? "#e74c3c"
                        : "#2ecc71",
                    padding: "4px 12px",
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {profile.role === "OWNER" && "👑 "}
                  {profile.role === "ADMIN" && "🔧 "}
                  {profile.role === "USER" && "👤 "}
                  {profile.role}
                </span>
              </p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.5)", textTransform: "uppercase", fontWeight: 600 }}>
                📅 Member Since
              </label>
              <p style={{ margin: "8px 0 0 0", fontSize: 14, color: "rgba(255, 255, 255, 0.8)" }}>
                {new Date(profile.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <button
              onClick={() => setEditing(true)}
              className="btn btn--primary"
              style={{ width: "100%", padding: "12px", marginTop: 20 }}
            >
              ✏️ Edit Profile
            </button>
          </>
        ) : (
          <>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.5)", textTransform: "uppercase", fontWeight: 600 }}>
                👤 Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: 8,
                  background: "rgba(0, 0, 0, 0.2)",
                  border: "1px solid rgba(155, 89, 182, 0.3)",
                  borderRadius: 6,
                  color: "white",
                  fontSize: 13,
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.5)", textTransform: "uppercase", fontWeight: 600 }}>
                📧 Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: 8,
                  background: "rgba(0, 0, 0, 0.1)",
                  border: "1px solid rgba(155, 89, 182, 0.2)",
                  borderRadius: 6,
                  color: "rgba(255, 255, 255, 0.5)",
                  fontSize: 13,
                  cursor: "not-allowed",
                }}
              />
              <p style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.4)", marginTop: 5, margin: 0 }}>
                Email cannot be changed
              </p>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => {
                  setEditing(false);
                  setAvatarFile(null);
                  setAvatarPreview(profile.avatar || null);
                }}
                className="btn btn--ghost"
                style={{ flex: 1, padding: "12px" }}
              >
                ✕ Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn btn--primary"
                style={{
                  flex: 1,
                  padding: "12px",
                  opacity: saving ? 0.6 : 1,
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "⏳ Saving..." : "✅ Save"}
              </button>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .card {
          padding: 20px;
          background: rgba(155, 89, 182, 0.05);
          border: 1px solid rgba(155, 89, 182, 0.2);
          border-radius: 8px;
        }

        .card.glass {
          background: rgba(30, 30, 30, 0.8);
          backdrop-filter: blur(10px);
        }

        .btn {
          padding: 10px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          font-size: 12px;
        }

        .btn--primary {
          background: rgba(155, 89, 182, 0.8);
          color: white;
        }

        .btn--primary:hover:not(:disabled) {
          background: rgba(155, 89, 182, 1);
        }

        .btn--primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn--ghost {
          background: rgba(155, 89, 182, 0.1);
          color: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(155, 89, 182, 0.3);
        }

        .btn--ghost:hover {
          background: rgba(155, 89, 182, 0.2);
        }

        .input {
          font-family: inherit;
        }

        .fade-in {
          animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
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
