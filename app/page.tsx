"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [status, setStatus] = useState<"IDLE" | "DOWNLOADING" | "COMPLETED">("IDLE");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (status === "DOWNLOADING") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setStatus("COMPLETED");
            return 100;
          }
          // Random increment for realistic effect
          const increment = Math.random() * 2 + 0.5; 
          return Math.min(prev + increment, 100);
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [status]);

  const startMagic = () => {
    setStatus("DOWNLOADING");
    setProgress(0);
  };

  const reset = () => {
    setStatus("IDLE");
    setProgress(0);
  };

  return (
    <div className="magic-container">
      <div className="scanline" />
      <div className="vignette" />

      {status === "IDLE" && (
        <button className="magic-btn" onClick={startMagic}>
          Click for Magic
        </button>
      )}

      {status === "DOWNLOADING" && (
        <div className="progress-container">
          <div className="progress-label">
            <span>DOWNLOADING ASSETS...</span>
            <span>{(progress * 10).toFixed(1)} GB / 1000 GB</span>
          </div>
          <div className="progress-bar-bg">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <p style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
            {Math.floor(progress)}%
          </p>
        </div>
      )}

      {status === "COMPLETED" && (
        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
          <div className="success-msg">DOWNLOAD COMPLETE</div>
          <div className="success-sub">1TB of Magic installed directly to your brain.</div>
          
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
            RESET SIMULATION
          </button>
        </div>
      )}
    </div>
  );
}
