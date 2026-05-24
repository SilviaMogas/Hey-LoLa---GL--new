-- Migration 003: Add ENS domain field to foundation dogs.
-- Each rescue dog gets an optional ENS (Ethereum Name Service) domain
-- like "lucky.heylola.eth" as part of their digital passport.
--
-- Shelter dogs (stored as JSONB in shelters.dogs) automatically support
-- the new ensName field without a schema change.

alter table foundation_dogs
  add column if not exists ens_name text;

comment on column foundation_dogs.ens_name is 'ENS domain for this dog, e.g. lucky.heylola.eth';
