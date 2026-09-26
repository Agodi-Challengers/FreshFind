# FreshFind: Figma redesign handoff (for the next coding agent)

Branch: `feature/figma-redesign-sync` (created from `dev`). When the work is finished, open a PR into `dev`. Do not push to `dev` or `main` directly.
Design source: Figma file "Fresh find" (https://www.figma.com/design/xkqqnk7d0u0KSjEBtSZqpv/Fresh-find), with desktop frames `00` to `08` and mobile frames "Home", "Find a Market", "Market Directory", "Market Details", "Produce guide", "Bookmark", "About Us", "Contatct".
Spec: the Aptech Techwiz SRS "FreshFind".
Goal: **the UI in code must match the Figma design, including hover, focus, active and selected states.** Make no functional regressions.

---

## 1. Rules to follow

1. **Stack:** React 19 + Vite, react-router-dom 7, Bootstrap 5 CSS (loaded globally), plain CSS files per page. Data lives in `public/data/*.json`.
2. **CI runs `npm install && npm run build`** on PRs. The build must pass. Run `npm run lint` too.
3. **Keep code beginner-friendly.** Use small components, plain `array.map()`, clear names, and short comments. Don't add new libraries.
4. **Every page CSS must be scoped** to its page root class (`.guide …`, `.detail …`, `.directory …`). Vite bundles all CSS into one file, so an unscoped `.container`, `.card`, `.btn` or `.pill` rule in a page file changes every page. (This already broke the navbar and cards once; see section 3.)
5. **Bootstrap gotcha:** `.card` in Bootstrap sets `display:flex; flex-direction:column`. If you need a horizontal card, set `flex-direction: row` explicitly.
6. **Images:** reference them as `asset("/images/…")` from `src/lib/assets.js`. Never use relative CSS paths like `url("images/…")` or `url("../../public/…")`, because they break on nested routes and in the build. In CSS, use absolute `/images/...`.
7. **Icons:** only use names that exist in `src/components/Icon.jsx`. A missing name renders nothing. Available names: accessibility apple arrow-left arrow-right arrow-up-down badge-check battery-full bookmark bookmark-check bot calendar calendar-days car carrot chevron-down chevron-right clock copy download egg eye eye-off facebook github heart-handshake hourglass house info layout-grid leaf lightbulb linkedin locate-fixed lock mail map map-pin menu message-circle minus more-vertical navigation phone plus search send-horizontal share-2 shopping-basket signal sliders-horizontal sparkles sprout sticky-note store sun tag trash-2 trending-up twitter user wallet wheat wifi x.
8. **Toast:** `const toast = useToast(); toast("Saved")`. It is a function; there is no `toast.show`.
9. **Season data:** `produce.season` is a 12-char string like `"111000000011"`. Show it with `seasonRange(p.season)` from `src/lib/time.js` (it returns a month range such as Nov to Apr). Never print the raw string.
10. **Don't add a second "Ask FreshFind" button.** The global `ChatLauncher` already renders one.

## 2. Design tokens and shared pieces (already done, reuse them)

`src/styles/tokens.css` holds these tokens:

| Token | Value |
|---|---|
| `--green` | #00B207 |
| `--green-hover` | #008C06 |
| `--green-hard` | #2C742F |
| `--green-soft` | #84D187 |
| `--green-deep` | #006304 |
| `--green-ink` | #1F4D2B (link, focus) |
| `--green-tint` | #E4FFE5 |
| `--card-border` | #E4F0DF |
| `--warning` | #FF8A00 |
| `--danger` | #EA4B48 |
| `--ink` | #1B221C |
| `--muted` | #5E6B5F |

Other settings: the font is Poppins, and `--r-card` is 8px. `--focus-ring` is `0 0 0 2px #fff, 0 0 0 5px var(--green-ink)`.

Figma states to copy:
- **Card hover:** border `1.5px #3C8D40` plus shadow `0 18px 36px -4px rgba(26,64,36,.18)`. Focus is hover plus `--focus-ring`. Use classes `card hover-card`.
- **Inputs:** border `#E4F0DF`. Hover border `#9AA39B`. Focus border `2px #00B207` plus ring `0 0 0 4px rgba(61,140,64,.22)`.
- **Primary button:** `#00B207`, hover `#008C06`. **Ghost button:** hover background `#E4F0DF`.
- **Tabs/chips:** white with border `--card-border`. Selected is green with white text and a count bubble (see `.chip__count` in `BookmarksPage.css`, or `.guide__tab-count`).
- **Seasonal card:** hover and active get border `#2C742F` and glow `0 0 12px rgba(32,181,38,.32)`.

Reusable components:
- `PageBanner({ crumbs, title, text, children })`: the photo breadcrumb banner at the top of every inner page. When `title` is set, it becomes the tall variant.
- `CtaBanner`: the "Run a market or grow for one?" block. It is already rendered globally in `App.jsx`, above the footer. **Do not add it inside pages.**
- `Pagination({ page, pageCount, onChange, label })`: the Figma "< 1 2 3 4 … >" control. See how `ProduceGuidePage.jsx` uses it with a `?page=` URL param and `PAGE_SIZE`.
- `MarketCard({ market, variant, headingLevel, showDescription })`: `variant="home"` shows round produce photos; the default variant shows produce pills. Pass `showDescription` on the Directory.
- `Breadcrumb`: the first item `{ to: "/" }` renders a house icon.

## 3. Finished and pushed

| Commit | What |
|---|---|
| fix: repoint 50 broken image paths | `markets.json` / `produce.json` image paths; Lekki gallery photos |
| feat: Figma design tokens… | tokens, base, layout, components CSS; navbar states; Logo; MarketCard; Home; **Market Detail** (gallery strip, badges, schedule, map, "Good to know", nearby); PageBanner; CtaBanner; **MarketDetailPage.css scoped under `.detail`** |
| feat(about) | About page: story, what we believe, 5 team cards |
| feat(contact) | Contact page: banner, map card left, form right |
| feat(saved) | Bookmarks: tabs with counts, item meta, list preview, download button |
| feat(produce) | Produce Guide: tall banner, one-row toolbar, pagination (8 per page), red category label and green name on `ProduceCard` |

## 4. Still to do (in this order)

### 4.1 Seasonal page (`SeasonalPage.jsx/.css`), Figma "05 Seasonal Recommendations · Desktop"
- Replace the old header with `<PageBanner crumbs=[Home, Seasonal] title="Peak this month">`. Put the **12-month selector inside the banner** as `children`: month buttons, with the current month selected (green). Use `aria-pressed`.
- Delete `background-image: url("../../public/images/markets/Breadcrumbs.png")` from `SeasonalPage.css` (broken path).
- Add a **product detail block** for the pick of the month (`pickOfTheMonth` in `src/lib/seasonal.js`):
  - on the left, a vertical thumbnail slider with up/down arrow buttons and a big image;
  - on the right, the title, pills ("In season" green, "Pick of the week" amber), the description and "Category: X";
  - a wide green "Find at N markets" button linking to `/directory?q=<name>`;
  - "Save" (`BookmarkButton variant="button"`) and "Share" (`shareLink`) buttons.
- Below that, a **3-column grid of mini cards**: image 132x98, name, a status pill ("In season" green, or "Ending soon" amber from `endingItems`), a one-line note, and a "See markets →" link.
- Finish with a **"Top Markets for Seasonal Picks"** section: header plus an "Open directory →" link, then 4 `MarketCard`s.
- Scope all CSS under `.seasonal`.

### 4.2 Market Directory (`DirectoryPage.jsx/.css`, `FilterSidebar.jsx`), Figma "02 Market Directory · Desktop" and mobile "Market Directory"
- Replace `<header className="container_page-header">` with `PageBanner` (crumbs: Home > Market Directory).
- **Desktop:** remove the "Quick filters" chip row and the green "Filters" button. The toolbar is the search input, the sort dropdown and the grid/list view toggle. On mobile, keep a Filters button that opens the sidebar as a sheet.
- Rename the sidebar legends to exactly: "Location", "Days of The Week", "Time of Day", "Product Category", "Market features".
- Cards: `MarketCard` with `showDescription`, in 3 columns next to the sidebar.
- Add `Pagination` (9 per page, `?page=` param, reset to 1 when any filter changes).
- Scope CSS under `.directory`, and remove any global `.grid--3{display:none}`-style overrides.

### 4.3 Find a Market (`FindMarketPage.jsx/.css`), Figma "01 Find a Market · Desktop" and mobile "Find a Market"
- Add `PageBanner` (Home > Find a Market).
- Toolbar row with Area, Date (day), Time and Produce dropdowns (reuse `Dropdown` and the builders in `src/lib/quickFilters.js`), a "Use my location" button (`requestDeviceLocation` from `LocationContext`) and a green "Search" button.
- Result rows (`MarketRow`) restyled to Figma: thumbnail, name, status pill, hours, distance, "Directions" and "Details". Row hover and selected states should match the card states. A selected row should highlight its map pin.
- The map panel stays on the right. Remove any page-level CTA (it is global now).

### 4.4 Mobile pass
Check every page at 402px wide against the Figma mobile frames. Also check that there is no horizontal scroll: `document.documentElement.scrollWidth === 402`.

Known mobile rules:
- The Home page hides the "Explore" section.
- On mobile, cards and season cards scroll horizontally.
- The bottom tab bar must not cover content, so leave padding-bottom on `main`.

### 4.5 Cleanup and PR
- Search for leftovers: `grep -rn "container_page-header\|Breadcrumbs.png\|picsum\|toast.show\|id=\"remove-btn\"" src`. The result should be empty.
- `npm run lint && npm run build`, then fix any warnings.
- Open a PR `feature/figma-redesign-sync → dev` titled "Figma redesign sync: pages, images and states". In the description, list the pages changed, the bug fixes (the global CSS leak from MarketDetailPage.css, broken image paths, missing icons, `toast.show`, the raw season strings, the duplicate chat button) and a screenshot per page.

## 5. How to check your work
- `npm run dev`, then open each route: `/`, `/find`, `/directory`, `/markets/lekki-sunday`, `/produce`, `/produce/tomatoes`, `/seasonal`, `/saved`, `/about`, `/contact`.
- Compare each one side by side with its Figma frame at 1440px and at 402px.
- Tab through each page with the keyboard. Every interactive element needs a visible focus ring, and hover must match Figma.
- Watch the console. There should be no React key warnings or 404 images.
