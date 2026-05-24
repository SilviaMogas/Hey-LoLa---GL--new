-- Migration 002: Add proper columns to partner & shelter tables.
-- The initial migration created some tables with generic `data jsonb` columns,
-- but the frontend code inserts individual columns. This migration adds the
-- missing columns so inserts/queries work correctly.

-- ──────────────────────────────────────────────
-- PARTNER_APPLICATIONS — structured columns
-- ──────────────────────────────────────────────
alter table partner_applications
  add column if not exists partner_type text,
  add column if not exists business_name text,
  add column if not exists categories jsonb default '[]',
  add column if not exists city text,
  add column if not exists address text,
  add column if not exists store_url text,
  add column if not exists ships_to text,
  add column if not exists website text,
  add column if not exists instagram text,
  add column if not exists contact_name text,
  add column if not exists contact_role text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists dog_friendly_features jsonb default '[]',
  add column if not exists notes text,
  add column if not exists offers_perk boolean,
  add column if not exists perk jsonb,
  add column if not exists source text default 'self_onboarding',
  add column if not exists category text,
  add column if not exists policy text,
  add column if not exists suggested_perk text,
  add column if not exists claim_profile boolean,
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by text,
  add column if not exists updated_at timestamptz default now();

-- ──────────────────────────────────────────────
-- SHELTERS — proper relational columns
-- ──────────────────────────────────────────────
alter table shelters
  add column if not exists name text not null default '',
  add column if not exists city text default '',
  add column if not exists region text default 'Americas',
  add column if not exists blurb text default '',
  add column if not exists website text default '',
  add column if not exists dogs jsonb default '[]',
  add column if not exists logo text,
  add column if not exists "order" integer default 99,
  add column if not exists updated_at timestamptz default now();

-- ──────────────────────────────────────────────
-- SHELTER_SECRETS — token column
-- ──────────────────────────────────────────────
alter table shelter_secrets
  add column if not exists token text,
  add column if not exists updated_at timestamptz default now();

-- ──────────────────────────────────────────────
-- SHELTER_OWNERS — relational columns
-- ──────────────────────────────────────────────
alter table shelter_owners
  add column if not exists shelter_id text,
  add column if not exists email text,
  add column if not exists claimed_at timestamptz;

-- ──────────────────────────────────────────────
-- ONBOARDING_SUBMISSIONS — individual form fields
-- ──────────────────────────────────────────────
alter table onboarding_submissions
  add column if not exists type text,
  add column if not exists source text,
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists email text,
  add column if not exists city text,
  add column if not exists pet_name text,
  add column if not exists pet_type text,
  add column if not exists instagram text,
  add column if not exists founding_club_interest text,
  add column if not exists interests jsonb,
  add column if not exists business_name text,
  add column if not exists category text,
  add column if not exists address text,
  add column if not exists website text,
  add column if not exists contact_person text,
  add column if not exists role text,
  add column if not exists phone text,
  add column if not exists updated_at timestamptz default now();

-- ──────────────────────────────────────────────
-- BUSINESS_LEADS — structured columns
-- ──────────────────────────────────────────────
alter table business_leads
  add column if not exists business_name text,
  add column if not exists contact_role text,
  add column if not exists location text,
  add column if not exists reason text,
  add column if not exists email text,
  add column if not exists status text default 'new',
  add column if not exists updated_at timestamptz default now();

-- ──────────────────────────────────────────────
-- CRM_LEADS — proper CRM pipeline columns
-- ──────────────────────────────────────────────
alter table crm_leads
  add column if not exists "businessName" text,
  add column if not exists category text,
  add column if not exists tier integer,
  add column if not exists city text,
  add column if not exists contact jsonb,
  add column if not exists source text,
  add column if not exists stage text default 'prospect',
  add column if not exists tags jsonb default '[]',
  add column if not exists notes jsonb default '[]',
  add column if not exists "linkedPartnerApplicationId" text,
  add column if not exists "createdAt" bigint,
  add column if not exists "updatedAt" bigint,
  add column if not exists "lastTouchAt" bigint,
  add column if not exists "lastTouchBy" text,
  add column if not exists "createdBy" text,
  add column if not exists created_by text;

