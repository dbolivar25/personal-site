# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a personal website/portfolio built with Next.js, utilizing the App Router and static generation. The site showcases the owner's personal information and portfolio projects.

## Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Architecture

### Component Structure
- Root layout (`app/layout.tsx`) provides global styling, metadata, and wraps all pages
- Reusable components in `app/components/` (nav, footer, projects, mdx)
- MDX support for portfolio project content

### Routing
- App Router implementation (Next.js 13+)
- Main routes: Home (`/`), Portfolio (`/portfolio`)
- Dynamic routes for individual projects (`/portfolio/[slug]`)
- Static generation with file-based routing

### Content Management
- Portfolio projects stored as MDX files in `app/portfolio/projects/`
- Each MDX file represents a single project with its content and metadata
- Filename becomes the URL slug (e.g., `redis-clone.mdx` → `/portfolio/redis-clone`)

### Styling
- TailwindCSS for styling (using `@tailwindcss/postcss`)
- Geist font family (Sans and Mono) for typography
- Dark/light mode support

### Dependencies
- Next.js (canary version)
- React 18
- TailwindCSS 4 (alpha)
- `sugar-high` for code syntax highlighting
- Vercel Analytics and Speed Insights for performance monitoring

## Development Notes

- This is a statically generated site with no backend database
- New portfolio projects can be added by creating new MDX files in `app/portfolio/projects/`
- The site uses metadata for SEO optimization and OpenGraph previews
- Favicons and various icon sizes are included in the `public` directory