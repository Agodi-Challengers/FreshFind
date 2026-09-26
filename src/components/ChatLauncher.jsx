import { useEffect, useState } from "react";
import Icon from "./Icon.jsx";
import ChatbotPanel from "./chatbot/ChatbotPanel.jsx";
import { useToast } from "../context/ToastContext.jsx";
import {
  chatEnabled,
  chatProvider,
  isChatOpen,
  openChat,
  subscribeToChat,
} from "../services/chatService.js";

/* eslint-disable-next-line react-refresh/only-export-components */
export function useOpenChat() {
  const toast = useToast();
  return () => {
    if (!openChat()) toast("Chat is switched off right now. Please use the contact form.");
  };
}

/**
 * Floating "Ask FreshFind" button from the Figma (States / Chat launcher).
 * It always opens the chat chosen in .env. It hides while the chat window
 * is open, and is not shown at all when chat is switched off.
 */
export default function ChatLauncher() {
  const [open, setOpen] = useState(isChatOpen);

  useEffect(() => subscribeToChat(setOpen), []);

  if (!chatEnabled) return null;

  return (
    <>
      {/* The scripted FreshFind Assistant window (VITE_CHAT_PROVIDER=json). */}
      {chatProvider === "json" && <ChatbotPanel />}
      <button
        type="button"
        className="chat-launcher"
        onClick={openChat}
        aria-label="Ask FreshFind: open chat"
        aria-expanded={open}
        hidden={open}
      >
        <span className="chat-launcher__avatar" aria-hidden="true">
          <Icon name="bot" size={20} />
        </span>
        <span className="chat-launcher__text">Ask FreshFind</span>
      </button>
    </>
  );
}
