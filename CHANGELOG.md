# Changelog

All notable changes made to this project are logged here, newest first.
Format: `[date] — summary`, followed by the specific edits.

## 2026-09-21 — Pivoted the bot from a support agent to a face-product suggestion agent

Rescoped the whole assistant per your direction: it's no longer general Mamaearth support — it's a face-care product recommender with a specific happy path: ask what they need → ask skin type → ask where they live (for humidity/climate) → recommend specific products → offer to route to the order page.

- **Rewrote `SYSTEM_PROMPT` in `app/api/chat/route.ts`**: new "Happy path" section encoding that exact 5-step flow, and the full product catalog you provided (face washes, serums, moisturizers, sunscreens, scrubs, creams/masks — every product, ingredient, and skin-type note) embedded directly in the prompt as grounding data, plus a "skin type + climate" mapping section (oily/humid → oil-free & tea tree/charcoal, dry/cold → hydrating rice-water/beetroot/Aqua Glow, sensitive → aloe/rice, sun/tan → Ubtan/vitamin C + sunscreen, acne → tea tree/salicylic/charcoal) so recommendations are reasoned, not random. Guardrail added: never recommend a product outside this exact catalog.
- **Updated `components/mamaearth-chatbot.tsx` copy** to match, so the UI doesn't contradict the new prompt the way "Mama" vs "Arjun" did earlier: `GREETING`, the pre-call subheading, and the pre-call description now describe face-product matching instead of general skin/hair/baby-care support.
- **Fixed two real bugs found while testing the new prompt**, not just prompt wording:
  - The model ignored "no lists" and replied with a markdown bullet list when naming 3 products — bad for TTS, which would read the dashes aloud. Rewrote the "How you speak" rule with an explicit right/wrong example pair (a flowing sentence vs. a dashed list) and capped recommendations at 1–2 products, said in one sentence.
  - The reply got **cut off mid-sentence** (hit `max_tokens: 220`) once it had to name 2–3 full product names with reasoning. Raised `max_tokens` to `350`.

### Verification
- `npx tsc --noEmit`: clean.
- Drove the full happy path directly against `/api/chat` with `curl`, turn by turn: (1) "looking for a good face product" → asked what kind; (2) "acne and oily skin" → correctly skipped re-asking skin type (already given) and asked location; (3) "Mumbai, humid" → recommended Tea Tree Foaming Face Wash + Oil-Free Moisturizer with ACV + HydraGel Indian Sunscreen, all real catalog products with sound climate/skin-type reasoning, as one flowing sentence, ending with the order-routing question, no truncation; (4) "yes please" → closed cleanly ("sending you over to the order page now").

## 2026-09-21 — Renamed the bot from "Mama" to "Arjun" everywhere

You'd already rewritten `SYSTEM_PROMPT` in `app/api/chat/route.ts` to give the assistant the name "Arjun" and a more structured call-flow persona (identify issue → route with next steps → escalate when out of scope) — but that prompt only controls what the LLM says once a conversation is already running. Everything spoken or shown *before* that (the greeting, the UI chrome) was still hardcoded to "Mama," so the bot would introduce itself as Mama, then contradict itself as Arjun if asked its name.

Found and renamed every other reference so it's consistent app-wide:
- `components/mamaearth-chatbot.tsx`: `GREETING` string, the "Mama is speaking/thinking/ready" status strings, the widget header name, "Talk to Mama" (both the pre-call screen and the floating launcher pill), and the open/close button `aria-label`s.
- `app/page.tsx`: the hero paragraph ("Arjun is here whenever...") and the "Meet Arjun" caption on the mascot panel.
- Left `Mamaearth` (the brand name) and the `MamaMascot` component/function name untouched — those refer to the brand and a code identifier, not the bot's persona name.

### Verification
- `npx tsc --noEmit`: clean.
- Grepped both files for any remaining bare "Mama" (bot name) after the edit — zero matches outside the brand name and the internal `MamaMascot` identifier.
- Loaded the site in Chrome: hero now reads "Meet Arjun" / "Talk to Arjun," and the widget header shows "arjun" — confirmed visually.

## 2026-09-21 — ElevenLabs live: neural voice confirmed working (not Indian-accented)

Added your `ELEVENLABS_API_KEY` and a voice ID picked from the Voice Library search ("Indian English male" results). It failed with `402 payment_required` / `paid_plan_required` — `"Free users cannot use library voices via the API."` Confirmed this is a hard, unconditional free-tier restriction (not about which voice was picked) by testing one of ElevenLabs' own default/premade voices ("Adam") with the same key, which worked immediately.

