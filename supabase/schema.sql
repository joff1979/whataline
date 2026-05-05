-- ───────────────────────────────────────────────────────────────────────────
-- whataline.com — Supabase schema
-- Run this once in the Supabase SQL Editor (Project → SQL Editor → New query)
-- ───────────────────────────────────────────────────────────────────────────

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. TABLES
-- ═══════════════════════════════════════════════════════════════════════════

-- Writing projects (scripts, screenplays)
create table writing_projects (
  id            bigserial primary key,
  title         text not null,
  logline       text not null default '',
  poster_url    text,
  genre         text,
  format        text,
  script_url    text,
  status        text not null default 'draft' check (status in ('draft', 'published')),
  featured      boolean not null default false,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Film projects (directorial work)
create table film_projects (
  id            bigserial primary key,
  title         text not null,
  logline       text not null default '',
  poster_url    text,
  genre         text,
  format        text,
  year          int,
  trailer_url   text,
  film_url      text,
  status        text not null default 'draft' check (status in ('draft', 'published')),
  featured      boolean not null default false,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Awards / accolades (polymorphic — belongs to one writing OR one film project)
create table awards (
  id                  bigserial primary key,
  name                text not null,
  category            text,                                -- aka "Festival"
  year                int,
  writing_project_id  bigint references writing_projects(id) on delete cascade,
  film_project_id     bigint references film_projects(id)    on delete cascade,
  -- Exactly one parent must be set
  constraint awards_one_parent
    check ((writing_project_id is not null)::int + (film_project_id is not null)::int = 1)
);

create index awards_writing_project_id_idx on awards(writing_project_id);
create index awards_film_project_id_idx    on awards(film_project_id);

-- Services Kat offers
create table services (
  id            bigserial primary key,
  title         text not null,
  description   text not null default '',
  sort_order    int not null default 0,
  published     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Work samples attached to a service
create table service_samples (
  id            bigserial primary key,
  service_id    bigint not null references services(id) on delete cascade,
  title         text not null,
  description   text,
  file_url      text,
  sort_order    int not null default 0
);

create index service_samples_service_id_idx on service_samples(service_id);

-- Testimonials / pull quotes
create table testimonials (
  id              bigserial primary key,
  quote_text      text not null,
  attribute_name  text not null,
  attribute_title text,
  organisation    text,
  sort_order      int not null default 0,
  published       boolean not null default true,
  created_at      timestamptz not null default now()
);

-- Contact form submissions
create table contact_submissions (
  id          bigserial primary key,
  name        text not null,
  email       text not null,
  subject     text,
  message     text not null,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index contact_submissions_created_at_idx on contact_submissions(created_at desc);

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. updated_at TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger writing_projects_updated_at
  before update on writing_projects
  for each row execute function set_updated_at();

create trigger film_projects_updated_at
  before update on film_projects
  for each row execute function set_updated_at();

create trigger services_updated_at
  before update on services
  for each row execute function set_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════════
-- Model: only Kat will be a Supabase Auth user, so "authenticated" === admin.
-- anon role: read published content + insert contact submissions.
-- authenticated role: full CRUD on everything.
-- ═══════════════════════════════════════════════════════════════════════════

alter table writing_projects    enable row level security;
alter table film_projects       enable row level security;
alter table awards              enable row level security;
alter table services            enable row level security;
alter table service_samples     enable row level security;
alter table testimonials        enable row level security;
alter table contact_submissions enable row level security;

-- ── Public reads ──────────────────────────────────────────────────────────
create policy "anon reads published writing"
  on writing_projects for select to anon
  using (status = 'published');

create policy "anon reads published films"
  on film_projects for select to anon
  using (status = 'published');

create policy "anon reads published services"
  on services for select to anon
  using (published = true);

create policy "anon reads published testimonials"
  on testimonials for select to anon
  using (published = true);

create policy "anon reads awards"
  on awards for select to anon using (true);

create policy "anon reads service samples"
  on service_samples for select to anon using (true);

-- ── Public writes (contact form only) ────────────────────────────────────
create policy "anon submits contact form"
  on contact_submissions for insert to anon
  with check (true);

-- ── Authenticated (admin) — full access ──────────────────────────────────
create policy "auth full access writing"
  on writing_projects for all to authenticated
  using (true) with check (true);

create policy "auth full access films"
  on film_projects for all to authenticated
  using (true) with check (true);

create policy "auth full access awards"
  on awards for all to authenticated
  using (true) with check (true);

create policy "auth full access services"
  on services for all to authenticated
  using (true) with check (true);

create policy "auth full access service samples"
  on service_samples for all to authenticated
  using (true) with check (true);

create policy "auth full access testimonials"
  on testimonials for all to authenticated
  using (true) with check (true);

create policy "auth full access contact submissions"
  on contact_submissions for all to authenticated
  using (true) with check (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. STORAGE BUCKET
-- ═══════════════════════════════════════════════════════════════════════════
-- Single bucket `media` for posters, scripts, sample files.
-- Public read so URLs work directly in <img>; authenticated upload only.
-- ═══════════════════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public)
  values ('media', 'media', true)
  on conflict (id) do nothing;

create policy "public reads media"
  on storage.objects for select to public
  using (bucket_id = 'media');

create policy "auth uploads media"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'media');

create policy "auth updates media"
  on storage.objects for update to authenticated
  using (bucket_id = 'media');

create policy "auth deletes media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'media');

-- ═══════════════════════════════════════════════════════════════════════════
-- Done.
-- Next: invite Kat as a user via Auth → Users → Invite user
-- ═══════════════════════════════════════════════════════════════════════════
