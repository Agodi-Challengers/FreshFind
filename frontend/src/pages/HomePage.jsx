import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import Dropdown from "../components/Dropdown.jsx";
import SearchBox from "../components/SearchBox.jsx";
import MarketCard from "../components/MarketCard.jsx";
import StatusPill from "../components/StatusPill.jsx";
import { useData } from "../context/DataContext.jsx";
import { useNow } from "../context/ClockContext.jsx";
import { useUserLocation } from "../context/LocationContext.jsx";
import { useBookmarks } from "../context/BookmarksContext.jsx";
import { useDecoratedMarkets } from "../lib/useMarkets.js";
import { sortMarkets, filtersToParams, EMPTY_FILTERS } from "../lib/filters.js";
import { seasonalHighlights, pickOfTheMonth } from "../lib/seasonal.js";
import { DAY_KEYS, DAY_LONG } from "../lib/time.js";
import { formatKm } from "../lib/geo.js";
import { asset } from "../lib/assets.js";
import "./HomePage.css";
import line from "../assets/Line.png"
import  "./DirectoryPage.jsx"

const WEEKEND = ["sat", "sun"];

const listNames = (names) =>
  names.length <= 1
    ? names.join("")
    : `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`;

function areaOptions(areas, regions, markets) {
  const count = (fn) => markets.filter(fn).length;
  const opts = [
    { value: "", label: "All areas", count: markets.length, strong: true },
  ];
  for (const r of regions) {
    opts.push({ header: r });
    for (const a of areas.filter((x) => x.region === r)) {
      opts.push({
        value: a.name,
        label: a.name,
        count: count((m) => m.area === a.name),
      });
    }
  }
  return opts;
}

function dayOptions(now) {
  const tomorrow = DAY_KEYS[(now.dayIndex + 1) % 7];
  return [
    { value: "", label: "Any day", strong: true },
    { value: "weekend", label: "This weekend" },
    ...["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((d) => ({
      value: d,
      label:
        d === now.dayKey
          ? `${DAY_LONG[d]} (today)`
          : d === tomorrow
            ? `${DAY_LONG[d]} (tomorrow)`
            : DAY_LONG[d],
    })),
  ];
}

