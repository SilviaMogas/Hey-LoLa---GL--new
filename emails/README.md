# Hey Lola — Email templates

This folder holds every transactional email Hey Lola sends. Each file is a
self-contained React component (a "template") that renders to HTML + plain
text when an API endpoint dispatches the email via Resend.

## How to view the templates

The repo ships with a local preview server that renders every email in the
browser — no app deploy, no Firestore, no Resend account required. This is
the canonical way to review wording and design before approving a change.

### Prerequisites

- **Node.js** (18 or newer). If `node --version` fails, install from
  <https://nodejs.org>.
- One-time install of project dependencies (from the repo root):

  ```bash
  npm install
  ```

  This pulls down `react-email`, `@react-email/components`, `@react-email/ui`
  and everything else listed in `package.json`. Takes ~30 seconds.

### Launch the preview

From the repo root:

```bash
npm run email
```

You should see:

```
React Email 6.1.5
Running preview at: http://localhost:3500
✔ Ready in 0.1s
```

Open **<http://localhost:3500>** in your browser. The left sidebar lists
the 19 templates; click any of them to see the rendered email on the right.

### What you can do inside the preview

- **Switch viewport** — toggle between desktop and mobile widths to confirm
  the email looks right on a phone (where most opens happen).
- **Light / dark mode** — preview against both backgrounds; Gmail, Outlook
  and Apple Mail each pick a different one depending on the user's settings.
- **Plain Text tab** — every email also ships a text-only version (for
  clients that block HTML or for accessibility). Switch tabs at the top to
  audit the wording there too.
- **Send Test** — click the button in the top-right, enter your email and
  the rendered template is sent via your `RESEND_API_KEY` from `.env.local`.
  No Resend key configured? You can still copy the rendered HTML from the
  **Source** tab and paste it into your email client to preview it there.
- **Hot reload** — keep the browser open. Edit any `.tsx` file in this
  folder and the preview refreshes automatically. No restart needed.

### Stopping the server

Press `Ctrl+C` in the terminal where `npm run email` is running.

## Sending every email to your inbox in one shot

The preview server lets you "Send Test" one template at a time. For a full
audit — confirmations *and* admin alerts of every workflow — there's a
batch test script.

### Configure once

Add to `.env.local`:

```bash
RESEND_API_KEY="re_xxx"                         # required — emails actually leave
TEST_USER_EMAIL="designer@example.com"          # autoresponders land here
ADMIN_INBOX_EMAIL="ops@example.com"             # optional — overrides the
                                                # admin alert destination
                                                # (default: hey@heylola.co)
```

The test script substitutes `TEST_USER_EMAIL` into every "user-facing"
recipient slot in the sample data so you receive every autoresponder. Admin
alerts go to `ADMIN_INBOX_EMAIL` if set, otherwise to `hey@heylola.co`.

> ⚠️ `ADMIN_INBOX_EMAIL` also affects real form submissions while the app is
> running — `npm run dev` will route every admin alert to whatever address
> is configured. Unset it (or leave it empty) for production.

### Run the test

```bash
npm run email:test
```

You'll see something like:

```
Hey Lola — email test run
────────────────────────────────────────────────────────────
User inbox (autoresponders):  designer@example.com
Admin inbox (alerts):         ops@example.com
────────────────────────────────────────────────────────────
01 · Venue Invite (admin → venue)              ✓ 1 sent
02 · Partner Application                       ✓ 2 sent
03 · Foundation Interest                       ✓ 2 sent
04 · Group Join                                ✓ 2 sent
05 · Venue Claim (any of 3 entry points)       ✓ 2 sent
06 · Onboarding · Pet Parent (/start)          ✓ 2 sent
07 · Onboarding · Animal Lover (/start)        ✓ 2 sent
08 · Venue Intake (/start)                     ✓ 2 sent
09 · Waitlist (member)                         ✓ 2 sent
10 · Business Lead (B2B inquiry)               ✓ 2 sent
11 · Signup · email/password (with verify link)✓ 2 sent
12 · Signup · Google OAuth (no verify link)    ✓ 2 sent
────────────────────────────────────────────────────────────
Sent: 23    Failed: 0
```

Twelve scenarios, twenty-three emails total. Resend's free plan caps at
100/day so you can run the full suite ~4 times daily without hitting the
limit.

### Troubleshooting

- *"To run the preview server, the package `@react-email/ui` must be
  installed."* → run `npm install` from the repo root; the dependency is
  already declared in `package.json`.
- *"Port 3500 is already in use."* → either close whatever's using it or
  edit the script in `package.json` to pick a different port:
  `"email": "email dev --dir emails --port 3501"`.
- *Templates don't appear in the sidebar* → make sure you launched from the
  repo root, not from inside `emails/`. The script flag `--dir emails`
  needs the parent path.
