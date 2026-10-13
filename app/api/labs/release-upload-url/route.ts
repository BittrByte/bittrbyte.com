import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { requireAdminProfile } from "@/lib/labs/access";
import { createR2MultipartUpload, createR2UploadUrl } from "@/lib/r2";

export const runtime = "nodejs";

/** Single PUT is fine for small files; big OS ZIPs use multipart. */
const MULTIPART_THRESHOLD_BYTES = 8 * 1024 * 1024;
/** Keep parts modest — large single XHR PUTs often die as fake “network” errors. */
const PART_SIZE_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request) {
  const admin = await requireAdminProfile();
  if (!admin) {
    return NextResponse.json({ error: "Admin only." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const version = String(body.version || "").trim();
  const filename = String(body.filename || "").trim();
  const contentType = String(
    body.contentType || "application/octet-stream"
  ).trim();
  const sizeBytes = Number(body.sizeBytes || 0);

  if (!version || !filename) {
    return NextResponse.json(
      { error: "Version and filename are required." },
      { status: 400 }
    );
  }

  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `releases/${version}-${randomBytes(4).toString("hex")}-${safeName}`;

  try {
    if (sizeBytes >= MULTIPART_THRESHOLD_BYTES) {
      const { uploadId, key } = await createR2MultipartUpload({
        key: storagePath,
        contentType: contentType || "application/octet-stream",
      });
      return NextResponse.json({
        mode: "multipart",
        path: key,
        uploadId,
        partSize: PART_SIZE_BYTES,
        filename: safeName,
        contentType: contentType || "application/octet-stream",
        backend: "r2",
      });
    }

    const { uploadUrl, key } = await createR2UploadUrl({
      key: storagePath,
      contentType: contentType || "application/octet-stream",
      expiresInSeconds: 60 * 60,
    });

    return NextResponse.json({
      mode: "single",
      path: key,
      uploadUrl,
      filename: safeName,
      contentType: contentType || "application/octet-stream",
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
