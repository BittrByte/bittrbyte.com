import { NextResponse } from "next/server";
import { requireAdminProfile } from "@/lib/labs/access";
import { abortR2MultipartUpload, completeR2MultipartUpload } from "@/lib/r2";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const admin = await requireAdminProfile();
  if (!admin) {
    return NextResponse.json({ error: "Admin only." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const path = String(body.path || "").trim();
  const uploadId = String(body.uploadId || "").trim();
  const abort = Boolean(body.abort);
  const parts = Array.isArray(body.parts) ? body.parts : [];

  if (!path.startsWith("releases/") || !uploadId) {
    return NextResponse.json({ error: "Invalid complete request." }, { status: 400 });
  }

  try {
    if (abort) {
      await abortR2MultipartUpload({ key: path, uploadId });
      return NextResponse.json({ ok: true, aborted: true });
    }

    const normalized = (parts as { partNumber?: number; etag?: string }[])
      .map((p) => ({
        partNumber: Number(p.partNumber || 0),
        etag: String(p.etag || "").trim(),
      }))
      .filter((p) => p.partNumber >= 1 && p.etag);

    if (normalized.length === 0) {
      return NextResponse.json({ error: "No parts to complete." }, { status: 400 });
    }

    await completeR2MultipartUpload({
      key: path,
      uploadId,
      parts: normalized,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Could not complete upload.",
      },
      { status: 500 }
    );
  }
}
