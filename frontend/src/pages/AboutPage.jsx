import Breadcrumb from "../components/Breadcrumb.jsx";
import Icon from "../components/Icon.jsx";
import { useData } from "../context/DataContext.jsx";
import { asset } from "../lib/assets.js";
import "./AboutPage.css";

const VALUES = [
  {
    title: "Local first",
    icon: "heart-handshake",
    tone: "green",
    text: "Every naira spent at a farmers market stays closer to the people who grew the food.",
  },
  {
    title: "Accurate listings",
    icon: "badge-check",
    tone: "yellow",
    text: "We confirm days and hours with market organisers, and flag anything that might be out of date.",
  },
  {
    title: "Easy for everyone",
    icon: "accessibility",
    tone: "orange",
    text: "Clear text, good contrast and keyboard support, so anyone can plan a market trip.",
  },
];

const TEAM = [
  {
    name: "Ada Okafor",
    role: "Product & research",
    initials: "AO",
    tone: "#e4f0df",
  },
  {
    name: "Tunde Bello",
    role: "Frontend developer",
    initials: "TB",
    tone: "#fdf0d2",
  },
  {
    name: "Funmi Idowu",
    role: "UI/UX designer",
    initials: "FI",
    tone: "#fce3d9",
  },
  {
    name: "Kelechi Eze",
    role: "Data & content",
    initials: "KE",
    tone: "#f3ecdd",
  },
];

export default function AboutPage() {
  const { markets, areas, produce } = useData();

  return (
    <div className="about">
      <section className="container about__hero">
        <div className="about__copy">
          <Breadcrumb
            items={[{ label: "Home", to: "/" }, { label: "About us" }]}
          />
          <span className="eyebrow">Our story</span>
          <h1>
            We started FreshFind because the best tomatoes shouldn’t be a
            secret.
          </h1>
          <p className="lead">
            Market days and times in Lagos live on flyers, church notice boards
            and WhatsApp forwards. FreshFind puts them in one place, so it’s
            easy to buy fresh and support the farmers near you.
          </p>
        </div>
        <div className="about__photo">
          <img
            src={asset("/images/site/about.webp")}
            alt="Shoppers at a busy Lagos farmers market"
            width="624"
            height="460"
          />
          <div className="about__stat">
            <strong>2,400+</strong>
            <span>farmers &amp; traders listed</span>
          </div>
        </div>
      </section>

      <section
        className="container about__stats-wrap"
        aria-label="FreshFind in numbers"
      >
        <ul className="about__stats">
          <li>
            <strong>{markets.length}</strong>
            <span>markets listed</span>
          </li>
          <li>
            <strong>{areas.length}</strong>
            <span>Lagos neighbourhoods</span>
          </li>
          <li>
            <strong>{produce.length}</strong>
            <span>produce guides</span>
          </li>
          <li>
            <strong>12k</strong>
            <span>monthly visitors</span>
          </li>
        </ul>
      </section>

      <section
        className="container about__values"
        aria-labelledby="values-title"
      >
        <h2 id="values-title">What we believe</h2>
        <div className="grid grid--3">
          {VALUES.map((v) => (
            <div key={v.title} className="about__value card hover-card">
              <span
                className={`feature__icon feature__icon--${v.tone}`}
                aria-hidden="true"
              >
                <Icon name={v.icon} size={24} />
              </span>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container about__team" aria-labelledby="team-title">
        <h2 id="team-title">The team</h2>
        <p className="lead">
          A small group of designers and developers who love a good market
          morning.
        </p>
        <ul className="grid grid--4">
          {TEAM.map((t) => (
            <li key={t.name} className="about__member card">
              <span
                className="about__avatar"
                style={{ background: t.tone }}
                aria-hidden="true"
              >
                {t.initials}
              </span>
              <h3>{t.name}</h3>
              <p>{t.role}</p>
              <div className="about__social">
                <a
                  href="https://www.linkedin.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${t.name} on LinkedIn`}
                >
                  <Icon name="linkedin" size={14} />
                </a>
                <a
                  href="https://github.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${t.name} on GitHub`}
                >
                  <Icon name="github" size={14} />
                </a>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
