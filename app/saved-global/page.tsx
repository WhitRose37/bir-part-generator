"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Part = {
  id: string;
  partNumber: string;
  productName?: string;
  commonNameEn?: string;
  commonNameTh?: string;
  uom?: string;
  characteristicsOfMaterialEn?: string;
  characteristicsOfMaterialTh?: string;
  estimatedCapacityMachineYear?: string;
  quantityToUse?: string;
  functionEn?: string;
  functionTh?: string;
  whereUsedEn?: string;
  whereUsedTh?: string;
  longEn?: string;
  longTh?: string;
  eccn?: string;
  hts?: string;
  coo?: string;
  tagsJson?: string[] | null;
  imagesJson?: string[] | null;
  sourcesJson?: any[] | null;
  createdById?: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
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

export default function SavedGlobalPage() {
  const router = useRouter();
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchParts();
    }
  }, [mounted, page, search]);

  async function fetchParts() {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/saved-global?page=${page}&limit=12&search=${encodeURIComponent(search)}`,
        { cache: "no-store", credentials: "include" }
      );

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setParts(data.parts || []);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (e) {
      showToast("❌ Failed to load parts", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(partId: string) {
    if (!confirm("Are you sure you want to delete this part?")) return;

    setDeleting(partId);
    try {
      const res = await fetch(`/api/saved-global?id=${partId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setParts(parts.filter((p) => p.id !== partId));
        showToast("✅ Part deleted");
      } else {
        showToast("❌ Failed to delete part", "error");
      }
    } catch (e) {
      showToast("❌ Error deleting part", "error");
    } finally {
      setDeleting(null);
    }
  }

  function openDetail(part: Part) {
    setSelectedPart(part);
    setImageIndex(0);
  }

  function closeDetail() {
    setSelectedPart(null);
    setImageIndex(0);
  }

  const images = selectedPart?.imagesJson || [];
  const currentImage = images[imageIndex];

  if (!mounted || loading) {
    return (
      <div className="container">
        <div className="card glass">
          <p style={{ color: "#9b59b6" }}>⏳ Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: 20, marginBottom: 40 }}>
      {/* Header */}
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: 28, marginBottom: 5 }}>🌐 Saved Parts (Global)</h1>
        <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: 13 }}>
          Browse and manage saved parts database
        </p>
      </div>

      {/* Search */}
      <div className="card glass" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="text"
            placeholder="🔎 Search by part number, name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
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
            onClick={fetchParts}
            className="btn btn--primary"
            style={{ padding: "12px 20px" }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Parts Grid */}
      {parts.length === 0 ? (
        <div className="card glass" style={{ textAlign: "center", padding: 40 }}>
          <p style={{ fontSize: 48, margin: "0 0 15px 0" }}>📭</p>
          <p style={{ color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>
            No parts found
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 20,
          }}
        >
          {parts.map((part) => {
            const images = part.imagesJson || [];
            const firstImage = images[0];

            return (
              <div
                key={part.id}
                className="card glass"
                style={{
                  padding: 0,
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform =
                    "translateY(-4px)";
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 10px 30px rgba(155, 89, 182, 0.3)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform =
                    "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                {/* Image Thumbnail */}
                <div
                  onClick={() => openDetail(part)}
                  style={{
                    width: "100%",
                    height: 200,
                    background: firstImage
                      ? `url(${firstImage}) center/cover`
                      : "linear-gradient(135deg, rgba(155, 89, 182, 0.2), rgba(52, 152, 219, 0.1))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  {!firstImage && (
                    <span style={{ fontSize: 48, opacity: 0.3 }}>📦</span>
                  )}
                  {images.length > 1 && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 10,
                        right: 10,
                        background: "rgba(0, 0, 0, 0.7)",
                        padding: "4px 8px",
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      📸 {images.length}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div style={{ padding: 20 }}>
                  <h3
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      margin: "0 0 8px 0",
                      color: "#9b59b6",
                    }}
                  >
                    {part.partNumber}
                  </h3>
                  <p
                    style={{
                      fontSize: 12,
                      margin: "0 0 12px 0",
                      color: "rgba(255, 255, 255, 0.8)",
                      minHeight: 36,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {part.commonNameEn || part.productName || "—"}
                  </p>

                  {/* Tags */}
                  {part.tagsJson && part.tagsJson.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                      {part.tagsJson.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          style={{
                            background: "rgba(155, 89, 182, 0.2)",
                            padding: "3px 8px",
                            borderRadius: 4,
                            fontSize: 10,
                            fontWeight: 600,
                            color: "#9b59b6",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => openDetail(part)}
                      className="btn btn--primary"
                      style={{
                        flex: 1,
                        padding: "8px",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      👁️ View
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(part.id);
                      }}
                      disabled={deleting === part.id}
                      className="btn btn--ghost"
                      style={{
                        padding: "8px 12px",
                        fontSize: 11,
                        color: "#e74c3c",
                      }}
                    >
                      {deleting === part.id ? "⏳" : "🗑️"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 10,
            marginTop: 30,
          }}
        >
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn btn--ghost"
            style={{ padding: "10px 16px" }}
          >
            ← Previous
          </button>
          <span
            style={{
              padding: "10px 16px",
              background: "rgba(155, 89, 182, 0.1)",
              border: "1px solid rgba(155, 89, 182, 0.3)",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn btn--ghost"
            style={{ padding: "10px 16px" }}
          >
            Next →
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedPart && (
        <div
          onClick={closeDetail}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(8px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            animation: "fadeIn 0.2s ease",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card glass"
            style={{
              width: "min(900px, 100%)",
              maxHeight: "90vh",
              overflow: "auto",
              padding: 30,
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
                paddingBottom: 15,
                borderBottom: "1px solid rgba(155, 89, 182, 0.2)",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
                  {selectedPart.partNumber}
                </h2>
                <p
                  style={{
                    margin: "5px 0 0 0",
                    fontSize: 13,
                    color: "rgba(255, 255, 255, 0.6)",
                  }}
                >
                  {selectedPart.commonNameEn || selectedPart.productName}
                </p>
              </div>
              <button
                onClick={closeDetail}
                style={{
                  background: "none",
                  border: "none",
                  color: "white",
                  fontSize: 24,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                ✕
              </button>
            </div>

            {/* Image Gallery */}
            {images.length > 0 && (
              <div style={{ marginBottom: 30 }}>
                <div
                  style={{
                    width: "100%",
                    height: 400,
                    background: "rgba(0, 0, 0, 0.3)",
                    borderRadius: 8,
                    overflow: "hidden",
                    marginBottom: 15,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {currentImage ? (
                    <img
                      src={currentImage}
                      alt={`Image ${imageIndex + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <p style={{ color: "rgba(255, 255, 255, 0.5)" }}>
                      No image
                    </p>
                  )}
                </div>

                {/* Image Navigation */}
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <button
                    onClick={() => setImageIndex(Math.max(0, imageIndex - 1))}
                    disabled={imageIndex === 0}
                    style={{
                      padding: "8px 12px",
                      background:
                        imageIndex === 0 ? "#444" : "rgba(155, 89, 182, 0.8)",
                      color: "white",
                      border: "none",
                      borderRadius: 4,
                      cursor: imageIndex === 0 ? "not-allowed" : "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    ← Previous
                  </button>

                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      justifyContent: "center",
                      flex: 1,
                    }}
                  >
                    {images.map((_: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => setImageIndex(i)}
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background:
                            i === imageIndex
                              ? "#9b59b6"
                              : "rgba(155, 89, 182, 0.3)",
                          border: "none",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() =>
                      setImageIndex(Math.min(images.length - 1, imageIndex + 1))
                    }
                    disabled={imageIndex === images.length - 1}
                    style={{
                      padding: "8px 12px",
                      background:
                        imageIndex === images.length - 1
                          ? "#444"
                          : "rgba(155, 89, 182, 0.8)",
                      color: "white",
                      border: "none",
                      borderRadius: 4,
                      cursor:
                        imageIndex === images.length - 1
                          ? "not-allowed"
                          : "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {/* Content Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 15,
                marginBottom: 20,
              }}
            >
              <DataField label="Product Name" value={selectedPart.productName} />
              <DataField label="UOM" value={selectedPart.uom} />
              <DataField
                label="Common Name (EN)"
                value={selectedPart.commonNameEn}
              />
              <DataField
                label="Common Name (TH)"
                value={selectedPart.commonNameTh}
              />
            </div>

            {/* Full Width Fields */}
            <DataField
              label="Characteristics (EN)"
              value={selectedPart.characteristicsOfMaterialEn}
              fullWidth
            />
            <DataField
              label="Characteristics (TH)"
              value={selectedPart.characteristicsOfMaterialTh}
              fullWidth
            />
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15, marginBottom: 20 }}>
              <DataField label="Function (EN)" value={selectedPart.functionEn} />
              <DataField label="Function (TH)" value={selectedPart.functionTh} />
              <DataField label="Where Used (EN)" value={selectedPart.whereUsedEn} />
              <DataField label="Where Used (TH)" value={selectedPart.whereUsedTh} />
            </div>

            <DataField
              label="Long Description (EN)"
              value={selectedPart.longEn}
              fullWidth
            />
            <DataField
              label="Long Description (TH)"
              value={selectedPart.longTh}
              fullWidth
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15, marginBottom: 20 }}>
              <DataField label="Estimated Capacity" value={selectedPart.estimatedCapacityMachineYear} />
              <DataField label="Quantity to Use" value={selectedPart.quantityToUse} />
            </div>

            {/* Trade Info */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 15,
                marginBottom: 20,
              }}
            >
              <DataField label="ECCN" value={selectedPart.eccn} />
              <DataField label="HTS" value={selectedPart.hts} />
              <DataField label="COO" value={selectedPart.coo} />
            </div>

            {/* Tags */}
            {selectedPart.tagsJson && selectedPart.tagsJson.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <p
                  style={{
                    fontSize: 11,
                    color: "rgba(255, 255, 255, 0.5)",
                    margin: "0 0 8px 0",
                    fontWeight: 600,
                  }}
                >
                  TAGS
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {selectedPart.tagsJson.map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        background: "rgba(155, 89, 182, 0.2)",
                        padding: "6px 12px",
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#9b59b6",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div
              style={{
                paddingTop: 15,
                borderTop: "1px solid rgba(155, 89, 182, 0.2)",
                fontSize: 11,
                color: "rgba(255, 255, 255, 0.5)",
              }}
            >
              <p style={{ margin: "0 0 5px 0" }}>
                Created by: {selectedPart.createdByName || "Unknown"}
              </p>
              <p style={{ margin: 0 }}>
                Created: {new Date(selectedPart.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DataField({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value: any;
  fullWidth?: boolean;
}) {
  return (
    <div
      style={{
        padding: 12,
        background: "rgba(155, 89, 182, 0.05)",
        borderRadius: 6,
        marginBottom: fullWidth ? 15 : 0,
        gridColumn: fullWidth ? "1 / -1" : "auto",
      }}
    >
      <p
        style={{
          fontSize: 11,
          color: "rgba(255, 255, 255, 0.5)",
          margin: 0,
          fontWeight: 600,
          textTransform: "uppercase",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: 13,
          fontWeight: 600,
          margin: "8px 0 0 0",
          color: value ? "#fff" : "#aaa",
          wordBreak: "break-word",
          whiteSpace: "pre-wrap",
        }}
      >
        {value || "—"}
      </p>
    </div>
  );
}
