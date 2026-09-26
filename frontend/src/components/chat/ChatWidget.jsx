import TawkChat from "./TawkChat.jsx";
import { chatProvider } from "../../services/chatService.js";

/**
 * Loads only the chat provider chosen in .env (VITE_CHAT_PROVIDER).
 * "none" loads nothing, so no third-party script runs.
 */
export default function ChatWidget() {
  if (chatProvider === "tawk") return <TawkChat />;
  return null;
}
