# Mette Tronvoll Portfolio

Map-led photography portfolio built with Next.js App Router, TypeScript, Tailwind CSS, and MapLibre.

The homepage centers on an interactive world map where each project is geolocated and linked to a dedicated gallery page.

## Features

- Fullscreen MapLibre map with clustered project markers
- Circular image markers generated from each project's cover image
- Project detail panel and camera easing on map marker click
- Responsive navigation and map controls for desktop/mobile
- Dedicated project pages generated from typed data
- Biography/CV page with expandable chronology sections
- SEO metadata, robots, and sitemap support

## Tech Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- MapLibre GL JS

## Requirements

- Node.js 20+
- npm

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Create production build
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run typecheck`: Run TypeScript checks

## Content Model

Project content is data-driven. Each project includes:

- `slug`
- `title`
- `description`
- `latitude` / `longitude`
- `country` and optional `city`
- `year`
- `coverImage`
- `gallery` (array of image paths)

Biography/CV content is also data-driven, with sections for:

- Solo exhibitions
- Group exhibitions
- Public collections
- Optional installation images per entry

## Updating Content

### Add or update a project

1. Add image assets under `public/images/...`.
2. Add or edit an entry in `data/projects.ts`.
3. Ensure `coverImage` and all `gallery` paths are valid.
4. Use a unique `slug` (used for `/projects/[slug]`).

### Update Biography/CV

1. Edit chronology and collection data in `data/biography.ts`.
2. (Optional) Add installation images and map them to entries.

## Project Structure

```txt
app/
  biography/page.tsx
  projects/[slug]/page.tsx
  layout.tsx
  page.tsx
  robots.ts
  sitemap.ts
components/
  map/
  sections/
data/
  biography.ts
  projects.ts
lib/
  seo.ts
public/
  images/
```

## SEO

- Site-wide metadata is defined centrally and reused across routes.
- Project pages generate route-level metadata from project data.
- `robots` and `sitemap` routes are included.

## Deployment

Designed for Vercel deployment.

```bash
npm run build
npm run start
```

For production, confirm the site URL in SEO configuration matches your domain.
