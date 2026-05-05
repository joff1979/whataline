-- ─────────────────────────────────────────────────────────────────────────────
-- Add about_content table
-- Run in Supabase SQL Editor (Project → SQL Editor → New query)
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists about_content (
  id            integer primary key default 1,
  bio_paragraphs jsonb not null default '[]',
  pull_quotes    jsonb not null default '[]',
  credits        jsonb not null default '[]',
  recognition    jsonb not null default '[]',
  education      jsonb not null default '[]'
);

alter table about_content enable row level security;

create policy "anon reads about_content"
  on about_content for select to anon using (true);

create policy "auth manages about_content"
  on about_content for all to authenticated
  using (true) with check (true);

-- Pre-populate with the current content so Kat sees real data immediately
insert into about_content (
  id, bio_paragraphs, pull_quotes, credits, recognition, education
) values (
  1,
  '[
    "Kat is an award-winning multi-hyphenate filmmaker with experience across Script Supervision, Producing, Screenwriting and Directing, and a passion for crafting engaging stories.",
    "As a screenwriter, Kat specialises in poignant drama and romance, often with a twist of magical realism or a hint of wry humour. Her flair for creating quirky storylines and layered characters has resulted in incredible feedback, acknowledging her masterful storytelling and charming style. Kat laughs, cries and screams right alongside her characters — resulting in authentic, compelling scripts.",
    "Kat''s years of Project Management experience outside of the film industry ideally place her to steer through the complexity of all phases of production with a unique blend of collaboration, structure, creativity and empathy — and she often gets invited back."
  ]',
  '[
    {"text": "Kat is the breath of fresh air you never expect to find, but always welcome, amongst the chaos of film and TV production.", "attr": "Director, rocking horse media"},
    {"text": "If Kat was on Trip Advisor, I''d be giving her 5 stars!", "attr": "Producer"}
  ]',
  '[
    {"role": "Script Supervisor", "items": [
      {"title": "\"Holly and Ivy\"",         "company": "rocking horse media", "year": "2025–present"},
      {"title": "\"Too Soon\"",                                                  "year": "2025–present"},
      {"title": "\"Not One Or The Other\"",                                      "year": "2025"},
      {"title": "\"Cherry\"",                                                    "year": "2025"},
      {"title": "\"Cloud\"",                                                     "year": "2024"},
      {"title": "\"Henry House\"",           "company": "rocking horse media", "year": "2024"},
      {"title": "\"The Name Has A Price\"",                                      "year": "2022–2023"}
    ]},
    {"role": "Writer · Director · Producer", "items": [
      {"title": "\"It''s About Time\"",  "year": "2025–present"},
      {"title": "\"Do Unto Yourself\"",  "year": "2024–2025"}
    ]},
    {"role": "Screenwriter", "items": [
      {"title": "\"Kat N Mouse\" (feature rewrite)",    "company": "1day edutainment", "year": "2025–present"},
      {"title": "\"The Parent Club\" (pilot rewrite)",  "company": "1day edutainment", "year": "2025–present"},
      {"title": "12 original scripts",                  "company": "What A Line",      "year": "2021–present"}
    ]},
    {"role": "Producer", "items": [
      {"title": "\"A Mind Game\" (feature)", "company": "S.H.Y. Films", "year": "2025–present"},
      {"title": "Screening Event — 3 short films",       "year": "2024–2025"},
      {"title": "\"Defence Strategy\" (co-producer)",    "year": "2024"}
    ]}
  ]',
  '[
    {"title": "Award Winner",  "body": "Top Film Awards",                       "year": "2023"},
    {"title": "Award Winner",  "body": "Indiefare International Film Festival", "year": "2023"},
    {"title": "Accolade",      "body": "Creative Screenwriting — \"Live Long\"","year": "2023"}
  ]',
  '[
    {"school": "London Film Academy",       "course": "Screenwriting Certificate",           "year": "2022"},
    {"school": "Raindance Film School",     "course": "Filmmakers'' Foundation Certificate", "year": "2023"},
    {"school": "Stage 32",                  "course": "Script Supervision",                  "year": "2022–present"},
    {"school": "City Academy",              "course": "Short Film Course",                   "year": "2025"},
    {"school": "University of East Anglia", "course": "Introduction to Screenwriting",       "year": "2021"}
  ]'
) on conflict (id) do update set
  bio_paragraphs = excluded.bio_paragraphs,
  pull_quotes    = excluded.pull_quotes,
  credits        = excluded.credits,
  recognition    = excluded.recognition,
  education      = excluded.education;
