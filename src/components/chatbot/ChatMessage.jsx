import { Link } from "react-router-dom";
import Icon from "../Icon.jsx";
import { asset } from "../../lib/assets.js";
import { marketMeta } from "../../services/chatbotService.js";

/**
 * One chat message (Figma "Chatbot · open state").
 * Bot messages are white bubbles on the left, the user's are green on the right.
 * A bot message can also carry market result cards and page links.
 */
export default function ChatMessage({ message, onNavigate }) {
  if (message.from === "user") {
    return (
      <li className="chatbot__row chatbot__row--user">
        <p className="chatbot__bubble chatbot__bubble--user">{message.text}</p>
      </li>
    );
  }

  return (
    <li className="chatbot__row">
      <div className="chatbot__bot">
        <p className="chatbot__bubble">{message.text}</p>

        {message.markets?.map((market) => (
          <Link
            key={market.id}
            to={`/markets/${market.id}`}
            className="chatbot__market"
            onClick={onNavigate}
          >
            <img src={asset(market.images.card)} alt="" width="38" height="38" />
            <span className="chatbot__market-text">
              <strong>{market.name}</strong>
              <span>{marketMeta(market)}</span>
            </span>
            <Icon name="arrow-right" size={16} />
          </Link>
        ))}

        {message.links?.length > 0 && (
          <div className="chatbot__links">
            {message.links.map((link) => (
              <Link key={link.to} to={link.to} className="chatbot__chip" onClick={onNavigate}>
                {link.label}
                <Icon name="arrow-right" size={14} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}
