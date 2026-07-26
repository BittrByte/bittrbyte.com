import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminProfile, writeAudit } from "@/lib/labs/access";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const admin = await requireAdminProfile();
  if (!admin) {
    return NextResponse.json({ error: "Admin only." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const version = String(body.version || "").trim();
  const device = String(body.device || "Pixel 6a").trim();
  const summary = String(body.summary || "").trim();
  const notes = String(body.notes || "").trim();
  const knownIssues = String(body.knownIssues || "").trim();
  const installNotes = String(body.installNotes || "").trim();
  const markLatest = Boolean(body.isLatest);
  const storagePath = String(body.storagePath || "").trim();
  const filename = String(body.filename || "").trim();
  const sizeBytes = Number(body.sizeBytes || 0);
  const sha256 = String(body.sha256 || "").trim().toLowerCase();

  if (!version || !storagePath || !filename || !sizeBytes) {
    return NextResponse.json(
      { error: "Missing release metadata." },
      { status: 400 }
    );
  }

  const service = createServiceClient();

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
      filename,
      storage_path: storagePath,
      size_bytes: sizeBytes,
      sha256: sha256 || null,
      download_enabled: true,
      is_latest: markLatest,
      created_by: admin.id,
      status: "available",
      channel: "labs",
    })
    .select("*")
    .single();

  if (error || !release) {
    return NextResponse.json(
      { error: error?.message || "Could not save release." },
      { status: 500 }
    );
  }

  await writeAudit({
    actorId: admin.id,
    eventType: "release_publish",
    targetType: "release",
    targetId: release.id,
    metadata: { version, sha256, size_bytes: sizeBytes },
  });

  revalidatePath("/labs/admin");
  revalidatePath("/labs");
  revalidatePath("/labs/releases");

  return NextResponse.json({ ok: true, id: release.id, version });
}
