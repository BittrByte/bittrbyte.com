# SKYWALL Labs portal

Private Next.js portal under `/labs/*` with Supabase Auth, Postgres, and private Storage.

## Local setup

1. Copy `.env.example` to `.env.local` and fill in Supabase URL, publishable key, and secret key.
2. **Required once:** open [Supabase SQL Editor](https://supabase.com/dashboard/project/psufiiovxogfsogfgfmw/sql/new), paste the full contents of [`supabase/migrations/001_labs.sql`](supabase/migrations/001_labs.sql), and run it. Until this runs, login/admin will fail because the tables do not exist yet.
3. `npm install`
4. `npm run labs:ensure-storage` (private ZIP bucket; safe to re-run)
5. `npm run dev`
6. Open `/labs/bootstrap` and create the first admin (bootstrap secret = `LABS_SESSION_SECRET` from `.env.local`).
7. Sign in at `/labs/login`.

## Netlify

**Required before deploy will succeed.** In Site settings → Environment variables, add all of these for Production (and usually also for Deploy Previews):

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | publishable / anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | secret / service_role key |
| `LABS_SESSION_SECRET` | same long random string as local `.env.local` |
| `NEXT_PUBLIC_SITE_URL` | `https://bittrbyte.com` |

Then trigger a new deploy. Without `SUPABASE_SERVICE_ROLE_KEY`, the build used to crash; Labs routes are now forced dynamic, but runtime login/admin still need these vars.

## Create a YC reviewer

Admin → Create user → Reviewer → username + temp password + expiry (e.g. 3 months).

They sign in with **username + password** (not email).

## Publish first ZIP

Admin → Publish release ZIP → upload package → mark latest. Members download via short-lived signed URLs only.

## Security notes

- Never commit `.env.local`.
- Rotate keys that were pasted in chat.
- Revoke expired GitHub PATs.
- Downloads are audited and expire in ~90 seconds.
