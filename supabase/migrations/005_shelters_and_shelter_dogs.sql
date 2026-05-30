-- 005_shelters_and_shelter_dogs.sql
--
-- Relational shelters + adoptable-dogs schema, ported from the waiting-list
-- project. Sits alongside the legacy JSONB-bucket `shelters` and
-- `foundation_dogs` tables — those stay untouched for backwards compatibility.
--
-- Design intent: shelters are peer-level entities to pet parents (`users`),
-- and adoptable dogs are peer-level to pet-parent-owned `pets`. A shelter
-- profile may be claimed and managed by a user account; an adoptable dog
-- may, after adoption, be linked to the adopter's user account and to the
-- pet card they create for it.

create table if not exists shelter_profiles (
  id            text primary key,                       -- slug: "bobbi-and-the-strays"
  slug          text not null unique,
  name          text not null,
  city          text,
  country       text,
  region        text,
  description   text,
  website       text,
  instagram     text,
  contact_email text,
  logo          text,
  verified      boolean not null default false,
  status        text not null default 'active',         -- active | paused
  platform      text,                                   -- shelterluv | adoptapet | …
  source        jsonb,                                  -- { listingUrl, maxDogs? }
  order_index   integer not null default 100,

  -- Cross-reference to a Hey Lola user account that manages this shelter.
  -- Long-term, shelters live at the same level as pet parents.
  owner_user_id uuid references auth.users(id) on delete set null,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists shelter_profiles_status_idx on shelter_profiles(status);
create index if not exists shelter_profiles_owner_idx  on shelter_profiles(owner_user_id);


create table if not exists shelter_dogs (
  id                   text primary key,                -- slug: "bobbi-abby"
  slug                 text not null unique,
  shelter_id           text not null references shelter_profiles(id) on delete cascade,

  name                 text not null,
  sex                  text,                            -- male | female | unknown
  age                  text,                            -- free-form, e.g. "9 yrs"
  breed                text,
  weight_kg            numeric,
  location             text,

  partner_id           text,
  partner_name         text,
  source_url           text,

  description          text,
  adoption_fee_usd     numeric,
  hero_image           text,

  status               text not null default 'available',  -- available | pending | adopted | hold
  last_synced_at       date,

  passport             jsonb not null default '{"visibility":"public","verificationStatus":"partner_source"}',

  -- Cross-reference to Hey Lola users.
  -- An adoptable dog can have interested users, an eventual adopter, and
  -- once the adopter creates a pet card for the dog, that link too.
  interested_user_ids  uuid[] not null default '{}',
  adopter_user_id      uuid references auth.users(id) on delete set null,
  -- Once the adopter creates their own pet card for this dog, we link it.
  -- Pets table is created lazily by the app schema; keep as a free uuid.
  linked_pet_id        uuid,

  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists shelter_dogs_shelter_idx  on shelter_dogs(shelter_id);
create index if not exists shelter_dogs_status_idx   on shelter_dogs(status);
create index if not exists shelter_dogs_adopter_idx  on shelter_dogs(adopter_user_id);


-- ──────────────────────────────────────────────
-- RLS
-- ──────────────────────────────────────────────
alter table shelter_profiles enable row level security;
alter table shelter_dogs     enable row level security;

create policy "Public read shelter_profiles"
  on shelter_profiles for select
  using (status = 'active');

create policy "Public read shelter_dogs"
  on shelter_dogs for select
  using (
    status in ('available', 'pending')
    and coalesce(passport->>'visibility', 'public') = 'public'
  );

-- A shelter owner (claimed account) can update their own profile and dogs.
create policy "Shelter owner updates own profile"
  on shelter_profiles for update
  using (auth.uid() = owner_user_id);

create policy "Shelter owner inserts own dogs"
  on shelter_dogs for insert
  with check (
    exists (
      select 1 from shelter_profiles s
      where s.id = shelter_dogs.shelter_id and s.owner_user_id = auth.uid()
    )
  );

create policy "Shelter owner updates own dogs"
  on shelter_dogs for update
  using (
    exists (
      select 1 from shelter_profiles s
      where s.id = shelter_dogs.shelter_id and s.owner_user_id = auth.uid()
    )
  );

create policy "Shelter owner deletes own dogs"
  on shelter_dogs for delete
  using (
    exists (
      select 1 from shelter_profiles s
      where s.id = shelter_dogs.shelter_id and s.owner_user_id = auth.uid()
    )
  );

-- An authenticated user can register interest in an adoptable dog by
-- appending their uid to interested_user_ids; the existing
-- `foundation_interests` table still records the full submission.
create policy "Auth users express interest"
  on shelter_dogs for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');


-- ──────────────────────────────────────────────
-- updated_at triggers
-- ──────────────────────────────────────────────
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists shelter_profiles_set_updated_at on shelter_profiles;
create trigger shelter_profiles_set_updated_at
  before update on shelter_profiles
  for each row execute function set_updated_at();

drop trigger if exists shelter_dogs_set_updated_at on shelter_dogs;
create trigger shelter_dogs_set_updated_at
  before update on shelter_dogs
  for each row execute function set_updated_at();
