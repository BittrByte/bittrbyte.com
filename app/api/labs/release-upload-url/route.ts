import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { requireAdminProfile } from "@/lib/labs/access";
import { createR2UploadUrl } from "@/lib/r2";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const admin = await requireAdminProfile();
  if (!admin) {
    return NextResponse.json({ error: "Admin only." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const version = String(body.version || "").trim();
  const filename = String(body.filename || "").trim();
  const contentType = String(body.contentType || "application/zip").trim();

  if (!version || !filename) {
    return NextResponse.json(
      { error: "Version and filename are required." },
      { status: 400 }
    );
  }

  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `releases/${version}-${randomBytes(4).toString("hex")}-${safeName}`;

  try {
    const { uploadUrl, key } = await createR2UploadUrl({
      key: storagePath,
      contentType: contentType || "application/zip",
      expiresInSeconds: 60 * 60,
    });

    return NextResponse.json({
      path: key,
      uploadUrl,
      filename: safeName,
      contentType: contentType || "application/zip",
      backend: "r2",
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Could not create upload URL.",
      },
      { status: 500 }
    );
  }
}
