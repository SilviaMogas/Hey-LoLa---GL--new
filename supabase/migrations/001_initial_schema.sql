-- Hey Lola — Supabase Postgres schema
-- Migrated from Firestore (NoSQL) to relational tables.
-- Each former collection becomes a table; nested sub-collections use foreign keys.

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ──────────────────────────────────────────────
-- USERS
-- ──────────────────────────────────────────────
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  -- id will match auth.users.id via trigger or explicit set
  email text not null,
  first_name text not null default '',
  last_name text not null default '',
  display_name text not null default '',
  username text not null default '',
  user_type text not null default 'Dog Owner',
  photo_url text,
  home_city text,
  local_hub text,
  bio text,
  dream_destination text,
  referral_code text,
  referred_by text,
  member_plan text default 'free',
  membership jsonb,
  onboarded boolean default false,
  onboarding_step integer default 0,
  onboarding_status jsonb,
  email_verified boolean default false,
  status text,
  whats_on text,
  status_updated_at timestamptz,
  username_changed_at jsonb,
  founding_member boolean default false,
  community_opt_in boolean default false,
  interests jsonb,
  app_intents jsonb,
  relationship_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- USERNAMES (handle reservation)
-- ──────────────────────────────────────────────
create table if not exists usernames (
  username text primary key,
  uid uuid not null references users(id) on delete cascade
);

-- ──────────────────────────────────────────────
-- PETS
-- ──────────────────────────────────────────────
create table if not exists pets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null default '',
  type text not null default 'Dog',
  sex text,
  breed text not null default '',
  birth_date text,
  current_weight jsonb,
  weight_history jsonb default '[]',
  vaccinations jsonb default '[]',
  vax_status text default '',
  special_needs text default '',
  photo_url text,
  country_of_birth text default '',
  residence_country text default '',
  travel_history jsonb default '[]',
  planned_destinations jsonb,
  activities jsonb,
  microchip_id text default '',
  hobbies text default '',
  passport_number text,
  is_public boolean default false,
  is_hidden boolean default false,
  city text,
  emergency_contacts jsonb,
  health_timeline jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ──────────────────────────────────────────────
-- PET_PUBLIC (public pet cards)
-- ──────────────────────────────────────────────
create table if not exists pet_public (
  id uuid primary key,
  data jsonb not null default '{}',
  updated_at timestamptz default now()
);

-- ──────────────────────────────────────────────
-- MEMBER_PUBLIC (public member cards)
-- ──────────────────────────────────────────────
create table if not exists member_public (
  id uuid primary key,
  data jsonb not null default '{}',
  updated_at timestamptz default now()
);

-- ──────────────────────────────────────────────
-- PLACES
-- ──────────────────────────────────────────────
create table if not exists places (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text,
  tags jsonb,
  city text,
  neighborhood text,
  description text default '',
  utility text default '',
  status text default 'Pending verification',
  lat double precision,
  lng double precision,
  image text,
  rating double precision,
  address text,
  phone text,
  website text,
  instagram text,
  contact_email text,
  pet_friendly_notes text,
  claimed_by uuid,
  claim_approved_at timestamptz,
  is_hidden boolean default false,
  recommended_by text,
  recommended_by_url text,
  member_perk text,
  verification_status text default 'not_verified',
  partner_status text default 'not_invited',
  perk_status text default 'no_perks',
  verification_email_sent_at timestamptz,
  verification_email_sent_to text,
  claim_requested_at timestamptz,
  claimed_by_email text,
  claimed_by_name text,
  claimed_by_role text,
  approved_at timestamptz,
  approved_by text,
  rejected_at timestamptz,
  rejected_by text,
  perk_type text,
  perk_description text,
  perk_conditions text,
  perk_start_date text,
  perk_end_date text,
  perk_available_days text,
  perk_approved_at timestamptz,
  perk_approved_by text,
  perk_rejected_at timestamptz,
  perk_rejected_by text,
  primary_email text,
  secondary_emails jsonb,
  contact_page_url text,
  enrichment_status text default 'not_started',
  enrichment_source text,
  enrichment_last_checked_at timestamptz,
  outreach_ready boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ──────────────────────────────────────────────
-- PLACE_SECRETS (verification tokens for venues)
-- ──────────────────────────────────────────────
create table if not exists place_secrets (
  id uuid primary key,
  verification_token text,
  created_at timestamptz default now()
);

-- ──────────────────────────────────────────────
-- FAVORITES (saved places)
-- ──────────────────────────────────────────────
create table if not exists favorites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  place_id uuid,
  match_value text,
  created_at timestamptz default now()
);

