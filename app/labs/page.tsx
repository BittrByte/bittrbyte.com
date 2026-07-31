import Link from "next/link";
import { LabsAppChrome } from "@/components/labs/chrome";
import { createServiceClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/labs/access";
import { DownloadButton } from "@/components/labs/download-button";
import type { LabsPost, LabsRelease } from "@/lib/types";

function formatBytes(n: number | null) {
  if (!n) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function LabsDashboardPage() {
  const { profile } = await getSessionProfile();
  const service = createServiceClient();

  const [{ data: latest }, { data: posts }] = await Promise.all([
    service
      .from("labs_releases")
      .select("*")
      .eq("is_latest", true)
      .maybeSingle(),
    service
      .from("labs_posts")
      .select("*, author:labs_profiles(display_name, role, username)")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const release = latest as LabsRelease | null;
  const feed = (posts || []) as LabsPost[];

  return (
    <LabsAppChrome current="dashboard">
      <div className="labs-hero-lockup">
        <span className="eyebrow">SKYWALL / Labs</span>
        <h1>Welcome{profile ? `, ${profile.display_name}` : ""}</h1>
        <p>
          Private portal for selected testers and reviewers. Latest OS builds
          and development updates.
        </p>
      </div>

      <section className="labs-panel">
        <h2>Latest build</h2>
        {release ? (
          <>
            <h3 style={{ textTransform: "none", letterSpacing: 0 }}>
              SKYWALL OS {release.version}
            </h3>
            <div className="labs-meta">
              <span>{release.device}</span>
              <span>{release.channel}</span>
              <span>{formatBytes(release.size_bytes)}</span>
              {release.sha256 ? (
                <span title={release.sha256}>
                  SHA256 {release.sha256.slice(0, 12)}…
                </span>
              ) : null}
            </div>
            <p className="labs-muted">{release.summary || "No summary yet."}</p>
            <div className="labs-actions">
              {release.download_enabled && release.storage_path ? (
                <DownloadButton releaseId={release.id} />
              ) : (
                <span className="labs-muted">Download not available yet.</span>
              )}
              <Link className="btn" href={`/labs/releases/${release.id}`}>
                Release details
              </Link>
            </div>
          </>
        ) : (
          <p className="labs-muted">
            No release published yet. Admins can upload the first ZIP from
            Admin.
          </p>
        )}
      </section>

      <section className="labs-panel">
        <div className="labs-panel__head">
          <h2>Development feed</h2>
          <Link className="btn" href="/labs/feed">
            Open feed
          </Link>
        </div>
        {feed.length ? (
          <div className="labs-stack">
            {feed.map((post) => (
              <article key={post.id} className="labs-feed-item">
                <div className="labs-meta">
                  <span>{post.author?.display_name || "Member"}</span>
                  <span>{new Date(post.created_at).toLocaleString()}</span>
                  {post.is_pinned ? <span className="labs-pill">Pinned</span> : null}
                </div>
                <p>{post.body}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="labs-muted">No posts yet.</p>
        )}
      </section>
    </LabsAppChrome>
  );
}
