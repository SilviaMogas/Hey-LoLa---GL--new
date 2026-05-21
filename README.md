<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/041ff40c-7f72-4aad-a12c-bcd060760a1d

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Hey Lola Partner Network — invite, claim, verify

Two parallel paths can promote a venue to `Verified`:

1. **Public claim** (any signed-in user) — opens the dialog from a listing,
   submits a claim, admin reviews in the back office.
2. **Email-link claim** (admin-driven outreach) — admin clicks `Invite to
verify` in the back office, the venue receives an email, clicks the
   `/claim-listing/{token}` link, fills the claim form. Admin reviews.

### Auto-approval by domain match

If the contact email used in the claim form **ends with the venue's
website domain** (e.g. `info@coralgablesanimalhospital.com` for the venue
whose website is `coralgablesanimalhospital.com`), the claim is approved
**automatically**:

- `verificationStatus` → `verified`
- `status` → `Verified`
- `partnerStatus` → `active_partner`
- `approvedBy` is stamped as `auto:domain_match`

Anything else (no website on file, mismatched domain, generic mailbox like
gmail) drops to `pending_review` for manual approval.

### Set up

1. **Firebase Admin** env vars on Vercel (see `.env.example`):
   `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`,
   `FIREBASE_ADMIN_PRIVATE_KEY`, `FIREBASE_DATABASE_ID`.
2. **Resend** for transactional email:
   - Sign up at [resend.com](https://resend.com), free tier 100 emails/day.
   - Add your sending domain (e.g. `heylola.co`) and verify the SPF + DKIM
     records Resend gives you. Without a verified sending domain, Resend
     accepts the request but most providers will spam-bin the message.
   - Set `RESEND_API_KEY` on Vercel. Optional: `EMAIL_FROM` (defaults to
     `Hey Lola <hey@heylola.co>`).
   - Without `RESEND_API_KEY` the invite endpoint still works — it just
     returns the rendered claim URL so the operator can paste it into a
     manual email.
3. **Admin allow-list**: `hello@silviamogas.com` and `hey@heylola.co`
   are admins by default. Override with `ADMIN_EMAILS` (comma-separated)
   on Vercel. Mirror the change in `firestore.rules` `isAdmin()`.
4. **Seed** the venue + secret data (one-off):
   `node scripts/import_miami_venues.cjs && node scripts/seed_firestore.mjs`
5. **Send invites**: log in to heylola.co as an admin → Dashboard →
   `BACK OFFICE` → Places tab → click `Invite to verify` per venue.
   Disabled when `contactEmail` is empty.

## Reviewing transactional emails

Every email Hey Lola sends — partner application confirmations, foundation
interest acknowledgements, group join welcomes, admin alerts, etc. — lives
as a React component in [`emails/`](emails/). Designers and copywriters
can preview them in the browser without running the app:

```bash
npm install        # one-time
npm run email      # opens http://localhost:3500
```

See [`emails/README.md`](emails/README.md) for the full guide: how to edit
copy, swap brand colours, send live tests via Resend, and add new templates.