-- ──────────────────────────────────────────────
-- CITY_VOTES
-- ──────────────────────────────────────────────
create table if not exists city_votes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  city text not null,
  created_at timestamptz default now()
);

-- ──────────────────────────────────────────────
-- CLAIM_REQUESTS
-- ──────────────────────────────────────────────
create table if not exists claim_requests (
  id uuid primary key default uuid_generate_v4(),
  place_id uuid,
  user_id uuid,
  name text,
  email text,
  role text,
  status text default 'pending',
  data jsonb default '{}',
  created_at timestamptz default now()
);

-- ──────────────────────────────────────────────
-- VENUE_CLAIMS (public claim form submissions)
-- ──────────────────────────────────────────────
create table if not exists venue_claims (
  id uuid primary key default uuid_generate_v4(),
  data jsonb not null default '{}',
  status text default 'pending',
  created_at timestamptz default now()
);

-- ──────────────────────────────────────────────
-- WAITLIST
-- ──────────────────────────────────────────────
create table if not exists waitlist (
  id uuid primary key default uuid_generate_v4(),
  email text not null,
  name text,
  type text,
  city text,
  data jsonb default '{}',
  created_at timestamptz default now()
);

-- ──────────────────────────────────────────────
-- SUBSCRIBERS / PARTNER_APPLICATIONS
-- ──────────────────────────────────────────────
create table if not exists partner_applications (
  id uuid primary key default uuid_generate_v4(),
  data jsonb not null default '{}',
  status text default 'pending',
  created_at timestamptz default now()
);

-- ──────────────────────────────────────────────
-- CREATOR_APPLICATIONS
-- ──────────────────────────────────────────────
create table if not exists creator_applications (
  id uuid primary key default uuid_generate_v4(),
  data jsonb not null default '{}',
  created_at timestamptz default now()
);

