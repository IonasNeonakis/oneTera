"use client";

import { useState, useRef } from "react";

export default function Home() {
  const [status, setStatus] = useState<"IDLE" | "DOWNLOADING" | "COMPLETED" | "STOPPED">("IDLE");
  const [downloadedBytes, setDownloadedBytes] = useState(0);
  const [fileCount, setFileCount] = useState(0);

  // Refs to handle the loop and stopping
  const isDownloading = useRef(false);
  const totalTarget = 1000 * 1024 * 1024 * 1024; // 1TB in bytes
  const CHUNK_SIZE = 100 * 1024 * 1024; // 100MB per file

  const generateAndDownload = async () => {
    if (!isDownloading.current) return;

    try {
      // 1. Generate a 1GB Blob (using a smaller buffer repeated might be more memory efficient, 
      // but creating a defined size TypedArray is fastest for allocation)
      // Warning: 1GB allocation might fail on some browsers/devices. 
      // We'll wrap in try/catch to handle OOM.
      const buffer = new Uint8Array(CHUNK_SIZE);
      // No need to fill it with data, zeros are fine for "magic"
      const blob = new Blob([buffer], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);

      // 2. Trigger Download
      const a = document.createElement("a");
      a.href = url;
      a.download = `magic_data_shard_${Date.now()}.bin`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Clean up URL object after a short delay to allow download to start
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      // 3. Update State
      setDownloadedBytes(prev => {
        const newVal = prev + CHUNK_SIZE;
        if (newVal >= totalTarget) {
          isDownloading.current = false;
          setStatus("COMPLETED");
        }
        return newVal;
      });
      setFileCount(prev => prev + 1);

      // 4. Loop if active and not complete
      if (isDownloading.current) {
        // Small delay to prevent freezing the UI completely
        setTimeout(generateAndDownload, 500);
      }

    } catch (error) {
      console.error("Storage/Memory Error:", error);
      alert("Magic Overload: Browser ran out of memory or disk space.");
      stopMagic();
    }
  };

  const startMagic = () => {
    isDownloading.current = true;
    setStatus("DOWNLOADING");
    // Generate first file
    generateAndDownload();
  };

  const stopMagic = () => {
    isDownloading.current = false;
    setStatus("STOPPED");
  };

  const reset = () => {
    isDownloading.current = false;
    setStatus("IDLE");
    setDownloadedBytes(0);
    setFileCount(0);
  };

  const currentGB = (downloadedBytes / (1024 * 1024 * 1024)).toFixed(1);
  const totalGB = 1000;
  const progressPercent = Math.min((downloadedBytes / totalTarget) * 100, 100);

  return (
    <div className="magic-container">
      <div className="scanline" />
      <div className="vignette" />

      {status === "IDLE" && (
        <button className="magic-btn" onClick={startMagic}>
          Click for Magic
        </button>
      )}

      {(status === "DOWNLOADING" || status === "STOPPED") && (
        <div className="progress-container">
          <div className="progress-label">
            <span>{status === "STOPPED" ? "DOWNLOAD PAUSED" : "DOWNLOADING..."}</span>
            <span>{currentGB} GB / {totalGB} GB</span>
          </div>

          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${progressPercent}%`, backgroundColor: status === "STOPPED" ? "#ff0050" : "var(--primary)" }}
            />
          </div>

          <div className="flex justify-between items-center mt-4 text-xs text-white/40 font-mono">
            <span>FILES: {fileCount}</span>
            <span>{progressPercent.toFixed(2)}%</span>
          </div>

          <button
            onClick={status === "STOPPED" ? startMagic : stopMagic}
            className="mt-8 border border-white/20 px-6 py-2 rounded-full text-sm font-mono hover:bg-white/10 transition-colors uppercase tracking-widest text-primary"
          >
            {status === "STOPPED" ? "RESUME" : "STOP DOWNLOAD"}
          </button>
        </div>
      )}

      {status === "COMPLETED" && (
        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
          <div className="success-msg">DOWNLOAD COMPLETE</div>
          <div className="success-sub">1TB of Data successfully transferred.</div>
          <div className="text-xs text-white/40 font-mono mt-2">{fileCount} files created.</div>

          <button
            onClick={reset}
            style={{
              marginTop: '2rem',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.6)',
              padding: '0.5rem 1.5rem',
              cursor: 'pointer',
              fontSize: '0.8rem',
              borderRadius: '20px'
            }}
            className="hover:bg-white/10 transition-colors"
          >
            RESET
          </button>
        </div>
      )}
    </div>
  );
}
