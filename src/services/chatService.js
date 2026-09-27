/**
 * One place to control the live chat.
 *
 * The rest of the app only calls openChat(), closeChat(), toggleChat(),
 * maximizeChat() and minimizeChat(). It never talks to the chat widget directly.
 *
 * Which provider runs is set in .env:
 *   VITE_CHAT_PROVIDER=json   -> FreshFind Assistant, scripted answers from
 *                                public/data/chatbot.json (SRS 1.5, default)
 *   VITE_CHAT_PROVIDER=none   -> no chat loads at all
 */

const SUPPORTED = ["json", "none"];

const requested = (import.meta.env.VITE_CHAT_PROVIDER || "json")
  .trim()
  .toLowerCase();

if (!SUPPORTED.includes(requested)) {
  console.warn(
    `[chat] VITE_CHAT_PROVIDER="${requested}" is not supported. Use "json" or "none". Falling back to "json".`,
  );
}

/** The provider that is actually running: "json" or "none". */
export const chatProvider = SUPPORTED.includes(requested) ? requested : "json";

/** True when a chat provider is switched on. */
export const chatEnabled = chatProvider !== "none";

// The provider component (the ChatbotPanel) gives us its controls once
// it has loaded. Until then we remember the last thing that was asked.
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
