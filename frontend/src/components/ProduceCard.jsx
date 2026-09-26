import { Link } from "react-router-dom";
import Icon from "./Icon.jsx";
import BookmarkButton from "./BookmarkButton.jsx";
import SeasonStrip from "./SeasonStrip.jsx";
import { useData } from "../context/DataContext.jsx";
import { useNow } from "../context/ClockContext.jsx";
import { inSeason } from "../lib/time.js";
import { asset } from "../lib/assets.js";
import { FaArrowRight } from "react-icons/fa6";


/** Produce Guide card: photo, category, description, season strip and where to buy. */
export default function ProduceCard({ item }) {
  const { marketsByProduce, categories } = useData();
  const now = useNow();
  const count = marketsByProduce[item.id]?.length || 0;
  const catLabel =
    categories.find((c) => c.name === item.category)?.label || item.category;
  const seasonal = inSeason(item.season, now.month);

  return (
    <article className="produce-card card hover-card">
      <div className="produce-card__media">
        <img
          src={asset(item.photo || item.image)}
          alt=""
          loading="lazy"
          width="300"
          height="180"
        />
        {seasonal && (
          <span className="pill pill--green-dot produce-card__pill">
            <span className="dot dot--open" aria-hidden="true" />
            In season
          </span>
        )}
        <BookmarkButton
          type="produce"
          id={item.id}
          name={item.name}
          variant="solid"
          className="produce-card__save"
        />
      </div>
      <div className="produce-card__body">
        <div>
          <span className="produce-card__cat">{catLabel}</span>
          <h3 className="produce-card__name">
            <Link to={`/produce/${item.id}`} className="stretched">
              {item.name}
            </Link>
          </h3>
        </div>
        <p className="produce-card__desc">{item.description}</p>
        <SeasonStrip season={item.season} currentMonth={now.month} />
        <div className="produce-card__foot">
          <span className="icon-text produce-card__count">
            <Icon name="store" size={14} />
            At {count} {count === 1 ? "market" : "markets"}
          </span>
          <Link
            to={`/directory?q=${encodeURIComponent(item.shortName || item.name)}`}
            className="produce-card__buy"
          >
            Where to buy <FaArrowRight />

          </Link>
        </div>
      </div>
    </article>
  );
}
