import { NextResponse } from "next/server";
import {
  requireActiveProfile,
  writeAudit,
} from "@/lib/labs/access";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const profile = await requireActiveProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (!profile.can_download) {
    return NextResponse.json(
      { error: "Download not permitted for this account." },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const releaseId = String(body.releaseId || "");
  if (!releaseId) {
    return NextResponse.json({ error: "Missing release." }, { status: 400 });
  }

  const service = createServiceClient();
  const { data: release } = await service
    .from("labs_releases")
    .select("*")
    .eq("id", releaseId)
    .maybeSingle();

  if (!release || !release.download_enabled || !release.storage_path) {
    return NextResponse.json(
      { error: "Download unavailable." },
      { status: 404 }
    );
  }

  const { data: signed, error } = await service.storage
    .from("labs-releases")
    .createSignedUrl(release.storage_path, 90);

  if (error || !signed?.signedUrl) {
    return NextResponse.json(
      { error: "Could not create download link." },
      { status: 500 }
    );
  }

  await writeAudit({
    actorId: profile.id,
    eventType: "download",
    targetType: "release",
    targetId: release.id,
    metadata: { version: release.version, filename: release.filename },
  });

  return NextResponse.json({ url: signed.signedUrl });
}
