import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (!m) continue;
      process.env[m[1].trim()] ||= m[2].trim();
    }
  } catch {
    // ignore
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: buckets, error: listError } = await supabase.storage.listBuckets();
if (listError) {
  console.error("listBuckets failed:", listError.message);
  process.exit(1);
}

const exists = (buckets || []).some((b) => b.id === "labs-releases" || b.name === "labs-releases");
if (exists) {
  console.log("Bucket labs-releases already exists");
  process.exit(0);
}

const { error } = await supabase.storage.createBucket("labs-releases", {
  public: false,
});

if (error) {
  console.error("createBucket failed:", error.message);
  process.exit(1);
}

console.log("Created private bucket labs-releases");
