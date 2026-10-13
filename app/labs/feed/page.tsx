import { LabsAppChrome } from "@/components/labs/chrome";
import { getSessionProfile } from "@/lib/labs/access";
import { createServiceClient } from "@/lib/supabase/server";
import type { LabsComment, LabsPost } from "@/lib/types";
import { CommentForm, NewPostForm } from "./ui";

export default async function FeedPage() {
  const { profile } = await getSessionProfile();
  const service = createServiceClient();

  const { data: posts } = await service
    .from("labs_posts")
    .select("*, author:labs_profiles(display_name, role, username)")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(50);

  const postList = (posts || []) as LabsPost[];
  const ids = postList.map((p) => p.id);

  let comments: LabsComment[] = [];
  if (ids.length) {
    const { data } = await service
      .from("labs_comments")
      .select("*, author:labs_profiles(display_name, role, username)")
      .in("post_id", ids)
      .order("created_at", { ascending: true });
    comments = (data || []) as LabsComment[];
  }

  const byPost = new Map<string, LabsComment[]>();
  for (const c of comments) {
    const list = byPost.get(c.post_id) || [];
    list.push(c);
    byPost.set(c.post_id, list);
  }

  return (
    <LabsAppChrome current="feed">
      <div className="labs-hero-lockup">
        <span className="eyebrow">Feed</span>
        <h1>Development updates</h1>
        <p>Private notes from the Labs cohort. Not a public forum.</p>
      </div>

      {profile?.can_post ? (
        <section className="labs-panel" style={{ marginBottom: "1rem" }}>
          <h2>Write</h2>
          <NewPostForm />
        </section>
      ) : null}

      <section className="labs-panel">
        {postList.length ? (
          postList.map((post) => (
            <article key={post.id} className="labs-feed-item">
              <div className="labs-meta">
                <span>{post.author?.display_name || "Member"}</span>
                <span>{post.author?.role}</span>
                <span>{new Date(post.created_at).toLocaleString()}</span>
                {post.is_pinned ? <span className="labs-pill">Pinned</span> : null}
              </div>
              <p>{post.body}</p>
              <div style={{ marginTop: "0.75rem", paddingLeft: "0.75rem", borderLeft: "1px solid var(--labs-line)" }}>
                {(byPost.get(post.id) || []).map((c) => (
                  <div key={c.id} style={{ marginBottom: "0.65rem" }}>
                    <div className="labs-meta">
                      <span>{c.author?.display_name || "Member"}</span>
                      <span>{new Date(c.created_at).toLocaleString()}</span>
                    </div>
                    <p className="labs-muted">{c.body}</p>
                  </div>
                ))}
                {profile?.can_post ? <CommentForm postId={post.id} /> : null}
              </div>
            </article>
          ))
        ) : (
          <p className="labs-muted">No posts yet.</p>
        )}
      </section>
    </LabsAppChrome>
  );
}
