# Phase 1a — Launch Checklist

Technical SEO foundation for FinVerse. 16 files to push, 3 verifications required, 2-3 env var checks before Vercel build will succeed.

## File inventory

### NEW files (2)
- `client/src/components/SEO.tsx` — reusable SEO component using React 19 native metadata hoisting
- `scripts/generate-sitemap.mjs` — build-time sitemap generator pulling from Supabase

### MODIFIED files (14)
- `client/index.html` — hygiene fixes + global OG/Twitter foundation
- `package.json` — adds `prebuild` script
- `client/src/pages/Home.tsx` — SEO + Organization schema
- `client/src/pages/Framework.tsx` — SEO
- `client/src/pages/Blog.tsx` — SEO
- `client/src/pages/Article.tsx` — SEO + dynamic Article schema
- `client/src/pages/About.tsx` — SEO + Person schema
- `client/src/pages/Resources.tsx` — SEO + Bookmap added + duplicate `useState` import bug fixed
- `client/src/pages/Education.tsx` — SEO
- `client/src/pages/Blueprint.tsx` — SEO + Course schema
- `client/src/pages/CourseLandingSMC.tsx` — SEO + Course schema
- `client/src/pages/RefundPolicy.tsx` — SEO
- `client/src/pages/PrivacyPolicy.tsx` — SEO
- `client/src/pages/TermsOfUse.tsx` — SEO

---

## CRITICAL: Three pre-push verifications

### 1. Home.tsx — Udemy CTA conflict

The staged `Home.tsx` has the Udemy referral link still active in the bottom CTA section. This contradicts the locked decision (no Udemy promotion from FinVerse).

Project memory says "Homepage Udemy CTA → internal /education" was completed in Phase 0. But the snapshot I read still has the Udemy URL.

**Before pushing Home.tsx, verify on your live site:**

- Open https://finverse.world (incognito)
- Scroll to bottom — is there a "Smart Money Concepts" CTA section with a "View Course" button?
- Click it (without buying anything). Where does it land?
  - If Udemy → my snapshot is current, my staged version is fine to push (CTA still goes to Udemy, broken vs. your strategy)
  - If `/education` or `/courses/smc-complete-guide` → my snapshot is stale, **do not push my Home.tsx as-is** — you'll regress the fix

**If the Udemy CTA still goes to Udemy on live, here's the correct fix to apply to my staged Home.tsx:**

In `client/src/pages/Home.tsx`:

Replace this line near the top:
```typescript
const UDEMY_URL = "https://www.udemy.com/course/smart-money-concepts-the-complete-guide-to-smart-trading/?referralCode=C4DBD99FE2D9012F18F5";
```
With:
```typescript
const SMC_COURSE_URL = "/courses/smc-complete-guide";
```

