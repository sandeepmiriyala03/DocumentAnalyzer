"use client";
import { useState, ChangeEvent } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Set only the first selected file to state
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);  // Set single File object, not FileList
      setError("");
      setResult(null);
      console.log("File selected:", e.target.files[0]);
    }
  };

  // Upload the selected file to backend
  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file); // Append single File object

      const res = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("Response data:", data[3]);
      if (!res.ok) {
        setError(data.error || "Upload failed");
        return;
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "50px auto", padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center", color: "#333", marginBottom: 20 }}>Upload Document</h1>

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

      {error && <p style={{ color: "red", fontWeight: "bold", textAlign: "center", marginTop: 20 }}>{error}</p>}

{result && result.analysis && result.analysis.length > 0 && (
  <div
    style={{
      marginTop: 30,
      padding: 24,
      background: "linear-gradient(135deg, #f0f4ff 25%, #d9e4ff 100%)",
      borderRadius: 16,
      boxShadow: "0 12px 30px rgba(0, 70, 255, 0.15), inset 0 0 10px rgba(0, 70, 255, 0.1)",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      fontSize: 16,
      color: "#102a8f",
      lineHeight: 1.6,
      userSelect: "text",
      boxSizing: "border-box",
      whiteSpace: "normal",
      wordBreak: "break-word",
    }}
  >
    {/* Highlights Section */}
    {result.analysis[0].highlights && (
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 12, color: "#0050ab" }}>Highlights</h2>
        <ul style={{ paddingLeft: 20, margin: 0, color: "#102a8f" }}>
          {result.analysis[0].highlights.map((highlight: string, index: number) => (
            <li key={index} style={{ marginBottom: 8 }}>
              {highlight}
            </li>
          ))}
        </ul>
      </div>
    )}

    {/* Summary Section */}
    {result.analysis[0].summary && (
      <div>
        <h2 style={{ marginBottom: 12, color: "#0050ab" }}>Summary</h2>
        <ul style={{ paddingLeft: 20, margin: 0, color: "#102a8f" }}>
          {result.analysis[0].summary.map((summaryItem: string, index: number) => (
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
