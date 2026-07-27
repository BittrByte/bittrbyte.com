"use client";

import { useActionState, useState } from "react";
import { sha256 } from "js-sha256";
import {
  addEvidenceAction,
  createUserAction,
  updateAccessAction,
  type AdminState,
} from "./actions";

const initial: AdminState = {};

async function hashFileSha256(
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  const hasher = sha256.create();
  const chunkSize = 8 * 1024 * 1024;
  let offset = 0;
  while (offset < file.size) {
    const chunk = file.slice(offset, offset + chunkSize);
    const buf = new Uint8Array(await chunk.arrayBuffer());
    hasher.update(buf);
    offset += buf.length;
    onProgress?.(Math.min(99, Math.round((offset / file.size) * 100)));
  }
  return hasher.hex();
}

function uploadFileToR2(
  uploadUrl: string,
  file: File,
  contentType: string,
  onProgress?: (pct: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", contentType || "application/zip");
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress?.(Math.min(99, Math.round((event.loaded / event.total) * 100)));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
        return;
      }
      reject(
        new Error(
          `Upload failed (${xhr.status}). ${xhr.responseText?.slice(0, 180) || ""}`
        )
      );
    };
    xhr.onerror = () =>
      reject(
        new Error(
          "Network error during R2 upload. Usually the R2 bucket is missing CORS for bittrbyte.com — add a CORS policy allowing PUT from https://www.bittrbyte.com (see LABS.md)."
        )
      );
    xhr.send(file);
  });
}

export function CreateUserForm() {
  const [state, action, pending] = useActionState(createUserAction, initial);
  return (
    <form className="labs-form" action={action}>
      <div className="labs-field">
        <label htmlFor="kind">Account type</label>
        <select id="kind" name="kind" defaultValue="member">
          <option value="member">Member (email)</option>
          <option value="reviewer">Reviewer (username)</option>
          <option value="admin">Admin (email)</option>
        </select>
      </div>
      <div className="labs-field">
        <label htmlFor="displayName">Display name</label>
        <input id="displayName" name="displayName" required />
      </div>
      <div className="labs-field">
        <label htmlFor="email">Email (members/admins)</label>
        <input id="email" name="email" type="email" />
      </div>
      <div className="labs-field">
        <label htmlFor="username">Username (reviewers)</label>
        <input id="username" name="username" placeholder="yc-partner" />
      </div>
      <div className="labs-field">
        <label htmlFor="password">Temporary password</label>
        <input id="password" name="password" type="text" required minLength={8} />
      </div>
      <div className="labs-field">
        <label htmlFor="expiryPreset">Access length</label>
        <select id="expiryPreset" name="expiryPreset" defaultValue="3m">
          <option value="30d">30 days</option>
          <option value="3m">3 months</option>
          <option value="6m">6 months</option>
          <option value="indefinite">Indefinite</option>
          <option value="custom">Custom date</option>
        </select>
      </div>
      <div className="labs-field">
        <label htmlFor="customDate">Custom expiry (if custom)</label>
        <input id="customDate" name="customDate" type="datetime-local" />
      </div>
      <label>
        <input type="checkbox" name="canDownload" defaultChecked /> Can download
      </label>
      <label>
        <input type="checkbox" name="canPost" defaultChecked /> Can post
      </label>
      {state.error ? <p className="labs-error">{state.error}</p> : null}
      {state.ok ? <p className="labs-ok">{state.ok}</p> : null}
      <button className="btn btn--primary" disabled={pending}>
        {pending ? "Creating…" : "Create account"}
      </button>
    </form>
  );
}

export function AccessControls({
  profileId,
}: {
  profileId: string;
}) {
  const [state, action, pending] = useActionState(updateAccessAction, initial);
  return (
    <form className="labs-form" action={action}>
      <input type="hidden" name="profileId" value={profileId} />
      <div className="labs-field">
        <label htmlFor={`action-${profileId}`}>Action</label>
        <select id={`action-${profileId}`} name="action" defaultValue="extend">
          <option value="extend">Extend / set expiry</option>
          <option value="activate">Activate</option>
          <option value="revoke">Revoke</option>
        </select>
      </div>
      <div className="labs-field">
        <label htmlFor={`expiry-${profileId}`}>Expiry preset</label>
        <select id={`expiry-${profileId}`} name="expiryPreset" defaultValue="3m">
          <option value="30d">30 days</option>
          <option value="3m">3 months</option>
          <option value="6m">6 months</option>
          <option value="indefinite">Indefinite</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      <div className="labs-field">
        <label htmlFor={`custom-${profileId}`}>Custom date</label>
        <input id={`custom-${profileId}`} name="customDate" type="datetime-local" />
      </div>
      {state.error ? <p className="labs-error">{state.error}</p> : null}
      {state.ok ? <p className="labs-ok">{state.ok}</p> : null}
      <button className="btn" disabled={pending}>
        Apply
      </button>
    </form>
  );
}

