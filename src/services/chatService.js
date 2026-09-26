/**
 * One place to control the live chat, whatever provider is switched on.
 *
 * The rest of the app only calls openChat(), closeChat(), toggleChat(),
 * maximizeChat() and minimizeChat(). It never talks to Tawk.to directly.
 *
 * Which provider runs is set in .env:
 *   VITE_CHAT_PROVIDER=json   -> FreshFind Assistant, scripted answers from
 *                                public/data/chatbot.json (SRS 1.5, default)
 *   VITE_CHAT_PROVIDER=tawk   -> Tawk.to live chat
 *   VITE_CHAT_PROVIDER=none   -> no chat loads at all
 */

const SUPPORTED = ["json", "tawk", "none"];

const requested = (import.meta.env.VITE_CHAT_PROVIDER || "json").trim().toLowerCase();

if (!SUPPORTED.includes(requested)) {
  console.warn(
    `[chat] VITE_CHAT_PROVIDER="${requested}" is not supported. Use "json", "tawk" or "none". Chat is turned off.`,
  );
}

// Tawk.to needs both IDs. Without them it cannot load, so chat stays off
// (otherwise the button would show but do nothing).
const tawkHasIds = Boolean(
  import.meta.env.VITE_TAWK_PROPERTY_ID && import.meta.env.VITE_TAWK_WIDGET_ID,
);

if (requested === "tawk" && !tawkHasIds) {
  console.warn(
    "[chat] VITE_CHAT_PROVIDER=tawk but VITE_TAWK_PROPERTY_ID or VITE_TAWK_WIDGET_ID is missing. Chat is turned off.",
  );
}

function pickProvider() {
  if (requested === "json") return "json";
  if (requested === "tawk") return tawkHasIds ? "tawk" : "none";
  return "none";
}

/** The provider that is actually running: "json", "tawk" or "none". */
export const chatProvider = pickProvider();

/** True when a chat provider is switched on. */
export const chatEnabled = chatProvider !== "none";

// The provider component (for example TawkChat) gives us its controls once
// its widget has loaded. Until then we remember the last thing that was asked.
let controls = null;
let pendingAction = null;

// Components that want to know if the chat window is open (the launcher button).
let isOpen = false;
const listeners = new Set();

function run(action) {
  if (!chatEnabled) return false;
  if (controls && typeof controls[action] === "function") {
    controls[action]();
  } else {
    // Widget still loading: do it as soon as it is ready.
    pendingAction = action;
  }
  return true;
}

/**
 * Called by the provider component.
 * controls = { open, close, toggle } or null when the provider goes away.
 */
export function registerChatControls(next) {
  controls = next;
  if (controls && pendingAction) {
    const action = pendingAction;
    pendingAction = null;
    run(action);
  }
}

/** Called by the provider component when its window opens or closes. */
export function setChatOpen(open) {
  isOpen = open;
  listeners.forEach((listener) => listener(open));
}

/** Listen for the chat opening and closing. Returns a function that stops listening. */
export function subscribeToChat(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function isChatOpen() {
  return isOpen;
}

export const openChat = () => run("open");
export const closeChat = () => run("close");
export const toggleChat = () => run("toggle");
export const maximizeChat = () => run("open");
export const minimizeChat = () => run("close");
