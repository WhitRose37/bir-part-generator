"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type Part = {
  partNumber: string;
  commonNameEn: string | null;
  commonNameTh: string | null;
  uom: string | null;
  characteristicsOfMaterialEn: string | null;
  characteristicsOfMaterialTh: string | null;
  longEn: string | null;
  longTh: string | null;
  [key: string]: any;
};

export default function ComparePage() {
  const searchParams = useSearchParams();
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = searchParams.get("ids")?.split(",") || [];
    if (ids.length > 0) {
      fetchParts(ids);
    }
  }, [searchParams]);

  async function fetchParts(ids: string[]) {
    try {
      const res = await fetch("/api/parts/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });

      if (res.ok) {
        const data = await res.json();
        setParts(data.parts);
      }
    } catch (e) {
      console.error("Error fetching parts:", e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container" style={{ marginTop: 40 }}>
        <div className="card glass">
          <p style={{ color: "#9b59b6" }}>⏳ Loading...</p>
        </div>
      </div>
    );
  }

  const fields = [
    "partNumber",
    "commonNameEn",
    "commonNameTh",
    "uom",
    "characteristicsOfMaterialEn",
    "characteristicsOfMaterialTh",
    "longEn",
    "longTh",
  ];

  const fieldLabels: { [key: string]: string } = {
    partNumber: "Part Number",
    commonNameEn: "Common Name (EN)",
    commonNameTh: "Common Name (TH)",
    uom: "UOM",
    characteristicsOfMaterialEn: "Characteristics (EN)",
    characteristicsOfMaterialTh: "Characteristics (TH)",
    longEn: "Description (EN)",
    longTh: "Description (TH)",
  };

  return (
    <div className="container" style={{ marginTop: 20, marginBottom: 40 }}>
      <div className="card glass" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>⚖️ Part Comparison</h2>
          <Link href="/my-catalog" className="btn btn--ghost">
            ← Back to Catalog
          </Link>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "rgba(155, 89, 182, 0.05)",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "rgba(155, 89, 182, 0.15)" }}>
              <th
                style={{
                  padding: 15,
                  textAlign: "left",
                  borderBottom: "2px solid rgba(155, 89, 182, 0.3)",
                  fontWeight: "bold",
                  minWidth: 150,
                }}
              >
                Field
              </th>
              {parts.map((part, idx) => (
                <th
                  key={idx}
                  style={{
                    padding: 15,
                    textAlign: "left",
                    borderBottom: "2px solid rgba(155, 89, 182, 0.3)",
                    fontWeight: "bold",
                    minWidth: 250,
                    backgroundColor: `rgba(${52 + idx * 50}, ${152 - idx * 20}, ${219 - idx * 20}, 0.1)`,
                  }}
                >
                  {part.commonNameEn || part.partNumber}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fields.map((field, rowIdx) => (
              <tr
                key={field}
                style={{
                  backgroundColor: rowIdx % 2 === 0 ? "transparent" : "rgba(155, 89, 182, 0.03)",
                }}
              >
                <td
                  style={{
                    padding: 15,
                    borderBottom: "1px solid rgba(155, 89, 182, 0.1)",
                    fontWeight: "bold",
                    color: "rgba(255, 255, 255, 0.8)",
                  }}
                >
                  {fieldLabels[field]}
                </td>
                {parts.map((part, colIdx) => {
                  const value = part[field];
                  const isDifferent =
                    parts.some((p) => p[field] !== value) && value !== null && value !== "";

                  return (
                    <td
                      key={`${field}-${colIdx}`}
                      style={{
                        padding: 15,
                        borderBottom: "1px solid rgba(155, 89, 182, 0.1)",
                        backgroundColor: isDifferent ? "rgba(231, 76, 60, 0.1)" : "transparent",
                        color: value ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.4)",
                        wordBreak: "break-word",
                      }}
                    >
                      {value || "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          table {
            font-size: 12px;
          }
          td,
          th {
            padding: 10px !important;
          }
        }
      `}</style>
    </div>
  );
}
