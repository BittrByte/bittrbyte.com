"use client";

import { useState } from "react";

export function DownloadButton({ releaseId }: { releaseId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/labs/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ releaseId }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error || "Download unavailable.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Download failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <button className="btn btn--primary" onClick={onClick} disabled={pending}>
        {pending ? "Preparing…" : "Download ZIP"}
      </button>
      {error ? <p className="labs-error">{error}</p> : null}
    </div>
  );
}
