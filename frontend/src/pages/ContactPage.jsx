import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb.jsx";
import Icon from "../components/Icon.jsx";
import { useOpenChat } from "../components/ChatLauncher.jsx";
import { useUserLocation } from "../context/LocationContext.jsx";
import { distanceKm, formatKm } from "../lib/geo.js";
import { googleMapsEmbed, googleDirections } from "../lib/assets.js";
import "./ContactPage.css";

const OFFICE = {
  lat: 6.4474,
  lng: 3.4722,
  address: "14 Admiralty Way, Lekki Phase 1, Lagos",
};
const EMAIL = "hello@freshfind.ng";
const TOPICS = [
  { id: "general", label: "General question" },
  { id: "fix", label: "Fix a listing" },
  { id: "add", label: "Add my market" },
  { id: "partner", label: "Partnership" },
];

export default function ContactPage() {
  const [params] = useSearchParams();
  const openChat = useOpenChat();
  const { origin, status, requestDeviceLocation } = useUserLocation();
  const [topic, setTopic] = useState(
    TOPICS.some((t) => t.id === params.get("topic"))
      ? params.get("topic")
      : "fix",
  );
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const km = distanceKm(origin, OFFICE);

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "Please enter a valid email address.";
    if (form.message.trim().length < 10)
      next.message = "Please tell us a little more (at least 10 characters).";
    setErrors(next);
    if (Object.keys(next).length) return;
    const t = TOPICS.find((x) => x.id === topic).label;
    const body = `${form.message}\n\n${form.name}\n${form.email}`;
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(`FreshFind: ${t}`)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  const field = (key, label, props = {}) => (
    <div className="field">
      <label htmlFor={`c-${key}`}>{label}</label>
      {props.as === "textarea" ? (
        <textarea
          id={`c-${key}`}
          rows={4}
          value={form[key]}
          placeholder={props.placeholder}
          aria-invalid={Boolean(errors[key])}
          aria-describedby={errors[key] ? `c-${key}-err` : undefined}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        />
      ) : (
        <input
          id={`c-${key}`}
          type={props.type || "text"}
          value={form[key]}
          placeholder={props.placeholder}
          autoComplete={props.autoComplete}
          aria-invalid={Boolean(errors[key])}
          aria-describedby={errors[key] ? `c-${key}-err` : undefined}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        />
      )}
      {errors[key] && (
        <span id={`c-${key}-err`} className="field__error">
          {errors[key]}
        </span>
      )}
    </div>
  );

  return (
    <div className="contact">
      <header className="container page-header">
        <Breadcrumb
          items={[{ label: "Home", to: "/" }, { label: "Contact us" }]}
        />
        <div className="page-header__copy">
          <span className="eyebrow">We’d love to hear from you</span>
          <h1 className="page-title">Contact us</h1>
          <p className="lead">
            Questions, corrections to a market listing, or want to add your
            market? Send us a message.
          </p>
        </div>
      </header>

      <div className="container contact__body">
        <form className="contact__form card" onSubmit={submit} noValidate>
          <h2>Send a message</h2>
          <div className="contact__row">
            {field("name", "Full name", {
              placeholder: "e.g. Ada Okafor",
              autoComplete: "name",
            })}
            {field("email", "Email address", {
              placeholder: "you@example.com",
              type: "email",
              autoComplete: "email",
            })}
          </div>
          <fieldset className="contact__topics">
            <legend>What is it about?</legend>
            <div>
              {TOPICS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className="chip"
                  aria-pressed={topic === t.id}
                  onClick={() => setTopic(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </fieldset>
          {field("message", "Message", {
            as: "textarea",
            placeholder:
              "Tell us what’s changed. For listings, include the market name and new days or hours.",
          })}
          <div className="contact__submit">
            <p className="muted">
              {sent
                ? "Your email app should open with the message ready to send."
                : "We usually reply within 2 working days."}
            </p>
            <button type="submit" className="btn btn--accent btn--lg">
              Send message
              <Icon name="send-horizontal" size={16} />
            </button>
          </div>
        </form>

        <div className="contact__side">
          <section className="contact__map card" aria-labelledby="office-title">
            <div className="contact__map-frame">
              <iframe
                title="Map showing the FreshFind office"
                src={googleMapsEmbed(OFFICE, 14)}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              {origin.source === "device" ? (
                <span className="pill contact__you">
                  <span className="dot dot--you" aria-hidden="true" />
                  You are here · {formatKm(km)} away
                </span>
              ) : (
                <button
                  type="button"
                  className="pill contact__you"
                  onClick={requestDeviceLocation}
                >
                  <span className="dot dot--you" aria-hidden="true" />
                  {status === "locating"
                    ? "Finding you…"
                    : status === "denied"
                      ? "Location access is off"
                      : "Show my distance"}
                </button>
              )}
            </div>
            <div className="contact__info">
              <h2 id="office-title" className="visually-hidden">
                Our office
              </h2>
              <a
                className="icon-text"
                href={googleDirections(OFFICE)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="map-pin" size={16} />
                {OFFICE.address}
              </a>
              <a className="icon-text" href="tel:+2348000000000">
                <Icon name="phone" size={16} />
                +234 800 000 0000
              </a>
              <a className="icon-text" href={`mailto:${EMAIL}`}>
                <Icon name="mail" size={16} />
                {EMAIL}
              </a>
              <span className="icon-text">
                <Icon name="clock" size={16} />
                Mon – Fri · 9:00 AM – 5:00 PM
              </span>
            </div>
          </section>

          <button type="button" className="contact__faq" onClick={openChat}>
            <span className="contact__faq-ic" aria-hidden="true">
              <Icon name="bot" size={20} />
            </span>
            <span>
              <strong>Need a quick answer?</strong>
              <span>Ask FreshFind about hours, payment and parking.</span>
            </span>
            <Icon name="arrow-right" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
