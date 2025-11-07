"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Source = { name: string; url?: string };
type Row = {
  id: string;
  partNumber: string;
  productName?: string | null;
  commonNameEn?: string | null;
  commonNameTh?: string | null;
  uom?: string | null;
  // ✅ เพิ่มฟิลด์เหล่านี้
  characteristicsOfMaterialEn?: string | null;
  characteristicsOfMaterialTh?: string | null;
  functionEn?: string | null;
  functionTh?: string | null;
  whereUsedEn?: string | null;
  whereUsedTh?: string | null;
  // ...existing fields...
  eccn?: string | null;
  hts?: string | null;
  coo?: string | null;
  tagsJson?: string[] | null;
  imagesJson?: string[] | null;
  sourcesJson?: Source[] | null;
  data?: any | null;
  createdByName?: string | null;
  updatedAt: string;
};

type Norm = {
  id: string;
  partNumber: string;
  productName: string;
  commonNameEn: string;
  commonNameTh: string;
  uom: string;
  // ✅ เพิ่มฟิลด์เหล่านี้
  characteristicsOfMaterialEn: string;
  characteristicsOfMaterialTh: string;
  functionEn: string;
  functionTh: string;
  whereUsedEn: string;
  whereUsedTh: string;
  eccn: string;
  hts: string;
  coo: string;
  tags: string[];
  images: string[];
  sources: Source[];
  createdByName: string;
  updatedAt: string;
};

// ---- รวมฟิลด์จาก schema ใหม่ + ข้อมูลเก่าที่อยู่ใน data ----
function normalizeRow(r: Row): Norm {
  const d = r.data || {};
  return {
    id: r.id,
    partNumber: r.partNumber?.trim() || "",
    productName: r.productName ?? d.product_name ?? "",
    commonNameEn: r.commonNameEn ?? d.common_name_en ?? "",
    commonNameTh: r.commonNameTh ?? d.common_name_th ?? "",
    uom: r.uom ?? d.uom ?? "",
    characteristicsOfMaterialEn: r.characteristicsOfMaterialEn ?? d.characteristics_of_material_en ?? "",
    characteristicsOfMaterialTh: r.characteristicsOfMaterialTh ?? d.characteristics_of_material_th ?? "",
    functionEn: r.functionEn ?? d.function_en ?? "",
    functionTh: r.functionTh ?? d.function_th ?? "",
    whereUsedEn: r.whereUsedEn ?? d.where_used_en ?? "",
    whereUsedTh: r.whereUsedTh ?? d.where_used_th ?? "",
    eccn: r.eccn ?? d.eccn ?? "",
    hts: r.hts ?? d.hts ?? "",
    coo: r.coo ?? d.coo ?? "",
    tags: (r.tagsJson as any) ?? d.tags ?? [],
    images: (r.imagesJson as any) ?? d.images ?? [],
    sources: (r.sourcesJson as any) ?? d.sources ?? [],
    createdByName: r.createdByName || "",
    updatedAt: r.updatedAt,
  };
}

async function safeJson(res: Response) {
  const ct = res.headers.get("content-type") || "";
  const text = await res.text();
  if (!text) return null;
  if (!ct.includes("application/json")) {
    throw new Error(`Expected JSON, got ${ct || "no content-type"}: ${text.slice(0, 200)}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON: ${text.slice(0, 200)}`);
  }
}

