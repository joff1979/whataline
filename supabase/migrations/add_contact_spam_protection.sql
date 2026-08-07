-- ─────────────────────────────────────────────────────────────────────────────
-- Contact form spam protection (Phase 1)
-- Run in Supabase SQL Editor (Project → SQL Editor → New query)
-- ─────────────────────────────────────────────────────────────────────────────

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. Classification + forensics columns on contact_submissions
-- ═══════════════════════════════════════════════════════════════════════════

alter table contact_submissions add column if not exists status        text not null default 'clean'
  check (status in ('clean','spam','quarantine'));
alter table contact_submissions add column if not exists spam_score    smallint not null default 0;
alter table contact_submissions add column if not exists spam_reasons  text[] not null default '{}';
alter table contact_submissions add column if not exists ip_hash       text;
alter table contact_submissions add column if not exists user_agent    text;
alter table contact_submissions add column if not exists referer      text;
alter table contact_submissions add column if not exists dwell_ms     integer;
alter table contact_submissions add column if not exists message_hash text;
alter table contact_submissions add column if not exists emailed_at   timestamptz;
alter table contact_submissions add column if not exists email_error  text;

-- Rate-limit query: count rows for an ip_hash within a rolling window.
create index if not exists contact_submissions_ip_hash_created_at_idx
  on contact_submissions(ip_hash, created_at desc);

-- Admin inbox filter (status in ('clean','quarantine')) + spam review.
create index if not exists contact_submissions_status_created_at_idx
  on contact_submissions(status, created_at desc);

-- 7-day duplicate-message detection.
create index if not exists contact_submissions_message_hash_idx
  on contact_submissions(message_hash, created_at desc);

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. Submission token replay protection
-- ═══════════════════════════════════════════════════════════════════════════
-- Tracks only USED nonces (not issued ones — most page loads never convert).
-- A unique-violation on insert means the token has already been redeemed.
-- Unbounded growth is fine at Phase 1 traffic; a retention job to prune rows
-- older than the token TTL belongs in a future admin/retention phase.

create table if not exists used_form_nonces (
  nonce    text primary key,
  used_at  timestamptz not null default now()
);

alter table used_form_nonces enable row level security;
-- No policies granted to anon/authenticated — only service_role (which
-- bypasses RLS) ever reads or writes this table.

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. Lock down direct writes
-- ═══════════════════════════════════════════════════════════════════════════
-- The contact form no longer inserts directly from the browser — all writes
-- go through the contact-submit Edge Function (service_role, bypasses RLS).
-- With no anon insert policy left, RLS denies anon writes by default.

drop policy if exists "anon submits contact form" on contact_submissions;

-- ═══════════════════════════════════════════════════════════════════════════
-- Done.
-- Next: set IP_HASH_SALT, FORM_TOKEN_SECRET and ALLOWED_REFERER_HOSTS as
-- Edge Function secrets, then deploy contact-submit and contact-token.
-- ═══════════════════════════════════════════════════════════════════════════
