# SKYWALL Labs portal

Private Next.js portal under `/labs/*` with Supabase Auth + Postgres, and Cloudflare R2 for large private OS ZIP packages.

## Local setup

1. Copy `.env.example` to `.env.local` and fill in Supabase + R2 values.
2. **Required once:** open [Supabase SQL Editor](https://supabase.com/dashboard/project/psufiiovxogfsogfgfmw/sql/new), paste the full contents of [`supabase/migrations/001_labs.sql`](supabase/migrations/001_labs.sql), and run it.
3. `npm install`
4. `npm run dev`
5. Open `/labs/bootstrap` and create the first admin (bootstrap secret = `LABS_SESSION_SECRET` from `.env.local`) — only if no admin exists yet.
6. Sign in at `/labs/login`.

## Netlify env vars

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | publishable / anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | secret / service_role key |
| `LABS_SESSION_SECRET` | same long random string as local `.env.local` |
| `NEXT_PUBLIC_SITE_URL` | `https://bittrbyte.com` |
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 Account API token access key |
| `R2_SECRET_ACCESS_KEY` | R2 Account API token secret |
| `R2_BUCKET` | `skywall-labs-releases` |
| `R2_ENDPOINT` | `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` |

Mark R2 secret + Supabase service role as **Secret** in Netlify (Builds + Functions scopes).

Then trigger a new deploy.

## Cloudflare R2 setup

1. Create a Cloudflare account and enable R2.
2. Create a **private** bucket named `skywall-labs-releases`.
3. R2 → Manage R2 API Tokens → **Account API Tokens** → Create token with **Object Read & Write** on that bucket.
4. Copy Account ID, Access Key ID, and Secret Access Key into `.env.local` and Netlify.

Large packages (1GB+) upload **directly to R2** via short-lived signed PUT URLs. Keep the Admin tab open until hashing + upload finish.

### Required: R2 bucket CORS (browser uploads)

Without this, Admin upload fails right after hashing with “Network error”.

1. Cloudflare → **R2** → bucket `skywall-labs-releases`
2. **Settings** → **CORS Policy** → Add / Edit
3. Paste the JSON from [`scripts/r2-cors.json`](scripts/r2-cors.json) (allows PUT/GET from `www.bittrbyte.com` and localhost)
4. Save

Object Read & Write tokens cannot set CORS via API — use the dashboard.

## Create a YC reviewer

Admin → Create user → Reviewer → username + temp password + expiry (e.g. 3 months).

They sign in with **username + password** (not email).

## Publish first ZIP

1. Package the whole `releases/skywall-os-0.1-bluejay/` folder (OTA zip + boot/dtbo/vendor_boot + FLASH.md + README + SHA256SUMS), not only the Lineage zip.
2. Admin → Publish release ZIP → fill notes → choose the package → mark latest.
3. Members download via short-lived R2 signed URLs only (~90 seconds). Login/expiry/`can_download` are checked first; downloads are audited.

## Security notes

- Never commit `.env.local`.
- Rotate keys that were pasted in chat.
- Keep the R2 bucket private (not public).
- Downloads are audited and expire in ~90 seconds.
