# Changelog

All notable changes made to this project are logged here, newest first.
Format: `[date] — summary`, followed by the specific edits.

## 2026-09-20 — Groq key wired up, model fixed, verified live

- **Fixed a secret-exposure risk**: you'd pasted your real `GROQ_API_KEY` into `.env.local.example`, which is *not* gitignored (only `.env.local` is — see `.gitignore`). Moved the real key into `.env.local` (confirmed gitignored) and restored `.env.local.example` to a blank template. The key was never committed, so nothing leaked — just relocated before it could be.
- **Fixed the model id in `app/api/chat/route.ts`**: `llama-3.3-70b-versatile` returned `404 model_not_found` on your key — Groq's free lineup has changed. Switched to `openai/gpt-oss-120b`, confirmed available via `GET /v1/models` on your key.
- **Verified live end-to-end**: started the dev server with your key loaded, called `/api/chat` directly (got a real answer about dry skin), then drove the actual UI in Chrome — started a call, asked "My hair is very oily, what should I use?", got a correct, on-brand, contextual reply, spoken aloud via TTS in real time. Conversation history/follow-ups confirmed working too.

## 2026-09-20 — Real voice conversation: STT + TTS + LLM

Goal: make "Talk to Mama" an actual working conversation instead of a UI mockup — the user speaks, the bot transcribes it, sends it to a real LLM, and speaks the answer back.

- **Added `app/api/chat/route.ts`** (server-side, so the API key never reaches the browser)
  A Next.js route handler that takes the running conversation and calls **Groq's free-tier chat completions API** (`llama-3.3-70b-versatile`) with a "Mama" system prompt: short spoken-style replies (1–3 sentences, no markdown/lists/emoji since it's read aloud by TTS), scoped to skin/hair/baby-care guidance, and told to admit uncertainty on exact prices/policy instead of inventing facts. Returns a clean, typed error (`{ error }`) for a missing key, a bad upstream response, or a network failure, so the UI never gets stuck.
  Chose Groq because it has a genuinely free tier (no credit card) and is fast enough for a live voice back-and-forth — required per your request to "use all the free tools available."

- **Added `lib/speech.d.ts`**
  TypeScript doesn't ship types for the Web Speech API's `SpeechRecognition` (still non-standard/Chrome-first), so this adds minimal typings for `SpeechRecognition`, its event/result types, and `window.SpeechRecognition` / `window.webkitSpeechRecognition`.

- **Added `.env.local.example`**
  Template for the one env var the app needs: `GROQ_API_KEY`. Copy it to `.env.local` (already gitignored) and fill in a free key from https://console.groq.com/keys.

- **Rewrote `components/mamaearth-chatbot.tsx`** to add the real conversation loop:
  - **STT**: browser-native `SpeechRecognition` captures the mic after each Mama reply, shows a live interim transcript bubble while the user is talking, and finalizes on a completed utterance.
  - **LLM**: finalized user text is POSTed to `/api/chat` with the last 12 turns of history; the reply is added to a scrollable transcript (previously there was no transcript at all — just a static caption).
  - **TTS**: replies are spoken with `window.speechSynthesis`, preferring a female-sounding system voice if one is available; the mic automatically resumes listening once Mama finishes speaking, so the conversation continues hands-free until the user mutes or ends the call.
  - **Text fallback**: added an input + send button so the demo still works if the mic/STT misbehaves on unfamiliar hardware (important for a live interview) — same `/api/chat` path either way.
  - Wired the previously-decorative speaker button to **replay the last reply**.
  - Status pill now reflects real state: *Listening… / Thinking… / Mama is speaking / Microphone muted*, instead of a hardcoded "Live voice support" label.
  - Errors (missing API key, network failure, upstream failure) surface as a small inline message and a spoken fallback line, rather than silently failing.

### Setup required before this works
1. Get a free key at https://console.groq.com/keys (no credit card).
2. `cp .env.local.example .env.local` and paste the key in as `GROQ_API_KEY=...`.
3. Restart `pnpm dev` (env vars are only read at server start).
4. Voice input needs Chrome or Edge (Web Speech API). Other browsers still work via the text input.

### Verification
- `npx tsc --noEmit`: no new errors beyond the pre-existing, unrelated `three` typings gap.
- Ran `pnpm dev`, opened the widget in Chrome, started a call: greeting was spoken via TTS and shown in the transcript, the text-input fallback correctly POSTed to `/api/chat`, and — with no `GROQ_API_KEY` set yet — the route returned its intended config-error response (`500`, confirmed in server logs) and the UI handled it gracefully (inline error, spoken fallback line, mic resumed listening) without crashing. Full LLM replies aren't verified end-to-end yet since no key is configured in this environment — that needs your own free Groq key per the setup steps above.

## 2026-09-20 — Mamaearth branding pass (logo + theme)

Goal: give the app a consistent Mamaearth identity (logo + color theme) for an interview demo.

- **Added `components/mamaearth-logo.tsx`**
  Original leaf-in-circle mark (`MamaearthMark`) and a full lockup with wordmark + "Goodness Inside" tagline (`MamaearthLogo`), built as inline SVG/React so it renders crisp at any size with no image requests.

- **Replaced `public/icon.svg` (favicon)**
  Was the generic v0.app placeholder mark (black/white "V"). Now uses the same leaf badge as the in-app logo, with a light/dark `prefers-color-scheme` swap (green-on-cream in light mode, cream-on-green in dark mode).

- **Regenerated `public/icon-light-32x32.png`, `public/icon-dark-32x32.png`, `public/apple-icon.png`**
  Rasterized from the new leaf mark via `sharp` so the browser tab icon and iOS home-screen icon match the SVG favicon instead of showing the old placeholder.

- **Updated `app/layout.tsx`**
  `viewport.themeColor` changed from white/black to the brand greens (`#3F6B2E` light / `#22381d` dark) so the mobile browser chrome matches the brand.

- **Reworked `app/globals.css` theme tokens**
  `:root` and `.dark` custom properties (`--background`, `--primary`, `--secondary`, `--accent`, `--border`, `--ring`, `--chart-*`, `--sidebar-*`, etc.) were generic shadcn grayscale. Replaced with a Mamaearth palette (greens, cream, tan/clay accents) derived from the colors already used inline in the chatbot widget, so any shadcn UI component (e.g. `components/ui/button.tsx`) now themes correctly by default. Removed the separate OS-level `prefers-color-scheme: dark` auto-switch block, since the brand site is intentionally light-themed regardless of OS setting (dark mode still works if the `.dark` class is applied manually).

- **Added a site header to `app/page.tsx`**
  The landing page previously had no nav — just the hero. Added a header bar with the `MamaearthLogo` lockup, placeholder nav links (Skin / Hair / Baby Care / Rewards), and a "Shop Now" CTA button, so the page reads as a real branded site rather than a bare component demo.

- **Updated `components/mamaearth-chatbot.tsx` header**
  Swapped the generic `lucide-react` `Leaf` icon badge for the new `MamaearthMark` component, so the chat widget's header matches the site header exactly. Removed the now-unused `Leaf` import.

- **Created this file (`CHANGELOG.md`)** to keep a running log of changes going forward.

### Verification
- `pnpm install` (project had no `node_modules` yet).
- `pnpm dev` + visual check in Chrome: hero page renders with new header/logo/theme; chat widget opens with the matching leaf mark in its header.
- `npx tsc --noEmit`: one pre-existing, unrelated error (`Could not find a declaration file for module 'three'` — missing `@types/three`, not introduced by this change).
