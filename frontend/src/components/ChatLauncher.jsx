import { useEffect } from "react";
import Icon from "./Icon.jsx";
import { loadTawk, openChat, tawkConfigured } from "../lib/tawk.js";
import { useToast } from "../context/ToastContext.jsx";

export function useOpenChat() {
  const toast = useToast();
  return () => {
    if (!openChat())
      toast(
        "Chat is not set up yet. Add the Tawk.to IDs to .env to turn it on.",
      );
  };
}

/** Floating "Ask FreshFind" launcher shown on every page. It opens the Tawk.to chat. */
export default function ChatLauncher() {
  const open = useOpenChat();

  useEffect(() => {
    if (!tawkConfigured) return undefined;
    // load the widget after the page has settled, so it does not slow down first paint
    const id = window.setTimeout(loadTawk, 2500);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <button
      type="button"
      className="chat-launcher"
      onClick={open}
      aria-label="Ask FreshFind: open chat"
    >
      <span className="chat-launcher__avatar" aria-hidden="true">
        <Icon name="bot" size={20} />
      </span>
      <span className="chat-launcher__text">Ask FreshFind</span>
    </button>
  );
}