**Decision**: switched `ELEVENLABS_VOICE_ID` to Adam (`pNInz6obpgDQGcFmaJgB`), one of the account's default voices — genuinely neural/human-sounding, works on the free API tier right now, but Western-accented rather than Indian. Traded exact accent for a working human-like voice today, since all three free routes to an Indian neural voice (Groq terms, Azure subscription, ElevenLabs Library-on-free) hit real account-level walls tonight.

- Updated `.env.local` and `.env.local.example` with the working key/voice and a clear explanation of the free-tier restriction, so future-you doesn't re-attempt a Library voice on this plan and lose time to the same error again.
- **Verified live end-to-end**: `curl`'d `/api/speech` directly (200, valid mp3), then drove the actual widget in Chrome — started a call, heard/confirmed via server logs (`POST /api/speech 200`) that the real ElevenLabs audio played, not the Rishi fallback.

**To get an Indian-accented voice on ElevenLabs later**: upgrade to a paid plan, then swap `ELEVENLABS_VOICE_ID` back to one of the Indian voices found earlier (e.g. search "Indian English male" in the Voice Library) — the code needs no changes, just the env var.

## 2026-09-21 — Switched the voice provider to ElevenLabs

Azure was a dead end (see the entry below — no subscription on that org account, can't self-serve one). Moving to ElevenLabs instead, since it's a completely separate signup flow (elevenlabs.io, not Microsoft) so it doesn't hit the same org-account wall, and its free tier (10k chars/month, recurring, no card) was already scoped out earlier.

- **Rewrote `app/api/speech/route.ts`**: now calls ElevenLabs' `POST /v1/text-to-speech/{voice_id}` with `xi-api-key` auth and the `eleven_multilingual_v2` model, streaming the mp3 back. Same shape as before (`{ text }` in, audio out, clean `{ error }` JSON on failure) — no client changes needed, `components/mamaearth-chatbot.tsx`'s `speak()` still just calls `/api/speech` and falls back to the local "Rishi" browser voice if it errors.
- **`.env.local.example` / `.env.local`**: swapped in `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID`, with steps for finding an Indian male voice — ElevenLabs doesn't ship one by default the way Azure does, so you have to search the Voice Library (elevenlabs.io/app/voice-library → search "Indian" → preview → "Add to my voices"), then copy that voice's ID from "My Voices". The old Azure vars are kept in both files, commented as unused, in case that path gets unblocked later.

### Setup required before this is live
1. Sign up at https://elevenlabs.io (free, no card) and grab an API key from Settings → API Keys.
2. In the Voice Library, search "Indian", preview a few male voices, and add the one you like to "My Voices".
3. Copy its Voice ID (from the "..." menu on that voice in My Voices).
4. Put both in `.env.local` as `ELEVENLABS_API_KEY=...` and `ELEVENLABS_VOICE_ID=...`.
5. Restart `pnpm dev`.

### Verification
- `npx tsc --noEmit`: clean, no new errors.
- Started the dev server and POSTed to `/api/speech` directly: confirmed the intended clean config-error response (not a crash) since no key/voice is set yet — app still runs fully on the Rishi fallback in this state. Full ElevenLabs playback not yet verified; needs your API key + voice ID.

## 2026-09-21 — Azure blocked at signup; staying on the Rishi browser voice for now

Walked through Azure Portal to create the free Speech resource (`app/api/speech/route.ts` was already built for this — see the entry below). Hit a real blocker: the Subscription dropdown on the "Speech" resource creation page showed **"No available items"** — the signed-in account (`...@ipsa...`, "INDORE EDUCATION & SERVICE" org tenant) has no Azure subscription attached, and education/org tenants commonly restrict self-service subscription creation to admins. Not fixable by further clicking around.

Also explored reusing the voice from the separate `chatBot/voice_assistant` project (Piper TTS, voice "Ryan"): its own Python venv is broken (built for Python 3.12, which is no longer installed on this Mac at all), and a fresh install of the official `piper-tts` PyPI wheel (tried both `1.6.0`, the version that project pins, and the latest `1.8.0`) hit a genuine upstream packaging bug on macOS arm64 — the bundled `espeakbridge` binary ignores the runtime-supplied voice-data path and looks for a hardcoded CI build path (`/Users/runner/work/piper1-gpl/...`) that doesn't exist on any machine but the one that built the wheel. Confirmed via direct Python reproduction and every documented env-var override; not something fixable without building Piper from source. Also worth noting for later: neither of that project's voices (Ryan, Daniel) is Indian-accented anyway.

**Decision**: given the interview timing, stay on the already-working **"Rishi"** macOS browser voice (`components/mamaearth-chatbot.tsx`, `PREFERRED_VOICE_NAME`) rather than chase either path further tonight. No code changes needed — `app/api/speech/route.ts` (Azure) still exists and fails cleanly/falls back automatically, exactly as designed, so it's safe to finish setting up later with zero risk to what's currently working.

**To revisit later, when there's no time pressure:**
- Azure: sign into portal.azure.com with a *personal* Microsoft/Outlook account instead of the org one, and start an Azure Free Trial there (org tenants usually don't block a separate personal account).
- Or switch to ElevenLabs (10k free chars/month, different signup flow entirely — elevenlabs.io, not Microsoft — so it likely won't hit the same org-account wall). Not yet implemented; `app/api/speech/route.ts` would need to swap its provider call.
- Piper: would need Python 3.12 reinstalled and either an older/patched `piper-tts` wheel or building it from source.

## 2026-09-20 — Switched the voice to Azure AI Speech (Indian male, human-like)

You asked for an Indian male voice, then whether a paid-quality provider (Sarvam AI or ElevenLabs) had a free tier good enough to use. Researched all three plus Google Cloud TTS and Azure AI Speech and compared free-tier limits, voice realism, and Indian-accent support:

| Provider | Free tier | Notes |
|---|---|---|
| ElevenLabs | 10k chars/month, recurring | Best raw realism, but no dedicated Indian voice — pick-your-own from a community library |
| Sarvam AI | ₹100 one-time credit (~33k chars) | India-built, most "authentic" accent, but the free credit doesn't renew |
| Google Cloud TTS | ~1M chars/month, recurring | Good `en-IN` voices, but needs a full GCP billing account to set up |
| **Azure AI Speech (chosen)** | **500,000 chars/month, recurring, never expires** | Ships a purpose-built natural Indian male neural voice out of the box: `en-IN-PrabhatNeural` |

Picked Azure: best free-tier ceiling plus a ready-made Indian male voice, no guessing from a voice library required.

- **Rewrote `app/api/speech/route.ts`**: swapped the (still terms-locked) Groq Orpheus call for Azure's Cognitive Services TTS REST API. Exchanges `AZURE_SPEECH_KEY` for a short-lived bearer token, then POSTs SSML (`<voice name='en-IN-PrabhatNeural'>`) to the region's `tts.speech.microsoft.com` endpoint and streams the mp3 back. No client changes needed — `components/mamaearth-chatbot.tsx`'s `speak()` already just POSTs `{ text }` to `/api/speech` and plays whatever audio comes back, falling back to the browser's local "Rishi" (`en-IN`) voice if the route errors.
- **Added `AZURE_SPEECH_KEY` / `AZURE_SPEECH_REGION`** to `.env.local.example` (with setup steps) and as blank placeholders in your `.env.local` — not filled in yet, so right now the route returns a clean config error and the app is still running on the local "Rishi" browser voice as a result.
- **Housekeeping**: `tsconfig.tsbuildinfo`, `AGENTS.md`, and `CLAUDE.md` are `next dev`/`tsc` build artifacts that kept getting regenerated every time I ran the dev server or type-checker during these sessions, and one of them (`tsconfig.tsbuildinfo`) had gotten committed by accident. Added all three to `.gitignore` and untracked the committed one (`git rm --cached`) so they stop reappearing in `git status`.

### Setup required before the new voice is live
1. Create a free **Speech** resource at https://portal.azure.com — pick the **F0** pricing tier (this is the free one).
2. Copy the key and region from that resource's "Keys and Endpoint" page.
3. Put them in `.env.local` as `AZURE_SPEECH_KEY=...` and `AZURE_SPEECH_REGION=...` (e.g. `centralindia`).
4. Restart `pnpm dev`.

### Verification
- `npx tsc --noEmit`: no new errors beyond the pre-existing, unrelated `three` typings gap.
- Started the dev server and POSTed to `/api/speech` directly: confirmed it returns the intended clean config-error message (not a crash) since Azure isn't configured yet — the app correctly falls back to the browser voice in this state. Full Azure neural-voice playback isn't verified end-to-end yet; needs your Azure key.

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