-- ──────────────────────────────────────────────
-- CREATORS (admin-managed)
-- ──────────────────────────────────────────────
create table if not exists creators (
  id uuid primary key default uuid_generate_v4(),
  name text not null default '',
  email text not null default '',
  instagram text,
  tiktok text,
  website text,
  city text default '',
  referral_code text default '',
  commission_percent numeric default 10,
  status text default 'invited',
  signups_count integer default 0,
  paid_conversions integer default 0,
  total_commission_owed numeric default 0,
  last_guide_submitted text,
  profile_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ──────────────────────────────────────────────
-- BUSINESS_LEADS
-- ──────────────────────────────────────────────
create table if not exists business_leads (
  id uuid primary key default uuid_generate_v4(),
  data jsonb not null default '{}',
  created_at timestamptz default now()
);

-- ──────────────────────────────────────────────
-- ONBOARDING_SUBMISSIONS
-- ──────────────────────────────────────────────
create table if not exists onboarding_submissions (
  id uuid primary key default uuid_generate_v4(),
  data jsonb not null default '{}',
  status text default 'pending',
  created_at timestamptz default now()
);

-- ──────────────────────────────────────────────
-- CRM_LEADS
-- ──────────────────────────────────────────────
create table if not exists crm_leads (
  id uuid primary key default uuid_generate_v4(),
  data jsonb not null default '{}',
  status text default 'new',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ──────────────────────────────────────────────
-- POSTS (community)
-- ──────────────────────────────────────────────
create table if not exists posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,
  data jsonb not null default '{}',
  group_id text,
  created_at timestamptz default now()
);

-- ──────────────────────────────────────────────
-- POST_REPLIES (subcollection of posts)
-- ──────────────────────────────────────────────
create table if not exists post_replies (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid,
  data jsonb not null default '{}',
  created_at timestamptz default now()
);

-- ──────────────────────────────────────────────
-- BLOG_POSTS
-- ──────────────────────────────────────────────
create table if not exists blog_posts (
  id uuid primary key default uuid_generate_v4(),
  data jsonb not null default '{}',
  created_at timestamptz default now()
);

-- ──────────────────────────────────────────────
-- GROUP_MEMBERSHIPS
-- ──────────────────────────────────────────────
create table if not exists group_memberships (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  group_id text not null,
  data jsonb default '{}',
  created_at timestamptz default now()
);

-- ──────────────────────────────────────────────
-- CONNECTIONS (member-to-member)
-- ──────────────────────────────────────────────
create table if not exists connections (
  id uuid primary key default uuid_generate_v4(),
  from_id uuid not null,
  to_id uuid not null,
  status text default 'pending',
  created_at timestamptz default now()
);

-- ──────────────────────────────────────────────
-- DM_THREADS & MESSAGES
-- ──────────────────────────────────────────────
create table if not exists dm_threads (
  id uuid primary key default uuid_generate_v4(),
  participants jsonb not null default '[]',
  last_message text,
  last_message_at timestamptz,
  data jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists dm_messages (
  id uuid primary key default uuid_generate_v4(),
  thread_id uuid not null references dm_threads(id) on delete cascade,
  sender_id uuid not null,
  text text not null default '',
  data jsonb default '{}',
  created_at timestamptz default now()
);

-- ──────────────────────────────────────────────
-- RESERVATION_CLICKS
-- ──────────────────────────────────────────────
create table if not exists reservation_clicks (
  id uuid primary key default uuid_generate_v4(),
  data jsonb not null default '{}',
  created_at timestamptz default now()
);

-- ──────────────────────────────────────────────
-- FEATURE_FLAGS
-- ──────────────────────────────────────────────
create table if not exists feature_flags (
  key text primary key,
  enabled boolean default false,
  data jsonb default '{}',
  updated_at timestamptz default now()
);

-- ──────────────────────────────────────────────
-- SHELTERS
-- ──────────────────────────────────────────────
create table if not exists shelters (
  id uuid primary key default uuid_generate_v4(),
  data jsonb not null default '{}',
  created_at timestamptz default now()
);

-- ──────────────────────────────────────────────
-- SHELTER_SECRETS
-- ──────────────────────────────────────────────
create table if not exists shelter_secrets (
  id uuid primary key,
  data jsonb not null default '{}',
  created_at timestamptz default now()
);

-- ──────────────────────────────────────────────
-- SHELTER_OWNERS
-- ──────────────────────────────────────────────
create table if not exists shelter_owners (
  id uuid primary key,
  data jsonb not null default '{}',
  created_at timestamptz default now()
);

-- ──────────────────────────────────────────────
-- FOUNDATION_DOGS
-- ──────────────────────────────────────────────
create table if not exists foundation_dogs (
  id uuid primary key default uuid_generate_v4(),
  status text default 'available',
  passport jsonb default '{}',
  data jsonb default '{}',
  created_at timestamptz default now()
);

-- ──────────────────────────────────────────────
-- FOUNDATION_INTERESTS
-- ──────────────────────────────────────────────
create table if not exists foundation_interests (
  id uuid primary key default uuid_generate_v4(),
  dog_id uuid,
  data jsonb not null default '{}',
  created_at timestamptz default now()
);

-- ──────────────────────────────────────────────
-- RLS — Enable Row Level Security on all tables.
-- For now, allow full access via service_role and
-- authenticated users. Policies can be tightened later.
-- ──────────────────────────────────────────────

-- Enable RLS
alter table users enable row level security;
alter table usernames enable row level security;
alter table pets enable row level security;
alter table pet_public enable row level security;
alter table member_public enable row level security;
alter table places enable row level security;
alter table place_secrets enable row level security;
alter table favorites enable row level security;
alter table city_votes enable row level security;
alter table claim_requests enable row level security;
alter table venue_claims enable row level security;
alter table waitlist enable row level security;
alter table partner_applications enable row level security;
alter table creator_applications enable row level security;
alter table creators enable row level security;
alter table business_leads enable row level security;
alter table onboarding_submissions enable row level security;
alter table crm_leads enable row level security;
alter table posts enable row level security;
alter table post_replies enable row level security;
alter table blog_posts enable row level security;
alter table group_memberships enable row level security;
alter table connections enable row level security;
alter table dm_threads enable row level security;
alter table dm_messages enable row level security;
alter table reservation_clicks enable row level security;
alter table feature_flags enable row level security;
alter table shelters enable row level security;
alter table shelter_secrets enable row level security;
alter table shelter_owners enable row level security;
alter table foundation_dogs enable row level security;
alter table foundation_interests enable row level security;

-- Permissive policies: anon can read public data, authenticated users can CRUD own data.
-- Service role bypasses RLS. These can be tightened per-table later.

-- Allow anyone to read places, foundation dogs, pet_public, member_public, feature_flags, shelters, blog_posts
create policy "Public read places" on places for select using (true);
create policy "Public read pet_public" on pet_public for select using (true);
create policy "Public read member_public" on member_public for select using (true);
create policy "Public read feature_flags" on feature_flags for select using (true);
create policy "Public read shelters" on shelters for select using (true);
create policy "Public read foundation_dogs" on foundation_dogs for select using (true);
create policy "Public read blog_posts" on blog_posts for select using (true);
create policy "Public read posts" on posts for select using (true);
create policy "Public read post_replies" on post_replies for select using (true);

-- Authenticated users can read their own data
create policy "Users read own" on users for select using (auth.uid() = id);
create policy "Users update own" on users for update using (auth.uid() = id);

create policy "Pets read own" on pets for select using (auth.uid() = user_id);
create policy "Pets insert own" on pets for insert with check (auth.uid() = user_id);
create policy "Pets update own" on pets for update using (auth.uid() = user_id);
create policy "Pets read public" on pets for select using (is_public = true);

create policy "Favorites read own" on favorites for select using (auth.uid() = user_id);
create policy "Favorites insert own" on favorites for insert with check (auth.uid() = user_id);
create policy "Favorites delete own" on favorites for delete using (auth.uid() = user_id);

create policy "City votes read own" on city_votes for select using (auth.uid() = user_id);
create policy "City votes insert own" on city_votes for insert with check (auth.uid() = user_id);

create policy "Group memberships read own" on group_memberships for select using (auth.uid() = user_id);
create policy "Group memberships insert own" on group_memberships for insert with check (auth.uid() = user_id);

create policy "Connections read own" on connections for select using (auth.uid() = from_id or auth.uid() = to_id);
create policy "Connections insert own" on connections for insert with check (auth.uid() = from_id);
create policy "Connections update own" on connections for update using (auth.uid() = to_id);

create policy "DM threads read own" on dm_threads for select using (auth.uid()::text = any(array(select jsonb_array_elements_text(participants))));

create policy "DM messages read own thread" on dm_messages for select using (
  exists (select 1 from dm_threads t where t.id = thread_id and auth.uid()::text = any(array(select jsonb_array_elements_text(t.participants))))
);
create policy "DM messages insert own" on dm_messages for insert with check (auth.uid() = sender_id);

-- Allow anyone to insert into public submission tables (waitlist, creators, etc.)
create policy "Public insert waitlist" on waitlist for insert with check (true);
create policy "Public insert partner_applications" on partner_applications for insert with check (true);
create policy "Public insert creator_applications" on creator_applications for insert with check (true);
create policy "Public insert business_leads" on business_leads for insert with check (true);
create policy "Public insert onboarding_submissions" on onboarding_submissions for insert with check (true);
create policy "Public insert venue_claims" on venue_claims for insert with check (true);
create policy "Public insert claim_requests" on claim_requests for insert with check (true);
create policy "Public insert foundation_interests" on foundation_interests for insert with check (true);
create policy "Public insert reservation_clicks" on reservation_clicks for insert with check (true);

-- Usernames: anyone can check availability, auth users can manage own
create policy "Public read usernames" on usernames for select using (true);
create policy "Users insert usernames" on usernames for insert with check (auth.uid() = uid);
create policy "Users delete own usernames" on usernames for delete using (auth.uid() = uid);

-- Posts: auth users can insert and manage own
create policy "Posts insert own" on posts for insert with check (auth.uid() = user_id);
create policy "Posts delete own" on posts for delete using (auth.uid() = user_id);
create policy "Post replies insert" on post_replies for insert with check (auth.uid() = user_id);

-- Pet public / member public: owner can upsert
create policy "Pet public upsert own" on pet_public for insert with check (true);
create policy "Pet public update" on pet_public for update using (true);
create policy "Member public upsert own" on member_public for insert with check (true);
create policy "Member public update" on member_public for update using (true);

-- Places: auth users can insert
create policy "Places insert auth" on places for insert with check (auth.uid() is not null);
create policy "Places update auth" on places for update using (auth.uid() is not null);

-- Saved places read own
create policy "Saved places read own" on saved_places for select using (auth.uid() = user_id) ;

-- Enable realtime for key tables
alter publication supabase_realtime add table users;
alter publication supabase_realtime add table pets;
alter publication supabase_realtime add table posts;
alter publication supabase_realtime add table dm_threads;
alter publication supabase_realtime add table dm_messages;
alter publication supabase_realtime add table feature_flags;
alter publication supabase_realtime add table connections;