export default function SavedGlobalPage() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Norm[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [view, setView] = useState<Norm | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<Partial<Norm>>({});
  const [saving, setSaving] = useState(false);

  function toast(msg: string, type: "success" | "error" = "success") {
    const t = document.createElement("div");
    t.className = `toast toast--${type}`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => {
      t.classList.add("toast--hide");
      setTimeout(() => t.remove(), 400);
    }, 1200);
  }

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/saved-global?q=${encodeURIComponent(q)}&take=50`, { cache: "no-store" });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || res.statusText);
      const items = Array.isArray(j?.items) ? j.items : Array.isArray(j?.parts) ? j.parts : [];
      setRows(items.map(normalizeRow));
    } catch (e: any) {
      setErr(e?.message || "Load failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // ESC ปิด modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setEditMode(false); setView(null); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // เปิดดู + เตรียม draft แก้ไข
  function openView(n: Norm) {
    setView(n);
    setEditMode(false);
    setDraft({
      productName: n.productName,
      commonNameEn: n.commonNameEn,
      commonNameTh: n.commonNameTh,
      uom: n.uom,
      // ✅ เพิ่มฟิลด์
      characteristicsOfMaterialEn: n.characteristicsOfMaterialEn,
      characteristicsOfMaterialTh: n.characteristicsOfMaterialTh,
      functionEn: n.functionEn,
      functionTh: n.functionTh,
      whereUsedEn: n.whereUsedEn,
      whereUsedTh: n.whereUsedTh,
      eccn: n.eccn,
      hts: n.hts,
      coo: n.coo,
    });
  }

  async function doPatch() {
    if (!view) return;
    setSaving(true);
    try {
      const res = await fetch("/api/saved-global", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: view.id,
          partNumber: view.partNumber,
          productName: draft.productName ?? "",
          commonNameEn: draft.commonNameEn ?? "",
          commonNameTh: draft.commonNameTh ?? "",
          uom: draft.uom ?? "",
          eccn: draft.eccn ?? "",
          hts: draft.hts ?? "",
          coo: draft.coo ?? "",
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || res.statusText);
      toast("✅ Updated");
      setEditMode(false);
      setView(null);
      load();
    } catch (e: any) {
      toast(`❌ Update failed: ${e?.message || e}`, "error");
    } finally {
      setSaving(false);
    }
  }

  async function doDelete() {
    if (!view) return;
    const ok = confirm(`Delete part "${view.partNumber}" ? This cannot be undone.`);
    if (!ok) return;
    try {
      const res = await fetch(`/api/saved-global?id=${encodeURIComponent(view.id)}`, {
        method: "DELETE",
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || res.statusText);
      toast("🗑 Deleted");
      setView(null);
      load();
    } catch (e: any) {
      toast(`❌ Delete failed: ${e?.message || e}`, "error");
    }
  }

  return (
    <div className="container" style={{ marginTop: 20, marginBottom: 40 }}>
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: 28, marginBottom: 5 }}>🌐 Saved Parts (Global)</h1>
        <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: 13 }}>
          View and manage all saved parts from community
        </p>
      </div>

      {/* Search */}
      <div className="card glass" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            className="search-input"
            value={q}
            placeholder="Search by Part / Name / Tag"
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            style={{
              flex: 1,
              padding: "12px",
              background: "rgba(0, 0, 0, 0.2)",
              border: "1px solid rgba(155, 89, 182, 0.3)",
              borderRadius: 6,
              color: "white",
              fontSize: 13,
            }}
          />
          <button
            className="btn btn--primary"
            onClick={load}
            disabled={loading}
            style={{
              padding: "12px 24px",
              background: loading ? "#666" : "#9b59b6",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            {loading ? "⏳ Loading..." : "🔎 Search"}
          </button>
          <Link
            href="/generator"
            style={{
              padding: "12px 24px",
              background: "#3498db",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            ＋ New Search
          </Link>
        </div>
      </div>

      {/* Error */}
      {err && (
        <div className="card glass" style={{ marginBottom: 20, borderLeft: "4px solid #e74c3c", paddingLeft: 15 }}>
          <p style={{ color: "#e74c3c", margin: 0 }}>❌ {err}</p>
        </div>
      )}

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 15, marginBottom: 20 }}>
        {rows.map((n) => (
          <div
            key={n.id}
            className="card glass"
            style={{
              padding: 15,
              cursor: "pointer",
              transition: "all 0.3s ease",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(30, 30, 30, 0.95)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(30, 30, 30, 0.8)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
            onClick={() => openView(n)}
          >
            {/* Main Info */}
            <div>
              <h4 style={{ margin: "0 0 4px 0", fontSize: 14, fontWeight: 700 }}>
                {n.productName || n.commonNameEn || n.partNumber}
              </h4>
              <p style={{ margin: 0, fontSize: 12, color: "rgba(255, 255, 255, 0.6)" }}>
                {n.partNumber}
              </p>
            </div>

            {/* Meta */}
            <div style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.5)", display: "flex", flexDirection: "column", gap: 4 }}>
              <div>👤 {n.createdByName || "Unknown"}</div>
              <div>📅 {new Date(n.updatedAt).toLocaleDateString()}</div>
            </div>

            {/* Tags */}
            {n.tags?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {n.tags.slice(0, 3).map((tag, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: 10,
                      background: "rgba(155, 89, 182, 0.2)",
                      padding: "2px 8px",
                      borderRadius: 12,
                      color: "rgba(255, 255, 255, 0.7)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* View Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                openView(n);
              }}
              style={{
                marginTop: "auto",
                padding: "8px",
                background: "rgba(155, 89, 182, 0.2)",
                border: "1px solid rgba(155, 89, 182, 0.3)",
                borderRadius: 6,
                color: "white",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              👁️ View Details
            </button>
          </div>
        ))}
      </div>

      {rows.length === 0 && !loading && !err && (
        <div className="card glass" style={{ textAlign: "center", padding: 40 }}>
          <p style={{ fontSize: 14, color: "rgba(255, 255, 255, 0.6)" }}>
            No parts found yet — go to <Link href="/generator" style={{ color: "#9b59b6" }}>Generator</Link> and save your first part!
          </p>
        </div>
      )}

      {/* Modal */}
      {view && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => { setEditMode(false); setView(null); }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.55)",
            backdropFilter: "blur(2px)",
            zIndex: 10000,
            display: "grid",
            placeItems: "center",
            padding: 16,
          }}
        >
          <div
            className="card glass"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(800px, 96vw)",
              maxHeight: "85vh",
              overflow: "auto",
              display: "grid",
              gap: 20,
              padding: 30,
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 15 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
                  {view.productName || view.commonNameEn || view.partNumber}
                </h2>
                <p style={{ margin: "8px 0 0 0", fontSize: 12, color: "rgba(255, 255, 255, 0.6)" }}>
                  Part: <b>{view.partNumber}</b>
                </p>
                <p style={{ margin: "4px 0 0 0", fontSize: 11, color: "rgba(255, 255, 255, 0.5)" }}>
                  👤 {view.createdByName || "Unknown"} • 📅 {new Date(view.updatedAt).toLocaleString()}
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {!editMode ? (
                  <>
                    <button
                      onClick={() => setEditMode(true)}
                      style={{
                        padding: "8px 16px",
                        background: "#3498db",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: 12,
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={doDelete}
                      style={{
                        padding: "8px 16px",
                        background: "#e74c3c",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: 12,
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={doPatch}
                      disabled={saving}
                      style={{
                        padding: "8px 16px",
                        background: saving ? "#666" : "#2ecc71",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        cursor: saving ? "not-allowed" : "pointer",
                        fontWeight: 600,
                        fontSize: 12,
                      }}
                    >
                      {saving ? "⏳ Saving..." : "💾 Save"}
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      style={{
                        padding: "8px 16px",
                        background: "#666",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: 12,
                      }}
                    >
                      ✕ Cancel
                    </button>
                  </>
                )}
                <button
                  onClick={() => { setEditMode(false); setView(null); }}
                  style={{
                    padding: "8px 16px",
                    background: "rgba(155, 89, 182, 0.2)",
                    color: "white",
                    border: "1px solid rgba(155, 89, 182, 0.3)",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 12,
                  }}
                >
                  Close
                </button>
              </div>
            </div>

            {/* Content */}
            {!editMode ? (
              <>
                {/* Display Mode */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
                  <div>
                    <label style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.5)", fontWeight: 600 }}>
                      Common Name (EN)
                    </label>
                    <p style={{ margin: "6px 0 0 0", fontSize: 13, fontWeight: 500 }}>
                      {view.commonNameEn || "—"}
                    </p>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.5)", fontWeight: 600 }}>
                      Common Name (TH)
                    </label>
                    <p style={{ margin: "6px 0 0 0", fontSize: 13, fontWeight: 500 }}>
                      {view.commonNameTh || "—"}
                    </p>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.5)", fontWeight: 600 }}>
                      UOM
                    </label>
                    <p style={{ margin: "6px 0 0 0", fontSize: 13, fontWeight: 500 }}>
                      {view.uom || "—"}
                    </p>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.5)", fontWeight: 600 }}>
                      ECCN / HTS / COO
                    </label>
                    <p style={{ margin: "6px 0 0 0", fontSize: 13, fontWeight: 500 }}>
                      {view.eccn || "—"} / {view.hts || "—"} / {view.coo || "—"}
                    </p>
                  </div>
                </div>

                {/* Images */}
                {view.images?.length > 0 && (
                  <div>
                    <label style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.5)", fontWeight: 600 }}>
                      📸 Images ({view.images.length})
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10, marginTop: 10 }}>
                      {view.images.map((img, i) => (
                        <a
                          key={i}
                          href={img}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: "block",
                            width: "100%",
                            height: 100,
                            background: "rgba(0, 0, 0, 0.3)",
                            borderRadius: 6,
                            overflow: "hidden",
                            border: "1px solid rgba(155, 89, 182, 0.2)",
                          }}
                        >
                          <img
                            src={img}
                            alt={`img-${i}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Edit Mode */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
                  <div>
                    <label style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.5)", fontWeight: 600 }}>
                      Common Name (EN)
                    </label>
                    <input
                      type="text"
                      value={draft.commonNameEn || ""}
                      onChange={(e) => setDraft({ ...draft, commonNameEn: e.target.value })}
                      style={{
                        marginTop: 6,
                        width: "100%",
                        padding: "8px",
                        background: "rgba(0, 0, 0, 0.2)",
                        border: "1px solid rgba(155, 89, 182, 0.3)",
                        borderRadius: 6,
                        color: "white",
                        fontSize: 12,
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.5)", fontWeight: 600 }}>
                      Common Name (TH)
                    </label>
                    <input
                      type="text"
                      value={draft.commonNameTh || ""}
                      onChange={(e) => setDraft({ ...draft, commonNameTh: e.target.value })}
                      style={{
                        marginTop: 6,
                        width: "100%",
                        padding: "8px",
                        background: "rgba(0, 0, 0, 0.2)",
                        border: "1px solid rgba(155, 89, 182, 0.3)",
                        borderRadius: 6,
                        color: "white",
                        fontSize: 12,
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.5)", fontWeight: 600 }}>
                      UOM
                    </label>
                    <input
                      type="text"
                      value={draft.uom || ""}
                      onChange={(e) => setDraft({ ...draft, uom: e.target.value })}
                      style={{
                        marginTop: 6,
                        width: "100%",
                        padding: "8px",
                        background: "rgba(0, 0, 0, 0.2)",
                        border: "1px solid rgba(155, 89, 182, 0.3)",
                        borderRadius: 6,
                        color: "white",
                        fontSize: 12,
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.5)", fontWeight: 600 }}>
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={draft.productName || ""}
                      onChange={(e) => setDraft({ ...draft, productName: e.target.value })}
                      style={{
                        marginTop: 6,
                        width: "100%",
                        padding: "8px",
                        background: "rgba(0, 0, 0, 0.2)",
                        border: "1px solid rgba(155, 89, 182, 0.3)",
                        borderRadius: 6,
                        color: "white",
                        fontSize: 12,
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 15 }}>
                  <div>
                    <label style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.5)", fontWeight: 600 }}>
                      ECCN
                    </label>
                    <input
                      type="text"
                      value={draft.eccn || ""}
                      onChange={(e) => setDraft({ ...draft, eccn: e.target.value })}
                      style={{
                        marginTop: 6,
                        width: "100%",
                        padding: "8px",
                        background: "rgba(0, 0, 0, 0.2)",
                        border: "1px solid rgba(155, 89, 182, 0.3)",
                        borderRadius: 6,
                        color: "white",
                        fontSize: 12,
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.5)", fontWeight: 600 }}>
                      HTS
                    </label>
                    <input
                      type="text"
                      value={draft.hts || ""}
                      onChange={(e) => setDraft({ ...draft, hts: e.target.value })}
                      style={{
                        marginTop: 6,
                        width: "100%",
                        padding: "8px",
                        background: "rgba(0, 0, 0, 0.2)",
                        border: "1px solid rgba(155, 89, 182, 0.3)",
                        borderRadius: 6,
                        color: "white",
                        fontSize: 12,
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.5)", fontWeight: 600 }}>
                      COO
                    </label>
                    <input
                      type="text"
                      value={draft.coo || ""}
                      onChange={(e) => setDraft({ ...draft, coo: e.target.value })}
                      style={{
                        marginTop: 6,
                        width: "100%",
                        padding: "8px",
                        background: "rgba(0, 0, 0, 0.2)",
                        border: "1px solid rgba(155, 89, 182, 0.3)",
                        borderRadius: 6,
                        color: "white",
                        fontSize: 12,
                      }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
