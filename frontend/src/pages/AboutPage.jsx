import { Link } from "react-router-dom";
import PageBanner from "../components/PageBanner.jsx";
import Icon from "../components/Icon.jsx";
import { asset } from "../lib/assets.js";
import "./AboutPage.css";
import Paul from "../assets/Paul.png";
import Ziora from "../assets/ziora.png";
import Aishat from "../assets/aishat.png";
import Treasure from "../assets/treasure.png";
import Omisakin from "../assets/wole.png";

// The three things we care about (Figma "What we believe" checklist)
const BELIEFS = ["Local first", "Accurate listings", "Easy for everyone"];

// Our team. To add a person, copy one object and change the details.
const TEAM = [
  {
    name: "Paul Ademola",
    role: "Product Design (UI/UX) / Team Leader",
    photo: Paul,
    linkedin: "https://www.linkedin.com/in/paul-ademola-68697226b",
    github: "https://github.com/paulademolaa",
  },
  {
    name: "Ziora Iwuji",
    role: "Frontend Developer",
    photo: Ziora,
    github: "https://github.com/ziora-lawrence",
  },
  {
    name: "Aishat Lawal",
    role: "Frontend Developer",
    photo: Aishat,
    linkedin: "https://www.linkedin.com/in/aishat-lawal-4252b13b0",
    github: "https://github.com/anikemide0902-rgb",
  },
  {
    name: "Treasure Amao",
    role: "Frontend Developer",
    photo: Treasure,
    linkedin: "https://www.linkedin.com/in/treasure-amao-021b73418",
    github: "https://github.com/temzycodes",
  },
  {
    name: "Omisakin Olawole",
    role: "Product Design (UI/UX)",
    photo: Omisakin,
    linkedin: "https://www.linkedin.com/in/olawole-omisakin-670a16291",
    github: "https://github.com/",
  },
];

export default function AboutPage() {
  return (
    <div className="about">
      <PageBanner
        crumbs={[{ label: "Home", to: "/" }, { label: "About us" }]}
      />

      {/* Our story */}
      <section className="container about__hero">
        <div className="about__copy">
          <span className="eyebrow">Our story</span>
          <h1>Good Food Starts With a Fresh Find</h1>
          <p>
            Market days and times in your location live on flyers, church notice
            boards and WhatsApp forwards. FreshFind puts them in one place, so
            it’s easy to buy fresh and support the farmers near you.
          </p>
        </div>
        <img
          className="about__hero-img"
          src={asset("/images/site/about-hero.jpg")}
          alt="Farmers sitting with their pineapple harvest"
          width="624"
          height="460"
        />
      </section>

      {/* What we believe */}
      <section
        className="container about__believe"
        aria-labelledby="believe-title"
      >
        <img
          className="about__believe-img"
          src={asset("/images/site/about-believe.jpg")}
          alt="Smiling farmers standing in their field"
          width="624"
          height="460"
          loading="lazy"
        />
        <div className="about__believe-copy">
          <h2 id="believe-title">What we believe</h2>
          <p>
            Every naira spent at a farmers market helps support the people who
            grow our food. At FreshFind, we verify market days and hours with
            organisers, flag information that may be outdated, and keep
            everything clear and accessible so everyone can easily plan their
            next market trip.
          </p>
          <ul className="about__checklist">
            {BELIEFS.map((item) => (
              <li key={item}>
                <span className="about__check" aria-hidden="true">
                  <Icon name="badge-check" size={14} />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <Link to="/produce" className="btn btn--primary btn--lg">
            See produce guide
            <Icon name="arrow-right" size={16} />
          </Link>
        </div>
      </section>

      {/* The team */}
      <section className="about__team" aria-labelledby="team-title">
        <div className="container">
          <h2 id="team-title">The Team</h2>
          <p className="about__team-text">
            A small group of designers and developers who love a good market
            morning.
          </p>
          <ul className="about__team-list">
            {TEAM.map((person) => (
              <li key={person.name} className="team-card">
                <div className="team-card__photo">
                  <img
                    src={asset(person.photo)}
                    alt={person.name}
                    width="312"
                    height="280"
                    loading="lazy"
                  />
                  <div className="team-card__social">
                    <a
                      href={person.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${person.name} on LinkedIn`}
                    >
                      <Icon name="linkedin" size={18} />
                    </a>
                    <a
                      href={person.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${person.name} on GitHub`}
                    >
                      <Icon name="github" size={18} />
                    </a>
                  </div>
                </div>
                <div className="team-card__body">
                  <h3>{person.name}</h3>
                  <p>{person.role}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
