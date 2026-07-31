import Link from "next/link";
import { notFound } from "next/navigation";
import { LabsAppChrome } from "@/components/labs/chrome";
import { DownloadButton } from "@/components/labs/download-button";
import { getSessionProfile } from "@/lib/labs/access";
import { createServiceClient } from "@/lib/supabase/server";
import type { LabsRelease } from "@/lib/types";

export default async function ReleaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile } = await getSessionProfile();
  const service = createServiceClient();
  const { data } = await service
    .from("labs_releases")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const release = data as LabsRelease;

  return (
    <LabsAppChrome current="releases">
      <div className="labs-hero-lockup">
        <span className="eyebrow">Release</span>
        <h1>SKYWALL OS {release.version}</h1>
        <p>{release.summary || "Labs build package."}</p>
      </div>
      <section className="labs-panel labs-stack">
        <div className="labs-meta">
          <span>{release.device}</span>
          <span>{release.channel}</span>
          <span>{new Date(release.released_at).toLocaleString()}</span>
          {release.sha256 ? <span>SHA256 {release.sha256}</span> : null}
        </div>
        {release.notes ? (
          <div>
            <h3>Notes</h3>
            <p className="labs-muted" style={{ whiteSpace: "pre-wrap" }}>
              {release.notes}
            </p>
          </div>
        ) : null}
        {release.known_issues ? (
          <div>
            <h3>Known issues</h3>
            <p className="labs-muted" style={{ whiteSpace: "pre-wrap" }}>
              {release.known_issues}
            </p>
          </div>
        ) : null}
        {release.install_notes ? (
          <div>
            <h3>Install notes</h3>
            <p className="labs-muted" style={{ whiteSpace: "pre-wrap" }}>
              {release.install_notes}
            </p>
          </div>
        ) : null}
        <div className="labs-actions">
          {release.download_enabled && release.storage_path ? (
            profile?.can_download ? (
              <DownloadButton releaseId={release.id} />
            ) : (
              <span className="labs-muted">
                Download not permitted for your account.
              </span>
            )
          ) : (
            <span className="labs-muted">Download disabled.</span>
          )}
          <Link className="btn" href="/labs/releases">
            Back to archive
          </Link>
        </div>
      </section>
    </LabsAppChrome>
  );
}
