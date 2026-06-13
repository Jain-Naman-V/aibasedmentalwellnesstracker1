# MindGuard — AI Mental Wellness Companion

An AI-powered wellness tracker for students preparing for competitive exams (NEET, JEE, CUET, etc.). Tracks mood, journals with AI analysis, and provides personalized support through an AI companion chat.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Set up environment variables
cp .env.example .env.local
# Then edit .env.local with your keys

# 3. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the app works immediately with mock data. No API keys required.

## Features

- **Welcome → Auth → 4-step Onboarding** — Exam type, exam date (days-remaining), study habits, API config
- **Home Dashboard** — Streak counter, 7-day mood average, check-in prompt, latest insight
- **Daily Check-in** — Mood slider (1–10 with emojis), tags, journal with AI analysis ("Reading between the lines" loading state)
- **AI Companion Chat** — Context-aware streaming chat (exam type, triggers, mood avg in system prompt). Crisis keywords trigger helpline cards (iCall +91-9152987821, Vandrevala 1860-266-2345)
- **Insights Page** — 30-day mood chart (Recharts, tappable points), week-over-week mood comparison, top 5 stress triggers, weekly narrative
- **Settings** — Profile editor, API config (localStorage only, masked key, test connection), privacy notice
- **Streak Milestones** — Celebration cards at 7 and 30 consecutive days

## Environment Variables

See `.env.example` for all options. None are required — the app runs fully on mock data.

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase project URL (auth + database) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Supabase anonymous key |
| `ANTHROPIC_API_KEY` | No | Claude API key for real AI analysis |

**Mock auth mode:** When Supabase env vars are unset, the app uses localStorage-based mock auth. Sign up with any email/password.

**API keys for AI:** Can also be set in-app via Settings or onboarding Step 4. Keys are stored in `localStorage` only — never sent to our server.

## Routes

| Path | Page |
|------|------|
| `/` | Welcome / landing |
| `/auth/signup` | Sign up (email/password or magic link) |
| `/auth/login` | Sign in |
| `/onboarding` | 4-step onboarding wizard |
| `/dashboard` | Home dashboard (protected) |
| `/checkin` | Daily check-in (protected) |
| `/chat` | AI companion chat (protected) |
| `/insights` | Mood trends & patterns (protected) |
| `/settings` | Profile & API config (protected) |

## Tech Stack

- **Next.js 15** (App Router)
- **React 19** with TypeScript strict
- **Tailwind CSS v3** + shadcn/ui primitives
- **Supabase** (optional — auth + database)
- **Recharts** (mood charts)
- **Vitest** (testing — 44 tests)

## Running Tests

```bash
npx vitest run
```

## Architecture

```
src/
├── app/           # Next.js App Router pages + API routes
│   ├── api/       # REST endpoints (journal, mood, chat, insights)
│   ├── auth/      # Login & signup
│   └── ...
├── components/    # UI components (ChatInterface, NavBar, AuthGuard)
├── contexts/      # React contexts (AuthContext)
├── data/          # Mock data layer (30 mood logs, 5 journal entries)
├── hooks/         # React hooks (useChat)
└── lib/           # Utilities (validation, supabase client, API config)
```

## Privacy

- API keys are stored in `localStorage` only — never transmitted to our servers
- Journal entries are stored in the database linked only to your account
- Crisis helplines are hardcoded and triggered by keyword detection
- No data is sold or shared with third parties
