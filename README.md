# FreshFind · Fresh all along

FreshFind helps residents of Lagos discover farmers markets near them: where they are, when they open, and what is likely to be on the stalls this week. It is a single page application built from the **FreshFind · Web Design** Figma file and the _FreshFind (Web Innovation Unleashed) SRS v1.0_.

## Tech stack

| Layer   | Choice                                                 | Why                                                                                                   |
| ------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| UI      | React 19 + Vite                                        | Component based SPA, fast dev server and build                                                        |
| Routing | React Router                                           | Market detail pages, breadcrumbs, shareable filter URLs                                               |
| Styling | Bootstrap 5 (CSS only) + vanilla CSS                   | Bootstrap for reset, grid and utilities; the design system itself is plain CSS with custom properties |
| Data    | JSON files in `public/data`                            | SRS: no backend, data loaded from pre-populated JSON                                                  |
| Maps    | Google Maps embed + a design-exported SVG map of Lagos | SRS: embedded Google map on market pages; the Find a Market map follows the Figma design              |
| Chat    | JSON rule-based assistant (`public/data/chatbot.json`) | Chatbot listed in the SRS, no external service                                                        |

No other runtime libraries are used.

## Getting started

Requirements: Node.js 20.19 or newer and npm. The app lives in the `frontend/` folder.

```bash
cd frontend
npm install
cp .env.example .env   # optional: copy the example chat settings
npm run dev            # http://localhost:5173
npm run build          # production build in dist/
npm run preview        # serve the production build
```

### Chat

The FreshFind Assistant is a rule-based chatbot whose wording lives in `public/data/chatbot.json`. Set `VITE_CHAT_PROVIDER=json` to switch it on (the default) or `none` to hide it. No external chat service or API key is needed.

## Project structure

```
frontend/
  public/
    data/          markets.json, produce.json (all site content)
    images/        images exported from the Figma file (WebP)
  src/
    assets/        icons exported from the Figma file
    components/    reusable UI (navbar, cards, dropdowns, map, …)
    context/       data, clock, location and bookmarks providers
    lib/           time, distance, filter and export helpers
    pages/         one file per route (with its own CSS)
    styles/        design tokens and global CSS
```

## Branching

`main` ← `dev` ← `feature/*`. Every feature branch is opened as a pull request into `dev`; `dev` is merged into `main` for releases. A GitHub Actions workflow (`.github/workflows/ci.yml`) builds every pull request.

## Assumptions

- Market coordinates are approximate points on the named streets and are used for distance, "near me" sorting and the Google map.
- The default location is Lekki Phase 1 (as in the design) until the visitor shares their location.
- Opening hours come from the weekly schedule on each market page in the design. Where a card in the design showed fewer days than the market page, the market page wins.
- Seasons for produce that the design does not show are indicative for Lagos markets.
- Some produce items reuse the same photo in the Figma file; the site keeps the designer's image choices.
- Login, sign up and the contact form do not store or send data (SRS: no server storage). The contact form opens the visitor's email app.
- Bookmarks and notes are kept for the current browser session only (SRS: session-only notes).
- The visitor counter is simulated (SRS).
