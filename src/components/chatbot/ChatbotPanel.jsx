import { useEffect, useRef, useState } from "react";
import Icon from "../Icon.jsx";
import ChatMessage from "./ChatMessage.jsx";
import { useData } from "../../context/DataContext.jsx";
import { useNow } from "../../context/ClockContext.jsx";
import { useUserLocation } from "../../context/LocationContext.jsx";
import { useDecoratedMarkets } from "../../lib/useMarkets.js";
import { asset } from "../../lib/assets.js";
import { answer, nearMeAnswer } from "../../services/chatbotService.js";
import { registerChatControls, setChatOpen } from "../../services/chatService.js";
import "./ChatbotPanel.css";

const TYPING_DELAY_MS = 600;

/**
 * FreshFind Assistant window (Figma "Chatbot · open state").
 * Answers come from public/data/chatbot.json and the market/produce data.
 * It opens from the "Ask FreshFind" button through services/chatService.js.
 */
export default function ChatbotPanel() {
  const data = useData();
  const now = useNow();
  const markets = useDecoratedMarkets();
  const { origin, status, requestDeviceLocation } = useUserLocation();

  const [script, setScript] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [waitingForLocation, setWaitingForLocation] = useState(false);

  const inputRef = useRef(null);
  const listRef = useRef(null);
  const timer = useRef(null);

  // Load the scripted answers once.
  useEffect(() => {
    fetch(asset("/data/chatbot.json"))
      .then((res) => res.json())
      .then((json) => {
        setScript(json);
        setMessages([{ id: 0, from: "bot", text: json.greeting }]);
      })
      .catch(() => {
        setMessages([{ id: 0, from: "bot", text: "Sorry, the assistant could not load. Please try again later." }]);
      });
    return () => clearTimeout(timer.current);
  }, []);

  // Let the "Ask FreshFind" button open and close this window.
  useEffect(() => {
    registerChatControls({
      open: () => setIsChatOpen(true),
      close: () => setIsChatOpen(false),
      toggle: () => setIsChatOpen((open) => !open),
    });
    return () => registerChatControls(null);
  }, []);

  // Tell the launcher whether we are open, and focus the input when opening.
  useEffect(() => {
    setChatOpen(isChatOpen);
    if (isChatOpen) inputRef.current?.focus();
  }, [isChatOpen]);

  // Keep the newest message in view.
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages, isTyping, isChatOpen]);

  function addBotMessage(reply) {
    setMessages((prev) => [...prev, { id: prev.length, from: "bot", ...reply }]);
  }

  // When we asked for the user's location, answer once the browser replies.
  const locationKey = `${origin.source}:${status}`;
  const [lastLocationKey, setLastLocationKey] = useState(locationKey);
  if (locationKey !== lastLocationKey) {
    setLastLocationKey(locationKey);
    if (waitingForLocation && script) {
      const nearMe = script.intents.find((i) => i.type === "nearMe");
      if (origin.source === "device") {
        setWaitingForLocation(false);
        addBotMessage(nearMeAnswer(nearMe, markets, script));
      } else if (status === "denied" || status === "unavailable") {
        setWaitingForLocation(false);
        addBotMessage({ text: nearMe.denied, suggestions: nearMe.suggestions });
      }
    }
  }

  function send(question) {
    const text = question.trim();
    if (!text || !script || isTyping) return;
    setMessages((prev) => [...prev, { id: prev.length, from: "user", text }]);
    setInput("");
    setIsTyping(true);

    timer.current = setTimeout(() => {
      const reply = answer(text, {
        script,
        data,
        markets,
        now,
        hasDeviceLocation: origin.source === "device",
      });
      setIsTyping(false);
      addBotMessage(reply);
      if (reply.action === "locate") {
        setWaitingForLocation(true);
        requestDeviceLocation();
      }
    }, TYPING_DELAY_MS);
  }

  function handleSubmit(event) {
    event.preventDefault();
    send(input);
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") setIsChatOpen(false);
  }

  if (!isChatOpen) return null;

  // Suggested questions: from the last bot message, or the defaults.
  const lastBot = [...messages].reverse().find((m) => m.from === "bot");
  const suggestions = lastBot?.suggestions || script?.suggestions || [];

  return (
    <section
      className="chatbot"
      role="dialog"
      aria-label={script?.assistant.name || "FreshFind Assistant"}
      onKeyDown={handleKeyDown}
      style={{ backgroundImage: `url(${asset("/images/site/chat-pattern.jpg")})` }}
    >
      <header className="chatbot__header">
        <span className="chatbot__avatar" aria-hidden="true">
          <Icon name="bot" size={21} />
        </span>
        <div className="chatbot__title">
          <h2>{script?.assistant.name || "FreshFind Assistant"}</h2>
          <p>
            <span className="chatbot__online" aria-hidden="true" />
            {script?.assistant.status || "Answers instantly"}
          </p>
        </div>
        <button
          type="button"
          className="chatbot__close"
          aria-label="Close chat"
          onClick={() => setIsChatOpen(false)}
        >
          <Icon name="x" size={20} />
        </button>
      </header>

      <ol className="chatbot__messages" ref={listRef} role="log" aria-live="polite">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onNavigate={() => setIsChatOpen(false)}
          />
        ))}

        {isTyping && (
          <li className="chatbot__row" aria-label="FreshFind Assistant is typing">
            <span className="chatbot__typing" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </li>
        )}

        {!isTyping && suggestions.length > 0 && (
          <li className="chatbot__suggested">
            <p>Suggested</p>
            <div className="chatbot__chips">
              {suggestions.map((s) => (
                <button key={s} type="button" className="chatbot__chip" onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          </li>
        )}
      </ol>

      <form className="chatbot__input" onSubmit={handleSubmit}>
        <label htmlFor="chatbot-question" className="visually-hidden">
          Type your question
        </label>
        <input
          id="chatbot-question"
          ref={inputRef}
          type="text"
          autoComplete="off"
          placeholder={script?.placeholder || "Type your question…"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="chatbot__send" aria-label="Send" disabled={!input.trim()}>
          <Icon name="send-horizontal" size={20} />
        </button>
      </form>
    </section>
  );
}
