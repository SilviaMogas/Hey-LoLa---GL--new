# HeyKai Horses — adoption pipeline

The HeyKai Foundation page (`/heykai`) is the equine sister to Hey Lola.
This document covers the public horse-adoption pipeline at `/heykai/horses`.

Same shape as the foundation dogs flow:

```
public/UI  →  Supabase table  →  scraper endpoint  →  rescue website
listing       foundation_horses   /api/scrape-horses     (the actual source of truth)
passport
```

## Pieces

| Piece                                                | Path                                          |
| ---------------------------------------------------- | --------------------------------------------- |
| Supabase migration                                   | `supabase/migrations/004_foundation_horses.sql` |
| Admin-protected scraper endpoint                     | `api/scrape-horses.ts`                        |
| Listing page (`/heykai/horses`)                      | `src/components/HeyKaiHorses.tsx`             |
| Passport page (`/heykai/horses/:slug`)               | `src/components/HeyKaiHorsePassport.tsx`      |
| Row helpers + camelCase mapping                      | `src/data/foundationHorses.ts`                |
| Routes                                               | `src/lib/routes.ts` (`heyKaiHorses`, `heyKaiHorsePassport`) |
| Foundation CTA section                               | `src/components/HeyKaiFoundation.tsx`         |
| Footer link                                          | `src/components/Footer.tsx` ("HeyKai Foundation" column) |

## Schema — `foundation_horses`

| Column            | Type        | Notes                                                                            |
| ----------------- | ----------- | -------------------------------------------------------------------------------- |
| `id`              | uuid PK     | `default uuid_generate_v4()`                                                     |
| `name`            | text        | Display name (required).                                                         |
| `slug`            | text        | Stable URL slug, also embedded in `passport.slug`. Used by `/heykai/horses/:slug`. |
| `breed`           | text        | E.g. "Andalusian", "Quarter Horse", "Welsh Pony".                                |
| `discipline`      | text null   | "dressage", "western", "leisure", "retired", … (nullable).                       |
| `age`             | text        | "12 years", "Yearling", …                                                        |
| `sex`             | text null   | gelding / mare / stallion / colt / filly / male / female.                        |
| `height_hands`    | numeric null| Horse height in hands (e.g. `15.2`).                                             |
| `photo`           | text null   | Primary image URL.                                                               |
| `bio`             | text        | Short description / story (best-effort from scraper).                            |
| `location`        | text null   | City / region display string.                                                    |
| `source_url`      | text        | **Unique**. Canonical adoption listing URL. De-dupes scraper re-runs.            |
| `partner_name`    | text        | Rescue name — shown on every card and passport.                                  |
| `partner_country` | text        | `US` / `ES` / `UK`.                                                              |
| `passport`        | jsonb       | `{ slug, publicUrl, visibility, verificationStatus, createdAt, updatedAt }`.     |
| `visibility`      | text        | `public` (default) or `hidden`.                                                  |
| `status`          | text        | `available` (default), `unavailable`, `hidden`.                                  |
| `data`            | jsonb       | Catch-all for ad-hoc fields we don't model yet.                                  |
| `created_at`      | timestamptz |                                                                                  |
| `updated_at`      | timestamptz |                                                                                  |

### RLS

* **Public read** — `visibility = 'public' AND status = 'available'`.
* **All writes** — service-role only (`/api/scrape-horses` via `SUPABASE_SERVICE_ROLE_KEY`).

Index strategy mirrors `foundation_dogs`: `status`, `partner_country`,
`visibility`, `slug`, and a partial UNIQUE on `source_url` so the scraper
can `upsert(onConflict: 'source_url')` without ever inserting duplicates.

## Running the scraper

The scraper lives at `POST /api/scrape-horses`. It expects a Bearer
`SCRAPER_SECRET` header and a JSON body selecting which sources to run:

```bash
# After deploying, seed every source in one go:
curl -X POST https://heylola.co/api/scrape-horses \
  -H "Authorization: Bearer $SCRAPER_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"source":"all"}'

# Per-country variants:
curl -X POST https://heylola.co/api/scrape-horses \
  -H "Authorization: Bearer $SCRAPER_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"source":"us"}'   # US only
# …same with "es" or "uk"
```

The response gives a per-source breakdown:

```json
{
  "success": true,
  "source": "all",
  "totals": { "found": 42, "inserted": 38 },
  "results": [
    { "source": "world-horse-welfare", "country": "UK", "ok": true,
      "found": 12, "inserted": 12, "skipped": 0 },
    { "source": "petfinder",           "country": "US", "ok": true,
      "found": 0,  "inserted": 0,  "skipped": 0,
      "error": null }
  ]
}
```

