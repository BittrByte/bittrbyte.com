"use server";

import { createHash, randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import {
  computeExpiry,
  requireAdminProfile,
  reviewerInternalEmail,
  writeAudit,
} from "@/lib/labs/access";
import { createServiceClient } from "@/lib/supabase/server";

export type AdminState = { error?: string; ok?: string };

export async function createUserAction(
  _prev: AdminState,
  formData: FormData
): Promise<AdminState> {
  const admin = await requireAdminProfile();
  if (!admin) return { error: "Admin only." };

  const kind = String(formData.get("kind") || "member");
  const displayName = String(formData.get("displayName") || "").trim();
  const password = String(formData.get("password") || "");
  const preset = String(formData.get("expiryPreset") || "3m");
  const customDate = String(formData.get("customDate") || "");
  const canDownload = formData.get("canDownload") === "on";
  const canPost = formData.get("canPost") === "on";
  const role = kind === "admin" ? "admin" : kind === "reviewer" ? "reviewer" : "member";

  if (!displayName || password.length < 8) {
    return { error: "Name and password (8+ chars) are required." };
  }

  const accessExpires = computeExpiry(preset, customDate || null);
  const service = createServiceClient();

  let email: string | null = null;
  let username: string | null = null;

  if (kind === "reviewer") {
    username = String(formData.get("username") || "")
      .trim()
      .toLowerCase();
    if (!username || !/^[a-z0-9._-]{3,32}$/.test(username)) {
      return { error: "Username must be 3–32 chars: a-z, 0-9, . _ -" };
    }
    email = reviewerInternalEmail(username);
  } else {
    email = String(formData.get("email") || "").trim().toLowerCase();
    if (!email.includes("@")) return { error: "Valid email required." };
  }

  const { data: created, error: createError } =
    await service.auth.admin.createUser({
      email: email!,
      password,
      email_confirm: true,
      user_metadata: {
        labs_role: role,
        display_name: displayName,
        username,
      },
    });

  if (createError || !created.user) {
    return { error: createError?.message || "Could not create auth user." };
  }

  const { data: profile, error: profileError } = await service
    .from("labs_profiles")
    .insert({
      auth_user_id: created.user.id,
      display_name: displayName,
      email: kind === "reviewer" ? null : email,
      username,
      role,
      access_expires: accessExpires,
      status: "active",
      can_download: canDownload,
      can_post: canPost,
      invitation_status: kind === "reviewer" ? "accepted" : "invited",
    })
    .select("*")
    .single();

  if (profileError || !profile) {
    await service.auth.admin.deleteUser(created.user.id);
    return { error: profileError?.message || "Could not create profile." };
  }

  if (username) {
    const { error: mapError } = await service.from("labs_reviewer_map").insert({
      username,
      auth_user_id: created.user.id,
    });
    if (mapError) {
      await service.from("labs_profiles").delete().eq("id", profile.id);
      await service.auth.admin.deleteUser(created.user.id);
      return { error: mapError.message };
    }
  }

  await writeAudit({
    actorId: admin.id,
    eventType: "invite",
    targetType: "profile",
    targetId: profile.id,
    metadata: { role, username, email: profile.email },
  });

  revalidatePath("/labs/admin");
  return {
    ok:
      kind === "reviewer"
        ? `Reviewer created. Username: ${username}`
        : `Member created for ${email}`,
  };
}

export async function updateAccessAction(
  _prev: AdminState,
  formData: FormData
): Promise<AdminState> {
  const admin = await requireAdminProfile();
  if (!admin) return { error: "Admin only." };

  const profileId = String(formData.get("profileId") || "");
  const action = String(formData.get("action") || "");
  if (!profileId || !action) return { error: "Missing fields." };

  const service = createServiceClient();
  const patch: Record<string, unknown> = {};

  if (action === "revoke") {
    patch.status = "revoked";
  } else if (action === "activate") {
    patch.status = "active";
  } else if (action === "extend") {
    const preset = String(formData.get("expiryPreset") || "3m");
    const customDate = String(formData.get("customDate") || "");
    patch.access_expires = computeExpiry(preset, customDate || null);
    patch.status = "active";
  } else {
    return { error: "Unknown action." };
  }

  const { error } = await service
    .from("labs_profiles")
    .update(patch)
    .eq("id", profileId);

  if (error) return { error: error.message };

  await writeAudit({
    actorId: admin.id,
    eventType: action,
    targetType: "profile",
    targetId: profileId,
    metadata: patch,
  });

  revalidatePath("/labs/admin");
  return { ok: "Updated." };
}

export async function publishReleaseAction(
  _prev: AdminState,
  formData: FormData
): Promise<AdminState> {
  const admin = await requireAdminProfile();
  if (!admin) return { error: "Admin only." };

  const version = String(formData.get("version") || "").trim();
  const device = String(formData.get("device") || "Pixel 6a").trim();
  const summary = String(formData.get("summary") || "").trim();
  const notes = String(formData.get("notes") || "").trim();
  const knownIssues = String(formData.get("knownIssues") || "").trim();
  const installNotes = String(formData.get("installNotes") || "").trim();
  const markLatest = formData.get("isLatest") === "on";
  const file = formData.get("zip") as File | null;

  if (!version) return { error: "Version is required." };
  if (!file || file.size === 0) return { error: "ZIP file is required." };

  const buffer = Buffer.from(await file.arrayBuffer());
  const sha256 = createHash("sha256").update(buffer).digest("hex");
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `releases/${version}-${randomBytes(4).toString("hex")}-${safeName}`;

  const service = createServiceClient();
  const { error: uploadError } = await service.storage
    .from("labs-releases")
    .upload(storagePath, buffer, {
      contentType: file.type || "application/zip",
      upsert: false,
    });

  if (uploadError) {
    return { error: uploadError.message };
  }

  if (markLatest) {
    await service
      .from("labs_releases")
      .update({ is_latest: false })
      .eq("is_latest", true);
  }

  const { data: release, error } = await service
    .from("labs_releases")
    .insert({
      version,
      device,
      summary: summary || null,
      notes: notes || null,
      known_issues: knownIssues || null,
      install_notes: installNotes || null,
      filename: safeName,
      storage_path: storagePath,
      size_bytes: buffer.length,
      sha256,
      download_enabled: true,
      is_latest: markLatest,
      created_by: admin.id,
      status: "available",
      channel: "labs",
    })
    .select("*")
    .single();

  if (error || !release) {
    await service.storage.from("labs-releases").remove([storagePath]);
    return { error: error?.message || "Could not save release." };
  }

  await writeAudit({
    actorId: admin.id,
    eventType: "release_publish",
    targetType: "release",
    targetId: release.id,
    metadata: { version, sha256, size_bytes: buffer.length },
  });

  revalidatePath("/labs/admin");
  revalidatePath("/labs");
  revalidatePath("/labs/releases");
  return { ok: `Published ${version}.` };
}

export async function addEvidenceAction(
  _prev: AdminState,
  formData: FormData
): Promise<AdminState> {
  const admin = await requireAdminProfile();
  if (!admin) return { error: "Admin only." };

  const title = String(formData.get("title") || "").trim();
  const caption = String(formData.get("caption") || "").trim();
  const mediaUrl = String(formData.get("mediaUrl") || "").trim();
  const mediaType = String(formData.get("mediaType") || "screenshot");

  if (!title) return { error: "Title required." };

  const service = createServiceClient();
  const { error } = await service.from("labs_evidence").insert({
    title,
    caption: caption || null,
    media_url: mediaUrl || null,
    media_type: mediaType,
  });

  if (error) return { error: error.message };

  revalidatePath("/labs/admin");
  revalidatePath("/labs");
  return { ok: "Evidence added." };
}

export async function bootstrapAdminAction(
  _prev: AdminState,
  formData: FormData
): Promise<AdminState> {
  // One-time bootstrap when no admins exist yet. Uses service role + shared secret.
  const bootstrapSecret = String(formData.get("bootstrapSecret") || "");
  const expected = process.env.LABS_SESSION_SECRET || "";
  if (!expected || bootstrapSecret !== expected) {
    return { error: "Invalid bootstrap secret." };
  }

  const service = createServiceClient();
  const { count } = await service
    .from("labs_profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin");

  if ((count || 0) > 0) {
    return { error: "An admin already exists. Use the admin UI." };
  }

  const displayName = String(formData.get("displayName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!displayName || !email.includes("@") || password.length < 8) {
    return { error: "Name, email, and password (8+) required." };
  }

  const { data: created, error: createError } =
    await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { labs_role: "admin", display_name: displayName },
    });

  if (createError || !created.user) {
    return { error: createError?.message || "Could not create admin." };
  }

  const { error: profileError } = await service.from("labs_profiles").insert({
    auth_user_id: created.user.id,
    display_name: displayName,
    email,
    role: "admin",
    status: "active",
    can_download: true,
    can_post: true,
    invitation_status: "accepted",
    access_expires: null,
  });

  if (profileError) {
    await service.auth.admin.deleteUser(created.user.id);
    return { error: profileError.message };
  }

  return { ok: "Admin created. Sign in at /labs/login." };
}
