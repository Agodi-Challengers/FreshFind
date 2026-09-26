import { Link } from "react-router-dom";
import Logo from "./Logo.jsx";
import { useBookmarks } from "../context/BookmarksContext.jsx";

/** Footer with site links and contact details. */
export default function SiteFooter() {
  const { items } = useBookmarks();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <Logo variant="light" tagline={false} />
            <p>
              Your local market companion. Helping neighbours discover farmers
              markets and make the most of seasonal, local produce.
            </p>
          </div>
          <nav className="footer__col" aria-label="Explore">
            <h2>Explore</h2>
            <Link to="/find">Find a Market</Link>
            <Link to="/directory">Market Directory</Link>
            <Link to="/produce">Produce Guide</Link>
            <Link to="/seasonal">Seasonal picks</Link>
          </nav>
          <nav className="footer__col" aria-label="FreshFind">
            <h2>FreshFind</h2>
            <Link to="/about">About us</Link>
            <Link to="/contact">Contact us</Link>
            <Link to="/contact?topic=add">List your market</Link>
            <Link to="/saved">Saved ({items.length})</Link>
          </nav>
          <div className="footer__col">
            <h2>Contact</h2>
            <a href="mailto:hello@freshfind.ng">hello@freshfind.ng</a>
            <a href="tel:+2348000000000">+234 800 000 0000</a>
            <span>Lagos, Nigeria</span>
          </div>
        </div>
        <div className="footer__bottom">
          <p>
            © {new Date().getFullYear()} FreshFind. Market information is for
            guidance; always confirm hours with the market.
          </p>
          <p>Designed by Agodi Challengers</p>
        </div>
      </div>
    </footer>
  );
}