function HeroVisual({ markets, pick, openCount }) {
  const { produceById } = useData();
  const featured = useMemo(() => {
    const open = sortMarkets(
      markets.filter((m) => m.status.state !== "closed"),
      "nearest",
    );
    return open.length
      ? open.slice(0, 5)
      : sortMarkets(markets, "next").slice(0, 5);
  }, [markets]);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (featured.length < 2) return undefined;
    const id = window.setInterval(
      () => setI((v) => (v + 1) % featured.length),
      5000,
    );
    return () => window.clearInterval(id);
  }, [featured.length]);

  const m = featured[i % Math.max(1, featured.length)];

  return (
    <div className="hero__visual">
      <div className="hero__photo">
        <img
          src={asset("/images/site/home-hero.webp")}
          alt="Fresh vegetables and fruit on a Lagos market stall"
          width="520"
          height="520"
          fetchPriority="high"
        />
      </div>

      <div className="hero__live float-card">
        <span className="dot dot--open" aria-hidden="true" />
        {openCount} {openCount === 1 ? "market" : "markets"} open near you
      </div>

      {pick && (
        <Link
          to={`/produce/${pick.id}`}
          className="hero__pick float-card float-card--b"
        >
          <img
            src={asset(pick.icon || pick.image)}
            alt=""
            width="44"
            height="44"
          />
          <span>
            <span className="hero__pick-eyebrow">Pick of the week</span>
            <span className="hero__pick-name">
              {pick.pick?.title || pick.name}
            </span>
          </span>
        </Link>
      )}

      {m && (
        <Link
          key={m.id}
          to={`/markets/${m.id}`}
          className="hero__featured float-card float-card--a"
          aria-label={`Featured market: ${m.name}, ${m.status.pill}`}
        >
          <span className="hero__featured-row">
            <img src={asset(m.images.row)} alt="" width="48" height="48" />
            <span>
              <span className="hero__featured-name">{m.name}</span>
              <span className="hero__featured-street">{m.street}</span>
            </span>
          </span>
          <span className="hero__featured-status">
            <StatusPill status={m.status} />
            <span>
              {m.status.state === "closed"
                ? m.status.label
                : m.status.label.replace("Open until", "Closes")}{" "}
              · {formatKm(m.km)}
            </span>
          </span>
          <span className="hero__featured-produce">
            {m.produce.slice(0, 5).map((id) => (
              <img
                key={id}
                src={asset(produceById[id]?.icon || produceById[id]?.image)}
                alt=""
                width="34"
                height="34"
              />
            ))}
            {m.produce.length > 5 && (
              <span className="hero__more">+{m.produce.length - 5}</span>
            )}
          </span>
        </Link>
      )}

      <div className="hero__stat float-card float-card--c">
        <span className="hero__stat-num">{markets.length}</span>
        <span>markets listed in Lagos</span>
      </div>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { areas, regions, produce, marketsByProduce, categories } = useData();
  const now = useNow();
  const { requestDeviceLocation } = useUserLocation();
  const { items: saved } = useBookmarks();
  const markets = useDecoratedMarkets();

  const [area, setArea] = useState("");
  const [day, setDay] = useState("");
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("open");

  const monthName = new Intl.DateTimeFormat("en-GB", { month: "long" }).format(
    new Date(2026, now.month, 1),
  );
  const seasonal = useMemo(
    () => seasonalHighlights(produce, now.month),
    [produce, now.month],
  );
  const pick = useMemo(
    () => pickOfTheMonth(produce, now.month),
    [produce, now.month],
  );
  const openCount = markets.filter((m) => m.status.state !== "closed").length;

  const tabMarkets = useMemo(() => {
    let list = markets;
    if (tab === "open")
      list = markets.filter((m) => m.status.state !== "closed");
    else if (tab === "today")
      list = markets.filter((m) => m.schedule[now.dayKey]);
    else list = markets.filter((m) => WEEKEND.some((d) => m.schedule[d]));
    return sortMarkets(list, "nearest").slice(0, 4);
  }, [markets, tab, now.dayKey]);

  const goFind = (extra = {}) => {
    const f = { ...EMPTY_FILTERS, q, ...extra };
    if (area)
      f.areas = areas
        .filter((a) => a.name === area || a.region === area)
        .map((a) => a.name);
    if (day) f.days = day === "weekend" ? WEEKEND : [day];
    const s = filtersToParams(f).toString();
    navigate(`/find${s ? `?${s}` : ""}`);
  };

  const inSeasonNames = seasonal
    .slice(0, 3)
    .map((p) => (p.shortName || p.name).toLowerCase());

  return (
    <div className="home">
      <section className="hero container" aria-labelledby="hero-title">
        <div className="hero__copy">
          {inSeasonNames.length > 0 && (
            <Link to="/seasonal" className="hero__tag">
              <Icon name="sprout" size={14} />
              This week: {listNames(inSeasonNames)}{" "}
              {inSeasonNames.length === 1 ? "is" : "are"} in season
            </Link>
          )}
          <h1 id="hero-title" className="hero__title">
            Know what’s fresh, and exactly where to find it.
          </h1>
          <p className="hero__lead">
            FreshFind brings every farmers market in your neighbourhood into one
            place: where they are, when they open, and what’s likely on the
            stalls this week. No more chasing flyers and WhatsApp forwards.
          </p>

          <form
            className="quickfind"
            role="search"
            aria-label="Find a market near you"
            onSubmit={(e) => {
              e.preventDefault();
              goFind();
            }}
          >
            <Dropdown
              icon="map-pin"
              label="Area"
              value={area}
              onChange={setArea}
              options={areaOptions(areas, regions, markets)}
              className="quickfind__area"
            />
            <Dropdown
              icon="calendar"
              label="Day"
              value={day}
              onChange={setDay}
              options={dayOptions(now)}
              className="quickfind__day"
            />
            <SearchBox
              icon="carrot"
              label="Produce"
              placeholder="e.g. tomatoes, ugu, fish"
              value={q}
              onChange={setQ}
              onSubmit={() => goFind()}
              onPick={(opt) =>
                opt.type === "category"
                  ? goFind({ q: "", cats: [opt.value] })
                  : goFind({ q: opt.value })
              }
              markets={markets}
              className="quickfind__search"
            />
            <button
              type="submit"
              className="btn btn--accent btn--lg quickfind__go"
            >
              <Icon name="search" size={17} />
              Find markets
            </button>
          </form>

          <div className="hero__popular">
            <span>Popular:</span>
            <Link to="/find?open=1" className="chip">
              <span className="dot dot--open" aria-hidden="true" />
              Open now
            </Link>
            <Link to="/find?day=sat" className="chip">
              This Saturday
            </Link>
            <Link to="/directory?feat=organic" className="chip">
              Organic
            </Link>
            <button
              type="button"
              className="chip"
              onClick={() => {
                requestDeviceLocation();
                navigate("/find");
              }}
            >
              Near me
            </button>
          </div>
        </div>

        <HeroVisual markets={markets} pick={pick} openCount={openCount} />
      </section>

     
      <section className="section container" aria-labelledby="open-title">
        <div className="section-head">
          <div className="section-head__copy">
            <span id="brow" className="eyebrow">Happening now</span>
            <img id="line" className="line" src={line}/>
            <h2 id="open-title" className="section-title">
              Markets open near you
            </h2>
            <div className="mobile-season">
              <h2 className="mobile-season-title">
              Open near you
              </h2>
                <Link to="/directory" className="see-all">
                  See all
                </Link>
            </div>
            
          </div>
          <div className="home__tabs" role="group" aria-label="Show markets">
            <button
              type="button"
              className="chip chip--lg"
              aria-pressed={tab === "open"}
              onClick={() => setTab("open")}
            >
              Open now · {openCount}
            </button>
            <button
              type="button"
              className="chip chip--lg"
              aria-pressed={tab === "today"}
              onClick={() => setTab("today")}
            >
              Today
            </button>
            <button
              type="button"
              className="chip chip--lg"
              aria-pressed={tab === "weekend"}
              onClick={() => setTab("weekend")}
            >
              This weekend
            </button>
            <Link to="/directory" className="btn btn--ghost">
              View directory →
            </Link>
          </div>
        </div>
        {tabMarkets.length ? (
          <div className="grid grid--4 scroll-row">
            {tabMarkets.map((m) => (
              <MarketCard key={m.id} market={m} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <strong>No markets are open right now</strong>
            <span>
              Most Lagos markets open early. See which one opens next.
            </span>
            <Link to="/directory?sort=next" className="btn btn--primary">
              See what opens next
            </Link>
          </div>
        )}
      </section>

   
      <section className="home__season" aria-labelledby="season-title">
        <div className="container">
          <div className="section-head">
            <div className="section-head__copy">
              <span className="eyebrow">
                In season 
              </span>
              <img className="line" src={line}/>
              <h2 id="season-title" className="section-title">
                This week’s seasonal picks
              </h2>
            </div>
            <Link to="/produce" className="produce-btn">
              See the produce guide →
            </Link>
          </div>
          <ul className="season-cards">
            {seasonal.slice(0, 5).map((p) => (
              <li key={p.id}>
                <Link to={`/produce/${p.id}`} className="season-card">
                  <img
                    src={asset(p.icon || p.image)}
                    alt=""
                    width="64"
                    height="64"
                    loading="lazy"
                  />
                  <span className="season-card__t">
                    <span className="season-card__cat">
                      {categories.find((c) => c.name === p.category)?.label ||
                        p.category}
                    </span>
                    <span className="season-card__name">{p.name}</span>
                  </span>
                  <span className="season-card__meta">
                    <span className="season-card__badge">
                      {p.badge || "In season"}
                    </span>
                    <span>
                      At {marketsByProduce[p.id]?.length || 0} markets
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      
      <section className="section container" aria-labelledby="explore-title">
        <div className="section-head">
          <div className="section-head__copy">
            <span className="eyebrow">Everything in one place</span>
            <h2 id="explore-title" className="section-title">
              Plan your market day in minutes
            </h2>
          </div>
        </div>
        <div className="grid grid--3">
          <Link to="/directory" className="feature card hover-card">
            <span className="feature__icon feature__icon--green">
              <Icon name="map" size={30} />
            </span>
            <h3>Market Directory</h3>
            <p>
              Browse every market in your area. Filter by neighbourhood, day of
              the week or produce, and sort by distance or next open day.
            </p>
            <span className="feature__link">
              Browse {markets.length} markets →
            </span>
          </Link>
          <Link to="/produce" className="feature card hover-card">
            <span className="feature__icon feature__icon--yellow">
              <Icon name="carrot" size={30} />
            </span>
            <h3>Produce Guide</h3>
            <p>
              Look up fruits, vegetables, herbs and dairy: when they’re in
              season and which markets usually stock them.
            </p>
            <span className="feature__link">Open the guide →</span>
          </Link>
          <Link to="/saved" className="feature card hover-card">
            <span className="feature__icon feature__icon--orange">
              <Icon name="bookmark" size={30} />
            </span>
            <h3>Bookmarks &amp; notes</h3>
            <p>
              Save favourite markets and produce, add quick notes for your
              shopping list, then export or share them with family.
            </p>
            <span className="feature__link">View saved ({saved.length}) →</span>
          </Link>
        </div>
      </section>

    
      <section className="container home__how-wrap" aria-labelledby="how-title">
        <div className="home__how">
          <div className="home__how-intro">
            <span className="eyebrow">How it works</span>
            <img className="line" src={line}/>
            <h2 id="how-title">From “what’s open?” to a full basket.</h2>
          </div>
          <ol className="home__steps">
            <li>
              <span className="home__num">1</span>
              <h3>Tell us where and when</h3>
              <p>Share your location or pick an area and day.</p>
            </li>
            <li>
              <span className="home__num">2</span>
              <h3>See what’s open and fresh</h3>
              <p>Markets, hours and typical produce, updated for right now.</p>
            </li>
            <li>
              <span className="home__num">3</span>
              <h3>Save it and go</h3>
              <p>Bookmark, add a note, and get directions on the map.</p>
            </li>
          </ol>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="container home__cta-wrap" aria-labelledby="cta-title">
        <div className="home__cta">
          <div>
            <h2 id="cta-title">Run a market or grow for one?</h2>
            <p>
              Get your market listed on FreshFind so more neighbours know when
              you’re open and what you’re selling.
            </p>
          </div>
          <div className="home__cta-buttons">
            <Link to="/contact?topic=add" className="btn btn--outline btn--lg">
              List your market
            </Link>
            <Link to="/contact" className="btn btn--outline-light btn--lg">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
