-- SKYWALL Labs schema, RLS, private storage bucket

create extension if not exists "pgcrypto";

create type public.labs_role as enum ('reviewer', 'member', 'admin');
create type public.labs_status as enum ('active', 'expired', 'revoked');
create type public.labs_invite_status as enum ('none', 'invited', 'accepted');

create table public.labs_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users (id) on delete cascade,
  display_name text not null,
  email text,
  username text unique,
  role public.labs_role not null default 'member',
  access_start timestamptz not null default now(),
  access_expires timestamptz,
  status public.labs_status not null default 'active',
  can_download boolean not null default true,
  can_post boolean not null default true,
  last_login_at timestamptz,
  invitation_status public.labs_invite_status not null default 'none',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.labs_reviewer_map (
  username text primary key,
  auth_user_id uuid not null unique references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.labs_releases (
  id uuid primary key default gen_random_uuid(),
  version text not null,
  released_at timestamptz not null default now(),
  device text not null default 'Pixel 6a',
  channel text not null default 'labs',
  status text not null default 'available',
  filename text,
  storage_path text,
  size_bytes bigint,
  sha256 text,
  summary text,
  notes text,
  known_issues text,
  install_notes text,
  download_enabled boolean not null default true,
  is_latest boolean not null default false,
  created_by uuid references public.labs_profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.labs_evidence (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  caption text,
  media_type text not null default 'screenshot',
  media_url text,
  storage_path text,
  sort_order int not null default 0,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.labs_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.labs_profiles (id) on delete cascade,
  body text not null,
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.labs_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.labs_posts (id) on delete cascade,
  author_id uuid not null references public.labs_profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.labs_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.labs_profiles (id) on delete set null,
  event_type text not null,
  target_type text,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index labs_profiles_status_idx on public.labs_profiles (status);
create index labs_releases_latest_idx on public.labs_releases (is_latest);
create index labs_posts_created_idx on public.labs_posts (created_at desc);
create index labs_audit_created_idx on public.labs_audit_events (created_at desc);

create or replace function public.labs_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger labs_profiles_updated_at
  before update on public.labs_profiles
  for each row execute function public.labs_set_updated_at();

create trigger labs_releases_updated_at
  before update on public.labs_releases
  for each row execute function public.labs_set_updated_at();

create trigger labs_posts_updated_at
  before update on public.labs_posts
  for each row execute function public.labs_set_updated_at();

create or replace function public.labs_is_active_member(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.labs_profiles p
    where p.auth_user_id = uid
      and p.status = 'active'
      and (p.access_expires is null or p.access_expires > now())
  );
$$;

create or replace function public.labs_is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.labs_profiles p
    where p.auth_user_id = uid
      and p.role = 'admin'
      and p.status = 'active'
      and (p.access_expires is null or p.access_expires > now())
  );
$$;

alter table public.labs_profiles enable row level security;
alter table public.labs_reviewer_map enable row level security;
alter table public.labs_releases enable row level security;
alter table public.labs_evidence enable row level security;
alter table public.labs_posts enable row level security;
alter table public.labs_comments enable row level security;
alter table public.labs_audit_events enable row level security;

-- reviewer_map: no client access (service role only)
create policy labs_reviewer_map_deny_all on public.labs_reviewer_map
  for all using (false) with check (false);

create policy labs_profiles_select_self_or_admin on public.labs_profiles
  for select using (
    auth.uid() = auth_user_id
    or public.labs_is_admin(auth.uid())
  );

create policy labs_profiles_update_self on public.labs_profiles
  for update using (
    auth.uid() = auth_user_id
    or public.labs_is_admin(auth.uid())
  );

create policy labs_releases_select_active on public.labs_releases
  for select using (public.labs_is_active_member(auth.uid()));

create policy labs_releases_admin_all on public.labs_releases
  for all using (public.labs_is_admin(auth.uid()))
  with check (public.labs_is_admin(auth.uid()));

create policy labs_evidence_select_active on public.labs_evidence
  for select using (public.labs_is_active_member(auth.uid()));

create policy labs_evidence_admin_all on public.labs_evidence
  for all using (public.labs_is_admin(auth.uid()))
  with check (public.labs_is_admin(auth.uid()));

create policy labs_posts_select_active on public.labs_posts
  for select using (public.labs_is_active_member(auth.uid()));

create policy labs_posts_insert_active on public.labs_posts
  for insert with check (
    public.labs_is_active_member(auth.uid())
    and exists (
      select 1 from public.labs_profiles p
      where p.auth_user_id = auth.uid()
        and p.can_post = true
        and p.id = author_id
    )
  );

create policy labs_posts_admin_all on public.labs_posts
  for all using (public.labs_is_admin(auth.uid()))
  with check (public.labs_is_admin(auth.uid()));

create policy labs_comments_select_active on public.labs_comments
  for select using (public.labs_is_active_member(auth.uid()));

create policy labs_comments_insert_active on public.labs_comments
  for insert with check (
    public.labs_is_active_member(auth.uid())
    and exists (
      select 1 from public.labs_profiles p
      where p.auth_user_id = auth.uid()
        and p.can_post = true
        and p.id = author_id
    )
  );

create policy labs_comments_admin_all on public.labs_comments
  for all using (public.labs_is_admin(auth.uid()))
  with check (public.labs_is_admin(auth.uid()));

create policy labs_audit_admin_select on public.labs_audit_events
  for select using (public.labs_is_admin(auth.uid()));

-- Private bucket is also created by: npm run labs:ensure-storage
insert into storage.buckets (id, name, public)
values ('labs-releases', 'labs-releases', false)
on conflict (id) do nothing;

create policy labs_storage_admin_read on storage.objects
  for select using (
    bucket_id = 'labs-releases'
    and public.labs_is_admin(auth.uid())
  );

create policy labs_storage_admin_write on storage.objects
  for insert with check (
    bucket_id = 'labs-releases'
    and public.labs_is_admin(auth.uid())
  );

create policy labs_storage_admin_update on storage.objects
  for update using (
    bucket_id = 'labs-releases'
    and public.labs_is_admin(auth.uid())
  );

create policy labs_storage_admin_delete on storage.objects
  for delete using (
    bucket_id = 'labs-releases'
    and public.labs_is_admin(auth.uid())
  );
