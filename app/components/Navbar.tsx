"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

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
      const res = await fetch("/api/me", {
        credentials: "include",
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
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
      window.location.href = "/";
    } catch (e) {
      console.error("Logout error:", e);
    }
  }

  if (!mounted) return null;

  return (
    <nav className="nav">
      <div className="nav__inner">
        <Link href="/" className="brand">
          <span className="brand__name">🚀 BIR Parts</span>
        </Link>

        {/* Desktop Links */}
        <div className="nav__links" style={{ display: loading ? "none" : "flex" }}>
          {user ? (
            <>
              <Link
                href="/generator"
                className={`nav__link ${pathname === "/generator" ? "nav__link--active" : ""}`}
              >
                🔍 Generator
              </Link>

              <Link
                href="/saved-global"
                className={`nav__link ${pathname === "/saved-global" ? "nav__link--active" : ""}`}
              >
                🌐 Global Parts
              </Link>

              {/* User Dropdown Menu */}
              <div 
                className="nav__user-menu"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="nav__user-button"
                >
                  <div className="nav__avatar">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      user.name?.charAt(0).toUpperCase() || "U"
                    )}
                  </div>
                  <span className="nav__user-name">{user.name}</span>
                  <span className={`nav__dropdown-icon ${dropdownOpen ? "open" : ""}`}>
                    ▼
                  </span>
                </button>

                {/* Tooltip */}
                {showTooltip && !dropdownOpen && (
                  <div className="nav__tooltip">
                    {user.name}
                  </div>
                )}

                {dropdownOpen && (
                  <div className="nav__dropdown">
                    <Link
                      href="/profile"
                      className="nav__dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      👤 Profile
                    </Link>

                    {/* Admin/Owner Menu */}
                    {(user.role === "ADMIN" || user.role === "OWNER") && (
                      <>
                        <div className="nav__dropdown-divider" />
                        <Link
                          href="/dashboard"
                          className="nav__dropdown-item"
                          onClick={() => setDropdownOpen(false)}
                        >
                          📊 Dashboard
                        </Link>
                        <Link
                          href="/admin"
                          className="nav__dropdown-item"
                          onClick={() => setDropdownOpen(false)}
                        >
                          {user.role === "OWNER" ? "👑" : "🔧"} Admin
                        </Link>
                      </>
                    )}

                    <div className="nav__dropdown-divider" />
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="nav__dropdown-item nav__dropdown-item--logout"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="nav__link nav__link--primary"
              >
                🔐 Login
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {dropdownOpen && (
        <div
          onClick={() => setDropdownOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999,
          }}
        />
      )}
    </nav>
  );
}