### Environment

| Variable                       | Purpose                                                     |
| ------------------------------ | ----------------------------------------------------------- |
| `SCRAPER_SECRET`               | Bearer token for `/api/scrape-horses`. **Required.**        |
| `SUPABASE_URL`                 | Same as the rest of the API surface.                        |
| `SUPABASE_SERVICE_ROLE_KEY`    | Used by `api/_supabase.ts` admin client. **Required.**       |

A missing `SCRAPER_SECRET` returns `500` with a clear error; missing
Supabase env vars surface the same way through `_supabase.ts`.

### Idempotency

Every row is upserted on `source_url` (unique index). Re-running the
scraper updates `name / breed / photo / bio / updated_at` etc. without
inserting duplicates. To force a re-import for a specific listing, just
`DELETE FROM foundation_horses WHERE source_url = '…'` and re-run.

## Adding a new rescue source

1. Open `api/scrape-horses.ts`.
2. Write a `parseFoo(html, listUrl): ScrapedHorse[]` function. Reuse
   `extractCards(html, listUrl, /detail-fragment/i)` to pull `(href, name,
   photo)` triples from `<a>` tags whose `href` matches your fragment.
   Anything beyond name + source URL + photo is best-effort and lives
   in `enrich(horse)` (it walks the detail page once).
3. Add an entry to `SOURCES`:
   ```ts
   { key: 'my-rescue', country: 'ES', partnerName: 'My Rescue',
     listUrl: 'https://my-rescue.org/horses', parse: parseFoo }
   ```
4. POST `{"source":"es"}` (or `"all"`) and check the per-source `results`
   row in the response. If `found: 0`, your `detailFragment` regex
   probably doesn't match the live HTML — open the page, view source,
   pick a URL fragment that's unique to detail pages and retry.

### Seeded sources

| Country | Source                                              | Notes                                                         |
| ------- | --------------------------------------------------- | ------------------------------------------------------------- |
| US      | Habitat for Horses (`habitatforhorses.org`)         | Listing page exposes static cards — usually scrapes cleanly.  |
| US      | The Right Horse Initiative (`therighthorse.org`)    | Static `/adopt` directory.                                    |
| US      | Petfinder (`petfinder.com/search/horses-for-adoption`) | React-rendered; cards still leak into the HTML, but Petfinder occasionally rate-limits — check `results[*].error` after a run. |
| ES      | ANAA (`anaaweb.org`)                                | Filters listings whose link text mentions caballo/yegua/poni. |
| ES      | Fundación Caballista (`fundacionequina.es`)         | Section `/caballos/` + `/apadrina/`.                          |
| ES      | Save a Horse Spain (`saveahorse.es`)                | Static `/horses/` directory.                                  |
| UK      | World Horse Welfare (`worldhorsewelfare.org`)       | `/rehome-a-horse` — the cleanest UK source.                   |
| UK      | Blue Cross (`bluecross.org.uk`)                     | Filters `/pet/` cards by species keywords.                    |
| UK      | Redwings (`redwings.org.uk`)                        | `/adopt-a-horse` directory.                                   |

## DMCA / attribution policy

HeyKai surfaces horses that are already publicly listed by a verified
rescue partner. We don't operate adoptions, and we don't take a fee.
Two non-negotiables in the UI:

1. **Every horse card** (`HeyKaiHorses.tsx`) renders a `partner_name`
   badge **plus** an outbound `<a href={source_url}>` "View on {partner}"
   link. Both are always visible — never tucked behind a hover state.
2. **Every horse passport** (`HeyKaiHorsePassport.tsx`) shows the partner
   in the hero, in the Identity grid (Source partner / Source / Country),
   in the Trust layer, and as the primary CTA ("Adopt at {partner}"
   button linking to `source_url`). There is no internal "submit
   adoption application" form — final decisions stay with the rescue.

If a rescue requests removal, run:

```sql
update foundation_horses
   set visibility = 'hidden', status = 'hidden', updated_at = now()
 where partner_name = 'Their Rescue Name';
```

Public RLS hides those rows immediately. Don't `DELETE` — keep the
record so the scraper doesn't re-insert it on its next run (unique
`source_url` index would conflict only if we kept the row; soft-hiding
also lets a future re-onboarding be a one-line update).

## Visiting the UI

| URL                          | What it does                                          |
| ---------------------------- | ----------------------------------------------------- |
| `/heykai`                    | HeyKai Foundation page (CTA section links to horses). |
| `/heykai/horses`             | Listing of every public + available horse.            |
| `/heykai/horses/:slug`       | Single passport. `slug` matches `foundation_horses.slug`. |
