"use client";

import { useState } from "react";
import Link from "next/link";

export default function GeneratorPage() {
  const [partNumber, setPartNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showDetailedModal, setShowDetailedModal] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [detailedAnalysis, setDetailedAnalysis] = useState<string | null>(null);
  // ✅ เพิ่มสถานะสำหรับ copy notification
  const [copiedField, setCopiedField] = useState<string | null>(null);
  // เพิ่ม state
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();

    if (!partNumber.trim()) {
      setError("❌ Please enter a part number");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setImageIndex(0);

    try {
      console.log(`[generator] 🔍 Generating for: ${partNumber}`);

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          part_number: partNumber.trim(),
          withImage: true,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      console.log(`[generator] ✅ Complete - Images: ${data.images?.length || 0}`);
      console.log(`[generator] 📊 Data:`, data);

      setResult(data);
    } catch (e: any) {
      console.error(`[generator] ❌ Error:`, e);
      setError(`❌ ${e?.message || "Generation failed"}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!result) return;
    
    setSaving(true);
    try {
      const res = await fetch("/api/saved-global", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...result }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || "Save failed");
      }

      showToast("✅ Part saved successfully!");
    } catch (e: any) {
      console.error("[handleSave] Error:", e);
      showToast(`❌ ${e?.message || "Save failed"}`, "error");
    } finally {
      setSaving(false);
    }
  }

  // ✅ เพิ่มฟังก์ชันวิเคราะห์ละเอียด
  async function handleDetailedAnalysis() {
    if (!result) return;
    
    setAnalyzing(true);
    setDetailedAnalysis(null);
    try {
      console.log("[detailed] 🔍 Requesting detailed analysis...");
      
      const res = await fetch("/api/generate-detailed-spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || "Analysis failed");
      }

      const data = await res.json();
      console.log("[detailed] ✅ Analysis complete");
      
      setDetailedAnalysis(data.analysis);
      setShowDetailedModal(true);
    } catch (e: any) {
      console.error("[detailed] ❌ Error:", e);
      showToast(`❌ ${e?.message || "Analysis failed"}`, "error");
    } finally {
      setAnalyzing(false);
    }
  }

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

  const images = result?.images || [];
  const currentImage = images[imageIndex];

  const displayValue = (value: any): string => {
    if (value === null || value === undefined || value === "") {
      return "—";
    }
    const str = String(value).trim();
    return str === "" ? "—" : str;
  };

  const hasValue = (value: any): boolean => {
    return value && String(value).trim() !== "";
  };

  // ✅ เพิ่มฟังก์ชัน copy to clipboard
  async function copyToClipboard(text: string, fieldName: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      showToast(`✅ Copied: ${fieldName}`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (e) {
      showToast("❌ Failed to copy", "error");
    }
  }

  // ✅ Component helper: DataField with copy button
  const DataField = ({ label, value, fieldName }: { label: string; value: any; fieldName: string }) => (
    <div style={{ padding: 12, background: "rgba(155, 89, 182, 0.05)", borderRadius: 6, position: "relative" }}>
      <p style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.5)", margin: 0, fontWeight: 600 }}>
        {label}
      </p>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 8 }}>
        <p style={{ 
          fontSize: 13, 
          fontWeight: 600, 
          margin: 0, 
          color: hasValue(value) ? "#fff" : "#aaa",
          flex: 1,
          wordBreak: "break-word",
        }}>
          {displayValue(value)}
        </p>
        {hasValue(value) && (
          <button
            onClick={() => copyToClipboard(String(value), label)}
            title="Copy to clipboard"
            style={{
              background: copiedField === label ? "#2ecc71" : "rgba(155, 89, 182, 0.2)",
              border: "1px solid rgba(155, 89, 182, 0.3)",
              borderRadius: 4,
              color: "white",
              padding: "6px 8px",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              transition: "all 0.2s ease",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              if (copiedField !== label) {
                (e.currentTarget as HTMLElement).style.background = "rgba(155, 89, 182, 0.3)";
              }
            }}
            onMouseLeave={(e) => {
              if (copiedField !== label) {
                (e.currentTarget as HTMLElement).style.background = "rgba(155, 89, 182, 0.2)";
              }
            }}
          >
            {copiedField === label ? "✅ Copied" : "📋 Copy"}
          </button>
        )}
      </div>
    </div>
  );

  function handleCopyForBookmarklet() {
    if (!result) {
      showToast("❌ No part data available", "error");
      return;
    }

    const data = {
      part_number: result.part_number || "",
      product_name: result.product_name || "",
      common_name_en: result.common_name_en || "",
      common_name_th: result.common_name_th || "",
      uom: result.uom || "",
      characteristics_of_material_en: result.characteristics_of_material_en || "",
      characteristics_of_material_th: result.characteristics_of_material_th || "",
      function_en: result.function_en || "",
      function_th: result.function_th || "",
      where_used_en: result.where_used_en || "",
      where_used_th: result.where_used_th || "",
      eccn: result.eccn || "",
      hts: result.hts || "",
      coo: result.coo || "",
    };

    localStorage.setItem("BIR_AUTO_FILL_DATA", JSON.stringify(data));
    
    setCopyStatus('copied');
    showToast("✅ Ready for Bookmarklet! Go to another website and click the BIR Auto-Fill bookmark");
    
    setTimeout(() => setCopyStatus('idle'), 3000);
  }

  return (
    <div className="container" style={{ marginTop: 20, marginBottom: 40 }}>
      {/* Header */}
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: 28, marginBottom: 5 }}>🔍 Generate Part Summary</h1>
        <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: 13 }}>
          Search and generate detailed specifications for industrial parts
        </p>
      </div>

      {/* Form */}
      <div className="card glass" style={{ marginBottom: 30 }}>
        <form onSubmit={handleGenerate}>
          <div style={{ display: "flex", gap: 12 }}>
            <input
              type="text"
              value={partNumber}
              onChange={(e) => setPartNumber(e.target.value)}
              placeholder="e.g., NSK 6000ZZ, SMC ZP2-25TN, FESTO MS4-LFR-1/4-D6"
              disabled={loading}
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
              type="submit"
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
              {loading ? "⏳ Generating..." : "🚀 Generate"}
            </button>
          </div>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="card glass" style={{ marginBottom: 20, borderLeft: "4px solid #e74c3c", paddingLeft: 15 }}>
          <p style={{ color: "#e74c3c", margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="card glass">
          {/* Save & Analysis Buttons */}
          <div style={{ display: "flex", gap: 10, marginBottom: 20, justifyContent: "flex-end", flexWrap: "wrap" }}>
            {/* ✅ เพิ่มปุ่ม Detailed Analysis */}
            <button
              onClick={handleDetailedAnalysis}
              disabled={analyzing}
              style={{
                padding: "10px 20px",
                background: analyzing ? "#666" : "#f39c12",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: analyzing ? "not-allowed" : "pointer",
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              {analyzing ? "⏳ Analyzing..." : "📖 View Detailed Info"}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: "10px 20px",
                background: saving ? "#666" : "#2ecc71",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: saving ? "not-allowed" : "pointer",
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              {saving ? "⏳ Saving..." : "💾 Save to Global"}
            </button>
            <Link
              href="/saved-global"
              style={{
                padding: "10px 20px",
                background: "#3498db",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 13,
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              🌐 View Saved
            </Link>
            <button
              onClick={handleCopyForBookmarklet}
              disabled={copyStatus === 'copied'}
              style={{
                padding: "10px 20px",
                background: copyStatus === 'copied' ? "#27ae60" : "#16a085",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: copyStatus === 'copied' ? "not-allowed" : "pointer",
                fontWeight: 600,
                fontSize: 13,
                transition: "all 0.3s ease",
              }}
            >
              {copyStatus === 'copied' ? "✅ Ready!" : "📋 Bookmarklet Mode"}
            </button>
          </div>

          {/* Images Section */}
          <div style={{ marginBottom: 30 }}>
            <h3 style={{ fontSize: 14, marginBottom: 15 }}>🖼️ Product Images ({images.length})</h3>

            {images.length > 0 ? (
              <>
                {/* Main Image Display */}
                <div
                  style={{
                    width: "100%",
                    height: 360,
                    background: "rgba(0, 0, 0, 0.3)",
                    borderRadius: 8,
                    overflow: "hidden",
                    marginBottom: 15,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid rgba(155, 89, 182, 0.2)",
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
                        (e.target as HTMLImageElement).src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='360' height='360'%3E%3Crect fill='%23333' width='360' height='360'/%3E%3Ctext x='50%25' y='50%25' fill='%23999' text-anchor='middle' dy='.3em' font-size='14'%3EImage Error%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  ) : (
                    <p style={{ color: "rgba(255, 255, 255, 0.5)" }}>Loading...</p>
                  )}
                </div>

                {/* Image Navigation */}
                <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between" }}>
                  <button
                    onClick={() => setImageIndex(Math.max(0, imageIndex - 1))}
                    disabled={imageIndex === 0}
                    style={{
                      padding: "8px 12px",
                      background: imageIndex === 0 ? "#444" : "#9b59b6",
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

                  <div style={{ display: "flex", gap: 8, justifyContent: "center", flex: 1 }}>
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setImageIndex(i)}
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: i === imageIndex ? "#9b59b6" : "rgba(155, 89, 182, 0.3)",
                          border: "none",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => setImageIndex(Math.min(images.length - 1, imageIndex + 1))}
                    disabled={imageIndex === images.length - 1}
                    style={{
                      padding: "8px 12px",
                      background: imageIndex === images.length - 1 ? "#444" : "#9b59b6",
                      color: "white",
                      border: "none",
                      borderRadius: 4,
                      cursor: imageIndex === images.length - 1 ? "not-allowed" : "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    Next →
                  </button>
                </div>
              </>
            ) : (
              <p style={{ color: "rgba(255, 255, 255, 0.5)", textAlign: "center", padding: 20, margin: 0 }}>
                ℹ️ No images available
              </p>
            )}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "rgba(155, 89, 182, 0.2)", margin: "30px 0" }} />

          {/* Data Section */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>📋 Part Information</h3>

            {/* Part Number & Product Name */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15, marginBottom: 20 }}>
              <DataField 
                label="Part Number" 
                value={result.part_number} 
                fieldName="Part Number"
              />
              <DataField 
                label="Product Name" 
                value={result.product_name} 
                fieldName="Product Name"
              />
            </div>

            {/* Common Names & UOM */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15, marginBottom: 20 }}>
              <DataField 
                label="Common Name (EN)" 
                value={result.common_name_en} 
                fieldName="Common Name (EN)"
              />
              <DataField 
                label="Common Name (TH)" 
                value={result.common_name_th} 
                fieldName="Common Name (TH)"
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 15, marginBottom: 20 }}>
              <DataField 
                label="UOM" 
                value={result.uom} 
                fieldName="UOM"
              />
            </div>

            {/* Characteristics */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 12px 0" }}>
                🏭 Characteristics of Material
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ padding: 12, background: hasValue(result.characteristics_of_material_en) ? "rgba(52, 152, 219, 0.08)" : "rgba(100, 100, 100, 0.05)", borderRadius: 6, position: "relative" }}>
                  <p style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.5)", margin: 0, fontWeight: 600 }}>
                    English
                  </p>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 6 }}>
                    <p style={{ fontSize: 11, margin: 0, lineHeight: 1.5, color: hasValue(result.characteristics_of_material_en) ? "#fff" : "#aaa", flex: 1 }}>
                      {displayValue(result.characteristics_of_material_en)}
                    </p>
                    {hasValue(result.characteristics_of_material_en) && (
                      <button
                        onClick={() => copyToClipboard(String(result.characteristics_of_material_en), "Characteristics (EN)")}
                        title="Copy"
                        style={{
                          background: copiedField === "Characteristics (EN)" ? "#2ecc71" : "rgba(52, 152, 219, 0.2)",
                          border: "1px solid rgba(52, 152, 219, 0.3)",
                          borderRadius: 3,
                          color: "white",
                          padding: "4px 6px",
                          cursor: "pointer",
                          fontSize: 10,
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        {copiedField === "Characteristics (EN)" ? "✅" : "📋"}
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ padding: 12, background: hasValue(result.characteristics_of_material_th) ? "rgba(46, 204, 113, 0.08)" : "rgba(100, 100, 100, 0.05)", borderRadius: 6, position: "relative" }}>
                  <p style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.5)", margin: 0, fontWeight: 600 }}>
                    ภาษาไทย
                  </p>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 6 }}>
                    <p style={{ fontSize: 11, margin: 0, lineHeight: 1.5, color: hasValue(result.characteristics_of_material_th) ? "#fff" : "#aaa", flex: 1 }}>
                      {displayValue(result.characteristics_of_material_th)}
                    </p>
                    {hasValue(result.characteristics_of_material_th) && (
                      <button
                        onClick={() => copyToClipboard(String(result.characteristics_of_material_th), "Characteristics (TH)")}
                        title="Copy"
                        style={{
                          background: copiedField === "Characteristics (TH)" ? "#2ecc71" : "rgba(46, 204, 113, 0.2)",
                          border: "1px solid rgba(46, 204, 113, 0.3)",
                          borderRadius: 3,
                          color: "white",
                          padding: "4px 6px",
                          cursor: "pointer",
                          fontSize: 10,
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        {copiedField === "Characteristics (TH)" ? "✅" : "📋"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Function & Where Used */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 12px 0" }}>
                🔧 Function / Where Used (English)
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ padding: 12, background: hasValue(result.function_en) ? "rgba(0, 0, 0, 0.25)" : "rgba(100, 100, 100, 0.05)", borderRadius: 6, position: "relative" }}>
                  <p style={{ fontSize: 10, color: "rgba(255, 255, 255, 0.5)", margin: 0, fontWeight: 600 }}>
                    Function
                  </p>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 6 }}>
                    <p style={{ fontSize: 11, margin: 0, lineHeight: 1.5, color: hasValue(result.function_en) ? "#fff" : "#aaa", flex: 1 }}>
                      {displayValue(result.function_en)}
                    </p>
                    {hasValue(result.function_en) && (
                      <button
                        onClick={() => copyToClipboard(String(result.function_en), "Function (EN)")}
                        title="Copy"
                        style={{
                          background: copiedField === "Function (EN)" ? "#2ecc71" : "rgba(0, 0, 0, 0.3)",
                          border: "1px solid rgba(155, 89, 182, 0.2)",
                          borderRadius: 3,
                          color: "white",
                          padding: "4px 6px",
                          cursor: "pointer",
                          fontSize: 10,
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        {copiedField === "Function (EN)" ? "✅" : "📋"}
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ padding: 12, background: hasValue(result.where_used_en) ? "rgba(0, 0, 0, 0.25)" : "rgba(100, 100, 100, 0.05)", borderRadius: 6, position: "relative" }}>
                  <p style={{ fontSize: 10, color: "rgba(255, 255, 255, 0.5)", margin: 0, fontWeight: 600 }}>
                    Where Used
                  </p>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 6 }}>
                    <p style={{ fontSize: 11, margin: 0, lineHeight: 1.5, color: hasValue(result.where_used_en) ? "#fff" : "#aaa", flex: 1 }}>
                      {displayValue(result.where_used_en)}
                    </p>
                    {hasValue(result.where_used_en) && (
                      <button
                        onClick={() => copyToClipboard(String(result.where_used_en), "Where Used (EN)")}
                        title="Copy"
                        style={{
                          background: copiedField === "Where Used (EN)" ? "#2ecc71" : "rgba(0, 0, 0, 0.3)",
                          border: "1px solid rgba(155, 89, 182, 0.2)",
                          borderRadius: 3,
                          color: "white",
                          padding: "4px 6px",
                          cursor: "pointer",
                          fontSize: 10,
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        {copiedField === "Where Used (EN)" ? "✅" : "📋"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Thai Function & Where Used */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 12px 0" }}>
                🇹🇭 Function / Where Used (Thai)
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ padding: 12, background: hasValue(result.function_th) ? "rgba(0, 0, 0, 0.25)" : "rgba(100, 100, 100, 0.05)", borderRadius: 6, position: "relative" }}>
                  <p style={{ fontSize: 10, color: "rgba(255, 255, 255, 0.5)", margin: 0, fontWeight: 600 }}>
                    Function
                  </p>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 6 }}>
                    <p style={{ fontSize: 11, margin: 0, lineHeight: 1.5, color: hasValue(result.function_th) ? "#fff" : "#aaa", flex: 1 }}>
                      {displayValue(result.function_th)}
                    </p>
                    {hasValue(result.function_th) && (
                      <button
                        onClick={() => copyToClipboard(String(result.function_th), "Function (TH)")}
                        title="Copy"
                        style={{
                          background: copiedField === "Function (TH)" ? "#2ecc71" : "rgba(0, 0, 0, 0.3)",
                          border: "1px solid rgba(155, 89, 182, 0.2)",
                          borderRadius: 3,
                          color: "white",
                          padding: "4px 6px",
                          cursor: "pointer",
                          fontSize: 10,
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        {copiedField === "Function (TH)" ? "✅" : "📋"}
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ padding: 12, background: hasValue(result.where_used_th) ? "rgba(0, 0, 0, 0.25)" : "rgba(100, 100, 100, 0.05)", borderRadius: 6, position: "relative" }}>
                  <p style={{ fontSize: 10, color: "rgba(255, 255, 255, 0.5)", margin: 0, fontWeight: 600 }}>
                    Where Used
                  </p>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 6 }}>
                    <p style={{ fontSize: 11, margin: 0, lineHeight: 1.5, color: hasValue(result.where_used_th) ? "#fff" : "#aaa", flex: 1 }}>
                      {displayValue(result.where_used_th)}
                    </p>
                    {hasValue(result.where_used_th) && (
                      <button
                        onClick={() => copyToClipboard(String(result.where_used_th), "Where Used (TH)")}
                        title="Copy"
                        style={{
                          background: copiedField === "Where Used (TH)" ? "#2ecc71" : "rgba(0, 0, 0, 0.3)",
                          border: "1px solid rgba(155, 89, 182, 0.2)",
                          borderRadius: 3,
                          color: "white",
                          padding: "4px 6px",
                          cursor: "pointer",
                          fontSize: 10,
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        {copiedField === "Where Used (TH)" ? "✅" : "📋"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Trade Info */}
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 12px 0" }}>
                🧾 Trade Information
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                <div style={{ padding: 12, background: hasValue(result.eccn) ? "rgba(231, 76, 60, 0.1)" : "rgba(100, 100, 100, 0.05)", borderRadius: 6, border: `1px solid ${hasValue(result.eccn) ? "rgba(231, 76, 60, 0.2)" : "rgba(100, 100, 100, 0.1)"}`, position: "relative" }}>
                  <p style={{ fontSize: 10, color: "rgba(255, 255, 255, 0.6)", margin: 0, fontWeight: 600 }}>ECCN</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: hasValue(result.eccn) ? "#ff6b6b" : "#aaa", margin: 0, flex: 1 }}>
                      {displayValue(result.eccn)}
                    </p>
                    {hasValue(result.eccn) && (
                      <button
                        onClick={() => copyToClipboard(String(result.eccn), "ECCN")}
                        title="Copy"
                        style={{
                          background: copiedField === "ECCN" ? "#2ecc71" : "rgba(231, 76, 60, 0.2)",
                          border: "none",
                          borderRadius: 3,
                          color: "white",
                          padding: "3px 5px",
                          cursor: "pointer",
                          fontSize: 10,
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        {copiedField === "ECCN" ? "✅" : "📋"}
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ padding: 12, background: hasValue(result.hts) ? "rgba(52, 152, 219, 0.1)" : "rgba(100, 100, 100, 0.05)", borderRadius: 6, border: `1px solid ${hasValue(result.hts) ? "rgba(52, 152, 219, 0.2)" : "rgba(100, 100, 100, 0.1)"}`, position: "relative" }}>
                  <p style={{ fontSize: 10, color: "rgba(255, 255, 255, 0.6)", margin: 0, fontWeight: 600 }}>HTS</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: hasValue(result.hts) ? "#3498db" : "#aaa", margin: 0, flex: 1 }}>
                      {displayValue(result.hts)}
                    </p>
                    {hasValue(result.hts) && (
                      <button
                        onClick={() => copyToClipboard(String(result.hts), "HTS")}
                        title="Copy"
                        style={{
                          background: copiedField === "HTS" ? "#2ecc71" : "rgba(52, 152, 219, 0.2)",
                          border: "none",
                          borderRadius: 3,
                          color: "white",
                          padding: "3px 5px",
                          cursor: "pointer",
                          fontSize: 10,
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        {copiedField === "HTS" ? "✅" : "📋"}
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ padding: 12, background: hasValue(result.coo) ? "rgba(46, 204, 113, 0.1)" : "rgba(100, 100, 100, 0.05)", borderRadius: 6, border: `1px solid ${hasValue(result.coo) ? "rgba(46, 204, 113, 0.2)" : "rgba(100, 100, 100, 0.1)"}`, position: "relative" }}>
                  <p style={{ fontSize: 10, color: "rgba(255, 255, 255, 0.6)", margin: 0, fontWeight: 600 }}>COO</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: hasValue(result.coo) ? "#2ecc71" : "#aaa", margin: 0, flex: 1 }}>
                      {displayValue(result.coo)}
                    </p>
                    {hasValue(result.coo) && (
                      <button
                        onClick={() => copyToClipboard(String(result.coo), "COO")}
                        title="Copy"
                        style={{
                          background: copiedField === "COO" ? "#2ecc71" : "rgba(46, 204, 113, 0.2)",
                          border: "none",
                          borderRadius: 3,
                          color: "white",
                          padding: "3px 5px",
                          cursor: "pointer",
                          fontSize: 10,
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        {copiedField === "COO" ? "✅" : "📋"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Detailed Analysis Modal */}
      {showDetailedModal && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setShowDetailedModal(false)}
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
              width: "min(900px, 96vw)",
              maxHeight: "85vh",
              overflow: "auto",
              padding: 30,
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
                📖 Detailed Information
              </h2>
              <button
                onClick={() => setShowDetailedModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "white",
                  fontSize: 20,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                ✕
              </button>
            </div>

            {/* Part Info */}
            <div style={{ marginBottom: 20, paddingBottom: 15, borderBottom: "1px solid rgba(155, 89, 182, 0.2)" }}>
              <p style={{ margin: 0, fontSize: 12, color: "rgba(255, 255, 255, 0.6)" }}>
                Part: <strong>{result?.part_number}</strong>
              </p>
              <p style={{ margin: "5px 0 0 0", fontSize: 12, color: "rgba(255, 255, 255, 0.6)" }}>
                {result?.product_name || result?.common_name_en}
              </p>
            </div>

            {/* Analysis Content */}
            <div
              style={{
                background: "rgba(155, 89, 182, 0.05)",
                padding: 20,
                borderRadius: 8,
                lineHeight: 1.8,
                fontSize: 13,
                color: "rgba(255, 255, 255, 0.9)",
                whiteSpace: "pre-wrap",
                wordWrap: "break-word",
              }}
            >
              {detailedAnalysis || "Loading..."}
            </div>

            {/* Footer Buttons */}
            <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowDetailedModal(false)}
                style={{
                  padding: "10px 20px",
                  background: "rgba(155, 89, 182, 0.2)",
                  border: "1px solid rgba(155, 89, 182, 0.3)",
                  borderRadius: 6,
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                ✕ Close
              </button>
              <button
                onClick={() => {
                  const text = detailedAnalysis || "";
                  const blob = new Blob([text], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${result?.part_number || "part"}-details.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                style={{
                  padding: "10px 20px",
                  background: "#2ecc71",
                  border: "none",
                  borderRadius: 6,
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                💾 Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
