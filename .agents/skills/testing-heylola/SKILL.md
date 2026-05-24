---
name: testing-heylola
description: Test the Hey Lola app end-to-end. Use when verifying UI rendering, console errors, and runtime behavior of the React + Firebase app.
---

# Testing Hey Lola App

## Quick Start

1. Start the dev server: `cd /home/ubuntu/repos/Hey-LoLa---GL--new && npm run dev`
2. Server runs on `http://localhost:3000`
3. Use Python Playwright via CDP (`http://localhost:29229`) to capture console output programmatically

## Environment

- **Frontend**: React 19 + Vite + TypeScript 5.8 + React Router v6
- **Backend**: Firebase (Auth + Firestore), Express.js API routes
- **Deployment**: Vercel (preview URLs appear in PR comments from vercel[bot])
- **Email**: Resend + React Email (preview at `localhost:3500` via `npx react-email dev`)

## Key Test Scenarios

### 1. Unauthenticated Visitor Tests (no Firebase login needed)
- Visit `/community`, `/explore`, `/club`, `/` — all should render without console errors
- Check for Firestore "Missing or insufficient permissions" errors (indicates unguarded Firestore subscriptions)
- Check for React Router deprecation warnings ("React Router Future Flag Warning")
- Vercel Analytics debug logs are expected and normal in dev mode

### 2. Authenticated User Tests (requires Firebase credentials)
- Dashboard pet-lover CTA — login as pet-lover user with no pets, verify CTA appears
- Admin Back Office — login as admin, verify Broadcast tab and feature flags
- Onboarding flow — create new account, go through pet type selection

### 3. Signup & Signin Flow Tests (can create new accounts without admin creds)
- **Signup flow**: Navigate to `/signup`, fill all fields (username, first/last name, email, password, confirm, terms checkbox), submit → should reach `/onboarding` (NOT `/verify-email`)
- **Onboarding completion**: 7 steps: pet type → pet name → photo (skippable) → identity/details → medical records → lifestyle → your journey → `/dashboard`
- **Verification banner**: Unverified users see an amber `VerifyEmailBanner` below the navbar on `/dashboard` with email text, "Resend" button, and "X" dismiss
- **Resend button**: Changes banner text to "Verification link sent — check your inbox."
- **Dismiss button**: Removes banner from DOM; banner stays dismissed during same session (parent layout mount) but resets on re-login
- **Sign out → sign in**: After signing out, unverified user can access `/login` normally (NOT redirected to `/verify-email`) and sign back in to `/dashboard`
- **Test email format**: Use `testuser<timestamp>@test.com` for unique accounts. Firebase accepts these for `sendEmailVerification`.
- **Banner click target**: The amber banner is very thin (~30px). Use Playwright CDP `page.evaluate()` with `document.querySelector` to click buttons reliably instead of coordinate-based clicking.

### 4. Email Trigger Tests (journey emails)
- **Onboarding-complete email trigger**: Sign up → complete 7-step onboarding → verify `POST /api/notify-onboarding-complete` fires via browser performance API or CDP network monitoring
- **isFirstRun guard**: After first onboarding, add a second pet via dashboard → "Add Pet" → complete flow → verify NO `/api/notify-onboarding-complete` fires (CDP monitor should capture 0 requests)
- **Email-verified trigger**: Code inspection only — `src/App.tsx` has `void fetch('/api/notify-email-verified')` inside the email verification polling `useEffect`. Cannot test at runtime without clicking a real Firebase verification link.
- **Welcome email trigger**: Fires during signup at `POST /api/notify-signup` — verify via performance API alongside onboarding-complete test
- **Local limitation**: Vite dev server serves `/api/` routes as raw TypeScript source (not as serverless functions). The `fetch()` calls still fire (verifiable via performance API) but responses are 404. Actual API execution requires Vercel deployment.
- **Network monitoring pattern**: Use `performance.getEntriesByType('resource').filter(e => e.name.includes('/api/notify'))` via Playwright CDP to check if fetch calls fired. For ongoing monitoring, use CDP `Network.requestWillBeSent` event listener.
- **Performance buffer caveat**: `performance.getEntriesByType('resource')` gets cleared on page navigation. Check it BEFORE the page navigates away, or use CDP `Network.requestWillBeSent` which persists across navigations.

### 5. Build & Type Safety
- `npx tsc --noEmit` — should exit 0 with zero errors
- `npx vite build` — should complete without errors

## Console Capture via Playwright (Python)

The Chrome browser exposes CDP at `http://localhost:29229`. Use this pattern to capture console output:

```python
from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.connect_over_cdp("http://localhost:29229")
    ctx = browser.contexts[0]
    page = ctx.pages[0] if ctx.pages else ctx.new_page()

    errors = []
    def on_console(msg):
        if "error_pattern" in msg.text:
            errors.append(msg.text)

    page.on("console", on_console)
    page.goto("http://localhost:3000/community", wait_until="domcontentloaded", timeout=15000)
    time.sleep(5)  # Wait for async ops
    print(f"Errors found: {len(errors)}")
    browser.close()
```

**Important**: Use `page.url` (property) not `page.url()` (method) in Python Playwright.
Use `wait_until="domcontentloaded"` instead of `"networkidle"` — some pages (especially `/explore` with map tiles) may have long-running network requests that cause `networkidle` to timeout.

## Browser Navigation Tips

- The Chrome address bar may not respond to `Ctrl+L` when a Google form is focused. Use Playwright CDP navigation instead of manual keyboard shortcuts.
- DevTools console (`F12`) may steal focus from the page. Close DevTools before using nav bar links.
- When recording, maximize the browser first: `sudo apt-get install -y wmctrl 2>/dev/null; wmctrl -r :ACTIVE: -b add,maximized_vert,maximized_horz`
- Port 3000 might be in use from a previous session. Vite auto-increments to 3001+. Check the dev server output for the actual port and use that in both browser and Playwright scripts.
- Vercel preview URLs might return 401 (auth-protected). If so, use the local dev server on the PR branch instead.

## CI Notes

- Vercel deploys preview URLs for PRs — check the vercel[bot] comment on the PR for the URL
- SonarCloud Code Analysis might be cancelled/failing — this is a preexisting issue on the main branch, not caused by PR changes. Verify by checking `gh api repos/OWNER/REPO/commits/main/check-runs`
- All CI checks are marked `[optional]` in this repo

## Devin Secrets Needed

- **Firebase credentials** — needed for authenticated user tests (login, dashboard, admin panel)
- **Resend API key** — needed for testing email broadcast functionality
- Neither is needed for unauthenticated visitor tests or build verification
