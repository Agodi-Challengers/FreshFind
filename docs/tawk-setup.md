# Live chat setup (Tawk.to)

FreshFind uses [Tawk.to](https://www.tawk.to) for its chat (SRS 1.8). The site hides Tawk's own round bubble and opens the chat from the Figma **Ask FreshFind** button, so there is only one chat button on the page.

## How it fits together

```
Ask FreshFind button (components/ChatLauncher.jsx)
        │  toggleChat()
        ▼
services/chatService.js      openChat · closeChat · toggleChat · maximizeChat · minimizeChat
        │  uses the controls registered by the active provider
        ▼
components/chat/ChatWidget.jsx  → loads only the provider set in VITE_CHAT_PROVIDER
        ▼
components/chat/TawkChat.jsx    → official @tawk.to/tawk-messenger-react package
```

Pages never talk to Tawk directly. To open the chat from anywhere, use `openChat()` from `services/chatService.js`, or the `useOpenChat()` hook from `components/ChatLauncher.jsx` (it also shows a toast when chat is switched off).

## 1. Settings (.env)

| Variable | Values | What it does |
|---|---|---|
| `VITE_CHAT_PROVIDER` | `tawk` or `none` | `tawk` loads Tawk.to. `none` loads no chat script and hides the button. |
| `VITE_TAWK_PROPERTY_ID` | from Tawk | Property ID from the embed link `https://embed.tawk.to/<PROPERTY_ID>/<WIDGET_ID>` |
| `VITE_TAWK_WIDGET_ID` | from Tawk | Widget ID from the same link |

- `frontend/.env.development` already holds the team's FreshFind property, so `npm run dev` works with no setup. These IDs are public (every visitor's browser sees them), so they are safe in the repo.
- For the live site, set the same three variables in the hosting dashboard (or a local `.env.production`). If they are missing, the production build has chat switched off.
- Restart `npm run dev` after changing any `.env` file (Vite reads them at start-up).

## 2. Match the design (Tawk dashboard)

In **Administration → Chat Widget → Widget Appearance** (property "FreshFind"), copy the Figma "Chatbot · open state" frame:

- Header / theme colour: `#006304`, text white.
- Widget title: `FreshFind Assistant`, status line: `Answers instantly`.
- Welcome message: "Hi! 👋 I can help you find markets, opening hours and what's in season. What are you looking for?"

## 3. Pre-scripted answers (SRS: static dataset, links to market and produce pages)

Use **Shortcuts** (and, if you enable it, the AI Assist knowledge base) with these questions and answers. Replace the domain with the live site address.

| Question | Answer |
|---|---|
| What's in season? | See this month's picks: /seasonal · Full guide: /produce |
| Which markets are open now? | Live list of open markets: /find?open=1 |
| Which markets open this Saturday? | /find?day=sat |
| Do markets take bank transfers? | Most markets take cash and bank transfer. Markets that also take card: /directory?feat=card |
| Is there parking? | Markets with dedicated parking: /directory?feat=parking |
| Where can I buy fresh fish? | /directory?cat=Fish%20%26%20meat · Festac 2nd Avenue: /markets/festac-2nd-ave · Epe Fish & Farm: /markets/epe-fish-farm |
| Where can I buy tomatoes? | /produce/tomatoes |
| Organic produce? | Markets with organic growers: /directory?feat=organic |
| Evening markets after work? | /directory?time=evening |
| How do I list my market? | Send us the details: /contact?topic=add |

Quick replies to enable on the welcome message: **What's in season?**, **Markets open now**, **Do they take transfers?**, **Parking info** (as in the Figma chatbot frame).

## 4. Notes for developers

- `@tawk.to/tawk-messenger-react` lists React 18 as its peer. `package.json` has an `overrides` entry so it installs with React 19.
- React 19 ignores the package's `defaultProps`, so `TawkChat.jsx` passes every event callback itself. Don't remove them, or the console fills with errors.
- In development, React StrictMode runs effects twice, and the package has no clean-up, so the embed script can be added twice in `npm run dev`. Production builds are not affected.

## 5. Test checklist

1. `VITE_CHAT_PROVIDER=tawk`: click **Ask FreshFind** and the Tawk window opens. The button hides while the window is open. Minimise it and the button comes back, with no second Tawk bubble.
2. `VITE_CHAT_PROVIDER=none`: no request to `embed.tawk.to`, no chat button, and the rest of the site works.
3. Mobile (402px wide): the round button sits above the bottom tab bar, and Tawk opens full-screen.
4. Keyboard: Tab to the button, see the focus ring, and press Enter to open the chat.
