import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb.jsx";
import Icon from "../components/Icon.jsx";
import { useToast } from "../context/ToastContext.jsx";

const TOPICS = [
  { value: "general", label: "General question" },
  { value: "add", label: "List a market" },
  { value: "correct", label: "Correct opening hours" },
  { value: "partnership", label: "Partnership" },
];

const EMAIL = "hello@freshfind.ng";

export default function ContactPage() {
  const [params] = useSearchParams();
  const toast = useToast();
  const initialTopic = TOPICS.some((t) => t.value === params.get("topic"))
    ? params.get("topic")
    : "general";

  const [form, setForm] = useState({
    name: "",
    email: "",
    topic: initialTopic,
    market: "",
    message: "",
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const topicLabel =
    TOPICS.find((t) => t.value === form.topic)?.label || "General question";

  const onSubmit = (e) => {
    e.preventDefault();
    const subject = `FreshFind · ${topicLabel}`;
    const body = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Topic: ${topicLabel}`,
      form.market ? `Market: ${form.market}` : null,
      "",
      form.message,
    ]
      .filter(Boolean)
      .join("\n");

    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    toast("Opening your email app…");
  };

  return (
    <div className="ff-container ff-page">
      <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Contact" }]} />

      <div className="ff-page-header" style={{ paddingBottom: 0 }}>
        <div className="ff-page-header__copy">
          <span className="ff-eyebrow">Contact</span>
          <h1 className="ff-page-title">Tell us about a market</h1>
          <p className="ff-lead">
            Send us a market we have missed, a correction to opening hours, or
            anything else. We read every message.
          </p>
        </div>
      </div>

      <div className="ff-detail" style={{ marginTop: 28 }}>
        <div className="ff-card ff-card-pad">
          <form className="ff-form" onSubmit={onSubmit}>
            <div className="ff-form-row">
              <label className="ff-field">
                <span className="ff-field-label">Your name</span>
                <input
                  className="ff-input"
                  type="text"
                  value={form.name}
                  onChange={set("name")}
                  placeholder="Amaka Obi"
                  required
                />
              </label>
              <label className="ff-field">
                <span className="ff-field-label">Email</span>
                <input
                  className="ff-input"
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="you@example.com"
                  required
                />
              </label>
            </div>

            <div className="ff-form-row">
              <label className="ff-field">
                <span className="ff-field-label">Topic</span>
                <select
                  className="ff-select"
                  value={form.topic}
                  onChange={set("topic")}
                >
                  {TOPICS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="ff-field">
                <span className="ff-field-label">Market (optional)</span>
                <input
                  className="ff-input"
                  type="text"
                  value={form.market}
                  onChange={set("market")}
                  placeholder="Name or street"
                />
              </label>
            </div>

            <label className="ff-field">
              <span className="ff-field-label">Message</span>
              <textarea
                className="ff-textarea"
                value={form.message}
                onChange={set("message")}
                placeholder="Tell us what you know…"
                required
              />
            </label>

            <div className="ff-form__actions">
              <button
                type="submit"
                className="ff-btn ff-btn--primary ff-btn--lg"
              >
                <Icon name="send-horizontal" size={17} />
                Send message
              </button>
              <span className="ff-fineprint" style={{ marginTop: 0 }}>
                This opens your email app. Nothing is stored on a server.
              </span>
            </div>
          </form>
        </div>

        <aside className="ff-sidebar">
          <div className="ff-card ff-card-pad ff-stack">
            <span className="ff-field-label">Reach us directly</span>
            <a
              className="ff-btn ff-btn--outline ff-btn--block"
              href={`mailto:${EMAIL}`}
            >
              <Icon name="mail" size={16} />
              {EMAIL}
            </a>
            <a
              className="ff-btn ff-btn--outline ff-btn--block"
              href="tel:+2348000000000"
            >
              <Icon name="phone" size={16} />
              +234 800 000 0000
            </a>
            <span className="ff-icon-text ff-muted">
              <Icon name="map-pin" size={14} />
              Lagos, Nigeria
            </span>
          </div>

          <div className="ff-notice ff-notice--info">
            <Icon name="info" size={17} />
            <span>
              There is no account and no server storage in this build, so
              messages are sent from your own email client.
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}