- *Warning about Next.js workspace / multiple lockfiles* → harmless; react-
  email runs Next.js internally and noticed your global `pnpm-lock.yaml`.
  Doesn't affect rendering.

## How templates are organised

Each user-facing workflow ships **two** templates:

| File | Sent to | Trigger |
|---|---|---|
| `partner-application-confirmation.tsx` | Applicant | Submitted `/partners/onboard` |
| `partner-application-admin.tsx` | `hey@heylola.co` | Same form |
| `foundation-interest-confirmation.tsx` | Visitor | Expressed interest in a rescue passport |
| `foundation-interest-admin.tsx` | `hey@heylola.co` | Same form |
| `group-join-confirmation.tsx` | Member | Joined a community group |
| `group-join-admin.tsx` | `hey@heylola.co` | Same flow |
| `venue-claim-confirmation.tsx` | Venue contact | Any of the 3 venue-claim entry points |
| `venue-claim-admin.tsx` | `hey@heylola.co` | Same flow |
| `onboarding-pet-parent-confirmation.tsx` | Signup | `/start` → Pet Parent |
| `onboarding-pet-parent-admin.tsx` | `hey@heylola.co` | Same form |
| `onboarding-animal-lover-confirmation.tsx` | Signup | `/start` → Animal Lover |
| `onboarding-animal-lover-admin.tsx` | `hey@heylola.co` | Same form |
| `venue-intake-confirmation.tsx` | Venue contact | `/start` → Claim your venue |
| `venue-intake-admin.tsx` | `hey@heylola.co` | Same form |
| `waitlist-confirmation.tsx` | Signup | `WaitlistModal` (member) |
| `waitlist-admin.tsx` | `hey@heylola.co` | Same modal |
| `business-lead-confirmation.tsx` | Inquirer | Signup form → Business |
| `business-lead-admin.tsx` | `hey@heylola.co` | Same form |
| `signup-confirmation.tsx` | New user | Email/password or Google OAuth signup via `Auth.tsx`. Embeds the Firebase verification link as the primary CTA for email signups — this is the **only** verification email the user receives (Firebase's default is suppressed when ours delivers; only used as a fallback if Resend can't send). |
| `signup-admin.tsx` | `hey@heylola.co` | Same flow |
| `venue-invite.tsx` | Venue contact | Admin clicks "Invite to verify" in Back Office (no admin alert — admin is the sender) |

## Editing copy

Each template exposes a `default` React component. The wording lives in
plain JSX text — change what's between the tags and save.

```tsx
// Before
<Body14>Welcome to the Hey Lola community.</Body14>

// After
<Body14>Bienvenida a la comunidad Hey Lola.</Body14>
```

Anything inside curly braces (e.g. `{firstName}`) is a runtime variable —
do **not** rename it, the API endpoints depend on those prop names.

## Brand-wide changes

The header (logo + tagline), footer, colours and spacing live in
`_components/Layout.tsx`. Tweak it once and every template inherits the
change.

The brand stripe at the top has three variants: `charcoal` (default),
`orange` (Foundation flows) and `cream`. Pass `accent="orange"` on the
`<Layout>` to switch.

### The logo

The brand mark "**HeyLola.**" lives as the `BrandLogo` component inside
`_components/Layout.tsx`. It mirrors `/public/logo.svg` exactly (Inter
italic 900, "Hey" in charcoal `#0A0A0A` and "Lola." in brand orange
`#F28C33`) but is rendered as HTML text rather than an embedded image.

Why not embed `logo.svg` directly?

- **Gmail web** strips `<svg>` tags out of the email body.
- **Hosted PNG via `<img>`** triggers the image-blocking placeholder in
  Gmail, Outlook and Yahoo until the recipient explicitly clicks
  "show images" — so the logo would be invisible at first open.
- The mark is just two pieces of styled text, so an HTML recreation gives
  near-pixel fidelity to the SVG without any of the above downsides.

If the brand mark ever stops being pure text (a glyph, a paw print, a
custom shape), revisit `BrandLogo` and switch to a hosted PNG with
`alt`, fixed `width`/`height` and a sensible fallback colour.

## Adding a new template

1. Create `<flow>-<confirmation|admin>.tsx` in this folder.
2. Default-export a React component that returns `<Layout>{...}</Layout>`.
3. Attach `PreviewProps` to the component so the preview shows realistic data.
4. Wire it from `src/lib/email/senders.tsx` (existing patterns are short
   enough to copy/paste).

## Don't

- **Don't** edit `_components/Layout.tsx` unless you're making a brand-wide
  change. Per-template tweaks belong in the template file.
- **Don't** rename prop names (`firstName`, `businessName`, etc.) — the
  endpoints in `api/notify-*.ts` pass these by name.
- **Don't** remove `<Layout>` — it carries the header, footer and email-
  client-safe HTML scaffolding.
- **Don't** add external CSS. React Email re-implements common styles as
  inline JSX props so they survive every email client.
