/**
 * Publish a large Labs release ZIP from this Mac (bypasses the browser).
 *
 * Writes the same R2 object path + labs_releases row + audit event as the
 * Admin portal Publish form, so members download through the existing site flow.
 *
 * Usage:
 *   node scripts/publish-release.mjs \
 *     --file "/path/to/package.zip" \
 *     --version 0.1-bluejay \
 *     --latest
 */
import { createHash, randomBytes } from "crypto";
import { createReadStream, statSync, readFileSync, existsSync } from "fs";
import { basename, resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (!m) continue;
      const key = m[1].trim();
      let value = m[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] ||= value;
    }
  } catch {
    // ignore — env may already be set
  }
}

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(`Missing ${name} (set in .env.local)`);
    process.exit(1);
  }
  return value;
}

function parseArgs(argv) {
  const out = {
    file: null,
    version: null,
    device: "Pixel 6a",
    summary: "",
    notes: "",
    knownIssues: "",
    installNotes: "",
    latest: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === "--file") {
      out.file = next;
      i++;
    } else if (arg === "--version") {
      out.version = next;
      i++;
    } else if (arg === "--device") {
      out.device = next;
      i++;
    } else if (arg === "--summary") {
      out.summary = next;
      i++;
    } else if (arg === "--notes") {
      out.notes = next;
      i++;
    } else if (arg === "--known-issues") {
      out.knownIssues = next;
      i++;
    } else if (arg === "--install-notes") {
      out.installNotes = next;
      i++;
    } else if (arg === "--latest") {
      out.latest = true;
    } else if (arg === "--help" || arg === "-h") {
      out.help = true;
    }
  }
  return out;
}

