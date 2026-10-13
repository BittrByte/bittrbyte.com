import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { requireAdminProfile } from "@/lib/labs/access";
import { createR2UploadUrl, getR2Config } from "@/lib/r2";

export const runtime = "nodejs";

/**
 * Admin-only: proves Netlify R2 env vars can sign + upload.
 * Browser uploads hide real R2 errors behind a fake CORS/network failure
 * when R2 omits Access-Control-Allow-Origin on 4xx/5xx responses.
 */
export async function GET() {
  const admin = await requireAdminProfile();
  if (!admin) {
    return NextResponse.json({ error: "Admin only." }, { status: 401 });
  }

  try {
    const cfg = getR2Config();
    const key = `debug/health-${Date.now()}-${randomBytes(3).toString("hex")}.bin`;
    const { uploadUrl } = await createR2UploadUrl({
      key,
      contentType: "application/octet-stream",
      expiresInSeconds: 300,
    });
    const u = new URL(uploadUrl);
    const hasChecksum =
      u.searchParams.has("x-amz-checksum-crc32") ||
      u.searchParams.has("x-amz-sdk-checksum-algorithm");

    const put = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/octet-stream" },
      body: Buffer.from(`r2-health-${Date.now()}`),
    });
    const putBody = (await put.text()).slice(0, 240);

    return NextResponse.json({
      ok: put.ok && !hasChecksum,
      putStatus: put.status,
      putBody,
      hasChecksum,
      host: u.host,
      bucket: cfg.bucket,
      endpointHost: new URL(cfg.endpoint).host,
      signedHeaders: u.searchParams.get("X-Amz-SignedHeaders"),
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "R2 health check failed.",
      },
      { status: 500 }
    );
  }
}
