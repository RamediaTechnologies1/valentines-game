# LoveScroll by Ramedia

A personalized, interactive scroll-based love experience. Buyers purchase a tier, upload photos + write a love letter, and the system generates a beautiful shareable link for their partner.

## Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.local.example .env.local

# 3. Fill in your keys (see Setup section below)

# 4. Run dev server
npm run dev
```

Open http://localhost:3000

---

## Setup Guide

### 1. Supabase

1. Create a project at https://supabase.com
2. Go to **SQL Editor** → paste the contents of `supabase/schema.sql` → Run
3. Go to **Storage** → Create bucket called `experience-photos`
   - Public: ✅ Yes
   - File size limit: 10MB
   - Allowed types: `image/jpeg, image/png, image/webp`
4. Copy your keys from **Settings → API**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 2. Stripe

1. Create account at https://stripe.com
2. Go to **Products** → Create 4 products:
   - **LoveScroll Lite** — $19 (one-time)
   - **LoveScroll Classic** — $49 (one-time)
   - **LoveScroll Forever** — $99 (one-time)
   - **Express Delivery** — $10 (one-time)
3. Copy each product's **Price ID** (starts with `price_`)
4. Copy your API keys from **Developers → API Keys**:
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### 3. Gmail API

See `docs/GMAIL_SETUP.md` for the full step-by-step guide.

### 4. Deploy to Vercel

```bash
# Push to GitHub
git init && git add . && git commit -m "LoveScroll MVP"
gh repo create lovescroll --private --push

# Or push manually
git remote add origin YOUR_REPO_URL
git push -u origin main
```

1. Go to https://vercel.com → Import your repo
2. Add all environment variables from `.env.local`
3. Deploy

### 5. Connect Domain

1. In your domain registrar, add a CNAME record:
   - Name: `love`
   - Value: `cname.vercel-dns.com`
2. In Vercel project → Settings → Domains → Add `love.ramedia.com`
3. Wait for DNS propagation (usually < 5 min)

---

## Architecture

```
love.ramedia.com/                → Landing page + pricing
love.ramedia.com/create          → Post-payment intake form
love.ramedia.com/ready           → "Your link is ready" + share
love.ramedia.com/v/[slug]        → The experience
love.ramedia.com/admin           → Dashboard
```

### Payment Flow
```
Landing → Pick Tier → Stripe Checkout → /create → Upload Photos →
  → System creates experience → /ready (copy link + share) →
  → Cron sends email after delay → Partner opens link →
  → Experience with game → Love letter → "Create yours" CTA
```

### Tech Stack
- Next.js 14 (App Router)
- Tailwind CSS v4
- Framer Motion
- Supabase (Postgres + Storage)
- Stripe Checkout
- Gmail API (Google Workspace)
- Vercel (hosting + cron)

---

## Tiers

| Tier | Price | Photos | Recording | Hosting |
|------|-------|--------|-----------|---------|
| Lite | $19 | 3 | ❌ | 30 days |
| Classic | $49 | 7 | ✅ | 6 months |
| Forever | $99 | 10 | ✅ | 1 year |

---

## Admin

Access at: `love.ramedia.com/admin`

Shows: orders, revenue, views, delivery status, retry failed emails.

---

## Cron Jobs

`/api/send-delivery` runs every 5 minutes (configured in `vercel.json`).
Processes pending deliveries where `delivery_time` has passed.

Add `CRON_SECRET` to Vercel env vars to secure the endpoint.

---

## File Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout + fonts
│   ├── globals.css                 # Tailwind + animations
│   ├── not-found.tsx               # 404 page
│   ├── global-error.tsx            # Error boundary
│   ├── create/                     # Post-payment form
│   ├── ready/                      # Link ready confirmation
│   ├── v/[slug]/                   # The experience
│   ├── admin/                      # Dashboard
│   └── api/
│       ├── checkout/               # Stripe checkout
│       ├── verify-session/         # Payment verification
│       ├── create-experience/      # Save to Supabase
│       ├── upload-photo/           # Photo upload
│       └── send-delivery/          # Email delivery
├── components/
│   ├── landing/                    # Hero, HowItWorks, Pricing, etc.
│   ├── create/                     # IntakeForm, PhotoUploader
│   ├── experience/                 # All experience components
│   └── recording/                  # Reaction recording system
├── hooks/
│   ├── useExperience.ts            # Load experience data
│   └── useReactionRecorder.ts      # Recording logic
└── lib/
    ├── gmail.ts                    # Gmail API client
    ├── email-template.ts           # HTML email template
    ├── stripe.ts                   # Stripe client
    ├── supabase.ts                 # Browser client
    ├── supabase-admin.ts           # Service role client
    ├── tiers.ts                    # Tier configuration
    ├── slug.ts                     # Slug generation
    ├── compress.ts                 # Image compression
    └── constants.ts                # App constants
```
