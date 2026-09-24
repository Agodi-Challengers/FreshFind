import { Link } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb.jsx";
import Icon from "../components/Icon.jsx";
import { useData } from "../context/DataContext.jsx";
import { useNow } from "../context/ClockContext.jsx";
import { isOpenNow } from "../lib/time.js";

const VALUES = [
  {
    icon: "store",
    title: "Local first",
    text: "Every market in the directory is in Lagos, added from the design and the SRS rather than scraped from a global database.",
  },
  {
    icon: "sun",
    title: "Honest about seasons",
    text: "Seasons that the design does not show are marked as indicative for Lagos, so nobody is misled by a precise-looking chart.",
  },
  {
    icon: "lock",
    title: "Nothing leaves your device",
    text: "Bookmarks, notes and location stay in this browser session. There is no account and no server storage.",
  },
];

export default function AboutPage() {
  const { markets, produce, areas } = useData();
  const now = useNow();
  const openCount = markets.filter((m) => isOpenNow(m, now)).length;

  return (
    <div className="ff-container ff-page">
      <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "About" }]} />

      <div className="ff-page-header" style={{ paddingBottom: 0 }}>
        <div className="ff-page-header__copy">
          <span className="ff-eyebrow">About FreshFind</span>
          <h1 className="ff-page-title">Fresh all along</h1>
          <p className="ff-lead">
            FreshFind helps residents of Lagos discover farmers markets near
            them: where they are, when they open, and what is likely to be on
            the stalls this week.
          </p>
        </div>
      </div>

      <div className="ff-stats" style={{ marginTop: 28, maxWidth: 700 }}>
        <div className="ff-stat">
          <span className="ff-stat__n">{markets.length}</span>
          <span className="ff-stat__l">markets listed</span>
        </div>
        <div className="ff-stat">
          <span className="ff-stat__n">{produce.length}</span>
          <span className="ff-stat__l">produce guides</span>
        </div>
        <div className="ff-stat">
          <span className="ff-stat__n">{openCount}</span>
          <span className="ff-stat__l">open right now</span>
        </div>
      </div>

      <section className="ff-section">
        <div className="ff-prose">
          <h2>How we built it</h2>
          <p>
            The site is a single page application built from the FreshFind web
            design and the FreshFind SRS. Market and produce information lives
            in two JSON files that ship with the site, so there is no backend to
            go down and no tracking to opt out of.
          </p>
          <p>
            Opening hours are read in Lagos time (Africa/Lagos) whatever the
            visitor's own time zone is, so "open now" means open now in Lagos.
            Distances are great-circle estimates from your chosen location, and
            the map on each market page is an embedded Google map.
          </p>
          <h2>What we assume</h2>
          <p>
            Market coordinates are approximate points on the named streets and
            are used for distance, "near me" sorting and the map. The default
            location is Lekki Phase 1 until a visitor shares their own. Login,
            sign up and the contact form do not store or send any data.
          </p>
          <p>
            We cover {areas.length} areas across the island and the mainland.
            Where a design card showed fewer trading days than the market page,
            the market page wins.
          </p>
        </div>
      </section>

      <section className="ff-section">
        <div className="ff-section-head__copy" style={{ marginBottom: 28 }}>
          <span className="ff-eyebrow">What we care about</span>
          <h2 className="ff-section-title">Three promises</h2>
        </div>
        <div className="ff-feature-list">
          {VALUES.map((v) => (
            <div key={v.title} className="ff-feature">
              <span className="ff-feature__ic" aria-hidden="true">
                <Icon name={v.icon} size={20} />
              </span>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="ff-section">
        <div className="ff-cta">
          <div>
            <h2>Start with what is open today</h2>
            <p>
              Find a market near you, then check the produce guide to see what
              is in season before you go.
            </p>
          </div>
          <div className="ff-cta__actions">
            <Link to="/find" className="ff-btn ff-btn--yellow ff-btn--lg">
              Find a market
            </Link>
            <Link
              to="/contact"
              className="ff-btn ff-btn--outline-light ff-btn--lg"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