function printHelp() {
  console.log(`Publish a Labs release ZIP from this Mac (same result as Admin portal).

Required:
  --file <path>       Path to the ZIP
  --version <label>   Version string (e.g. 0.1-bluejay)

Optional:
  --device <name>     Default: Pixel 6a
  --summary <text>
  --notes <text>
  --known-issues <text>
  --install-notes <text>
  --latest            Mark this release as latest

Example:
  node scripts/publish-release.mjs \\
    --file "/Users/admin/Desktop/SkywallX/releases/skywall-os-0.1-bluejay.zip" \\
    --version 0.1-bluejay --latest
`);
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

async function hashFileSha256(filePath, sizeBytes) {
  const hash = createHash("sha256");
  const stream = createReadStream(filePath);
  let done = 0;
  let lastPct = -1;
  for await (const chunk of stream) {
    hash.update(chunk);
    done += chunk.length;
    const pct = Math.min(99, Math.round((done / sizeBytes) * 100));
    if (pct !== lastPct && pct % 5 === 0) {
      lastPct = pct;
      process.stdout.write(`\rHashing… ${pct}%`);
    }
  }
  process.stdout.write("\rHashing… 100%\n");
  return hash.digest("hex");
}

loadEnvLocal();

const args = parseArgs(process.argv.slice(2));
if (args.help || !args.file || !args.version) {
  printHelp();
  process.exit(args.help ? 0 : 1);
}

const filePath = resolve(args.file);
if (!existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

const version = String(args.version).trim();
const device = String(args.device || "Pixel 6a").trim();
const filename = basename(filePath).replace(/[^a-zA-Z0-9._-]/g, "_");
const sizeBytes = statSync(filePath).size;
if (!sizeBytes) {
  console.error("File is empty.");
  process.exit(1);
}

const accountId = requireEnv("R2_ACCOUNT_ID");
const accessKeyId = requireEnv("R2_ACCESS_KEY_ID");
const secretAccessKey = requireEnv("R2_SECRET_ACCESS_KEY");
const bucket = process.env.R2_BUCKET?.trim() || "skywall-labs-releases";
const endpoint =
  process.env.R2_ENDPOINT?.trim() ||
  `https://${accountId}.r2.cloudflarestorage.com`;
const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
const serviceRole = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

const storagePath = `releases/${version}-${randomBytes(4).toString("hex")}-${filename}`;

console.log("Publish Labs release (Mac → R2 + Supabase)");
console.log(`  file:    ${filePath}`);
console.log(`  size:    ${formatBytes(sizeBytes)}`);
console.log(`  version: ${version}`);
console.log(`  device:  ${device}`);
console.log(`  latest:  ${args.latest}`);
console.log(`  r2 key:  ${storagePath}`);
console.log(`  bucket:  ${bucket}`);

const sha256 = await hashFileSha256(filePath, sizeBytes);
console.log(`  sha256:  ${sha256}`);

const s3 = new S3Client({
  region: "auto",
  endpoint,
  credentials: { accessKeyId, secretAccessKey },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

console.log("Uploading to Cloudflare R2…");
const upload = new Upload({
  client: s3,
  params: {
    Bucket: bucket,
    Key: storagePath,
    Body: createReadStream(filePath),
    ContentType: "application/octet-stream",
  },
  queueSize: 4,
  partSize: 16 * 1024 * 1024,
  leavePartsOnError: false,
});

let lastUploadPct = -1;
upload.on("httpUploadProgress", (progress) => {
  if (!progress.total) return;
  const pct = Math.min(99, Math.round((progress.loaded / progress.total) * 100));
  if (pct !== lastUploadPct && (pct % 2 === 0 || pct >= 99)) {
    lastUploadPct = pct;
    process.stdout.write(
      `\rUploading… ${pct}% (${formatBytes(progress.loaded)} / ${formatBytes(progress.total)})`
    );
  }
});

try {
  await upload.done();
  process.stdout.write("\rUploading… 100%\n");
} catch (err) {
  console.error("\nR2 upload failed:", err?.message || err);
  process.exit(1);
}

const head = await s3.send(
  new HeadObjectCommand({ Bucket: bucket, Key: storagePath })
);
const remoteSize = Number(head.ContentLength || 0);
if (remoteSize !== sizeBytes) {
  console.error(
    `Size mismatch after upload: local=${sizeBytes} remote=${remoteSize}`
  );
  process.exit(1);
}
console.log(`Verified R2 object size: ${formatBytes(remoteSize)}`);

const supabase = createClient(supabaseUrl, serviceRole, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: admin, error: adminError } = await supabase
  .from("labs_profiles")
  .select("id, display_name, role, status")
  .eq("role", "admin")
  .eq("status", "active")
  .order("created_at", { ascending: true })
  .limit(1)
  .maybeSingle();

if (adminError || !admin) {
  console.error(
    "Could not find an active admin profile:",
    adminError?.message || "none"
  );
  process.exit(1);
}
console.log(`Admin actor: ${admin.display_name || admin.id}`);

if (args.latest) {
  const { error: clearError } = await supabase
    .from("labs_releases")
    .update({ is_latest: false })
    .eq("is_latest", true);
  if (clearError) {
    console.error("Could not clear previous latest:", clearError.message);
    process.exit(1);
  }
}

const { data: release, error: insertError } = await supabase
  .from("labs_releases")
  .insert({
    version,
    device,
    summary: args.summary || null,
    notes: args.notes || null,
    known_issues: args.knownIssues || null,
    install_notes: args.installNotes || null,
    filename,
    storage_path: storagePath,
    size_bytes: sizeBytes,
    sha256,
    download_enabled: true,
    is_latest: Boolean(args.latest),
    created_by: admin.id,
    status: "available",
    channel: "labs",
  })
  .select("*")
  .single();

if (insertError || !release) {
  console.error(
    "Could not insert labs_releases row:",
    insertError?.message || "unknown"
  );
  console.error(
    "The ZIP is already in R2 at:",
    storagePath,
    "(you can finalize manually if needed)"
  );
  process.exit(1);
}

const { error: auditError } = await supabase.from("labs_audit_events").insert({
  actor_id: admin.id,
  event_type: "release_publish",
  target_type: "release",
  target_id: release.id,
  metadata: {
    version,
    sha256,
    size_bytes: sizeBytes,
    backend: "r2",
    storage_path: storagePath,
    published_via: "publish-release.mjs",
  },
});

if (auditError) {
  console.warn("Warning: audit insert failed:", auditError.message);
}

console.log("\nPublished.");
console.log(`  release id: ${release.id}`);
console.log(`  version:    ${release.version}`);
console.log(`  latest:     ${release.is_latest}`);
console.log("Check https://www.bittrbyte.com/labs/releases (signed in as admin/member).");
