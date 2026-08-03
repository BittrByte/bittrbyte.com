/**
 * Syncs reader-friendly privacy / data-flow notes onto Labs release 0.1-bluejay.
 *
 * Usage: node scripts/sync-bluejay-data-flows-notes.mjs
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

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  throw new Error("Missing Supabase env in .env.local");
}

const RELEASE_ID = "a5b60381-59bf-4863-bd5d-57b47940f198";

const summary =
  "SKYWALL OS 0.1 Bluejay Labs package. Open release details for privacy and data-flow notes.";

const notes = `Privacy & data flows — SKYWALL OS 0.1 Bluejay

This is a plain-English summary of what can leave the phone in this Labs build, and what stays on-device. Last checked against the shipping app code: 31 July 2026.


What leaves the phone

• AI chat drafting — When you use AI chat to create or edit a commitment, your chat text, recent conversation, timezone, installed app names, and the commitment being edited are sent to BittrByte’s proxy, which forwards a scrubbed version to Google Gemini. Exact map pin coordinates are not sent. If the proxy is unreachable, drafting can fall back to on-device and nothing is sent for that turn.

• Website classification — If a website filter is active and the on-device list does not know a domain, only that domain name (for example example.com) is sent to the proxy for classification. Page content and full browsing history are not sent. Answers are cached on the phone.

• Proxy health ping — When the app opens or boots, it may send an empty health check to the proxy (at most about once every five minutes). No chat, commitments, location, or screenshots are included. The host can still see ordinary connection details such as IP address.

• Indoor location fallback — Only when a place rule needs a fix, GPS is weak, and an Unwired Labs token was built into the app: nearby Wi‑Fi network IDs and signal strengths may be sent to Unwired Labs. Continuous GPS tracking and commitment contents are not sent. If no token is configured, this path does nothing.

• Map place search — When you search for a place or postcode, the search text is sent to OpenStreetMap Nominatim.

• Map tiles — Opening the map loads map images from CARTO / OpenStreetMap. That can reveal an approximate area, like any map website. Commitment contents and chat text are not sent with tile requests.

• DNS for website filtering — When the website filter / internet gate is active, allowed DNS lookups are forwarded to Cloudflare (1.1.1.1). Blocked domains are answered on the phone and never reach upstream.


What stays on the phone

• Commitments and policies — Stored only in app-private storage on the device.

• Chat transcripts after a commitment is enacted — Kept in local files on the device.

• Exact geofence pin coordinates — Kept inside the local policy on the device.

• Tripwire screenshots — Scored in memory and discarded; not uploaded.

• Website category lists and AI domain-category cache — Bundled or cached on the device.

• No SKYWALL analytics or usage-reporting SDK phones home about addiction or behaviour. The proxy processes a request and returns a draft; it does not keep a chat database.


What we cannot prove from this code alone

• Whether Google Gemini retains or trains on prompts depends on Google’s account settings and terms — not something this inventory can prove.

• Whether the hosting platform logs full request bodies depends on that host’s configuration.

• Unwired Labs retention / DPA details live in their contracts, not in this app source.

• Claims such as “nothing you type leaves the phone” are only true when the AI proxy is not configured. This Labs build uses the proxy when AI chat is used.


This is not a formal privacy policy or legal notice. It covers the SKYWALL app and AI proxy that ship with this OS Labs package, not every Android or carrier service on the device.`;

const service = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await service
  .from("labs_releases")
  .update({ summary, notes })
  .eq("id", RELEASE_ID)
  .eq("version", "0.1-bluejay")
  .select("id, version, summary, notes")
  .single();

if (error) {
  console.error(error);
  process.exit(1);
}

console.log(`Updated ${data.version} (${data.id})`);
console.log(`Summary: ${data.summary}`);
console.log(`Notes length: ${data.notes?.length ?? 0} chars`);
