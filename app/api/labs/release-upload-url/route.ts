import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { requireAdminProfile } from "@/lib/labs/access";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const admin = await requireAdminProfile();
  if (!admin) {
    return NextResponse.json({ error: "Admin only." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const version = String(body.version || "").trim();
  const filename = String(body.filename || "").trim();

  if (!version || !filename) {
    return NextResponse.json(
      { error: "Version and filename are required." },
      { status: 400 }
    );
  }

  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `releases/${version}-${randomBytes(4).toString("hex")}-${safeName}`;
  const service = createServiceClient();

  // Best-effort raise bucket cap (project-level Storage limit may still apply).
  await service.storage
    .updateBucket("labs-releases", {
      public: false,
      fileSizeLimit: "2147483648",
    })
    .catch(() => undefined);

  const { data, error } = await service.storage
    .from("labs-releases")
    .createSignedUploadUrl(storagePath);

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || "Could not create upload URL." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    path: data.path,
    token: data.token,
    signedUrl: data.signedUrl,
    filename: safeName,
  });
}
