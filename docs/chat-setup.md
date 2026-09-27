# Live chat setup (FreshFind Assistant)

FreshFind uses the built-in **FreshFind Assistant**, a rule-based chatbot whose wording lives in `public/data/chatbot.json` (SRS 1.5). No external chat service is used; the "Ask FreshFind" button opens the assistant window.

## How it fits together

```
Ask FreshFind button (components/ChatLauncher.jsx)
        │  openChat()
        ▼
services/chatService.js      openChat · closeChat · toggleChat · maximizeChat · minimizeChat
        │  uses the controls registered by the active provider
        ▼
components/chatbot/ChatbotPanel.jsx  → FreshFind Assistant (VITE_CHAT_PROVIDER=json)
        │
        ▼
services/chatbotService.js   → picks an answer from chatbot.json + the market/produce data
```

Pages never talk to the provider directly. To open the chat from anywhere, use `openChat()` from `services/chatService.js`, or the `useOpenChat()` hook from `components/ChatLauncher.jsx` (it also shows a toast when chat is switched off).

## 1. Settings (.env)

| Variable             | Values           | What it does                                           |
| -------------------- | ---------------- | ------------------------------------------------------ |
| `VITE_CHAT_PROVIDER` | `json` or `none` | `json` loads the FreshFind Assistant. `none` hides it. |

- `.env` and `.env.development` already set `VITE_CHAT_PROVIDER=json`, so `npm run dev` works with no setup.
- For the live site, set the same variable in the hosting dashboard (or a local `.env.production`).
- Restart `npm run dev` after changing any `.env` file (Vite reads them at start-up).

## 2. Edit the answers (public/data/chatbot.json)

The JSON holds the assistant name, greeting, suggestions, keyword intents, fallback and links. Change the wording there and the chatbot picks it up after a rebuild or redeploy.

## 3. Test checklist

1. `VITE_CHAT_PROVIDER=json`: click **Ask FreshFind** and the assistant window opens. The button hides while the window is open, and comes back when it is closed.
2. `VITE_CHAT_PROVIDER=none`: no chat button and the rest of the site works.
3. Mobile (402px wide): the round button sits above the bottom tab bar.
4. Keyboard: Tab to the button, see the focus ring, and press Enter to open the chat.
