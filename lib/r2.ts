import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

export function getR2Config() {
  const accountId = requireEnv("R2_ACCOUNT_ID");
  const accessKeyId = requireEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = requireEnv("R2_SECRET_ACCESS_KEY");
  const bucket = process.env.R2_BUCKET?.trim() || "skywall-labs-releases";
  const endpoint =
    process.env.R2_ENDPOINT?.trim() ||
    `https://${accountId}.r2.cloudflarestorage.com`;

  return { accountId, accessKeyId, secretAccessKey, bucket, endpoint };
}

export function createR2Client() {
  const { accessKeyId, secretAccessKey, endpoint } = getR2Config();
  return new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export async function createR2UploadUrl(input: {
  key: string;
  contentType?: string;
  expiresInSeconds?: number;
}) {
  const { bucket } = getR2Config();
  const client = createR2Client();
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: input.key,
    ContentType: input.contentType || "application/zip",
  });
  const uploadUrl = await getSignedUrl(client, command, {
    expiresIn: input.expiresInSeconds ?? 60 * 60,
  });
  return { bucket, key: input.key, uploadUrl };
}

export async function createR2DownloadUrl(input: {
  key: string;
  filename?: string | null;
  expiresInSeconds?: number;
}) {
  const { bucket } = getR2Config();
  const client = createR2Client();
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: input.key,
    ResponseContentDisposition: input.filename
      ? `attachment; filename="${input.filename.replace(/"/g, "")}"`
      : undefined,
  });
  const downloadUrl = await getSignedUrl(client, command, {
    expiresIn: input.expiresInSeconds ?? 90,
  });
  return { bucket, key: input.key, downloadUrl };
}
