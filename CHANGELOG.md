# Changelog

All notable changes made to this project are logged here, newest first.
Format: `[date] — summary`, followed by the specific edits.

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
