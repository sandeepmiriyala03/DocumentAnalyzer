"use client";
import { useState, ChangeEvent } from "react";

interface Analysis {
  chunk_number: number;
  keywords: string[];
  highlights: string[];
  summary: string[];
}

interface Result {
  total_chunks: number;
  analysis: Analysis[];
}

function isErrorResponse(data: unknown): data is { error: string } {
  return (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof (data as { error?: unknown }).error === "string"
  );
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]); // <-- Store single File, not FileList!
      setError("");
      setResult(null);
      console.log("File selected:", e.target.files);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file); // KEY MUST BE "file"

      // If local, use your backend base URL, otherwise empty for relative path in production
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

      const res = await fetch(`${baseUrl}/api/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        if (isErrorResponse(data)) {
          setError(data.error);
        } else {
          setError("Upload failed");
        }
        return;
      }
      setResult(data as Result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "50px auto",
        padding: 20,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ textAlign: "center", color: "#333", marginBottom: 20 }}>
        Upload Document
      </h1>

      <input
        type="file"
        onChange={handleFileChange}
        style={{ width: "100%", padding: 12, marginBottom: 16 }}
        disabled={loading}
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        style={{
          width: "100%",
          padding: 14,
          fontSize: 18,
          backgroundColor: loading ? "#ccc" : "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

      {error && (
        <p
          style={{
            color: "red",
            fontWeight: "bold",
            textAlign: "center",
            marginTop: 20,
          }}
        >
          {error}
        </p>
      )}

      {result && result.analysis && result.analysis.length > 0 && (
        <div
          style={{
            marginTop: 30,
            padding: 24,
            background:
              "linear-gradient(135deg, #f0f4ff 25%, #d9e4ff 100%)",
            borderRadius: 16,
            boxShadow:
              "0 12px 30px rgba(0, 70, 255, 0.15), inset 0 0 10px rgba(0, 70, 255, 0.1)",
            fontFamily:
              "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            fontSize: 16,
            color: "#102a8f",
            lineHeight: 1.6,
            userSelect: "text",
            boxSizing: "border-box",
            whiteSpace: "normal",
            wordBreak: "break-word",
          }}
        >
          {result.analysis[0].highlights && (
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ marginBottom: 12, color: "#0050ab" }}>
                Highlights
              </h2>
              <ul style={{ paddingLeft: 20, margin: 0, color: "#102a8f" }}>
                {result.analysis[0].highlights.map((highlight, index) => (
                  <li key={index} style={{ marginBottom: 8 }}>
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.analysis[0].summary && (
            <div>
              <h2 style={{ marginBottom: 12, color: "#0050ab" }}>Summary</h2>
              <ul style={{ paddingLeft: 20, margin: 0, color: "#102a8f" }}>
                {result.analysis[0].summary.map((summaryItem, index) => (
                  <li key={index} style={{ marginBottom: 8 }}>
                    {summaryItem}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
