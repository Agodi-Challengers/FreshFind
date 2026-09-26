import { useRef } from "react";
import TawkMessengerReact from "@tawk.to/tawk-messenger-react";
import { registerChatControls, setChatOpen } from "../../services/chatService.js";

// IDs come from .env (see .env.example). Never type them into this file.
const PROPERTY_ID = import.meta.env.VITE_TAWK_PROPERTY_ID;
const WIDGET_ID = import.meta.env.VITE_TAWK_WIDGET_ID;

// Where the Tawk window sits. Our own "Ask FreshFind" button opens it,
// so Tawk's round bubble is hidden (see handleLoad below).
// On mobile it sits above the bottom tab bar (the bar is about 72px tall).
const CUSTOM_STYLE = {
  zIndex: 1000,
  visibility: {
    desktop: { position: "br", xOffset: 32, yOffset: 28 },
    mobile: { position: "br", xOffset: 16, yOffset: 92 },
  },
};

const doNothing = () => {};

/**
 * Loads the Tawk.to live chat with the official React package and
 * hands its controls to services/chatService.js.
 */
export default function TawkChat() {
  const tawk = useRef(null);

  // chatService.js already turns chat off when an ID is missing; this is a safety net.
  if (!PROPERTY_ID || !WIDGET_ID) return null;

  const open = () => {
    tawk.current?.showWidget();
    tawk.current?.maximize();
  };

  const close = () => {
    tawk.current?.minimize();
  };

  const toggle = () => {
    if (tawk.current?.isChatMaximized()) close();
    else open();
  };

  function handleLoad() {
    // Hide Tawk's own bubble: the Figma "Ask FreshFind" button is the only way in.
    tawk.current?.hideWidget();
    registerChatControls({ open, close, toggle });
  }

  function handleMaximized() {
    setChatOpen(true);
  }

  function handleMinimized() {
    // Back to our button only.
    tawk.current?.hideWidget();
    setChatOpen(false);
  }

  return (
    <TawkMessengerReact
      ref={tawk}
      propertyId={PROPERTY_ID}
      widgetId={WIDGET_ID}
      customStyle={CUSTOM_STYLE}
      onLoad={handleLoad}
      onChatMaximized={handleMaximized}
      onChatMinimized={handleMinimized}
      onChatHidden={doNothing}
      // React 19 ignores this package's defaultProps, so every event it
      // listens for must get a function, or the browser logs errors.
      onStatusChange={doNothing}
      onBeforeLoad={doNothing}
      onChatStarted={doNothing}
      onChatEnded={doNothing}
      onPrechatSubmit={doNothing}
      onOfflineSubmit={doNothing}
      onChatMessageVisitor={doNothing}
      onChatMessageAgent={doNothing}
      onChatMessageSystem={doNothing}
      onAgentJoinChat={doNothing}
      onAgentLeaveChat={doNothing}
      onChatSatisfaction={doNothing}
      onVisitorNameChanged={doNothing}
      onFileUpload={doNothing}
      onTagsUpdated={doNothing}
      onUnreadCountChanged={doNothing}
    />
  );
}
