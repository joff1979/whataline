-- ─────────────────────────────────────────────────────────────────────────────
-- Laurels on awards  +  social links table
-- Run in Supabase SQL Editor (Project → SQL Editor → New query)
-- ─────────────────────────────────────────────────────────────────────────────

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. Laurels + "feature on About page" on the awards table
-- ═══════════════════════════════════════════════════════════════════════════

alter table awards add column if not exists laurel_url text;
alter table awards add column if not exists featured   boolean not null default false;

create index if not exists awards_featured_idx on awards(featured) where featured = true;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. Social links
-- ═══════════════════════════════════════════════════════════════════════════
-- platform: a lowercase key (linkedin, imdb, instagram, youtube, …). The
-- frontend ships built-in icons for known platforms; icon_url overrides with a
-- custom uploaded icon for anything else.

create table if not exists social_links (
  id          bigserial primary key,
  platform    text not null,
  label       text,
  url         text not null,
  icon_url    text,
  sort_order  int  not null default 0,
  published   boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table social_links enable row level security;

create policy "anon reads published socials"
  on social_links for select to anon
  using (published = true);

create policy "auth full access socials"
  on social_links for all to authenticated
  using (true) with check (true);

-- Seed Kat's links (id conflict-safe: only insert if table is empty)
insert into social_links (platform, label, url, sort_order)
select * from (values
  ('linkedin',  'LinkedIn',  'https://www.linkedin.com/in/kat-rollinson/',           0),
  ('imdb',      'IMDB',      'https://www.imdb.com/name/nm16175751/',                1),
  ('instagram', 'Instagram', 'https://www.instagram.com/kat_writes_whataline',       2),
  ('youtube',   'YouTube',   'https://www.youtube.com/@kat_writes_whataline',        3)
) as v(platform, label, url, sort_order)
where not exists (select 1 from social_links);

-- ═══════════════════════════════════════════════════════════════════════════
-- Done.
-- ═══════════════════════════════════════════════════════════════════════════
