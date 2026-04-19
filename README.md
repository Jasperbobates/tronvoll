# Minimalist Photography Portfolio (Map-Based)

A Next.js + TypeScript + Tailwind starter for a fine-art/editorial photographer portfolio with a fullscreen 2D world map as primary navigation.

## Final Stack

- **Next.js (App Router) + TypeScript**: SEO-ready metadata, static routes, fast server/client split.
- **Tailwind CSS**: clean control of typography, whitespace, and minimalist layout.
- **MapLibre GL JS**: best fit for a **2D map with subtle depth** (light pitch + camera easing) without a 3D globe.
- **next/image**: automatic optimization, responsive image delivery, AVIF/WebP support.
- **Vercel**: straightforward deployment for Next.js, caching, and image optimization.

## Why MapLibre GL JS

MapLibre provides modern vector-map rendering with soft depth cues while staying flat-map oriented:

- Keep `bearing: 0` and a small `pitch` (`10–20`) for a 2.5D editorial look.
- Disable rotate interactions to preserve calm UX.
- Use marker shadows + mild panel blur for layered depth.
- Add only click-triggered camera easing (no continuous animation).

## Architecture Proposal

### Page structure

1. **Top / Hero**: fullscreen map (`h-screen`) with project pins.
2. **Popup panel**: title, short description, link to project page.
3. **Scroll sections**: About + Contact only.
4. **Project pages**: static route per project (`/projects/[slug]`) with optimized large images.

### Data model

- Projects are typed and data-driven in `data/projects.ts`.
- The map and project routes consume the same source of truth.
- Easy CMS upgrade path later by replacing the data source layer.

### SEO & performance

- Metadata in `app/layout.tsx` and per-project metadata in route pages.
- `app/sitemap.ts` and `app/robots.ts` included.
- `next/image` used for project gallery assets.

## Folder structure

```txt
app/
  globals.css
  layout.tsx
  page.tsx
  robots.ts
  sitemap.ts
  projects/[slug]/page.tsx
components/
  map/MapCanvas.tsx
  map/ProjectPanel.tsx
  sections/AboutSection.tsx
  sections/ContactSection.tsx
data/
  projects.ts
lib/
  seo.ts
```

## Subtle depth implementation (without globe)

Depth is implemented by combining:

- map camera pitch in `MapCanvas` (`pitch: 16`)
- soft marker shadow
- slight container perspective transform
- restrained gradient overlay
- no heavy animations

This keeps the map visually dimensional while preserving a minimalist 2D navigation concept.

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Notes

- Replace placeholder image paths under `/public/images/projects/*` with real assets.
- For best visual quality, export images in multiple sizes and keep originals archived outside `public/`.