Then find the `<a href={UDEMY_URL}` element and change it to `<Link href={SMC_COURSE_URL}` (also remove `target="_blank"` and `rel="noopener noreferrer"` since it's an internal route now).

### 2. CourseLandingSMC.tsx — STRIPE_LINK placeholder

The staged version has:
```typescript
const STRIPE_LINK = "REPLACE_WITH_STRIPE_PAYMENT_LINK";
```

Yesterday you replaced this with the real Stripe Payment Link URL when you pushed.

**Before pushing CourseLandingSMC.tsx:**
- Open the file
- Replace `REPLACE_WITH_STRIPE_PAYMENT_LINK` with your actual Stripe Payment Link URL (the `https://buy.stripe.com/...` link you saved)

If you push the placeholder, the live "Enrol Now" button breaks.

### 3. Image assets — og-image.png and logo.png

The SEO component references:
- `https://finverse.world/og-image.png` (Open Graph card image, 1200×630)
- `https://finverse.world/logo.png` (Organization schema, JSON-LD logo)

**Verify these exist:**
- Visit https://finverse.world/og-image.png in browser — does it return an image or 404?
- Same for /logo.png

**If either is 404:**

Option A (proper fix): Create both images and place in `client/public/`:
- `og-image.png` — 1200×630 PNG, FinVerse branding (deep black + warm gold + cream serif). Typically: site logo + tagline. Used on every social share.
- `logo.png` — square logo, 512×512 minimum, transparent background. Used in JSON-LD Organization schema.

Option B (defer): Edit `client/src/components/SEO.tsx`:
- Change `DEFAULT_OG_IMAGE = "/og-image.png"` to a fallback you DO have, OR remove the OG image meta entirely
- Edit `organizationSchema` to remove the `logo` field

Option C (push as-is): Push without images. OG cards on social shares will look broken (missing image), but other meta works correctly. Add images in V1.5.

**Recommended: Option A or B.** Don't push with broken image refs.

---

## CRITICAL: Vercel env vars for sitemap generator

The `prebuild` script needs to read from Supabase at build time. Required env vars on Vercel:

- `SUPABASE_URL` — already set (used by webhook)
- `SUPABASE_ANON_KEY` — **needs to be added if not present**

**Check Vercel dashboard:**
- Project → Settings → Environment Variables
- Confirm `SUPABASE_URL` exists for Production environment
- Add `SUPABASE_ANON_KEY` if missing — value is your Supabase anon key (different from service role)
  - Find it: Supabase dashboard → Project Settings → API → "Project API keys" → `anon` `public`

**Fallback behavior:** If env vars are missing, the sitemap generator falls back to a static sitemap with just public pages (no blog posts, no dynamic content). Build still succeeds. So if you push without setting `SUPABASE_ANON_KEY`, nothing breaks — you just won't have blog posts in the sitemap until you add the env var.

---

## Push order (recommended)

Push in this order to minimize risk:

### Push 1: Hygiene + sitemap infra (safe, low-risk)
- `client/index.html`
- `package.json`
- `scripts/generate-sitemap.mjs`

If Vercel build succeeds → sitemap infra works.

### Push 2: SEO component + simple pages
- `client/src/components/SEO.tsx`
- `client/src/pages/RefundPolicy.tsx`
- `client/src/pages/PrivacyPolicy.tsx`
- `client/src/pages/TermsOfUse.tsx`
- `client/src/pages/Resources.tsx`
- `client/src/pages/Framework.tsx`

If Vercel build succeeds → SEO component pattern works.

### Push 3: Dynamic pages
- `client/src/pages/About.tsx`
- `client/src/pages/Blog.tsx`
- `client/src/pages/Article.tsx`
- `client/src/pages/Education.tsx`
- `client/src/pages/Blueprint.tsx`
- `client/src/pages/CourseLandingSMC.tsx` (after Stripe link replacement)

### Push 4: Home (after verifying Udemy CTA state)
- `client/src/pages/Home.tsx`

If you're confident, you can push all 16 files at once. Sequential push is safer for diagnosing if something breaks.

---

## Post-push verification (15 min)

### 1. Vercel build success
Check Vercel dashboard. Build should show new `prebuild` step running before `vite build`. Look for:
```
[sitemap] fetched X posts, Y courses
[sitemap] wrote N urls to client/public/sitemap.xml
```
in build logs.

If you see `[sitemap] Supabase env vars not set — using static sitemap only`, your `SUPABASE_ANON_KEY` env var isn't set or named differently. Build will still succeed but sitemap is static.

### 2. View source on live site

Visit any page, view page source (Cmd+U / Ctrl+U). Should see in `<head>`:
- `<title>` updated to match page
- `<meta name="description">` matches page-specific description
- `<link rel="canonical">` present
- `<meta property="og:title">`, `og:description`, `og:url`, `og:image`, `og:type`
- `<meta name="twitter:card">`, `twitter:title`, etc.
- `<script type="application/ld+json">` with appropriate schema

### 3. Sitemap accessible

Visit https://finverse.world/sitemap.xml — should show full XML sitemap with all pages + blog posts + courses.

### 4. Validate with Google's tools

- **Rich Results Test:** https://search.google.com/test/rich-results
  - Test https://finverse.world (Organization schema)
  - Test https://finverse.world/courses/smc-complete-guide (Course schema)
  - Test https://finverse.world/blog/[any-published-slug] (Article schema)
- **Sitemap submission:** Google Search Console → Sitemaps → submit `https://finverse.world/sitemap.xml`
  - You already have GSC verified from yesterday
  - The "Couldn't fetch" status from yesterday will resolve once the new sitemap is live

### 5. Test social card preview

- LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/
- Twitter Card Validator: https://cards-dev.twitter.com/validator
- Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/

Paste your homepage URL. Confirm OG card renders with the correct title, description, and image.

---

## What this doesn't do (V1.5)

- Per-page OG images (currently all pages share `/og-image.png`) — V1.5 generates per-page images for blog posts and course pages
- Multilingual `hreflang` tags — not needed yet, English-only site
- Mobile-app deep links / Smart App Banners — no mobile app
- AMP versions — declining standard, skip
- Pre-rendering / SSG — current SPA approach is sufficient with React 19's metadata hoisting; consider when you need actual server-side data fetching for SEO

---

## What's next after Phase 1a

**Phase 1b — Lead magnet + email infrastructure:**
- Lead magnet PDF (LinkedIn carousel style; GPT prompt drafted, ready)
- Email capture forms on `/framework`, article footers, possibly homepage
- Resend integration (env vars, sender domain config)
- Sender email decision: `journal@finverse.world` aliased to `support@`
- 5-email nurture sequence (drafted in earlier sessions, needs review)
- Lead magnet upload + automated delivery

This is the next workstream after Phase 1a is verified live.

---

## Index update for end of session

Add this to your session log:

**Date:** May 10, 2026
**Phase:** 1a (Technical SEO foundation)

**Decisions:**
- Meta tag injection: React 19 native hoisting (no react-helmet-async dependency)
- OG image: single shared `/og-image.png` for V1; per-page in V1.5 once imagery infrastructure exists
- Sitemap: build-time generator pulling from Supabase, falls back gracefully if env vars missing
- Sitemap update strategy: regenerated on every Vercel deploy; new blog posts/courses appear in sitemap on next deploy after publish

**Insights:**
- React 19 (Dec 2024) introduced native metadata hoisting — `<title>`, `<meta>`, `<link>` rendered anywhere in tree get auto-hoisted to `<head>` and deduplicated. No external library needed for our use case.
- `react-helmet-async` v3.0.0 (March 2026) detects React 19 at runtime and acts as transparent passthrough; either approach works but native is leaner
- `Resources.tsx` had a duplicate `useState` import (pre-existing bug) — fixed silently in this push
- Local repo snapshot may diverge from deployed code on some files; verified Home.tsx Udemy CTA discrepancy before push
- Vercel `prebuild` script runs before `vite build`, so generated files in `client/public/` end up in the dist bundle automatically

**Pending:**
- Push the 16 staged files in 4 batches per recommended order
- Verify SUPABASE_ANON_KEY env var on Vercel
- Create or fallback on `og-image.png` and `logo.png`
- Resolve Home.tsx Udemy CTA state (verify on live site)
- Submit fresh sitemap to GSC after deploy
- Validate JSON-LD via Google Rich Results Test
- Phase 1b begins after Phase 1a verified live
