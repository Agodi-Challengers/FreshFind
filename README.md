# FreshFind · Fresh all along

FreshFind helps people in Lagos find farmers markets near them: where they are, when they open, and what is in season. It is a single page application built from the FreshFind Figma design and the *FreshFind (Web Innovation Unleashed) SRS v1.0*.

**Live site:** https://fresh-find-one.vercel.app

## Features

- Market Directory and Find a Market with search, area, day, time and produce filters, sorting and a map of Lagos
- Market pages with photos, live "Open now" status, weekly schedule, Google map and directions
- Produce Guide and Seasonal picks for every month
- Bookmarks with session-only notes, export as a list and sharing
- FreshFind Assistant: a rule-based chatbot that answers from JSON (no AI, no external service)
- Real-time Lagos clock, browser geolocation and a simulated visitor counter
- Responsive layout for desktop, tablet and mobile

## Tech stack

React 19, React Router 7, Vite, Bootstrap 5 (CSS only) with custom CSS design tokens, and JSON data files. There is no backend or database. Hosted on Vercel.

## Getting started

Requirements: Node.js 20.19 or newer (CI uses Node 22) and npm.

```bash
npm install
npm run dev       # start the dev server at http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the production build
npm run lint      # check the code
```

No keys or accounts are needed. `.env.development` already sets `VITE_CHAT_PROVIDER=json` for the chatbot.

## Project structure

```
public/
  data/        markets.json, produce.json, chatbot.json (all site content, read only)
  images/      market, produce, seasonal and site images
src/
  components/  shared UI: header, cards, dropdowns, map, chat launcher, chatbot/
  context/     data, clock, location, bookmarks and toast providers
  lib/         filters, time and status, distance, seasons, export, share, storage
  services/    chatService (opens the chat), chatbotService (chatbot answers)
  pages/       one file per page, with its own CSS
  styles/      design tokens and global CSS
vercel.json    sends every address to index.html so refreshes work
```

## Editing content

- Markets and produce: edit `public/data/markets.json` and `public/data/produce.json`.
- Chatbot answers, suggestions and keywords: edit `public/data/chatbot.json`.

Changes appear after the next build or deploy.

## Deployment

Vercel builds every push. Each branch gets a preview address, and merging into `main` updates the live site. In Vercel, `VITE_CHAT_PROVIDER` must be a **Config** variable (not a Secret) with the value `json`.

## Branching

`main` ← `dev` ← `feature/*` or `fix/*`. Open a pull request for every change. GitHub Actions (`.github/workflows/ci.yml`) builds every push and pull request to `dev` and `main`.

## Assumptions

- All market and produce data is sample data for Lagos; coordinates are approximate and distances are straight-line.
- The default location is Lekki Phase 1 until the visitor shares their location.
- "Open now" is worked out from each market's schedule and Lagos time.
- Log in and Sign up are static, and the contact form opens the visitor's email app; nothing is stored or sent (SRS: no server storage).
- Bookmarks and notes last for the browser session only, and the visitor counter is simulated (SRS).

The full list of assumptions is in `ReadMe.doc`, submitted with the project documentation.
