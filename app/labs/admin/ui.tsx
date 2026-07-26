"use client";

import { useActionState } from "react";
import {
  addEvidenceAction,
  createUserAction,
  publishReleaseAction,
  updateAccessAction,
  type AdminState,
} from "./actions";

const initial: AdminState = {};

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
  const [state, action, pending] = useActionState(publishReleaseAction, initial);
  return (
    <form className="labs-form" action={action}>
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
      {state.error ? <p className="labs-error">{state.error}</p> : null}
      {state.ok ? <p className="labs-ok">{state.ok}</p> : null}
      <button className="btn btn--primary" disabled={pending}>
        {pending ? "Uploading…" : "Publish release"}
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
