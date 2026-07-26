"use server";

import { revalidatePath } from "next/cache";
import { requireActiveProfile, writeAudit } from "@/lib/labs/access";
import { createServiceClient } from "@/lib/supabase/server";

export type FeedState = { error?: string; ok?: string };

export async function createPostAction(
  _prev: FeedState,
  formData: FormData
): Promise<FeedState> {
  const profile = await requireActiveProfile();
  if (!profile) return { error: "Unauthorized." };
  if (!profile.can_post) return { error: "Posting not permitted." };

  const body = String(formData.get("body") || "").trim();
  if (!body) return { error: "Write something first." };

  const service = createServiceClient();
  const { error } = await service.from("labs_posts").insert({
    author_id: profile.id,
    body,
  });

  if (error) return { error: "Could not publish post." };

  await writeAudit({
    actorId: profile.id,
    eventType: "post_create",
    targetType: "post",
  });

  revalidatePath("/labs/feed");
  revalidatePath("/labs");
  return { ok: "Posted." };
}

export async function createCommentAction(
  _prev: FeedState,
  formData: FormData
): Promise<FeedState> {
  const profile = await requireActiveProfile();
  if (!profile) return { error: "Unauthorized." };
  if (!profile.can_post) return { error: "Commenting not permitted." };

  const postId = String(formData.get("postId") || "");
  const body = String(formData.get("body") || "").trim();
  if (!postId || !body) return { error: "Missing comment." };

  const service = createServiceClient();
  const { error } = await service.from("labs_comments").insert({
    post_id: postId,
    author_id: profile.id,
    body,
  });

  if (error) return { error: "Could not add comment." };

  revalidatePath("/labs/feed");
  return { ok: "Comment added." };
}
