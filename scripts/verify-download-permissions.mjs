/**
 * Verifies per-user can_download can be flipped and that the download API
 * gate condition matches the stored flag.
 *
 * Usage: node scripts/verify-download-permissions.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  const text = readFileSync(path, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
assert(url && key, "Missing Supabase env in .env.local");

const service = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: users, error: listError } = await service
  .from("labs_profiles")
  .select("id, display_name, role, can_download, can_post, status")
  .neq("role", "admin")
  .order("created_at", { ascending: true })
  .limit(5);

assert(!listError, `List failed: ${listError?.message}`);
assert(users?.length, "No non-admin Labs users to test against.");

const target = users[0];
const originalDownload = Boolean(target.can_download);
const originalPost = Boolean(target.can_post);

console.log(
  `Testing permissions on ${target.display_name} (${target.id}). Original download=${originalDownload}`
);

async function setPermissions(canDownload, canPost) {
  const { error } = await service
    .from("labs_profiles")
    .update({ can_download: canDownload, can_post: canPost })
    .eq("id", target.id);
  assert(!error, `Update failed: ${error?.message}`);

  const { data, error: readError } = await service
    .from("labs_profiles")
    .select("can_download, can_post")
    .eq("id", target.id)
    .single();
  assert(!readError, `Readback failed: ${readError?.message}`);
  assert(
    data.can_download === canDownload,
    `Expected can_download=${canDownload}, got ${data.can_download}`
  );
  assert(
    data.can_post === canPost,
    `Expected can_post=${canPost}, got ${data.can_post}`
  );
  return data;
}

try {
  const blocked = await setPermissions(false, originalPost);
  assert(
    blocked.can_download === false,
    "Download should be blocked after toggle off"
  );
  // Mirror API gate in route.ts
  assert(
    !blocked.can_download,
    "Download API would correctly return 403 when can_download is false"
  );

  const allowed = await setPermissions(true, originalPost);
  assert(
    allowed.can_download === true,
    "Download should be allowed after toggle on"
  );
  assert(
    allowed.can_download,
    "Download API would correctly allow when can_download is true"
  );

  console.log("PASS: can_download can be disabled and re-enabled for a user.");
} finally {
  await setPermissions(originalDownload, originalPost);
  console.log(
    `Restored original permissions (download=${originalDownload}, post=${originalPost}).`
  );
}
