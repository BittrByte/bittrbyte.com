import type { LabsProfile } from "@/lib/types";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export function isAccessValid(profile: LabsProfile | null | undefined): boolean {
  if (!profile) return false;
  if (profile.status !== "active") return false;
  if (profile.access_expires) {
    const expires = new Date(profile.access_expires).getTime();
    if (Number.isFinite(expires) && expires <= Date.now()) return false;
  }
  return true;
}

export async function getSessionProfile(): Promise<{
  userId: string | null;
  profile: LabsProfile | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { userId: null, profile: null };
  }

  const service = createServiceClient();
  const { data: profile } = await service
    .from("labs_profiles")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (profile && profile.status === "active" && profile.access_expires) {
    const expires = new Date(profile.access_expires).getTime();
    if (Number.isFinite(expires) && expires <= Date.now()) {
      await service
        .from("labs_profiles")
        .update({ status: "expired" })
        .eq("id", profile.id);
      return {
        userId: user.id,
        profile: { ...profile, status: "expired" } as LabsProfile,
      };
    }
  }

  return { userId: user.id, profile: (profile as LabsProfile | null) ?? null };
}

export async function requireActiveProfile() {
  const { userId, profile } = await getSessionProfile();
  if (!userId || !isAccessValid(profile)) {
    return null;
  }
  return profile!;
}

export async function requireAdminProfile() {
  const profile = await requireActiveProfile();
  if (!profile || profile.role !== "admin") return null;
  return profile;
}

export async function writeAudit(input: {
  actorId?: string | null;
  eventType: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}) {
  const service = createServiceClient();
  await service.from("labs_audit_events").insert({
    actor_id: input.actorId ?? null,
    event_type: input.eventType,
    target_type: input.targetType ?? null,
    target_id: input.targetId ?? null,
    metadata: input.metadata ?? {},
  });
}

export function computeExpiry(
  preset: string,
  customDate?: string | null
): string | null {
  if (preset === "indefinite") return null;
  if (preset === "custom" && customDate) {
    const d = new Date(customDate);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  const now = new Date();
  if (preset === "30d") {
    now.setDate(now.getDate() + 30);
    return now.toISOString();
  }
  if (preset === "3m") {
    now.setMonth(now.getMonth() + 3);
    return now.toISOString();
  }
  if (preset === "6m") {
    now.setMonth(now.getMonth() + 6);
    return now.toISOString();
  }
  return null;
}

export function reviewerInternalEmail(username: string) {
  const safe = username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
  return `${safe}@reviewers.labs.bittrbyte.internal`;
}
