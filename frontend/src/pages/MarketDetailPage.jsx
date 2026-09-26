import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb.jsx";
import Icon from "../components/Icon.jsx";
import StatusPill from "../components/StatusPill.jsx";
import BookmarkButton from "../components/BookmarkButton.jsx";
import MarketCard from "../components/MarketCard.jsx";
import NotFoundPage from "./NotFoundPage.jsx";
import { useData } from "../context/DataContext.jsx";
import { useNow } from "../context/ClockContext.jsx";
import { useUserLocation } from "../context/LocationContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { useDecoratedMarkets } from "../lib/useMarkets.js";
import {
  scheduleLabel,
  formatRange,
  WEEK_ORDER,
  DAY_LONG,
} from "../lib/time.js";
import { formatKm } from "../lib/geo.js";
import {
  asset,
  googleMapsEmbed,
  googleMapsLink,
  googleDirections,
} from "../lib/assets.js";
import { shareLink } from "../lib/share.js";
import "./MarketDetailPage.css";

const INFO = [
  { key: "payment", title: "Payment", icon: "wallet" },
  { key: "parking", title: "Parking", icon: "car" },
  { key: "growers", title: "Growers", icon: "sprout" },
  { key: "prices", title: "Prices", icon: "tag" },
];

export default function MarketDetailPage() {
  const { id } = useParams();
  const { produceById } = useData();
  const now = useNow();
  const { origin } = useUserLocation();
  const toast = useToast();
  const markets = useDecoratedMarkets();

  const market = markets.find((m) => m.id === id);
  const nearby = useMemo(
    () =>
      market
        ? market.nearby
            .map((nid) => markets.find((m) => m.id === nid))
            .filter(Boolean)
        : [],
    [market, markets],
  );

  if (!market) return <NotFoundPage />;

  const km = formatKm(market.km);
  const whatsapp = `https://wa.me/${market.phone.replace(/\D/g, "")}`;
  const [main, ...stack] = market.images.gallery;

  return (
    <article className="detail">
      <div className="container-detail__top">
        <div className="links">
          <Breadcrumb 
            items={[
              { label: "Home", to: "/" },
              { label: "Market Directory", to: "/directory" },
              {
                label: market.area,
                to: `/directory?area=${encodeURIComponent(market.area)}`,
              },
              { label: market.name },
            ]}
          />
        </div>

        <div className="detail__gallery">
          <img
            className="detail__photo-main"
            src={asset(main)}
            alt={`${market.name}`}
            width="868"
            height="400"
          />
          <div className="detail__photo-stack">
            {stack.map((src, i) => (
              <img
                key={`${src}-${i}`}
                src={asset(src)}
                alt=""
                width="400"
                height="194"
                loading="lazy"
              />
            ))}
          </div>
        </div>

        <div className="detail__title-row">
          <div className="detail__title">
            <div className="detail__badges">
              <StatusPill status={market.status} />
              <span className="pill pill--outline pill--muted">
                {market.status.label}
              </span>
              <span className="pill pill--yellow">{market.region}</span>
            </div>
            <h1>{market.name}</h1>
            <div className="detail__meta">
              <span className="icon-text">
                <Icon name="map-pin" size={16} />
                {market.address}
              </span>
              <span className="icon-text">
                <Icon name="navigation" size={16} />
                {km} from you
              </span>
              <span className="icon-text">
                <Icon name="calendar-days" size={16} />
                {scheduleLabel(market.schedule)}
              </span>
            </div>
          </div>
          <div className="detail__actions">
            <button
              type="button"
              className="btn btn--outline"
              onClick={() =>
                shareLink(
                  {
                    title: market.name,
                    text: `${market.name} · ${scheduleLabel(market.schedule)}`,
                    url: window.location.href,
                  },
                  toast,
                )
              }
            >
              <Icon name="share-2" size={16} />
              Share
            </button>
            <BookmarkButton
              type="market"
              id={market.id}
              name={market.name}
              variant="button"
            />
            <a
              className="btn btn--primary"
              href={googleDirections(market)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="navigation" size={16} />
              Get directions
            </a>
          </div>
        </div>
      </div>

      <div className="container detail__body">
        <div className="detail__left">
          <section aria-labelledby="about-market">
            <h2 id="about-market" className="detail__h2">
              About this market
            </h2>
            <p className="detail__about">{market.description}</p>
            <ul className="detail__cats" aria-label="Produce categories">
              {market.categories.map((c) => (
                <li key={c}>
                  <Link
                    to={`/directory?cat=${encodeURIComponent(c)}`}
                    className="pill pill--green"
                  >
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="produce-here">
            <h2 id="produce-here" className="detail__h2">
              Typically available here
            </h2>
            <p className="detail__note">
              Based on what traders usually bring. Availability changes with the
              season.
            </p>
            <ul className="detail__produce">
              {market.produce.map((pid) => {
                const p = produceById[pid];
                if (!p) return null;
                return (
                  <li key={pid}>
                    <Link
                      to={`/produce/${pid}`}
                      className="detail__produce-card card hover-card"
                    >
                      <img
                        src={asset(p.image)}
                        alt=""
                        width="168"
                        height="100"
                        loading="lazy"
                      />
                      <span>{p.shortName || p.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          <section aria-labelledby="good-to-know">
            <h2 id="good-to-know" className="detail__h2">
              Good to know
            </h2>
            <ul className="detail__info">
              {INFO.map((i) => (
                <li key={i.key} className="card">
                  <span className="detail__info-ic" aria-hidden="true">
                    <Icon name={i.icon} size={18} />
                  </span>
                  <strong>{i.title}</strong>
                  <span>{market[i.key]}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="detail__right" aria-label="Schedule and location">
          <section
            className="detail__schedule card"
            aria-labelledby="weekly-schedule"
          >
            <h2 id="weekly-schedule" className="detail__card-title">
              <Icon name="calendar-days" size={18} />
              Weekly schedule
            </h2>
            <table>
              <caption className="visually-hidden">
                Opening hours for {market.name}
              </caption>
              <tbody>
                {WEEK_ORDER.map((d) => {
                  const hours = market.schedule[d];
                  const today = d === now.dayKey;
                  return (
                    <tr
                      key={d}
                      className={today ? "is-today" : ""}
                      aria-current={today ? "date" : undefined}
                    >
                      <th scope="row">
                        {DAY_LONG[d]}
                        {today && <span className="detail__today">Today</span>}
                      </th>
                      <td className={hours ? "" : "is-closed"}>
                        {hours ? formatRange(hours) : "Closed"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="detail__small">
              Hours can change on public holidays. Last confirmed with
              organisers this month.
            </p>
          </section>

          <section
            className="detail__location card"
            aria-labelledby="location-title"
          >
            <div className="detail__map">
              <iframe
                title={`Map showing ${market.name}`}
                src={googleMapsEmbed(market)}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <a
                className="pill detail__map-link"
                href={googleMapsLink(market)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in Google Maps ↗
              </a>
            </div>
            <div className="detail__loc-info">
              <h2 id="location-title">{market.address}</h2>
              <p>
                {km} from your location ({origin.label}).
              </p>
              <a
                className="btn btn--primary btn--block"
                href={googleDirections(market)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="navigation" size={16} />
                Get directions
              </a>
            </div>
          </section>

          <section className="detail__contact" aria-labelledby="contact-title">
            <h2 id="contact-title">Market contact</h2>
            <a
              href={`tel:${market.phone.replace(/\s/g, "")}`}
              className="icon-text"
            >
              <Icon name="phone" size={15} />
              {market.phone}
            </a>
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="icon-text"
            >
              <Icon name="message-circle" size={15} />
              WhatsApp the organisers
            </a>
          </section>
        </aside>
      </div>

      {nearby.length > 0 && (
        <section
          className="container detail__nearby"
          aria-labelledby="nearby-title"
        >
          <div className="detail__nearby-head">
            <h2 id="nearby-title">Other markets near {market.area}</h2>
            <Link
              to={`/directory?area=${encodeURIComponent(market.area)}`}
              className="link-arrow"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid--4 scroll-row">
            {nearby.map((m) => (
              <MarketCard key={m.id} market={m} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
