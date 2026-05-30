-- Migration 004: foundation_horses
--
-- Mirrors the foundation_dogs shape (see 001/002/003) but for horses,
-- powering the HeyKai Foundation horse-adoption pipeline.
--
-- Differences vs. foundation_dogs:
--   • `breed` stays a string (e.g. "Andalusian", "Quarter Horse", "Welsh Pony").
--   • `discipline` text — riding/working discipline (dressage, western, leisure…).
--   • `height_hands` numeric — horse height in hands.
--   • Source attribution columns (source_url, partner_name, partner_country)
--     are top-level since rows are populated by the /api/scrape-horses
--     scraper from a handful of public rescue sites.
--
-- RLS mirrors foundation_dogs: anyone can read rows that are visibility=public
-- AND status=available. All writes go through the service-role admin client
-- in api/scrape-horses.ts.

create table if not exists foundation_horses (
  id uuid primary key default uuid_generate_v4(),
  name text not null default '',
  slug text,
  breed text default '',
  discipline text,            -- e.g. dressage, western, leisure, retired
  age text default '',        -- "12 years", "Yearling", etc.
  sex text,                   -- 'male' | 'female' | 'gelding' | 'mare' | 'stallion' | null
  height_hands numeric,       -- e.g. 15.2 (hands)
  photo text,                 -- primary image URL
  bio text default '',        -- short description / story
  location text,              -- city / region (display string)

  -- Source attribution — every card links back to the rescue.
  source_url text,            -- canonical url for the adoption listing
  partner_name text,          -- e.g. "World Horse Welfare"
  partner_country text,       -- 'US' | 'ES' | 'UK' | …

  -- Same passport jsonb as foundation_dogs so the Hey Lola passport
  -- helpers (slug / publicUrl / visibility / verificationStatus) work
  -- 1:1 between the two species.
  passport jsonb default '{}',
  visibility text default 'public',  -- 'public' | 'hidden'
  status text default 'available',   -- 'available' | 'unavailable' | 'hidden'

  -- Catch-all for any extra scraped fields we don't model as columns yet
  -- (vaccination notes, training level, microchip ID, …).
  data jsonb default '{}',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Skip-duplicates marker for the scraper: one row per source_url.
create unique index if not exists idx_foundation_horses_source_url
  on foundation_horses (source_url)
  where source_url is not null;

create index if not exists idx_foundation_horses_status
  on foundation_horses (status);
create index if not exists idx_foundation_horses_country
  on foundation_horses (partner_country);
create index if not exists idx_foundation_horses_visibility
  on foundation_horses (visibility);
create index if not exists idx_foundation_horses_slug
  on foundation_horses (slug);

-- ──────────────────────────────────────────────
-- RLS — mirror foundation_dogs.
-- ──────────────────────────────────────────────
alter table foundation_horses enable row level security;

-- Public read: only rows that are public AND available.
do $$ begin
  if not exists (
    select 1 from pg_policies
     where tablename = 'foundation_horses'
       and policyname = 'Public read foundation_horses'
  ) then
    execute $policy$
      create policy "Public read foundation_horses"
        on foundation_horses
        for select
        using (visibility = 'public' and status = 'available')
    $policy$;
  end if;
end $$;

-- No public writes — all inserts/updates flow through the service-role
-- key in /api/scrape-horses.ts and /api/manage-foundation.ts (admin).
-- Without an explicit insert/update policy + RLS enabled, anon + auth
-- callers are denied by default; service_role bypasses RLS.
