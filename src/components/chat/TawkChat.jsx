import { useEffect, useRef } from "react";
import TawkMessengerReact from "@tawk.to/tawk-messenger-react";
import {
  registerChatControls,
  setChatOpen,
} from "../../services/chatService.js";

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

// Tawk builds its widget asynchronously after its script loads. Any call to
// the API before that finishes throws or is silently ignored, which is why the
// chat sometimes did nothing when "Ask FreshFind" was clicked early (first
// paint, slow connection). While the window is not up yet we keep nudging
// Tawk until it is, ignoring the errors it throws until then.
const RETRY_EVERY_MS = 250;
const GIVE_UP_AFTER_MS = 20000;

/** Calls a method on the Tawk handle without letting a not-ready widget throw. */
function attemptTawk(handle, method) {
  try {
    handle?.[method]?.();
  } catch {
    // Tawk is still starting up; the next retry will try again.
  }
}

/** True once Tawk's chat window (not the small round bubble) is on screen. */
function chatWindowIsOpen() {
  return Array.from(
    document.querySelectorAll('iframe[title="Chat widget"]'),
  ).some((frame) => frame.offsetWidth > 200 && frame.offsetHeight > 200);
}

/**
 * Loads the Tawk.to live chat with the official React package and
 * hands its controls to services/chatService.js.
 */
export default function TawkChat() {
  const tawk = useRef(null);
  const retryTimer = useRef(null);

  // Clear any pending nudge if this provider is ever torn down.
  useEffect(() => () => clearTimeout(retryTimer.current), []);

  // chatService.js already turns chat off when an ID is missing; this is a safety net.
  if (!PROPERTY_ID || !WIDGET_ID) return null;

  const stopRetry = () => {
    clearTimeout(retryTimer.current);
    retryTimer.current = null;
  };

  // Open Tawk's window and keep trying until it actually appears.
  // We only maximize(): Tawk's own round bubble was hidden on load, and
  // calling showWidget() here would put it back next to our own button.
  const openChatWindow = () => {
    stopRetry();
    const startedAt = Date.now();
    const attempt = () => {
      attemptTawk(tawk.current, "maximize");
      if (!chatWindowIsOpen() && Date.now() - startedAt < GIVE_UP_AFTER_MS) {
        retryTimer.current = setTimeout(attempt, RETRY_EVERY_MS);
      } else {
        retryTimer.current = null;
      }
    };
    attempt();
  };

  const closeChatWindow = () => {
    stopRetry();
    attemptTawk(tawk.current, "minimize");
  };

  const isChatMaximized = () => {
    try {
      return Boolean(tawk.current?.isChatMaximized?.());
    } catch {
      return false;
    }
  };

  const toggleChatWindow = () => {
    if (isChatMaximized()) closeChatWindow();
    else openChatWindow();
  };

  function handleLoad() {
    // Hide Tawk's own bubble: the Figma "Ask FreshFind" button is the only way in.
    attemptTawk(tawk.current, "hideWidget");
    // Tawk remembers an open window from the last visit and reloads it
    // "open but hidden". Start closed so our button reliably opens it.
    if (isChatMaximized()) closeChatWindow();
    registerChatControls({
      open: openChatWindow,
      close: closeChatWindow,
      toggle: toggleChatWindow,
    });
  }

  function handleMaximized() {
    stopRetry();
    // Make sure no second (Tawk) bubble is left beside our button.
    attemptTawk(tawk.current, "hideWidget");
    setChatOpen(true);
  }

  function handleMinimized() {
    stopRetry();
    // Back to our button only.
    attemptTawk(tawk.current, "hideWidget");
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
