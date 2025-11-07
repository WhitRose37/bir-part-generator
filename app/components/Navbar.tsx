"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

type User = {
  id: string;
  name: string | null;
  email: string;
  avatar?: string;
  role: string;
};

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  async function fetchUser() {
    try {
      const res = await fetch("/api/me", {
        cache: "no-store",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        // ✅ 確保 data 是物件，不是陣列或其他型別
        if (data && typeof data === "object" && !Array.isArray(data)) {
          setUser(data as User);
        }
      }
    } catch (e) {
      console.error("Error fetching user:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      setDropdownOpen(false);
      router.push("/login");
    } catch (e) {
      console.error("Logout error:", e);
    }
  }

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="nav">
      <div className="nav__inner">
        {/* Logo & Brand */}
        <Link href="/" className="brand">
          <div style={{ fontSize: "24px" }}>🏭</div>
          <span className="brand__name">BIR Parts</span>
        </Link>

        {/* Nav Links */}
        <div className="nav__links">
          <Link
            href="/"
            className={`nav__link ${isActive("/") ? "nav__link--active" : ""}`}
          >
            🏠 Home
          </Link>

          <Link
            href="/generator"
            className={`nav__link ${isActive("/generator") ? "nav__link--active" : ""}`}
          >
            🔍 Generator
          </Link>

          <Link
            href="/saved-global"
            className={`nav__link ${isActive("/saved-global") ? "nav__link--active" : ""}`}
          >
            🌐 Global
          </Link>

          {/* Auth Section */}
          {loading ? (
            <span className="nav__link" style={{ opacity: 0.6 }}>
              ⏳ Loading...
            </span>
          ) : user ? (
            <div className="nav__user-menu">
              <button
                className="nav__user-button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {user.avatar && (
                  <img
                    src={user.avatar}
                    alt={user.name || ""}
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                    }}
                  />
                )}
                {!user.avatar && (
                  <div className="nav__avatar">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                <span className="nav__user-name">
                  {user.name || user.email}
                </span>
                <span
                  className={`nav__dropdown-icon ${dropdownOpen ? "open" : ""}`}
                >
                  ▼
                </span>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="nav__dropdown">
                  <Link
                    href="/profile"
                    className="nav__dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    👤 Profile
                  </Link>

                  {user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className="nav__dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      ⚙️ Admin Panel
                    </Link>
                  )}

                  {user.role === "ADMIN" && (
                    <Link
                      href="/dashboard"
                      className="nav__dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      📊 Dashboard
                    </Link>
                  )}

                  <Link
                    href="/my-catalog"
                    className="nav__dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    ❤️ My Catalog
                  </Link>

                  <div className="nav__dropdown-divider" />

                  <button
                    className="nav__dropdown-item nav__dropdown-item--logout"
                    onClick={handleLogout}
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="nav__link">
                🔐 Login
              </Link>
              <Link
                href="/register"
                className="nav__link nav__link--primary"
              >
                ✍️ Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
