import { Link } from "react-router-dom";

/** "Run a market or grow for one?" banner shown above the footer on every page. */
export default function CtaBanner() {
  return (
    <section className="cta-banner" aria-labelledby="cta-title">
      <div className="container cta-banner__inner">
        <h2 id="cta-title">Run a market or grow for one?</h2>
        <p>
          Get your market listed on FreshFind so more neighbours know when
          you’re open and what you’re selling.
        </p>
        <div className="cta-banner__buttons">
          {/* <Link to="/contact?topic=add" className="btn btn--outline btn--lg">
            List your market
          </Link> */}
          <Link to="/contact" className="btn btn--outline-light btn--lg">
            Contact us
          </Link>
        </div>
      </div>
    </section>
  );
}
