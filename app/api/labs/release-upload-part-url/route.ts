import { NextResponse } from "next/server";
import { requireAdminProfile } from "@/lib/labs/access";
import { createR2UploadPartUrl } from "@/lib/r2";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const admin = await requireAdminProfile();
  if (!admin) {
    return NextResponse.json({ error: "Admin only." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const path = String(body.path || "").trim();
  const uploadId = String(body.uploadId || "").trim();
  const partNumber = Number(body.partNumber || 0);

  if (!path.startsWith("releases/") || !uploadId || partNumber < 1) {
    return NextResponse.json({ error: "Invalid part request." }, { status: 400 });
  }

  try {
    const { uploadUrl } = await createR2UploadPartUrl({
      key: path,
      uploadId,
      partNumber,
      expiresInSeconds: 60 * 60,
    });
    return NextResponse.json({ uploadUrl, partNumber });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Could not create part URL.",
      },
      { status: 500 }
    );
  }
}