export function PublishReleaseForm() {
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setOk(null);
    setPending(true);
    setStatus("Preparing upload…");

    const form = e.currentTarget;
    const fd = new FormData(form);
    const version = String(fd.get("version") || "").trim();
    const device = String(fd.get("device") || "Pixel 6a").trim();
    const summary = String(fd.get("summary") || "").trim();
    const notes = String(fd.get("notes") || "").trim();
    const knownIssues = String(fd.get("knownIssues") || "").trim();
    const installNotes = String(fd.get("installNotes") || "").trim();
    const isLatest = fd.get("isLatest") === "on";
    const file = fd.get("zip") as File | null;

    try {
      if (!version) throw new Error("Version is required.");
      if (!file || file.size === 0) throw new Error("ZIP file is required.");

      // Large packages go straight to Cloudflare R2 (not through Netlify body limits).
      const contentType = file.type || "application/zip";
      setStatus("Requesting secure R2 upload slot…");
      const slotRes = await fetch("/api/labs/release-upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          version,
          filename: file.name,
          contentType,
        }),
      });
      const slot = await slotRes.json();
      if (!slotRes.ok || !slot.uploadUrl || !slot.path) {
        throw new Error(slot.error || "Could not start upload.");
      }

      setStatus("Hashing file (can take a few minutes for 1GB+)…");
      const digest = await hashFileSha256(file, (pct) => {
        setStatus(`Hashing file… ${pct}%`);
      });

      setStatus(
        `Uploading ${(file.size / (1024 * 1024)).toFixed(0)} MB to Cloudflare R2…`
      );
      await uploadFileToR2(slot.uploadUrl, file, contentType, (pct) => {
        setStatus(`Uploading to R2… ${pct}%`);
      });

      setStatus("Saving release record…");
      const finRes = await fetch("/api/labs/release-finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          version,
          device,
          summary,
          notes,
          knownIssues,
          installNotes,
          isLatest,
          storagePath: slot.path,
          filename: slot.filename || file.name,
          sizeBytes: file.size,
          sha256: digest,
        }),
      });
      const fin = await finRes.json();
      if (!finRes.ok) {
        throw new Error(fin.error || "Could not finalize release.");
      }

      setOk(`Published ${version}.`);
      setStatus("");
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
      setStatus("");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="labs-form" onSubmit={onSubmit}>
      <p className="labs-muted">
        Large Labs packages (1GB+) upload directly to private Cloudflare R2.
        Keep this tab open until hashing and upload finish.
      </p>
      <div className="labs-field">
        <label htmlFor="version">Version</label>
        <input id="version" name="version" required placeholder="0.1.0-labs" />
      </div>
      <div className="labs-field">
        <label htmlFor="device">Device</label>
        <input id="device" name="device" defaultValue="Pixel 6a" />
      </div>
      <div className="labs-field">
        <label htmlFor="summary">Summary</label>
        <textarea id="summary" name="summary" />
      </div>
      <div className="labs-field">
        <label htmlFor="notes">Notes</label>
        <textarea id="notes" name="notes" />
      </div>
      <div className="labs-field">
        <label htmlFor="knownIssues">Known issues</label>
        <textarea id="knownIssues" name="knownIssues" />
      </div>
      <div className="labs-field">
        <label htmlFor="installNotes">Install notes</label>
        <textarea id="installNotes" name="installNotes" />
      </div>
      <div className="labs-field">
        <label htmlFor="zip">ZIP package</label>
        <input id="zip" name="zip" type="file" accept=".zip,application/zip" required />
      </div>
      <label>
        <input type="checkbox" name="isLatest" defaultChecked /> Mark as latest
      </label>
      {status ? <p className="labs-muted">{status}</p> : null}
      {error ? <p className="labs-error">{error}</p> : null}
      {ok ? <p className="labs-ok">{ok}</p> : null}
      <button className="btn btn--primary" disabled={pending}>
        {pending ? "Working…" : "Publish release"}
      </button>
    </form>
  );
}

export function EvidenceForm() {
  const [state, action, pending] = useActionState(addEvidenceAction, initial);
  return (
    <form className="labs-form" action={action}>
      <div className="labs-field">
        <label htmlFor="title">Title</label>
        <input id="title" name="title" required />
      </div>
      <div className="labs-field">
        <label htmlFor="caption">Caption</label>
        <input id="caption" name="caption" />
      </div>
      <div className="labs-field">
        <label htmlFor="mediaType">Type</label>
        <select id="mediaType" name="mediaType" defaultValue="screenshot">
          <option value="screenshot">Screenshot</option>
          <option value="video">Video</option>
          <option value="clip">Clip</option>
        </select>
      </div>
      <div className="labs-field">
        <label htmlFor="mediaUrl">Media URL</label>
        <input id="mediaUrl" name="mediaUrl" type="url" placeholder="https://…" />
      </div>
      {state.error ? <p className="labs-error">{state.error}</p> : null}
      {state.ok ? <p className="labs-ok">{state.ok}</p> : null}
      <button className="btn" disabled={pending}>
        Add evidence
      </button>
    </form>
  );
}
