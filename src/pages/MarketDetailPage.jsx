import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageBanner from "../components/PageBanner.jsx";
import Icon from "../components/Icon.jsx";
import StatusPill from "../components/StatusPill.jsx";
import BookmarkButton from "../components/BookmarkButton.jsx";
import MarketCard from "../components/MarketCard.jsx";
import { useData } from "../context/DataContext.jsx";
import { useNow } from "../context/ClockContext.jsx";
import { useUserLocation } from "../context/LocationContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { useDecoratedMarkets } from "../lib/useMarkets.js";
import { scheduleLabel, formatRange, seasonRange, WEEK_ORDER, DAY_LONG } from "../lib/time.js";
import { formatKm } from "../lib/geo.js";
import { asset, googleMapsEmbed, googleMapsLink, googleDirections } from "../lib/assets.js";
import { shareLink } from "../lib/share.js";
import "./MarketDetailPage.css";
import { FaArrowRight } from "react-icons/fa6";

const INFO = [
  { key: "payment", title: "Payment", icon: "wallet" },
  { key: "parking", title: "Parking", icon: "car" },
  { key: "familyFriendly", title: "Family friendly", icon: "heart-handshake", fallback: "Open space, good for a family visit" },
  { key: "bringABag", title: "Bring a bag", icon: "shopping-basket", fallback: "Most stalls do not give out bags" },
];

/** Every photo we have for a market, without repeats. */
function marketPhotos(images) {
  const all = [...(images.gallery || []), images.card, images.row, images.popup];
  return all.filter((src, i) => src && all.indexOf(src) === i);
}

export default function MarketDetailPage() {
  const { id = "lekki-sunday" } = useParams();
  const { produceById } = useData();
  const now = useNow();
  const { origin } = useUserLocation();
  const toast = useToast();
  const markets = useDecoratedMarkets();

  const market = markets.find((m) => m.id === id) ?? markets[0];
  const nearby = useMemo(
    () => market.nearby.map((nid) => markets.find((m) => m.id === nid)).filter(Boolean),
    [market, markets],
  );

  const km = formatKm(market.km);
  const photos = marketPhotos(market.images);
  const [active, setActive] = useState(0);
  const main = photos[active] || photos[0];
  const [isShared, setIsShared] = useState(false);


  return (
    <article className="detail">
      <div className="detail__top">
        <PageBanner
          crumbs={[
            { label: "Home", to: "/" },
            { label: "Market Directory", to: "/directory" },
            { label: market.area, to: `/directory?area=${encodeURIComponent(market.area)}` },
            { label: market.name },
          ]}
        />

        {/* Gallery */}
        <div className="container">
          <div className="detail__gallery">
            <img
              className="detail__photo-main"
              src={asset(main)}
              alt={market.name}
              width="1040"
              height="520"
            />
            {photos.length > 1 && (
              <div className="detail__photo-strip">
                {photos.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    className={`detail__photo-thumb${i === active ? " is-active" : ""}`}
                    aria-label={`Show photo ${i + 1} of ${photos.length}`}
                    aria-pressed={i === active}
                    onClick={() => setActive(i)}
                  >
                    <img src={asset(src)} alt="" width="140" height="140" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Title and actions */}
        <div className="container">
          <div className="detail__title-row">
            <div className="detail__title">
              <h1 className="detail__name">{market.name}</h1>
              <div className="detail__badges">
                <StatusPill status={market.status} />
                {market.status.state !== "closed" && (
                  <span className="pill pill--outline pill--muted">{market.status.label}</span>
                )}
                {market.verified !== false && (
                  <span className="pill pill--verified">
                    <Icon name="badge-check" size={13} /> Verified Listing
                  </span>
                )}
              </div>
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
                  <Icon name="store" size={16} />
                  {market.growers}
                </span>
              </div>
            </div>
            <div className="detail__actions">

              <div className="detail__actions">
  <button
    type="button"
    className="btn btn--outline"
    onClick={() =>
      shareLink(
        {
          title: market.name,
          text: `${market.name} · ${scheduleLabel(market.schedule)}`,
          url:
            typeof window !== "undefined"
              ? window.location.href
              : "",
        },
        toast,
      )
    }
  >
    <Icon name="share-2" size={16} />
    Share
  </button>

</div>
  

  <BookmarkButton
    id={market.id}
    name={market.name}
    variant="button"
  />
</div>
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
          </section>

          <section aria-labelledby="produce-here">
            <h2 id="produce-here" className="detail__h2">
              Typically available here
            </h2>
            <p className="detail__note">
              Based on what traders usually bring. Availability changes with the season.
            </p>
            <ul className="detail__produce">
              {market.produce.map((pid, i) => {
                const p = produceById[pid];
                if (!p) return null;
                return (
                  <li key={`${pid}-${i}`}>
                    <Link to={`/produce/${pid}`} className="detail__produce-card card hover-card">
                      <img src={asset(p.image)} alt="" width="168" height="120" loading="lazy" />
                      <strong>{p.shortName || p.name}</strong>
                      <span>{seasonRange(p.season)}</span>
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
                  <span>{market[i.key] || i.fallback}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="detail__right" aria-label="Schedule and location">
          <section className="detail__schedule card" aria-labelledby="weekly-schedule">
            <h2 id="weekly-schedule" className="detail__card-title">
              <Icon name="calendar-days" size={18} />
              Weekly schedule
            </h2>
            <table>
              <caption className="visually-hidden">Opening hours for {market.name}</caption>
              <tbody>
                {WEEK_ORDER.map((d) => {
                  const hours = market.schedule[d];
                  const today = d === now.dayKey;
                  return (
                    <tr key={d} className={today ? "is-today" : ""} aria-current={today ? "date" : undefined}>
                      <th scope="row">
                        {DAY_LONG[d]}
                        {today && <span className="detail__today">Today</span>}
                      </th>
                      <td className={hours ? "" : "is-closed"}>{hours ? formatRange(hours) : "Closed"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="detail__small">{scheduleLabel(market.schedule)}</p>
          </section>

          <section className="detail__location card" aria-labelledby="location-title">
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
                className="btn btn--dark btn--block"
                href={googleDirections(market)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="navigation" size={16} />
                Get directions
              </a>
            </div>
          </section>

          <section className="detail__contact card" aria-labelledby="contact-title">
            <h2 id="contact-title">Market contact</h2>
            <a href={`tel:${market.phone.replace(/\s/g, "")}`} className="icon-text">
              <Icon name="phone" size={15} />
              {market.phone}
            </a>
            {market.instagram && (
  <a
    href={`https://instagram.com/${market.instagram.replace("@", "")}`}
    target="_blank"
    rel="noopener noreferrer"
    className="icon-text"
  >
    <Icon name="message-circle" size={15} />
    {market.instagram}
  </a>
)}
          </section>
        </aside>
      </div>

      {nearby.length > 0 && (
        <section className="container detail__nearby" aria-labelledby="nearby-title">
          <div className="detail__nearby-head">
            <h2 id="nearby-title">Other markets near {market.area}</h2>
            <Link to={`/directory?area=${encodeURIComponent(market.area)}`} className="link-arrow">
              View all <FaArrowRight />

            </Link>
          </div>
          <div className="grid grid--4">
            {nearby.map((m, i) => (
              <MarketCard key={`${m.id}-${i}`} market={m} headingLevel={3} />
            ))}
          </div>
        </section>
      )}

    </article>
  );
}