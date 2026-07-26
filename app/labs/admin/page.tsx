import { redirect } from "next/navigation";
import { LabsAppChrome } from "@/components/labs/chrome";
import { requireAdminProfile } from "@/lib/labs/access";
import { createServiceClient } from "@/lib/supabase/server";
import type { LabsProfile, LabsRelease } from "@/lib/types";
import {
  AccessControls,
  CreateUserForm,
  EvidenceForm,
  PublishReleaseForm,
} from "./ui";

export default async function AdminPage() {
  const admin = await requireAdminProfile();
  if (!admin) redirect("/labs");

  const service = createServiceClient();
  const [{ data: users }, { data: releases }, { data: audits }] =
    await Promise.all([
      service
        .from("labs_profiles")
        .select("*")
        .order("created_at", { ascending: false }),
      service
        .from("labs_releases")
        .select("*")
        .order("released_at", { ascending: false })
        .limit(10),
      service
        .from("labs_audit_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

  return (
    <LabsAppChrome current="admin">
      <div className="labs-hero-lockup">
        <span className="eyebrow">Admin</span>
        <h1>Labs control</h1>
        <p>Invite users, publish private builds, and moderate access.</p>
      </div>

      <div className="labs-grid labs-grid--2">
        <section className="labs-panel">
          <h2>Create user</h2>
          <CreateUserForm />
        </section>
        <section className="labs-panel">
          <h2>Publish release ZIP</h2>
          <PublishReleaseForm />
        </section>
      </div>

      <section className="labs-panel" style={{ marginTop: "1rem" }}>
        <h2>Evidence</h2>
        <EvidenceForm />
      </section>

      <section className="labs-panel" style={{ marginTop: "1rem" }}>
        <h2>Users</h2>
        <table className="labs-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Expires</th>
              <th>Controls</th>
            </tr>
          </thead>
          <tbody>
            {((users || []) as LabsProfile[]).map((u) => (
              <tr key={u.id}>
                <td>
                  <div>{u.display_name}</div>
                  <div className="labs-muted">
                    {u.email || u.username || "—"}
                  </div>
                </td>
                <td>{u.role}</td>
                <td>{u.status}</td>
                <td>
                  {u.access_expires
                    ? new Date(u.access_expires).toLocaleDateString()
                    : "Indefinite"}
                </td>
                <td>
                  <AccessControls profileId={u.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="labs-panel" style={{ marginTop: "1rem" }}>
        <h2>Recent releases</h2>
        <table className="labs-table">
          <thead>
            <tr>
              <th>Version</th>
              <th>Size</th>
              <th>SHA256</th>
              <th>Latest</th>
            </tr>
          </thead>
          <tbody>
            {((releases || []) as LabsRelease[]).map((r) => (
              <tr key={r.id}>
                <td>{r.version}</td>
                <td>{r.size_bytes ?? "—"}</td>
                <td className="labs-muted">{r.sha256?.slice(0, 16) || "—"}</td>
                <td>{r.is_latest ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="labs-panel" style={{ marginTop: "1rem" }}>
        <h2>Audit log</h2>
        <table className="labs-table">
          <thead>
            <tr>
              <th>When</th>
              <th>Event</th>
              <th>Target</th>
            </tr>
          </thead>
          <tbody>
            {(audits || []).map((a: { id: string; created_at: string; event_type: string; target_type: string | null; target_id: string | null }) => (
              <tr key={a.id}>
                <td>{new Date(a.created_at).toLocaleString()}</td>
                <td>{a.event_type}</td>
                <td className="labs-muted">
                  {a.target_type} {a.target_id}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </LabsAppChrome>
  );
}
