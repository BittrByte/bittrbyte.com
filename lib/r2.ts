import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
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
    // AWS SDK v3 defaults inject empty CRC32 checksums into presigned URLs.
    // That breaks browser / R2 uploads with opaque 500 InternalError responses.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
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
    ContentType: input.contentType || "application/octet-stream",
  });
  const uploadUrl = await getSignedUrl(client, command, {
    expiresIn: input.expiresInSeconds ?? 60 * 60,
  });
  return { bucket, key: input.key, uploadUrl };
}

export async function createR2MultipartUpload(input: {
  key: string;
  contentType?: string;
}) {
  const { bucket } = getR2Config();
  const client = createR2Client();
  const out = await client.send(
    new CreateMultipartUploadCommand({
      Bucket: bucket,
      Key: input.key,
      ContentType: input.contentType || "application/octet-stream",
    })
  );
  if (!out.UploadId) {
    throw new Error("R2 did not return a multipart upload id.");
  }
  return { bucket, key: input.key, uploadId: out.UploadId };
}

export async function createR2UploadPartUrl(input: {
  key: string;
  uploadId: string;
  partNumber: number;
  expiresInSeconds?: number;
}) {
  const { bucket } = getR2Config();
  const client = createR2Client();
  const command = new UploadPartCommand({
    Bucket: bucket,
    Key: input.key,
    UploadId: input.uploadId,
    PartNumber: input.partNumber,
  });
  const uploadUrl = await getSignedUrl(client, command, {
    expiresIn: input.expiresInSeconds ?? 60 * 60,
  });
  return { bucket, key: input.key, uploadUrl };
}

export async function completeR2MultipartUpload(input: {
  key: string;
  uploadId: string;
  parts: { partNumber: number; etag: string }[];
}) {
  const { bucket } = getR2Config();
  const client = createR2Client();
  await client.send(
    new CompleteMultipartUploadCommand({
      Bucket: bucket,
      Key: input.key,
      UploadId: input.uploadId,
      MultipartUpload: {
        Parts: input.parts
          .slice()
          .sort((a, b) => a.partNumber - b.partNumber)
          .map((p) => ({
            PartNumber: p.partNumber,
            ETag: p.etag,
          })),
      },
    })
  );
  return { bucket, key: input.key };
}

export async function abortR2MultipartUpload(input: {
  key: string;
  uploadId: string;
}) {
  const { bucket } = getR2Config();
  const client = createR2Client();
  await client.send(
    new AbortMultipartUploadCommand({
      Bucket: bucket,
      Key: input.key,
      UploadId: input.uploadId,
    })
  );
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
