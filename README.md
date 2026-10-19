# Mehmet Mutlu — Portfolio

Personal portfolio of Mehmet Mutlu, Senior Frontend Developer. A statically generated, bilingual (EN/TR) site with a real-time 3D glass hero, an iOS-inspired glass UI, light and dark themes and a full SEO setup. Deployed to GitHub Pages.

**Live:** https://mhmtmutlu.github.io/

## Highlights

- **Refraction hero** — a `MeshTransmissionMaterial` torus knot rendered with React Three Fiber refracts a theme-aware aurora shader and particle field; it follows the pointer and shrinks into a corner seal on scroll.
- **Glass design system** — layered `backdrop-filter` surfaces with sheen, grain and an optional SVG displacement “lens” filter where supported, defined as Tailwind utilities and CSS custom properties.
- **Light / dark theme** — system preference with manual override, no flash on load, persisted across view transitions; the 3D scene re-colours itself on theme change.
- **Bilingual** — English at `/`, Turkish at `/tr/`, with `hreflang` alternates, a localized sitemap and per-locale Open Graph images.
- **Command palette** — `⌘K` / `Ctrl K` navigation, theme and language switching, built on `cmdk`.
- **Motion** — Lenis smooth scrolling synchronised with GSAP ScrollTrigger reveals; everything degrades gracefully under `prefers-reduced-motion` and without WebGL.
- **SEO** — canonical URLs, Open Graph and Twitter cards, build-time OG images (satori + resvg), JSON-LD (`Person`, `WebSite`, `CreativeWork`, `BreadcrumbList`), sitemap and robots.

## Tech stack

| Area            | Choice                                                                                                                           |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Framework       | [Astro 7](https://astro.build) — static output, React islands, Content Layer collections, i18n routing, View Transitions         |
| UI              | React 19 (islands only), TypeScript (strict)                                                                                     |
| Styling         | Tailwind CSS v4 with design tokens in `@theme`, custom glass utilities                                                           |
| 3D              | three.js, [@react-three/fiber](https://github.com/pmndrs/react-three-fiber), [@react-three/drei](https://github.com/pmndrs/drei) |
| Motion          | GSAP + ScrollTrigger, [Lenis](https://lenis.darkroom.engineering)                                                                |
| Command palette | [cmdk](https://cmdk.paco.me)                                                                                                     |
| OG images       | [satori](https://github.com/vercel/satori) + [@resvg/resvg-js](https://github.com/thx/resvg-js)                                  |
| Fonts           | Geist, Geist Mono, Instrument Serif (self-hosted via Fontsource)                                                                 |
| Tooling         | `@astrojs/check`, GitHub Actions                                                                                                 |

## Project structure

```
src/
├── components/
│   ├── Home.astro            # Home page composition
│   ├── ProjectPage.astro     # Project detail template
│   ├── SEO.astro             # Head tags, hreflang, JSON-LD
│   ├── sections/             # Hero, About, Experience, Skills, Projects, Education, Contact, Footer
│   ├── three/                # HeroScene (lazy loader) + GlassScene (R3F scene)
│   └── ui/                   # Dock, CommandPalette, SectionHeader, LensFilter
├── content/projects/{en,tr}/ # Project case studies (Markdown + frontmatter)
├── data/                     # profile, social, experience, skills, education
├── i18n/                     # UI strings and locale helpers
├── layouts/Base.astro        # Document shell, theme bootstrap, dock, palette
├── lib/                      # theme, scroll and OG rendering helpers
├── pages/                    # Routes (EN at root, TR under /tr)
├── scripts/motion.ts         # Lenis + GSAP orchestration
└── styles/                   # global.css (tokens, glass system), cmdk.css
scripts/og.mjs                # Pre-build Open Graph image generation
```

### Architecture notes

- **Zero JS by default.** Content pages ship as plain HTML; only the hero scene (`client:only`) and the command palette (`client:idle`) hydrate.
- **Deferred 3D.** `HeroScene.tsx` is a 3 KB loader that waits for an idle frame, then lazy-imports `GlassScene.tsx` (three.js + R3F). A CSS glass placeholder covers the hero until the first WebGL frame and remains as the static hero when WebGL is unavailable or reduced motion is requested. The environment map is generated with `PMREMGenerator` from emissive panels, so no HDR loaders ship.
- **Single source of content.** Experience, skills and profile live in typed data modules; project case studies are a content collection keyed by `key` + `locale` so EN and TR entries stay paired.
- **One animation clock.** Lenis drives GSAP's ticker, and the R3F scene reads scroll position independently, so scroll, DOM reveals and WebGL stay in sync.
- **Theme without flash.** An inline script sets `data-theme` before paint and re-applies it after view-transition swaps; components listen to a `themechange` event.
- **OG generation is a separate process.** `scripts/og.mjs` runs before `astro build` because the resvg native module cannot share a process with Tailwind's native engine.

## Getting started

Requires Node 22.12 or newer.

```bash
npm install
npm run dev       # http://localhost:4321/
npm run build     # generates OG images, then builds to dist/
npm run preview
npm run check     # Astro + TypeScript diagnostics
```

## Content

| Edit              | File                                                              |
| ----------------- | ----------------------------------------------------------------- |
| Name, role, links | `src/data/profile.ts`, `src/data/social.ts`                       |
| Experience        | `src/data/experience.ts`                                          |
| Skills            | `src/data/skills.ts`                                              |
| Education         | `src/data/education.ts`                                           |
| UI copy (EN/TR)   | `src/i18n/ui.ts`                                                  |
| Projects          | `src/content/projects/en/*.md` and `src/content/projects/tr/*.md` |

To add a project, create a Markdown file with the same `key` in both locale folders. Frontmatter fields: `title`, `summary`, `key`, `locale`, `year`, `role`, `stack`, `order`, optional `url`, `repo`, `accent`.

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`, which builds the site and publishes it with GitHub Pages (set **Settings → Pages → Source** to _GitHub Actions_).

Files in `public/` are copied to the site root as is. `public/app-ads.txt` (AdMob authorized sellers for Zirve) is served at `/app-ads.txt` and is not linked from any page.

The build reads two environment variables:

| Variable    | Default                       | Purpose                                                        |
| ----------- | ----------------------------- | -------------------------------------------------------------- |
| `SITE_URL`  | `https://mhmtmutlu.github.io` | Absolute origin used for canonical URLs, sitemap and OG images |
| `BASE_PATH` | `/`                           | Sub-path the site is served from                               |

### Custom domain

1. Add `public/CNAME` containing the domain.
2. Set `SITE_URL` to `https://<domain>` and `BASE_PATH` to `/` in the workflow.
3. Point DNS at GitHub Pages (`A` records `185.199.108.153`, `.109.153`, `.110.153`, `.111.153`; `www` → `CNAME mhmtmutlu.github.io`).
4. Enable _Enforce HTTPS_ in the repository's Pages settings.

## Browser support

Evergreen browsers. The SVG displacement “lens” is a progressive enhancement for Chromium; other engines get the frosted-glass fallback. WebGL-less environments and users with reduced-motion preferences receive a static hero.

## License

Source code is released under the [MIT License](LICENSE). Personal content (texts, project descriptions, images) is © Mehmet Mutlu and not covered by the license.