-- ──────────────────────────────────────────────
-- VENUE_CLAIMS — structured claim form fields
-- ──────────────────────────────────────────────
alter table venue_claims
  add column if not exists business_name text,
  add column if not exists category text,
  add column if not exists city text,
  add column if not exists address text,
  add column if not exists website text,
  add column if not exists instagram text,
  add column if not exists contact_person text,
  add column if not exists role text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists pet_friendly_status text,
  add column if not exists perk_interest text,
  add column if not exists notes text,
  add column if not exists claim_status text default 'claim_submitted',
  add column if not exists verification_status text default 'pending_review',
  add column if not exists perk_status text default 'not_confirmed',
  add column if not exists source text,
  add column if not exists updated_at timestamptz default now();

-- ──────────────────────────────────────────────
-- WAITLIST — add missing columns for member waitlist
-- ──────────────────────────────────────────────
alter table waitlist
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists dog_name text,
  add column if not exists dog_type text,
  add column if not exists plan text,
  add column if not exists perks text,
  add column if not exists consent boolean,
  add column if not exists source text,
  add column if not exists updated_at timestamptz default now();

-- ──────────────────────────────────────────────
-- FOUNDATION_DOGS — expand for admin management
-- ──────────────────────────────────────────────
alter table foundation_dogs
  add column if not exists name text default '',
  add column if not exists breed text default '',
  add column if not exists age text default '',
  add column if not exists sex text,
  add column if not exists photo text,
  add column if not exists bio text default '',
  add column if not exists shelter_id uuid,
  add column if not exists updated_at timestamptz default now();

-- ──────────────────────────────────────────────
-- FOUNDATION_INTERESTS — expand for contact info and dog details
-- ──────────────────────────────────────────────
alter table foundation_interests
  add column if not exists dog_name text,
  add column if not exists dog_slug text,
  add column if not exists partner_id text,
  add column if not exists partner_name text,
  add column if not exists shelter_name text,
  add column if not exists contact jsonb,
  add column if not exists message text,
  add column if not exists source text,
  add column if not exists name text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists status text default 'new',
  add column if not exists updated_at timestamptz default now();

-- ──────────────────────────────────────────────
-- Additional RLS policies for new functionality
-- ──────────────────────────────────────────────

-- Allow public inserts into venue_claims (for anonymous venue submissions)
-- (Policy may already exist from 001; create if not exists is not supported
--  for policies, so we use DO block)
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'venue_claims' and policyname = 'Public insert venue_claims'
  ) then
    execute 'create policy "Public insert venue_claims" on venue_claims for insert with check (true)';
  end if;
end $$;

-- Allow public inserts into business_leads
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'business_leads' and policyname = 'Public insert business_leads'
  ) then
    execute 'create policy "Public insert business_leads" on business_leads for insert with check (true)';
  end if;
end $$;

-- Allow public read on creator_applications (for admin panel access)
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'creator_applications' and policyname = 'Public read creator_applications'
  ) then
    execute 'create policy "Public read creator_applications" on creator_applications for select using (true)';
  end if;
end $$;

-- Indexes for common queries
create index if not exists idx_partner_applications_status on partner_applications(status);
create index if not exists idx_partner_applications_email on partner_applications(email);
create index if not exists idx_onboarding_submissions_status on onboarding_submissions(status);
create index if not exists idx_onboarding_submissions_type on onboarding_submissions(type);
create index if not exists idx_venue_claims_status on venue_claims(status);
create index if not exists idx_crm_leads_stage on crm_leads(stage);
create index if not exists idx_crm_leads_city on crm_leads(city);
create index if not exists idx_shelters_order on shelters("order");
create index if not exists idx_foundation_dogs_status on foundation_dogs(status);
create index if not exists idx_foundation_dogs_shelter on foundation_dogs(shelter_id);
create index if not exists idx_foundation_interests_status on foundation_interests(status);
create index if not exists idx_business_leads_status on business_leads(status);
