import { useEffect } from "react";
import Icon from "./Icon.jsx";
import { useToast } from "../context/ToastContext.jsx";

const PROPERTY_ID = import.meta.env.VITE_TAWK_PROPERTY_ID;
const WIDGET_ID = import.meta.env.VITE_TAWK_WIDGET_ID;

/**
 * "Ask FreshFind" chat launcher. Loads the Tawk.to widget when the property and
 * widget ids are configured in .env; otherwise it explains that chat is not set up.
 */
export default function ChatLauncher() {
  const toast = useToast();

  useEffect(() => {
    if (!PROPERTY_ID || !WIDGET_ID) return undefined;
    if (document.getElementById("tawk-embed")) return undefined;

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const script = document.createElement("script");
    script.id = "tawk-embed";
    script.async = true;
    script.src = `https://embed.tawk.to/${PROPERTY_ID}/${WIDGET_ID}`;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    document.body.appendChild(script);

    return undefined;
  }, []);

  const openChat = () => {
    if (window.Tawk_API?.maximize) {
      window.Tawk_API.maximize();
      return;
    }
    toast(
      "Chat is not configured yet. Email hello@freshfind.ng and we will reply.",
    );
  };

  return (
    <button type="button" className="ff-chat-launcher" onClick={openChat}>
      <span className="ff-chat-launcher__avatar" aria-hidden="true">
        <Icon name="message-circle" size={22} />
      </span>
      <span className="ff-chat-launcher__text">Ask FreshFind</span>
    </button>
  );
}
