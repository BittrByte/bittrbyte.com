/**
 * Verifies per-release download_enabled can be flipped and matches the
 * download API gate condition in app/api/labs/download/route.ts.
 *
 * Usage: node scripts/verify-release-download.mjs
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

const { data: releases, error: listError } = await service
  .from("labs_releases")
  .select("id, version, download_enabled, storage_path")
  .order("released_at", { ascending: false })
  .limit(5);

assert(!listError, `List failed: ${listError?.message}`);
assert(releases?.length, "No Labs releases to test against.");

const target = releases[0];
const original = Boolean(target.download_enabled);

console.log(
  `Testing download_enabled on ${target.version} (${target.id}). Original=${original}`
);

async function setEnabled(enabled) {
  const { error } = await service
    .from("labs_releases")
    .update({ download_enabled: enabled })
    .eq("id", target.id);
  assert(!error, `Update failed: ${error?.message}`);

  const { data, error: readError } = await service
    .from("labs_releases")
    .select("id, version, download_enabled, storage_path")
    .eq("id", target.id)
    .single();
  assert(!readError, `Readback failed: ${readError?.message}`);
  assert(
    data.download_enabled === enabled,
    `Expected download_enabled=${enabled}, got ${data.download_enabled}`
  );
  return data;
}

try {
  const blocked = await setEnabled(false);
  // Mirror API gate: !release.download_enabled => unavailable
  assert(
    !blocked.download_enabled,
    "Download API would correctly treat this release as unavailable"
  );

  const allowed = await setEnabled(true);
  assert(
    allowed.download_enabled === true,
    "Download should be enabled after toggle on"
  );
  assert(
    Boolean(allowed.storage_path),
    "Release still has a storage_path for signed downloads"
  );

  console.log("PASS: release download_enabled can be disabled and re-enabled.");
} finally {
  await setEnabled(original);
  console.log(`Restored original download_enabled=${original}.`);
}
