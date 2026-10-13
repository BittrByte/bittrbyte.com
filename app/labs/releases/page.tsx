import Link from "next/link";
import { LabsAppChrome } from "@/components/labs/chrome";
import { createServiceClient } from "@/lib/supabase/server";
import type { LabsRelease } from "@/lib/types";

export default async function ReleasesPage() {
  const service = createServiceClient();
  const { data } = await service
    .from("labs_releases")
    .select("*")
    .order("released_at", { ascending: false });

  const releases = (data || []) as LabsRelease[];

  return (
    <LabsAppChrome current="releases">
      <div className="labs-hero-lockup">
        <span className="eyebrow">Releases</span>
        <h1>Build archive</h1>
        <p>Every Labs OS package published for this programme.</p>
      </div>
      <section className="labs-panel">
        {releases.length ? (
          <table className="labs-table">
            <thead>
              <tr>
                <th>Version</th>
                <th>Device</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {releases.map((r) => (
                <tr key={r.id}>
                  <td>
                    {r.version}{" "}
                    {r.is_latest ? <span className="labs-pill">Latest</span> : null}
                  </td>
                  <td>{r.device}</td>
                  <td>{r.status}</td>
                  <td>{new Date(r.released_at).toLocaleDateString()}</td>
                  <td>
                    <Link className="btn" href={`/labs/releases/${r.id}`}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="labs-muted">No releases yet.</p>
        )}
      </section>
    </LabsAppChrome>
  );
}
